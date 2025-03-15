//
// Copyright 2024 : Pragmatic Audio
//
// Declare UsbHIDConnector and attach it to the global window object

export const UsbHIDConnector = ( async function () {
    let devices = [];
    let currentDevice = null;

    const {usbHidDeviceHandlerConfig} = await import('./usbDeviceConfig.js');

    const getDeviceConnected = async () => {
        try {
            // Build filters from your configuration
            // (Assuming each configuration has a unique vendorId)
            const vendorToManufacturer = usbHidDeviceHandlerConfig.map(entry => ({
              vendorId: entry.vendorId,
              // You could also include productId if needed
            }));

            // Request devices matching the filters
            const selectedDevices = await navigator.hid.requestDevice({ filters: vendorToManufacturer });

            if (selectedDevices.length > 0) {
                const rawDevice = selectedDevices[0];
                // Find the vendor configuration matching the selected device
                const vendorConfig = usbHidDeviceHandlerConfig.find(entry => entry.vendorId === rawDevice.vendorId);

                if (!vendorConfig) {
                  console.error("No configuration found for vendor:", rawDevice.vendorId);
                  return;
                }

                const model = rawDevice.productName;

                // Look up the model-specific configuration from the vendor config.
                // If no specific model configuration exists, fall back to a default if provided.
                let deviceDetails = vendorConfig.devices[model] || {};
                let modelConfig = deviceDetails.modelConfig || vendorConfig.defaultModelConfig || {};

                const manufacturer = deviceDetails.manufacturer | vendorConfig.manufacturer;
                let handler = deviceDetails.handler ||  vendorConfig.handler;

                // Check if already connected
                const existingDevice = devices.find(d => d.rawDevice === rawDevice);
                if (existingDevice) {
                    console.log("Device already connected:", existingDevice.model);
                    currentDevice = existingDevice;
                    return currentDevice;
                }

                // Open the device if not already open
                if (!rawDevice.opened) {
                    await rawDevice.open();
                }
                currentDevice = {
                    rawDevice: rawDevice,
                    manufacturer: manufacturer,
                    model: model,
                    handler: handler,
                    modelConfig: modelConfig
                };

                if (currentDevice.handler) {
                    await currentDevice.handler.connect(currentDevice);
                } else {
                    console.error(`No handler found for ${manufacturer} ${model}`);
                    return null;
                }

                devices.push(currentDevice);
                return currentDevice;
            } else {
                console.log("No device found.");
                return null;
            }
        } catch (error) {
            console.error("Failed to connect to HID device:", error);
            return null;
        }
    };

    const disconnectDevice = async () => {
        if (currentDevice && currentDevice.rawDevice) {
            try {
                await currentDevice.rawDevice.close();
                console.log("Device disconnected:", currentDevice.model);
                devices = devices.filter(d => d !== currentDevice);
                currentDevice = null;
            } catch (error) {
                console.error("Failed to disconnect device:", error);
            }
        }
    };
    const checkDeviceConnected = async (rawDevice) => {
        const devices = await navigator.hid.getDevices();
        var connected =  devices.some(d => d === rawDevice);
        if (!connected) {
            console.error("Device disconnected?");
            alert('Device disconnected?');
            return false;
        }
        return true;
    };

    const pushToDevice = async (device, slot, preamp, filters) => {
        if (!await checkDeviceConnected(device.rawDevice)) {
            throw Error("Device Disconnected");
        }
        if (device && device.handler) {
            return await device.handler.pushToDevice(device, slot, preamp, filters);
        } else {
            console.error("No device handler available for pushing.");
        }
        return true;   // Disconnect anyway
    };

    // Helper Function to Get Available 'Custom' Slots Based on the Device that we can write too
    const  getAvailableSlots = async (device) => {
        return device.modelConfig.availableSlots;
    };

    const getCurrentSlot = async (device) => {
        if (device && device.handler) {
            return await device.handler.getCurrentSlot(device)
        }{
            console.error("No device handler available for querying");
            return -2;
        }
    };

    const pullFromDevice = async (device, slot) => {
        if (!await checkDeviceConnected(device.rawDevice)) {
            throw Error("Device Disconnected");
        }
        if (device && device.handler) {
            return await device.handler.pullFromDevice(device, slot);
        } else {
            console.error("No device handler available for pulling.");
            return { filters: [] }; // Empty filters
        }
    };

    const enablePEQ = async (device, enabled, slotId) => {
        if (device && device.handler) {
            return await device.handler.enablePEQ(device, enabled, slotId);
        } else {
            console.error("No device handler available for enabling.");
        }
    };

    const getCurrentDevice = () => currentDevice;

    return {
        getDeviceConnected,
        getAvailableSlots,
        disconnectDevice,
        pushToDevice,
        pullFromDevice,
        getCurrentDevice,
        getCurrentSlot,
        enablePEQ,
    };
})();
