/*

1 byte = HEAD
4 bits = serial number
4 bits = intensity value interpretation method (2 bits for A channel, 2 bits for B channel)
1 byte = A channel intensity limit
1 byte = B channel intensity limit
4 bytes = A channel waveform frequency
4 bytes = A channel waveform intensity
4 bytes = B channel waveform frequency
4 bytes = B channel waveform intensity

*/

/*

1 byte = HEAD = 0xBF
4 bits = serial number = 0x0
4 bits = intensity value interpretation method (2 bits for A channel, 2 bits for B channel) = 0xF
1 byte = A channel intensity limit 0x00
1 byte = B channel intensity limit 0x00
4 bytes = A channel waveform frequency 0x0A
4 bytes = A channel waveform intensity 0x64
4 bytes = B channel waveform frequency 0x0A
4 bytes = B channel waveform intensity 0x64

*/

export function getChannelWaveDataV3(
    serialAndInterpretation: number,
    aIntensityLimit: number,
    bIntensityLimit: number,
    aFrequency: number,
    aIntensity: number,
    bFrequency: number,
    bIntensity: number
): Uint8Array {
    const aConvertedFrequency = convertMsPeriodToByte(aFrequency);
    const bConvertedFrequency = convertMsPeriodToByte(bFrequency);

    const buffer = new ArrayBuffer(20);
    const data = new Uint8Array(buffer);

    data[0] = 0xB0; // HEAD
    data[1] = serialAndInterpretation;

    data[2] = aIntensityLimit;
    data[3] = bIntensityLimit;

    data[4]  = data[5]  = data[6]  = data[7]  = aConvertedFrequency;
    data[8]  = data[9]  = data[10] = data[11] = aIntensity;
    data[12] = data[13] = data[14] = data[15] = bConvertedFrequency;
    data[16] = data[17] = data[18] = data[19] = bIntensity;

    return data;
}

function convertMsPeriodToByte(input: number): number {
  if (input >= 10 && input <= 100) {
    return input;
  } else if (input > 100 && input <= 600) {
    return Math.floor((input - 100) / 5) + 100;
  } else if (input > 600 && input <= 1000) {
    return Math.floor((input - 600) / 10) + 200;
  } else {
    return 10; // default fallback
  }
}

/*



*/

export function getBF(aIntensityLimit: number, bIntensityLimit: number, aFrequencyBalance: number, bFrequencyBalance: number, aIntensityBalance: number, bIntensityBalance: number): Uint8Array {
    const buffer = new ArrayBuffer(7);
    const data = new Uint8Array(buffer);

    data[0] = 0xBF; // HEAD

    data[1] = aIntensityLimit;
    data[2] = bIntensityLimit;
    data[3] = aFrequencyBalance;
    data[4] = bFrequencyBalance;
    data[5] = aIntensityBalance;
    data[6] = bIntensityBalance;

    return data;
}