import { UAParser, type UAParserExt } from 'ua-parser-js';

const OpenShockExtension: UAParserExt = {
  browser: [[/^(OpenShock)\/([-\w.+]+)/i], ['name', 'version']],
  cpu: [
    [/;\s*(ESP32(?:S[0-9]+)?);/i],
    [['architecture', 'XTensa']],
    [/;\s*(ESP32C[0-9]+);/i],
    [['architecture', 'RISC-V']],
  ],
  device: [
    [/;\s*(ESP32(?:[SC][0-9]+)?);\s*Espressif\)/i],
    ['model', ['vendor', 'Espressif'], ['type', 'embedded']],
  ],
  os: [[/\(arduino-esp32;/i], [['name', 'Arduino']]],
};

export function getReadableUserAgentName(userAgent: string): string | null {
  const ua = new UAParser(userAgent, OpenShockExtension);

  const browser = ua.getBrowser();
  const os = ua.getOS();

  if (!browser.name || !os.name) return null;

  if (browser.name === 'OpenShock') {
    const device = ua.getDevice();
    return `OpenShock ${browser.version} on ${os.name} ${device.model}`;
  }

  let name = `${browser.name} on ${os.name}`;

  if (os.version) name += ` ${os.version}`;

  return name;
}
