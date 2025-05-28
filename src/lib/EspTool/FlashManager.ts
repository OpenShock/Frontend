import Latin1 from 'crypto-js/enc-latin1';
import HashMD5 from 'crypto-js/md5';
import {
  ESPLoader,
  type FlashOptions,
  type IEspLoaderTerminal,
  type LoaderOptions,
  Transport,
} from 'esptool-js';

/**
 * Reboots the chip in ESPLoader mode.
 */
async function setupESPLoader(
  serialPort: SerialPort,
  terminal: IEspLoaderTerminal
): Promise<ESPLoader | null> {
  try {
    await serialPort.close(); // TODO: Find some way to detect if the port is already open
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

/**
 * Reboots the chip in application mode.
 */
async function setupApplication(serialPort: SerialPort): Promise<SerialPort | null> {
  try {
    await serialPort.close(); // TODO: Find some way to detect if the port is already open
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
   * Chip: During connect, the chip is read from the ESPLoader.
   */
  private chip: string;

  private constructor(loader: ESPLoader, terminal: IEspLoaderTerminal) {
    this.serialPort = loader.transport.device;
    this.serialPortReader = null;
    this.serialPortWriter = null;
    this.loader = loader;
    this.terminal = terminal;
    this.chip = loader.chip.CHIP_NAME;
  }

  static async Connect(serialPort: SerialPort, terminal: IEspLoaderTerminal) {
    const espLoader = await setupESPLoader(serialPort, terminal);
    if (espLoader != null) {
      return new FlashManager(espLoader, terminal);
    } else {
      return null;
    }
  }

  get SerialPort() {
    return this.serialPort;
  }

  get Chip() {
    return this.chip;
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

  async ensureApplication(forceReset?: boolean) {
    if (!this.serialPort) return false;
    if (!this.loader && !forceReset) return true;

    const serialPort = await setupApplication(await this._cycleTransport());
    this.serialPort = serialPort;

    if (serialPort) {
      const serialPortReader = serialPort!.readable!.getReader();
      const serialPortWriter = serialPort!.writable!.getWriter();
      this.serialPortReader = serialPortReader;
      this.serialPortWriter = serialPortWriter;
      // connect application to terminal
      (async () => {
        try {
          let lineBuffer = [];
          while (true) {
            // since we're using Transport APIs, and since they have no "no timeout" option, get as close as possible
            const b = await serialPortReader.read();
            if (b.done) break;
            if (b.value) {
              for (const byte of b.value) {
                // next byte
                if (byte == 13) continue;
                if (byte == 10) {
                  // write out line
                  this.terminal.writeLine(new TextDecoder().decode(new Uint8Array(lineBuffer)));
                  lineBuffer = [];
                } else {
                  lineBuffer.push(byte);
                }
              }
            } else {
              // if the port somehow returns all zero length buffers or something...
              await sleep(1);
            }
          }
        } catch (e) {
          console.log(e);
          this.terminal.writeLine(`firmware disconnected: ${e}`);
        }
      })();
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

  async flash(data: ArrayBuffer, eraseAll: boolean, onProgress: (progress: number) => void) {
    if (!this.loader) return false;

    function arrayBufferToString(buffer: ArrayBuffer) {
      const array = new Uint8Array(buffer);
      let str = '';
      for (let i = 0; i < array.length; ++i) {
        str += String.fromCharCode(array[i]);
      }
      return str;
    }
    function reportProgress(fileIndex: number, written: number, total: number) {
      onProgress(written / total);
    }

    const flashOptions = {
      fileArray: [
        {
          data: arrayBufferToString(data),
          address: 0,
        },
      ],
      flashSize: 'keep',
      eraseAll,
      compress: true,
      reportProgress,
      calculateMD5Hash: (image) => HashMD5(Latin1.parse(image)).toString(),
    } as FlashOptions;

    try {
      await this.loader.writeFlash(flashOptions);
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
    if (!this.serialPortWriter) return false;
    if (this.loader) return false;

    text += '\n';
    const buffer = new TextEncoder().encode(text);
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
