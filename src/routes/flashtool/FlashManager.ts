import { DecodeString, EncodeString } from '$lib/utils';
import Latin1 from 'crypto-js/enc-latin1';
import HashMD5 from 'crypto-js/md5';
import { ESPLoader, type IEspLoaderTerminal, type LoaderOptions, Transport } from 'esptool-js';

/**
 * Reboots the chip in ESPLoader mode.
 */
async function setupESPLoader(
  serialPort: SerialPort,
  terminal: IEspLoaderTerminal
): Promise<ESPLoader | null> {
  try {
    await serialPort.close(); // TODO: Find some way to detect if the port is already open
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars -- catch binding required by syntax, close failure is intentionally ignored */
  } catch (e) {
    /* empty */
  }

  try {
    console.log('setupESPLoader: ', serialPort);
    const transport = new Transport(serialPort);

    const flashOptions = {
      transport,
      baudrate: 115200,
      terminal,
    } as LoaderOptions;

    const loader = new ESPLoader(flashOptions);

    await loader.main();

    return loader;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((f) => setTimeout(f, ms));
}

function appendBuffer(buffer: Uint8Array | null, data: Uint8Array): Uint8Array {
  // Fast path: if buffer is null, just return data
  if (!buffer) return data;

  const newBuffer = new Uint8Array(buffer.length + data.length);

  newBuffer.set(buffer, 0);
  newBuffer.set(data, buffer.length);

  return newBuffer;
}

/**
 * Reboots the chip in application mode.
 */
async function setupApplication(serialPort: SerialPort): Promise<SerialPort | null> {
  try {
    await serialPort.close(); // TODO: Find some way to detect if the port is already open
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars -- catch binding required by syntax, close failure is intentionally ignored */
  } catch (e) {
    /* empty */
  }

  try {
    console.log('setupApplication: ', serialPort);

    // Need to connect to the ESP32 using the right settings.
    // Hardware flow control would be a disaster, as these pins are used to control the device's bootloader.
    // https://docs.espressif.com/projects/esptool/en/latest/esp32/advanced-topics/boot-mode-selection.html
    await serialPort.open({
      baudRate: 115200,
      dataBits: 8,
      parity: 'none',
      flowControl: 'none',
    });

    // give it time
    await sleep(200);

    // tell the chip to reset
    await serialPort.setSignals({
      dataTerminalReady: false,
      requestToSend: true,
    });

    // give it more time
    await sleep(200);

    await serialPort.setSignals({
      dataTerminalReady: false,
      requestToSend: false,
    });

    // give it even more time to actually boot
    await sleep(200);

    return serialPort;
  } catch (e) {
    console.error(e);
    return null;
  }
}

/**
 * FlashManager ; manages flashing the device.
 * Beware that operations on FlashManager are not atomic (they never were, I've just noted this down now)
 */
export default class FlashManager {
  /**
   * Underlying serial port wrapper. null if the FlashManager has been disconnect()ed.
   */
  private serialPort: SerialPort | null;
  /**
   * Active reader in app mode.
   */
  private serialPortReader: ReadableStreamDefaultReader<Uint8Array> | null;
  /**
   * Active writer in app mode, if any.
   */
  private serialPortWriter: WritableStreamDefaultWriter<Uint8Array> | null;
  /**
   * Loader: ESPLoader. Presence or lack thereof indicates if the target device is in bootloader mode.
   */
  private loader: ESPLoader | null;
  /**
   * Terminal: Shared output terminal between ESPLoader and firmware output.
   */
  private terminal: IEspLoaderTerminal;
  /**
   * Chip: Detected during bootloader setup. null until first ensureBootloader() call.
   */
  private chip: string | null;

  private constructor(serialPort: SerialPort, terminal: IEspLoaderTerminal, loader?: ESPLoader) {
    this.serialPort = serialPort;
    this.serialPortReader = null;
    this.serialPortWriter = null;
    this.loader = loader ?? null;
    this.terminal = terminal;
    this.chip = loader?.chip.CHIP_NAME ?? null;
  }

  /**
   * Connect in bootloader mode (legacy). Enters ESPLoader immediately.
   */
  static async ConnectBootloader(serialPort: SerialPort, terminal: IEspLoaderTerminal) {
    const espLoader = await setupESPLoader(serialPort, terminal);
    if (espLoader != null) {
      return new FlashManager(espLoader.transport.device, terminal, espLoader);
    } else {
      return null;
    }
  }

  /**
   * Connect in application mode. Opens the port, resets the device into app mode,
   * and starts reading serial output immediately. Bootloader is entered lazily when flash is triggered.
   */
  static async ConnectApplication(serialPort: SerialPort, terminal: IEspLoaderTerminal) {
    const port = await setupApplication(serialPort);
    if (!port) return null;

    const manager = new FlashManager(port, terminal);
    manager._startApplicationReadLoop();
    return manager;
  }

  get SerialPort() {
    return this.serialPort;
  }

  get Chip() {
    return this.chip;
  }

  get mode(): 'application' | 'bootloader' | 'disconnected' {
    if (!this.serialPort) return 'disconnected';
    if (this.loader) return 'bootloader';
    return 'application';
  }

  /**
   * Assumes the FlashManager is connected.
   * To work around esptool.js issues (namely, any timeout whatsoever corrupts newRead and probably everything else too), some operations have to 'reboot' the transport.
   * In addition, to reduce any weirdness, the FlashManager becomes 'disconnected' while it is switching states.
   */
  private async _cycleTransport(): Promise<SerialPort> {
    const loader = this.loader;
    const serialPort = this.serialPort!;
    const serialPortReader = this.serialPortReader;
    const serialPortWriter = this.serialPortWriter;
    this.serialPort = null;
    this.serialPortReader = null;
    this.serialPortWriter = null;
    this.loader = null;
    if (loader) {
      try {
        await loader.transport!.disconnect();
      } catch {
        // try to shut everything off, silently fail
      }
    }
    if (serialPortReader) {
      try {
        await serialPortReader.cancel();
      } catch {
        // try to shut everything off, silently fail
      }
    }
    if (serialPortWriter) {
      try {
        await serialPortWriter.close();
      } catch {
        // try to shut everything off, silently fail
      }
    }
    try {
      await serialPort.close();
    } catch {
      // try to shut everything off, silently fail
    }
    return serialPort;
  }

  async ensureBootloader(forceReset?: boolean) {
    if (!this.serialPort) return false;
    if (this.loader && !forceReset) return true;

    const serialPort = await this._cycleTransport();

    const loader = await setupESPLoader(serialPort, this.terminal);
    if (loader) {
      // success (if a failure occurs we're left disconnected)
      this.serialPort = serialPort;
      this.loader = loader;
      this.chip = loader.chip.CHIP_NAME;
    }
  }

  /**
   * Starts an async read loop that reads from the serial port and writes to the terminal.
   * Assumes the port is already open with reader/writer available.
   */
  private _startApplicationReadLoop() {
    if (!this.serialPort) return;

    const serialPortReader = this.serialPort.readable!.getReader();
    const serialPortWriter = this.serialPort.writable!.getWriter();
    this.serialPortReader = serialPortReader;
    this.serialPortWriter = serialPortWriter;

    (async () => {
      try {
        let lineBuffer: Uint8Array | null = null;

        while (true) {
          const { done, value } = await serialPortReader.read();
          if (done) break;
          if (!value) {
            await sleep(1);
            continue;
          }

          let start = 0;

          for (let i = 0; i < value.length; i++) {
            const byte = value[i];

            if (byte !== 10 && byte !== 13) continue;

            if (i > start) {
              lineBuffer = appendBuffer(lineBuffer, value.subarray(start, i));
            }

            if (byte === 10) {
              this.terminal.writeLine(lineBuffer?.length ? DecodeString(lineBuffer) : '');
              lineBuffer = null;
            }

            start = i + 1;
          }

          if (start < value.length) {
            lineBuffer = appendBuffer(lineBuffer, value.subarray(start));
          }
        }
      } catch (e) {
        console.log(e);
        this.terminal.writeLine(`firmware disconnected: ${e}`);
      }
    })();
  }

  async ensureApplication(forceReset?: boolean) {
    if (!this.serialPort) return false;
    if (!this.loader && !forceReset) return true;

    const serialPort = await setupApplication(await this._cycleTransport());
    this.serialPort = serialPort;

    if (serialPort) {
      this._startApplicationReadLoop();
    }
  }

  async disconnect() {
    console.log('Disconnecting');
    await this._cycleTransport();
    this.serialPort = null;
    this.terminal.clean();
    console.log('Disconnected');
  }

  async erase() {
    if (!this.loader) return false;

    try {
      await this.loader.eraseFlash();
      return true;
    } catch (e) {
      console.error(e);
      this.terminal.writeLine(`Failed to erase flash: ${e}`);
      return false;
    }
  }

  async hardReset() {
    if (!this.loader) return false;

    try {
      await this.loader.after();
      return true;
    } catch (e) {
      console.error(e);
      this.terminal.writeLine(`Failed to hard reset: ${e}`);
      return false;
    }
  }

  async flash(data: Uint8Array, eraseAll: boolean, onProgress: (progress: number) => void) {
    if (!this.loader) return false;

    function arrayBufferToString(array: Uint8Array) {
      let str = '';
      for (let i = 0; i < array.length; ++i) {
        str += String.fromCharCode(array[i]);
      }
      return str;
    }
    function reportProgress(fileIndex: number, written: number, total: number) {
      onProgress(written / total);
    }

    try {
      await this.loader.writeFlash({
        fileArray: [
          {
            data: arrayBufferToString(data),
            address: 0,
          },
        ],
        flashSize: 'keep',
        flashMode: 'keep',
        flashFreq: 'keep',
        eraseAll,
        compress: true,
        reportProgress,
        calculateMD5Hash: (image) => HashMD5(Latin1.parse(image)).toString(),
      });
      this.terminal.writeLine('Flash complete');
      return true;
    } catch (e) {
      console.error(e);
      this.terminal.writeLine(`Failed to flash: ${e}`);
      return false;
    }
  }

  /**
   * Sends an application command.
   * Returns false and ignores if not in application mode or if disconnected.
   */
  async sendApplicationCommand(text: string) {
    if (!this.serialPortWriter || this.loader) return false;

    const buffer = EncodeString(text + '\n');
    try {
      await this.serialPortWriter.write(buffer);
      return true;
    } catch (e) {
      console.error(e);
      this.terminal.writeLine(`Failed to write application command: ${e}`);
      return false;
    }
  }
}
