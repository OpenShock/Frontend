import {
  ESPLoader,
  Transport,
  type LoaderOptions,
  type IEspLoaderTerminal,
  type FlashOptions,
} from 'esptool-js';
import HashMD5 from 'crypto-js/md5';
import Latin1 from 'crypto-js/enc-latin1';

export default class FlashManager {
  private transport: Transport | null;
  private loader: ESPLoader | null;
  private terminal: IEspLoaderTerminal;
  private chip: string;

  private constructor(
    transport: Transport,
    loader: ESPLoader,
    terminal: IEspLoaderTerminal,
    chip: string
  ) {
    this.transport = transport;
    this.loader = loader;
    this.terminal = terminal;
    this.chip = chip;
  }

  static async Connect(serialPort: SerialPort, terminal: IEspLoaderTerminal) {
    try {
      await serialPort.close(); // TODO: Find some way to detect if the port is already open
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      /* empty */
    }

    try {
      console.log('Connecting to', serialPort);
      const transport = new Transport(serialPort);

      const flashOptions = {
        transport,
        baudrate: 115200,
        terminal,
      } as LoaderOptions;

      const loader = new ESPLoader(flashOptions);

      const chip = await loader.main();

      return new FlashManager(transport, loader, terminal, chip);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  get SerialPort() {
    return this.transport?.device ?? null;
  }

  get Chip() {
    return this.chip;
  }

  async disconnect() {
    console.log('Disconnecting');
    if (this.transport) {
      await this.transport.disconnect();
      this.transport = null;
    }
    this.loader = null;
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

  private consoleRunning = false;

  async readConsoleLoop() {
    let ok = true;
    this.consoleRunning = true;

    try {
      await this._internalConsoleLoop();
    } catch (e) {
      console.error(e);
      this.terminal.writeLine(`Failed to read console: ${e}`);
      ok = false;
    }

    this.consoleRunning = false;

    return ok;
  }

  private async _internalConsoleLoop() {
    while (this.transport) {
      const readLoop = this.transport.read(250);
      while (true) {
        const { value, done } = await readLoop.next();

        if (!value || done) {
          break;
        }

        this.terminal.write(value.toString());
      }
    }
  }
}
