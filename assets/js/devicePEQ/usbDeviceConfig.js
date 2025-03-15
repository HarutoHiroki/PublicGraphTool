// Dynamically import manufacturer specific handlers for their unique devices
const {fiioUsbHID} = await import('./fiioUsbHidHandler.js');
const {walkplayUsbHID} = await import('./walkplayHidHandler.js');
const {moondropUsbHID} = await import('./moondropHidHandler.js');

// Main list of HID devices - each vendor has one or more vendorId, and a list of devices associated,
// each device has a model of how the slots are configured and a handler to handle reading / writing
// the raw USBHID reports to the device
export const usbHidDeviceHandlerConfig = ( [
    {
      vendorId: 10610,
      manufacturer: "FiiO",
      handler: fiioUsbHID,
      defaultModelConfig: { // Fallback if we haven't got specific details yet
        minGain: -12,
        maxGain: 12,
        maxFilters: 5,
        firstWritableEQSlot: -1,
        maxWritableEQSlots: 0,
        disconnectOnSave: true,
        disabledPresetId: -1,
        availableSlots: []
      },
      devices: {
          "JadeAudio JA11": {
          modelConfig: {
            minGain: -12,
            maxGain: 12,
            maxFilters: 5,
            firstWritableEQSlot: 3,
            maxWritableEQSlots: 1,
            disconnectOnSave: true,
            disabledPresetId: 4,
            availableSlots: [{id: 0, name: "Vocal"}, {id: 1, name: "Classic"}, {id: 2, name: "Bass"}, {
              id: 3,
              name: "USER1"
            }]
          }
        },
        "FIIO KA17": {
          modelConfig: {
            minGain: -12,
            maxGain: 12,
            maxFilters: 10,
            firstWritableEQSlot: 7,
            maxWritableEQSlots: 3,
            disconnectOnSave: false,
            disabledPresetId: 11,
            availableSlots: [{id: 0, name: "Jazz"}, {id: 1, name: "Pop"}, {id: 2, name: "Rock"}, {
              id: 3,
              name: "Dance"
            }, {
              id: 5,
              name: "R&B"
            }, {id: 6, name: "Classic"}, {id: 7, name: "Hip-hop"}, {id: 4, name: "USER1"}, {id: 8, name: "USER2"}, {
              id: 9,
              name: "USER3"
            }]
          }
        },
        "FIIO Q7": {
          modelConfig: {
            minGain: -12,
            maxGain: 12,
            maxFilters: 10,
            firstWritableEQSlot: 7,
            maxWritableEQSlots: 3,
            disconnectOnSave: false,
            disabledPresetId: 11,
            availableSlots: [{id: 0, name: "Jazz"}, {id: 1, name: "Pop"}, {id: 2, name: "Rock"}, {
              id: 3,
              name: "Dance"
            }, {
              id: 5,
              name: "R&B"
            }, {id: 6, name: "Classic"}, {id: 7, name: "Hip-hop"}, {id: 4, name: "USER1"}, {id: 8, name: "USER2"}, {
              id: 9,
              name: "USER3"
            }]
          }
        },
        "FIIO BTR13": {
          modelConfig: {
            minGain: -12,
            maxGain: 12,
            maxFilters: 10,
            firstWritableEQSlot: 7,
            maxWritableEQSlots: 3,
            disconnectOnSave: false,
            disabledPresetId: 12,
            availableSlots: [{id: 0, name: "Jazz"}, {id: 1, name: "Pop"}, {id: 2, name: "Rock"}, {
              id: 3,
              name: "Dance"
            }, {
              id: 4,
              name: "R&B"
            }, {id: 5, name: "Classic"}, {id: 6, name: "Hip-hop"}, {id: 7, name: "USER1"}, {id: 8, name: "USER2"}, {
              id: 9,
              name: "USER3"
            }]
          }
        },
        "BTR17": {
          modelConfig: {
            minGain: -12,
            maxGain: 12,
            maxFilters: 10,
            firstWritableEQSlot: 7,
            maxWritableEQSlots: 3,
            disconnectOnSave: false,
            disabledPresetId: 11,
            availableSlots: [{id: 0, name: "Jazz"}, {id: 1, name: "Pop"}, {id: 2, name: "Rock"}, {
              id: 3,
              name: "Dance"
            }, {
              id: 4,
              name: "R&B"
            }, {id: 5, name: "Classic"}, {id: 6, name: "Hip-hop"}, {id: 160, name: "USER1"}, {id: 161, name: "USER2"}, {
              id: 162,
              name: "USER3"
            }, {id: 160, name: "USER1"}, {id: 161, name: "USER2"}, {id: 162, name: "USER3"}, {id: 163, name: "USER4"}, {
              id: 164,
              name: "USER5"
            }, {id: 165, name: "USER6"}, {id: 166, name: "USER7"}, {id: 167, name: "USER8"}, {id: 168, name: "USER9"}, {
              id: 169,
              name: "USER10"
            }]
          }
        },
        "FIIO KA15": {
          modelConfig: {
            minGain: -12,
            maxGain: 12,
            maxFilters: 10,
            firstWritableEQSlot: 7,
            maxWritableEQSlots: 3,
            disconnectOnSave: false,
            disabledPresetId: 11,
            availableSlots: [{id: 0, name: "Jazz"}, {id: 1, name: "Pop"}, {id: 2, name: "Rock"}, {
              id: 3,
              name: "Dance"
            }, {
              id: 4,
              name: "R&B"
            }, {id: 5, name: "Classic"}, {id: 6, name: "Hip-hop"}, {id: 7, name: "USER1"}, {id: 8, name: "USER2"}, {
              id: 9,
              name: "USER3"
            }]
          }
        },
        "K17": {
          modelConfig: {}
        },
        "LS-TC2": {
          modelConfig: {
            minGain: -12,
            maxGain: 12,
            maxFilters: 5,
            firstWritableEQSlot: 3,
            maxWritableEQSlots: 1,
            disconnectOnSave: true,
            disabledPresetId: 11,
            availableSlots: [{id: 0, name: "Vocal"}, {id: 1, name: "Classic"}, {id: 2, name: "Bass"}, {
              id: 3,
              name: "Dance"
            }, {id: 4, name: "R&B"}, {id: 5, name: "Classic"}, {id: 6, name: "Hip-hop"}, {id: 160, name: "USER1"}]
          }
        }
      }
    },
    {
      vendorId: 2578, // Snowsky
      manufacturer: "FiiO",
      handler: fiioUsbHID,
      devices: {
        "RETRO NANO": {
          modelConfig: {
            minGain: -12,
            maxGain: 12,
            maxFilters: 10,
            firstWritableEQSlot: 7,
            maxWritableEQSlots: 3,
            disconnectOnSave: true,
            disabledPresetId: 11,
            availableSlots: [{id: 0, name: "Vocal"}, {id: 1, name: "Classic"}, {id: 2, name: "Bass"}, {
              id: 3,
              name: "Dance"
            }, {id: 4, name: "R&B"}, {id: 5, name: "Classic"}, {id: 6, name: "Hip-hop"}, {id: 8, name: "Retro"}, {
              id: 11,
              name: "Close"
            }, {id: 160, name: "USER1"}, {id: 161, name: "USER2"}, {id: 162, name: "USER3"}]
          }
        },
      }
    },
    {
      vendorId: 13058,
      manufacturer: "WalkPlay",
      handler: walkplayUsbHID,
      defaultModelConfig:   {
          minGain: -12,
          maxGain: 12,
          maxFilters: 10,
          firstWritableEQSlot: -1,
          maxWritableEQSlots: 0,
          disconnectOnSave: true,
          disabledPresetId: -1,
          availableSlots: [{id: -99, name: "Default"}]
      },
      devices: {
        "Hi-MAX": {
          modelConfig:  {
            minGain: -12,
            maxGain: 12,
            maxFilters: 8,
            firstWritableEQSlot: -1,
            maxWritableEQSlots: 0,
            disconnectOnSave: false,
            disabledPresetId: -1,
            availableSlots: [{id: 101, name: "Custom"},{id: 102, name: "Custom 2"},{id: 103, name: "Custom 3"},{id: 104, name: "Custom 4"},{id: 1, name: "Pure"},{id: 2, name: "Pop"},{id: 3, name: "Rock"},{id: 4, name: "Vocal"},{id: 5, name: "Bass"},{id: 6, name: "Flat"},{id: 7, name: "Cinema"},{id: 8, name: "Game"},{id: -99, name: "Default"}]
          }
        },
        "Quark2": {
          manufacturer: "Moondrop",
          modelConfig: {
            minGain: -12,
            maxGain: 12,
            maxFilters: 8,
            firstWritableEQSlot: -1,
            maxWritableEQSlots: 0,
            disconnectOnSave: false,
            disabledPresetId: -1,
            availableSlots: [{id: 101, name: "Custom"},{id: 102, name: "Custom 2"},{id: 103, name: "Custom 3"},{id: 104, name: "Custom 4"},{id: 1, name: "Pure"},{id: 2, name: "Pop"},{id: 3, name: "Rock"},{id: 4, name: "Vocal"},{id: 5, name: "Bass"},{id: 6, name: "Flat"},{id: 7, name: "Cinema"},{id: 8, name: "Game"},{id: -99, name: "Default"}]
          }
        },
      }
    },
    {
      vendorId: 13784,
      manufacturer: "Moondrop",
      devices: {
        "ECHO-B": {
          handler: moondropUsbHID,
          modelConfig: {}
        },
      }
    }
])
