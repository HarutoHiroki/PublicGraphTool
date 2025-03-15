//
// Copyright 2024 : Pragmatic Audio
//
// Define the WiiM Network Handler for PEQ over HTTP API
//

const PLUGIN_URI = "http://moddevices.com/plugins/caps/EqNp";
const SOURCE_NAME = "wifi"; // Default source, can be changed dynamically

export const wiimNetworkHandler = (function () {

    /**
     * Fetch PEQ settings from the device
     * @param {string} ip - The device IP address
     * @param {number} slot - The PEQ slot (currently not used in WiiM API)
     * @returns {Promise<Object>} The parsed EQ settings
     */
    async function pullFromDevice(ip, slot) {
        try {
            const url = `https://${ip}/httpapi.asp?command=EQGetLV2SourceBandEx:${encodeURIComponent(JSON.stringify({ source_name: SOURCE_NAME, pluginURI: PLUGIN_URI }))}`;
            const response = await fetch(url, { method: "GET" });

            if (!response.ok) throw new Error(`Failed to fetch PEQ data: ${response.status}`);

            const data = await response.json();
            if (data.status !== "OK") throw new Error(`PEQ fetch failed: ${JSON.stringify(data)}`);

            console.log("WiiM PEQ Data:", data);

            const filters = parseWiiMEQData(data);
            return { filters, globalGain: 0, currentSlot: slot, deviceDetails: { maxFilters: 10 } };

        } catch (error) {
            console.error("Error pulling PEQ settings from WiiM:", error);
            throw error;
        }
    }

    /**
     * Push PEQ settings to the device
     * @param {string} ip - The device IP address
     * @param {number} slot - The PEQ slot (currently not used in WiiM API)
     * @param {number} preamp - The preamp gain
     * @param {Array} filters - Array of PEQ filters
     * @returns {Promise<boolean>} Returns true if push was successful
     */
    async function pushToDevice(ip, slot, preamp, filters) {
        try {
            const eqBandData = filters.map((filter, index) => ({
                index,
                param_name: `${String.fromCharCode(97 + index)}_mode`,
                value: filter.disabled ? -1 : convertToWiimMode(filter.type),
            }));

            filters.forEach((filter, index) => {
                eqBandData.push(
                    { index, param_name: `${String.fromCharCode(97 + index)}_freq`, value: filter.freq },
                    { index, param_name: `${String.fromCharCode(97 + index)}_q`, value: filter.q },
                    { index, param_name: `${String.fromCharCode(97 + index)}_gain`, value: filter.gain }
                );
            });

            const payload = {
                pluginURI: PLUGIN_URI,
                source_name: SOURCE_NAME,
                EQBand: eqBandData,
            };

            const url = `https://${ip}/httpapi.asp?command=EQSetLV2SourceBand:${encodeURIComponent(JSON.stringify(payload))}`;
            const response = await fetch(url, { method: "GET" });

            if (!response.ok) throw new Error(`Failed to push PEQ data: ${response.status}`);

            const data = await response.json();
            if (data.status !== "OK") throw new Error(`PEQ push failed: ${JSON.stringify(data)}`);

            console.log("WiiM PEQ updated successfully:", data);
            return true;

        } catch (error) {
            console.error("Error pushing PEQ settings to WiiM:", error);
            throw error;
        }
    }

    /**
     * Enable or disable PEQ
     * @param {string} ip - The device IP address
     * @param {boolean} enabled - Whether to enable or disable PEQ
     * @param {number} slotId - The PEQ slot (currently not used in WiiM API)
     * @returns {Promise<void>}
     */
    async function enablePEQ(ip, enabled, slotId) {
        try {
            const command = enabled ? "EQChangeSourceFX" : "EQSourceOff";
            const payload = { source_name: SOURCE_NAME, pluginURI: PLUGIN_URI };
            const url = `https://${ip}/httpapi.asp?command=${command}:${encodeURIComponent(JSON.stringify(payload))}`;
            const response = await fetch(url, { method: "GET" });

            if (!response.ok) throw new Error(`Failed to ${enabled ? "enable" : "disable"} PEQ: ${response.status}`);

            const data = await response.json();
            if (data.status !== "OK") throw new Error(`PEQ ${enabled ? "enable" : "disable"} failed: ${JSON.stringify(data)}`);

            console.log(`WiiM PEQ ${enabled ? "enabled" : "disabled"} successfully`);

        } catch (error) {
            console.error("Error toggling WiiM PEQ:", error);
            throw error;
        }
    }

    /**
     * Parse WiiM PEQ JSON response into a standardized format
     * @param {Object} data - The WiiM PEQ data
     * @returns {Array} Formatted PEQ filter list
     */
    function parseWiiMEQData(data) {
        const eqBands = data.EQBand || [];
        const filters = [];

        for (let i = 0; i < eqBands.length; i += 4) {
            const filterType = convertFromWiimMode(eqBands[i].value);
            const frequency = eqBands[i + 1].value;
            const qFactor = eqBands[i + 2].value;
            const gain = eqBands[i + 3].value;

            filters.push({
                type: filterType,
                freq: frequency,
                q: qFactor,
                gain: gain,
                disabled: filterType === "Off",
            });
        }

        return filters;
    }

    /**
     * Convert internal filter type to WiiM filter mode
     * @param {string} type - Internal filter type (PK, LSQ, HSQ)
     * @returns {number} WiiM PEQ mode value
     */
    function convertToWiimMode(type) {
        const mapping = { "Off": -1, "Low-Shelf": 0, "Peak": 1, "High-Shelf": 2 };
        return mapping[type] !== undefined ? mapping[type] : 1;
    }

    /**
     * Convert WiiM filter mode to internal filter type
     * @param {number} mode - WiiM PEQ mode value
     * @returns {string} Internal filter type
     */
    function convertFromWiimMode(mode) {
        switch (mode) {
            case 0: return "Low-Shelf";
            case 1: return "Peak";
            case 2: return "High-Shelf";
            default: return "Off";
        }
    }

    return {
        pullFromDevice,
        pushToDevice,
        enablePEQ,
    };
})();