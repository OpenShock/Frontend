import { ESPLoader, Transport, type LoaderOptions, type IEspLoaderTerminal, type FlashOptions } from 'esptool-js';
import HashMD5 from 'crypto-js/md5';
import Latin1 from 'crypto-js/enc-latin1';

export default class FlashManager {
  private transport: Transport | null;
  private loader: ESPLoader | null;
  private terminal: IEspLoaderTerminal;
  private chip: string;

  private constructor(transport: Transport, loader: ESPLoader, terminal: IEspLoaderTerminal, chip: string) {
    this.transport = transport;
    this.loader = loader;
    this.terminal = terminal;
    this.chip = chip;
  }

  static async Connect(serialPort: SerialPort, terminal: IEspLoaderTerminal) {
    try {
      await serialPort.close(); // TODO: Find some way to detect if the port is already open
    } catch (e) {
      // Ignore
    }

    try {
      console.log("Connecting to", serialPort);
      const transport = new Transport(serialPort);

      const flashOptions = {
        transport,
        baudrate: 115200,
        terminal
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
    console.log("Disconnecting");
    if (this.transport) {
      await this.transport.disconnect();
      this.transport = null;
    }
    this.loader = null;
    this.terminal.clean();
    console.log("Disconnected");
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
      fileArray: [{
        data: arrayBufferToString(data),
        address: 0
      }],
      flashSize: 'keep',
      eraseAll,
      compress: true,
      reportProgress,
      calculateMD5Hash: (image) => HashMD5(Latin1.parse(image)).toString()
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
    try {
      this.consoleRunning = true;

      await this._internalConsoleLoop(0);

      return true;
    } catch (e) {
      console.error(e);
      this.terminal.writeLine(`Failed to read console: ${e}`);

      this.consoleRunning = false;

      return false;
    }
  }

  private async _internalConsoleLoop(timeout: number) {
    const reader = this?.transport?.device?.readable?.getReader();
    if (!reader) {
      console.error("No reader");
      this.terminal.writeLine("No reader");
      return;
    }

    while (this.transport) {
      const value = await this._rawRead(timeout);

      if (value === null) {
        break;
      }

      this.terminal.write(value.toString());
    }

    this.consoleRunning = false;
  }

  private async _rawRead(timeout = 0) {
    if (!this.transport) return null;

    if (this.transport.leftOver.length != 0) {
      const p = this.transport.leftOver;
      this.transport.leftOver = new Uint8Array(0);
      return p;
    }
    if (!this.transport.device.readable) {
      return this.transport.leftOver;
    }

    const reader = this.transport.device.readable.getReader();

    let t: ReturnType<typeof setTimeout> | null = null;
    try {
      if (timeout > 0) {
        t = setTimeout(async () => {
          await reader.cancel();
        }, timeout);
      }

      const { value, done } = await reader.read();

      if (done) {
        throw new Error("Timeout");
      }

      return value;
    } finally {
      if (timeout > 0 && t) {
        clearTimeout(t);
      }

      reader.releaseLock();
    }
  }
}
