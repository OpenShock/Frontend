  import { toast } from 'svelte-sonner';
import DeviceVersion from '../models/DeviceVersion';
import { getChannelWaveDataV3 } from './encoder';
  
class DGLab3 {

        gattServer: BluetoothRemoteGATTServer | undefined;
        deviceVersion: DeviceVersion = DeviceVersion.V2_0;
        intervalId: NodeJS.Timeout | undefined; // Timer ID for writing pulse data

        count = 0; // AB channel writing counter
        errorCount = 0; // writing failure counter
        selectedOption = 'a';

        prefixArr = ['D-LAB', '47']; // Prefix for scanned Bluetooth names
        serviceIdArr: Array<BluetoothServiceUUID> = [
            '955a180b-0fe2-f5aa-a094-84b8d4f3e8ad',
            '0000180c-0000-1000-8000-00805f9b34fb'
        ]; // service id

        
        dg2ChannelId = ['955a1506-0fe2-f5aa-a094-84b8d4f3e8ad', '955a1505-0fe2-f5aa-a094-84b8d4f3e8ad']; // ble characteristics of AB channel in coyote 2.0
        coyote2wave: { [key: string]: string[] } = {
            'a': [
                '210100',
                '210102',
                '210104',
                '210106',
                '210108',
                '21010A',
                '21010A',
                '21010A',
                '000000',
                '000000',
                '000000',
                '000000'
            ], 'b': [
                'C4080A',
                '24080A',
                '84070A',
                '03070A',
                '63060A',
                'E3050A',
                '43050A',
                'A3040A',
                '22040A',
                '82030A',
                '02030A',
                '21010A',
                '21010A',
                '21010A',
                '21010A',
                '21010A',
                '21010A',
                '21010A',
                '21010A'
            ], 'c': [
                '210100',
                '618102',
                'A10105',
                'E18107',
                '21020A',
                '81020A',
                'C1020A',
                '010300',
                '410300',
                'A10300',
                '210100',
                '618102',
                'A10105',
                'E18107',
                '21020A',
                '81020A',
                'C1020A',
                '010300',
                '410300',
                'A10300'
            ]
        };

        scanBT(type: DeviceVersion) {
            if (typeof window.navigator.bluetooth === 'undefined') {
                console.error('Your browser does not support Bluetooth API, please switch to Chrome browser')
                return
            }

            if (this.gattServer) {
                console.error('Please disconnect the current device first, wait for a few seconds to confirm disconnection, and then scan again. You can also refresh the page.')
                return
            }

            this.deviceVersion = type;
            // Select the Bluetooth name prefix and service ID for the scanned Bluetooth device
            let prefix = this.prefixArr[this.deviceVersion - 2];
            let serviceId = this.serviceIdArr[this.deviceVersion - 2];
            console.log('Scanning for Bluetooth Device...');
            this.showSuccessToast('During scanning, click on the scanned device and confirm to start connecting');

            //Start Bluetooth scanning
            window.navigator.bluetooth.requestDevice({
                filters: [{
                    namePrefix: prefix
                }],
                optionalServices: [serviceId]
            })
                .then<BluetoothRemoteGATTServer>(device => {
                    device.addEventListener('gattserverdisconnected', this.onDisconnected);//Listening device disconnected
                    console.log('Device Name: ' + device.name);
                    console.log('Device Id: ' + device.id);
                    this.showSuccessToast('Found device, getting service in progress, please wait...');

                    if(device.gatt === undefined) {
                        console.log('Device does not support GATT, please use a different device');
                        throw new Error('Device does not support GATT');
                    }

                    if (!device.gatt.connected) {
                        console.log('Connecting to GATT Server...');
                        return device.gatt.connect();
                    } else {
                        // Already connected.
                        console.log('Already connected to GATT Server...');
                        return device.gatt;
                    }
                })
                .then(gattServer => {
                    this.gattServer = gattServer; // Store the obtained GATT service object in a global variable
                    // Obtain all main services on the device。
                    return this.gattServer.getPrimaryServices();
                })
                .then(services => {
                    console.log('services', services)
                    console.log('Services obtained successfully。');
                    console.log('Connected device');
                    this.showSuccessToast('Connected device');
                })
                .catch(error => {
                    console.error('Error: ' + error);
                });
        }

        disconnect() {
            if (this.gattServer) {
                this.stopSending();
                this.gattServer.disconnect(); // Disconnect
                this.gattServer = undefined; // Leave global variables blank
            }
        }

        hexStringToUint8Array(hexString: string): Uint8Array {
            if (hexString.length % 2 !== 0) {
                throw new Error('Hex string length must be even');
            }

            const array = new Uint8Array(hexString.length / 2);
            for (let i = 0; i < hexString.length; i += 2) {
                array[i / 2] = parseInt(hexString.substr(i, 2), 16);
            }
            return array;
        }

        startSending() {
            if (!this.gattServer) {
                console.log('Please connect the device first');
                return;
            }
            console.log('Start writing pulse data');
            this.intervalId = setInterval(this.setBT.bind(this), 100);
            //setBT();
        }

        stopSending() {
            // Stop Timer
            this.count = 0;
            // Reset Counter
            console.log('Stop writing pulse data')
            if (typeof this.intervalId !== 'undefined') {
                clearInterval(this.intervalId);
                console.log('Timer cleared');
            }
        }

        onDisconnected(event: any) {
            const device = event.target;
            console.error(`Device: ${device.name} Disconnected`);
            this.gattServer = undefined;
            this.stopSending(); // Stop sending data when disconnected
        }


        setBT() {
            if (this.errorCount > 5) {
                this.stopSending();
                return;
            }
            if (!this.gattServer) {
                this.errorCount++;
                console.error('Device not connected, not receiving service');
                return;
            }

            let serviceId = this.serviceIdArr[this.deviceVersion - 2];

            if (this.deviceVersion === DeviceVersion.V3_0) {
                const myVal = getChannelWaveDataV3(
                    0xB0,
                    0,
                    0, // aIntensityLimit
                    0, // bIntensityLimit
                    10,  // aFrequency
                    100,  // aIntensity
                    10,  // bFrequency
                    100   // bIntensity
                );

                this.gattServer!.getPrimaryService(serviceId)
                    .then(service => {
                        // get characteristic of channel A & B
                        return service.getCharacteristic('0000150a-0000-1000-8000-00805f9b34fb');
                    })
                    .then(characteristicA => {
                        characteristicA.writeValue(myVal);
                    }).then(() => {
                        this.count++;
                        if (this.count % 100 === 0) {
                            console.log('Write successful, write count' + this.count);
                        }
                    })
                    .catch(error => {
                        this.errorCount++;
                        console.error('Abnormal pulse writing：' + error);
                    });
            }
            else {
                // The data planned to be written is default to pulses data supported by coyote 2.0 devices
                let currentIndex = this.count % this.coyote2wave[this.selectedOption].length;
                let valueA = this.coyote2wave[this.selectedOption][currentIndex];
                let valueB = this.coyote2wave[this.selectedOption][currentIndex];
                const characteristicIdA = '955a1506-0fe2-f5aa-a094-84b8d4f3e8ad'; // pulse Writing of coyote 2.0 Device Bluetooth Characteristics into UUID A Channel
                const characteristicIdB = '955a1505-0fe2-f5aa-a094-84b8d4f3e8ad'; // pulse Writing of coyote 2.0 Device Bluetooth Characteristics into UUID B Channel

                this.gattServer!.getPrimaryService(serviceId)
                    .then(service => {
                        // get characteristic of channel A
                        return service.getCharacteristic(characteristicIdA);
                    })
                    .then(characteristicA => {
                        // writing to channel A
                        characteristicA.writeValue(this.hexStringToUint8Array(valueA));
                        // coyote 2.0 device requires obtaining B-channel characteristics
                        return this.gattServer!.getPrimaryService(serviceId)
                            .then(service => service.getCharacteristic(characteristicIdB));

                    })
                    .then(characteristicB => {
                        // writing to channel B
                        characteristicB.writeValue(this.hexStringToUint8Array(valueB));
                        // write counter 
                        this.count++;
                        if (this.count % 100 === 0) {
                            console.log('Write successful, write count' + this.count);
                        }
                    })
                    .catch(error => {
                        this.errorCount++;
                        console.error('Abnormal pulse writing：' + error)
                    });
            }
        }

        showSuccessToast(message: string) {
          toast.success(message);
        }

}

export default DGLab3;