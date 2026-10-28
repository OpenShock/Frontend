import { describe, expect, it } from 'vitest';
import { getHardwareId } from './serial-context.svelte';

function port(info: SerialPortInfo) {
  return { getInfo: () => info };
}

describe('getHardwareId', () => {
  it('formats vendor and product ids as upper-case padded hex', () => {
    expect(getHardwareId(port({ usbVendorId: 0x303a, usbProductId: 0x1001 }))).toBe(
      'VID_303A&PID_1001'
    );
  });

  it('omits a missing product id', () => {
    expect(getHardwareId(port({ usbVendorId: 0x1a86 }))).toBe('VID_1A86');
  });

  it('returns Unknown when the port has no usb ids', () => {
    expect(getHardwareId(port({}))).toBe('Unknown');
  });

  it('returns Unknown for a null port', () => {
    expect(getHardwareId(null)).toBe('Unknown');
  });
});
