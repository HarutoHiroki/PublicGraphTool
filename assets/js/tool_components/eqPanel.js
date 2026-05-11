// Extra panel: parametric EQ, file uploads, target/song uploads, AutoEQ, tone generator.

// Exposes window.showExtraPanel, window.hideExtraPanel, window.updateEQPhoneSelect
// (referenced from showPhone / removePhone / mobile focus logic in graphtool.js).
// Reads activePhones, showPhone, Equalizer, f_values, doc.

// Add extra feature
const SVG_ICON = {
    play:    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 22v-20l18 10-18 10z"/></svg>',
    pause:   '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M11 22h-4v-20h4v20zm6-20h-4v20h4v-20z"/></svg>',
    volume:  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 7l8-5v20l-8-5v-10zm-6 10h4v-10h-4v10zm20.264-13.264l-1.497 1.497c1.847 1.783 2.983 4.157 2.983 6.767 0 2.61-1.135 4.984-2.983 6.766l1.498 1.498c2.305-2.153 3.735-5.055 3.735-8.264s-1.43-6.11-3.736-8.264zm-.489 8.264c0-2.084-.915-3.967-2.384-5.391l-1.503 1.503c1.011 1.049 1.637 2.401 1.637 3.888 0 1.488-.623 2.841-1.634 3.891l1.503 1.503c1.468-1.424 2.381-3.309 2.381-5.394z"/></svg>',
    muted:   '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 7.358v15.642l-8-5v-.785l8-9.857zm3-6.094l-1.548-1.264-3.446 4.247-6.006 3.753v3.646l-2 2.464v-6.11h-4v10h.843l-3.843 4.736 1.548 1.264 18.452-22.736z"/></svg>'
};
function addExtra() {
    let extraButton = document.querySelector("div.select > div.selector-tabs > button.extra");
    // Disable functions by config
    if (!extraEnabled) {
        extraButton.remove();
        return;
    }
    if (!extraUploadEnabled) {
        document.querySelector("div.extra-panel > div.extra-upload").style["display"] = "none";
    }
    if (!extraEQEnabled) {
        document.querySelector("div.extra-panel > div.extra-eq").style["display"] = "none";
    }
    // Show and hide extra panel
    window.showExtraPanel = () => {
        document.querySelector("div.select > div.selector-panel").style["display"] = "none";
        document.querySelector("div.select > div.extra-panel").style["display"] = "flex";
        document.querySelector("div.select").setAttribute("data-selected", "extra");
        if (analyticsEnabled) { pushEventTag("clicked_equalizerTab", targetWindow); }
    };
    window.hideExtraPanel = (selectedList) => {
        document.querySelector("div.select > div.selector-panel").style["display"] = "flex";
        document.querySelector("div.select > div.extra-panel").style["display"] = "none";
        document.querySelector("div.select").setAttribute("data-selected", selectedList);
    };
    extraButton.addEventListener("click", showExtraPanel);
    // Upload function
    let uploadType = null;
    let fileFR = document.querySelector("#file-fr");
    document.querySelector("div.extra-upload-buttons > button.upload-fr").addEventListener("click", () => {
        uploadType = "fr";
        fileFR.click();
    });
    document.querySelector("div.extra-upload-buttons > button.upload-target").addEventListener("click", () => {
        uploadType = "target";
        fileFR.click();
    });
    let fileAudio = document.querySelector("#file-audio");
    document.querySelector("div.extra-upload-buttons > button.upload-track").addEventListener("click", () => {
        uploadType = "audio";
        fileAudio.click();
    });

    let addOrUpdatePhone = (brand, phone, ch) => {
        let phoneObj = asPhoneObj(brand, phone);
        phoneObj.rawChannels = ch;
        phoneObj.isDynamic = true;
        let phoneObjs = brand.phoneObjs;
        let oldPhoneObj = phoneObjs.filter(p => p.phone == phone.name)[0]
        if (oldPhoneObj) {
            oldPhoneObj.active && removePhone(oldPhoneObj);
            phoneObj.id = oldPhoneObj.id;
            phoneObj.offset = oldPhoneObj.offset;
            phoneObjs[phoneObjs.indexOf(oldPhoneObj)] = phoneObj;
            allPhones[allPhones.indexOf(oldPhoneObj)] = phoneObj;
        } else {
            brand.phones.push(phone);
            phoneObjs.push(phoneObj);
            allPhones.push(phoneObj);
        }
        updatePhoneSelect();
        return phoneObj;
    };
    fileFR.addEventListener("change", (e) => {
        let file = e.target.files[0];
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.onload = (e) => {
            let name = file.name.replace(/\.[^\.]+$/, "");
            let phone = { name: name };
            let ch = [tsvParse(e.target.result)];
            if (ch[0].length < 32) {
                alert("Parse frequence response file failed: invalid format.");
                return;
            }
            ch[0] = Equalizer.interp(f_values, ch[0]);
            if (uploadType === "fr") {
                name.match(/ R$/) && ch.splice(0, 0, null);
                let phoneObj = addOrUpdatePhone(brandMap.Uploaded, phone, ch);
                showPhone(phoneObj, false);
            } else if (uploadType === "target") {
                let fullName = name + (name.match(/ Target$/i) ? "" : " Target");
                let existsTargets = targets.reduce((a, b) => a.concat(b.files), []).map(f => f += " Target");
                if (existsTargets.indexOf(fullName) >= 0) {
                    alert("This target already exists on this tool, please select it instead of upload.");
                    return;
                }
                let phoneObj = {
                    isTarget: true,
                    brand: brandTarget,
                    dispName: name,
                    phone: name,
                    fullName: fullName,
                    fileName: fullName,
                    rawChannels: ch,
                    isDynamic: true,
                    id: -brandTarget.phoneObjs.length
                };
                showPhone(phoneObj, true);
            }
        };
        reader.readAsText(file);
    });
    // eq test track
    fileAudio.addEventListener("change", (e) => {
        let file = e.target.files[0];
        if (!file) {
            return;
        }
        // if theres already an uploaded track, replace it
        if (uploadedAudio || uploadedSource) {
            uploadedAudio.pause();
            currentAudio.currentTime = 0;

            let pinkNoisePlayButton = document.getElementById("play-button");
            pinkNoisePlayButton.classList.remove("playing");
            pinkNoisePlayButton.innerHTML = SVG_ICON.play;

            uploadedAudio = null;
            uploadedSource.disconnect();
        }
        const objectURL = URL.createObjectURL(file);
        uploadedAudio = new Audio(objectURL);
        uploadedSource = audioContext.createMediaElementSource(uploadedAudio);

        let eqDemo = document.querySelector("div.eq-demo");
        let eqTrack = eqDemo.querySelector(".eq-track");
        eqTrack.value = "custom-eq-track";
        eqTrack.dispatchEvent(new Event("change"));
    });

    // EQ Function
    let eqPhoneSelect = document.querySelector("div.extra-eq select[name='phone']");
    let filtersContainer = document.querySelector("div.extra-eq > div.filters");
    let fileFiltersImport = document.querySelector("#file-filters-import");
    let filterEnabledInput, filterTypeSelect,
        filterFreqInput, filterQInput, filterGainInput;
    let eqBands = extraEQBands;
    let updateFilterElements = () => {
        let node = filtersContainer.querySelector("div.filter");
        while (filtersContainer.childElementCount < eqBands) {
            let clone = node.cloneNode(true);
            clone.querySelector("input[name='enabled']").value = "true";
            clone.querySelector("select[name='type']").value = "PK";
            clone.querySelector("input[name='freq']").value = "0";
            clone.querySelector("input[name='q']").value = "0";
            clone.querySelector("input[name='gain']").value = "0";
            filtersContainer.appendChild(clone);
        }
        while (filtersContainer.childElementCount > eqBands) {
            filtersContainer.children[filtersContainer.childElementCount-1].remove();
        }
        filterEnabledInput = filtersContainer.querySelectorAll("input[name='enabled']");
        filterTypeSelect = filtersContainer.querySelectorAll("select[name='type']");
        filterFreqInput = filtersContainer.querySelectorAll("input[name='freq']");
        filterQInput = filtersContainer.querySelectorAll("input[name='q']");
        filterGainInput = filtersContainer.querySelectorAll("input[name='gain']");
        filtersContainer.querySelectorAll("input,select").forEach(el => {
            el.removeEventListener("input", applyEQ);
            el.addEventListener("input", applyEQ);
        });
    };
    let elemToFilters = (includeAll) => {
        // Collect filters from ui
        let filters = [];
        for (let i = 0; i < eqBands; ++i) {
            let disabled = !filterEnabledInput[i].checked;
            let type = filterTypeSelect[i].value;
            let freq = parseInt(filterFreqInput[i].value) || 0;
            let q = parseFloat(filterQInput[i].value) || 0;
            let gain = parseFloat(filterGainInput[i].value) || 0;
            if (!includeAll && (disabled || !type || !freq || !q || !gain)) {
                continue;
            }
            filters.push({ disabled, type, freq, q, gain });
        }
        return filters;
    };
    let filtersToElem = (filters) => {
        // Set filters to ui
        let filtersCopy = filters.map(f => f);
        while (filtersCopy.length < eqBands) {
            filtersCopy.push({ type: "PK", freq: 0, q: 0, gain: 0 });
        }
        if (filtersCopy.length > eqBands) {
            eqBands = Math.min(filtersCopy.length, extraEQBandsMax);
            filtersCopy = filtersCopy.slice(0, eqBands);
            updateFilterElements();
        }
        filtersCopy.forEach((f, i) => {
            filterEnabledInput[i].checked = !f.disabled;
            filterTypeSelect[i].value = f.type;
            filterFreqInput[i].value = f.freq;
            filterQInput[i].value = f.q;
            filterGainInput[i].value = f.gain;
        });
    };
    let applyEQHandle = null;
    let applyEQExec = () => {
        // Create and show phone with eq applied
        let activeElem = document.activeElement;
        let phoneSelected = eqPhoneSelect.value;
        let filters = elemToFilters();
        if (filters.length && !phoneSelected) {
            let firstPhone = eqPhoneSelect.querySelectorAll("option")[1];
            if (firstPhone) {
                phoneSelected = eqPhoneSelect.value = firstPhone.value;
            }
        }
        let phoneObj = phoneSelected && activePhones.filter(
            p => !p.isPrefBounds && p.brand.name + " " + p.dispName == phoneSelected)[0];
        if (!phoneObj || (!filters.length && !phoneObj.eq)) {
            return; // Allow empty filters if eq is applied before
        }
        let phoneEQ = { name: phoneObj.dispName + " EQ" };
        let phoneObjEQ = addOrUpdatePhone(phoneObj.brand, phoneEQ,
            phoneObj.rawChannels.map(c => c ? Equalizer.apply(c, filters) : null));
        phoneObj.eq = phoneObjEQ;
        phoneObjEQ.eqParent = phoneObj;
        if (typeof pendingEqOffset === "number" && isFinite(pendingEqOffset)) {
            phoneObjEQ.offset = pendingEqOffset;
            pendingEqOffset = null;
        }
        updatePreampDisplay();
        showPhone(phoneObjEQ, false);
        activeElem.focus();
    };
    let pendingEqOffset = null;
    let applyEQ = () => {
        clearTimeout(applyEQHandle);
        applyEQHandle = setTimeout(applyEQExec, 1);
        updateFilters(elemToFilters());
        document.dispatchEvent(new CustomEvent('UpdateExtensionFilters', { detail: { filters: elemToFilters() } }));
    };
    window.updateEQPhoneSelect = () => {
        let oldValue = eqPhoneSelect.value;
        let optionValues = activePhones.filter(p =>
            !p.isPrefBounds && !p.isTarget && !p.dispName.match(/ EQ$/)).map(p => p.brand.name + " " + p.dispName);
        Array.from(eqPhoneSelect.children).slice(1).forEach(c => eqPhoneSelect.removeChild(c));
        optionValues.forEach(value => {
            let optionElem = document.createElement("option");
            optionElem.setAttribute("value", value);
            optionElem.innerText = value;
            eqPhoneSelect.appendChild(optionElem);
        });
        eqPhoneSelect.value = (optionValues.indexOf(oldValue) >= 0) ? oldValue : "";
    };
    updateFilterElements();
    eqPhoneSelect.addEventListener("input", applyEQ);
    // Add new filter
    document.querySelector("div.extra-eq button.add-filter").addEventListener("click", () => {
        eqBands = Math.min(eqBands + 1, extraEQBandsMax);
        updateFilterElements();
    });
    // Remove last filter
    document.querySelector("div.extra-eq button.remove-filter").addEventListener("click", () => {
        eqBands = Math.max(eqBands - 1, 1);
        updateFilterElements();
        applyEQ(); // May removed effective filter
    });
    // Sort filters by frequency
    document.querySelector("div.extra-eq button.sort-filters").addEventListener("click", () => {
        filtersToElem(elemToFilters(true).sort((a, b) =>
            (a.freq || Infinity) - (b.freq || Infinity)));
    });
    // Disable / Enable all filters
    let disableFiltersBtn = document.querySelector("div.extra-eq button.disable-filters");
    disableFiltersBtn.addEventListener("click", () => {
        let disabling = !disableFiltersBtn.classList.contains("selected");
        disableFiltersBtn.classList.toggle("selected", disabling);
        disableFiltersBtn.innerText = disabling ? "Enable All" : "Disable All";
        for (let i = 0; i < eqBands; ++i) {
            filterEnabledInput[i].checked = !disabling;
        }
        applyEQ();
    });
    // Saving filters as a separate comparable phone
    let savedCounter = 1;
    document.querySelector("div.extra-eq button.save-filters").addEventListener("click", () => {
        let phoneSelected = eqPhoneSelect.value;
        let phoneObj = phoneSelected && activePhones.filter(
            p => !p.isPrefBounds && p.brand.name + " " + p.dispName == phoneSelected && p.eq)[0];
        let filters = elemToFilters(true);
        if (!phoneObj || !filters.length) {
            alert("Please select model and add at least one filter before saving.");
            return;
        }

        let phoneEQ = { name: phoneObj.phone + " EQ Saved " + savedCounter };
        let phoneObjEQ = addOrUpdatePhone(phoneObj.brand, phoneEQ, phoneObj.eq.rawChannels);
        phoneObjEQ.eqParent = phoneObj;
        showPhone(phoneObjEQ, false);
        savedCounter++;
    });
    // Import filters
    document.querySelector("div.extra-eq button.import-filters").addEventListener("click", () => {
        fileFiltersImport.click();
    });
    fileFiltersImport.addEventListener("change", (e) => {
        // Import filters callback
        let file = e.target.files[0];
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.onload = (e) => {
            let settings = e.target.result;
            let filters = settings.split("\n").map(l => {
                let r = l.match(/Filter\s*\d+:\s*(\S+)\s*(\S+)\s*Fc\s*(\S+)\s*Hz\s*Gain\s*(\S+)\s*dB(\s*Q\s*(\S+))?/);
                if (!r) { return undefined; }
                let disabled = (r[1] !== "ON");
                let type = r[2];
                let freq = parseInt(r[3]) || 0;
                let gain = parseFloat(r[4]) || 0;
                let q = parseFloat(r[6]) || 0;
                if (type === "LS" || type === "HS") {
                    type += "Q";
                    q = q || 0.707;
                } else if (type === "LSC" || type === "HSC") {
                    // Equalizer APO use LSC/HSC instead of LSQ/HSQ
                    type = type.substr(0, 2) + "Q";
                }
                return { disabled, type, freq, q, gain };
            }).filter(f => f);
            while (filters.length > 0) {
                // Remove empty tail filters
                let lastFilter = filters[filters.length-1];
                if (!lastFilter.freq && !lastFilter.q && !lastFilter.gain) {
                    filters.pop(); 
                } else {
                    break;
                }
            }
            if (filters.length > 0) {
                filtersToElem(filters);
                applyEQ();
            } else {
                alert("Parse filters file failed: no filter found.");
            }
        };
        reader.readAsText(file);
    });
    // Export filters
    document.querySelector("div.extra-eq button.export-filters").addEventListener("click", () => {
        let phoneSelected = eqPhoneSelect.value;
        let phoneObj = phoneSelected && activePhones.filter(
            p => !p.isPrefBounds && p.brand.name + " " + p.dispName == phoneSelected && p.eq)[0];
        let filters = elemToFilters(true);
        if (!phoneObj || !filters.length) {
            alert("Please select model and add atleast one filter before export.");
            return;
        }
        let preamp = Equalizer.calc_preamp(
            phoneObj.rawChannels.filter(c => c)[0],
            phoneObj.eq.rawChannels.filter(c => c)[0]);
        let settings = "Preamp: " + preamp.toFixed(1) + " dB\r\n";
        filters.forEach((f, i) => {
            let on = (!f.disabled && f.type && f.freq && f.gain && f.q) ? "ON" : "OFF";
            let type = f.type;
            if (type === "LSQ" || type === "HSQ") {
                // Equalizer APO use LSC/HSC instead of LSQ/HSQ
                type = type.substr(0, 2) + "C";
            }
            settings += ("Filter " + (i+1) + ": " + on + " " + type + " Fc " +
                f.freq.toFixed(0) + " Hz Gain " + f.gain.toFixed(1) + " dB Q " +
                f.q.toFixed(3) + "\r\n");
        });
        let exportElem = document.querySelector("#file-filters-export");
        exportElem.href && URL.revokeObjectURL(exportElem.href);
        exportElem.href = URL.createObjectURL(new Blob([settings]));
        exportElem.download = phoneObj.fullName.replace(/^Uploaded /, "") + " Filters.txt";
        exportElem.click();
    });
    // Export filters as graphic eq (for wavelet)
    document.querySelector("div.extra-eq button.export-graphic-filters").addEventListener("click", () => {
        let phoneSelected = eqPhoneSelect.value;
        let phoneObj = phoneSelected && activePhones.filter(
            p => !p.isPrefBounds && p.brand.name + " " + p.dispName == phoneSelected && p.eq)[0] || { fullName: "Unnamed" };
        let filters = elemToFilters();
        if (!filters.length) {
            alert("Please add atleast one filter before export.");
            return;
        }
        let graphicEQ = Equalizer.as_graphic_eq(filters);
        let settings = "GraphicEQ: " + graphicEQ.map(([f, gain]) =>
            f.toFixed(0) + " " + gain.toFixed(1)).join("; ");
        let exportElem = document.querySelector("#file-filters-export");
        exportElem.href && URL.revokeObjectURL(exportElem.href);
        exportElem.href = URL.createObjectURL(new Blob([settings]));
        exportElem.download = phoneObj.fullName.replace(/^Uploaded /, "") + " Graphic Filters.txt";
        exportElem.click();
    });
    // Readme
    document.querySelector("div.extra-eq button.readme").addEventListener("click", () => {
        alert("1. If you want to AutoEQ model A to B, display A B and remove target\n" +
            "2. Add/Remove bands before AutoEQ may give you a better result\n" +
            "3. The behavior of filters close to 20K is implementation dependent, avoid such filter if you're not sure how your DSP software works\n" +
            "4. EQ treble require resonant peak matching and fine tune by ear, keep treble untouched if you're not sure how to do that\n" +
            "5. Tone generator is useful to find actual location of peaks and dips, notice the web version may not work on some platform\n\n" +
            "JS port of AutoEQ algorithm provided by PEQdB (https://github.com/peqdb/autoeq-c)\n");
    });
    // AutoEQ
    let autoEQFromInput = document.querySelector("div.extra-eq input[name='autoeq-from']");
    let autoEQToInput = document.querySelector("div.extra-eq input[name='autoeq-to']");
    let autoEQGainFromInput = document.querySelector("div.extra-eq input[name='autoeq-gain-from']");
    let autoEQGainToInput = document.querySelector("div.extra-eq input[name='autoeq-gain-to']");
    let autoEQQFromInput = document.querySelector("div.extra-eq input[name='autoeq-q-from']");
    let autoEQQToInput = document.querySelector("div.extra-eq input[name='autoeq-q-to']");
    autoEQFromInput.value = Equalizer.config.AutoEQRange[0].toFixed(0);
    autoEQToInput.value = Equalizer.config.AutoEQRange[1].toFixed(0);
    autoEQGainFromInput.value = Equalizer.config.OptimizeGainRange[0].toFixed(0);
    autoEQGainToInput.value = Equalizer.config.OptimizeGainRange[1].toFixed(0);
    autoEQQFromInput.value = Equalizer.config.OptimizeQRange[0].toFixed(1);
    autoEQQToInput.value = Equalizer.config.OptimizeQRange[1].toFixed(1);
    document.querySelector("div.extra-eq button.autoeq").addEventListener("click", () => {
        // Generate filters automatically
        let phoneSelected = eqPhoneSelect.value;
        if (!phoneSelected) {
            let firstPhone = eqPhoneSelect.querySelectorAll("option")[1];
            if (firstPhone) {
                phoneSelected = eqPhoneSelect.value = firstPhone.value;
            }
        }
        let phoneObj = phoneSelected && activePhones.filter(
            p => !p.isPrefBounds && p.brand.name + " " + p.dispName == phoneSelected)[0];
        let targetObj = (activePhones.filter(p => p.isTarget)[0] ||
            activePhones.filter(p => p !== phoneObj && !p.isTarget)[0]);
        if (!phoneObj || !targetObj) {
            alert("Please select model and target, if there are no target and multiple models are displayed then the second one will be selected as target.");
            return;
        }
        let autoEQOverlay = document.querySelector(".extra-eq-overlay");
        autoEQOverlay.style.display = "block";
        setTimeout(async () => {
            let autoEQFrom = Math.min(Math.max(parseInt(autoEQFromInput.value) || 0, 20), 20000);
            let autoEQTo = Math.min(Math.max(parseInt(autoEQToInput.value) || 0, autoEQFrom), 20000);
            Equalizer.config.AutoEQRange = [autoEQFrom, autoEQTo];
            let autoEQGainFrom = Math.min(Math.max(parseInt(autoEQGainFromInput.value) || 0, -20), 20);
            let autoEQGainTo = Math.min(Math.max(parseInt(autoEQGainToInput.value) || 0, autoEQGainFrom), 20);
            Equalizer.config.OptimizeGainRange = [autoEQGainFrom, autoEQGainTo];
            let autoEQQFrom = Math.min(Math.max(parseFloat(autoEQQFromInput.value) || 0, 0.1), 5);
            let autoEQQTo = Math.min(Math.max(parseFloat(autoEQQToInput.value) || 0, autoEQQFrom), 5);
            Equalizer.config.OptimizeQRange = [autoEQQFrom, autoEQQTo];
            let phoneCHs = (phoneObj.rawChannels.filter(c => c)
                .map(ch => ch.map(([f, v]) => [f, v + phoneObj.norm])));
            let phoneCH = (phoneCHs.length > 1) ? avgCurves(phoneCHs) : phoneCHs[0];
            let targetCH = targetObj.rawChannels.filter(c => c)[0].map(([f, v]) => [f, v + targetObj.norm]);

            let [filters, offset] = await Equalizer.autoeq(
                phoneCH, targetCH, eqBands, typeof autoEqMode === 'undefined' ? 'IE' : autoEqMode);

            filtersToElem(filters);
            pendingEqOffset = offset;
            applyEQ();

            autoEQOverlay.style.display = "none";
        }, 1);
    });

    //* Pre amp Calc display *//
    function updatePreampDisplay() {
        let phoneSelected = eqPhoneSelect.value;
        let phoneObj = phoneSelected && activePhones.filter(
            p => !p.isPrefBounds && p.brand.name + " " + p.dispName == phoneSelected && p.eq)[0];
        let preamp = Equalizer.calc_preamp(
            phoneObj.rawChannels.filter(c => c)[0],
            phoneObj.eq.rawChannels.filter(c => c)[0]);
        let preampDisplay = document.getElementById("preamp-disp");
        if (preampDisplay) {
            preampDisplay.innerText = "Pre-amp: " + preamp.toFixed(1) + " dB";
        }
    }

    
    let toneGeneratorFromInput = document.querySelector("div.settings-row input[name='tone-generator-from']");
    let toneGeneratorToInput = document.querySelector("div.settings-row input[name='tone-generator-to']");
    let toneGeneratorSlider = document.querySelector("div.eq-demo input[name='tone-generator-freq']");
    let toneGeneratorText = document.querySelector("div.eq-demo .freq-text");
    let toneGenRange = document.querySelector("div.settings-row[name='tone-gen-range']");
    let toneGenSlider = document.querySelector("div.eq-demo[name='tone-gen-slider']");
    let toneGeneratorOsc = null;

    //* PINK NOISE WITH EQ FROM ABOVE, requested by listener *//
    
    // custom EQ stuff
    let pinkNoiseAudio, pinkNoiseSource, scarletFireAudio, scarletFireSource, 
        uploadedAudio, uploadedSource, currentAudio, currentSource;
    let toneGenActive = false;

    //* ---------- Audio Context ---------- *//
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (!audioContext) {
        alert("Web audio api is disabled, please enable it if you want to use EQ testing functions.");
        return;
    }

    //* ---------- Volume, Channel Balance Stuff ---------- *//
    // create and set the initial value of the volume slider
    const volumeIcon = document.querySelector('.volume-icon');
    const volumeRange = document.getElementById('volumeRange');
    let currentVolume = 12.5;
    let volumeNode = audioContext.createGain();
    volumeNode.gain.value = 0.125;

    // channel splitter and merger to split the audio into left and right channels
    let channelSplitter = audioContext.createChannelSplitter(2);
    let channelMerger = audioContext.createChannelMerger(2);
    let rightChannel = audioContext.createGain();
    let leftChannel = audioContext.createGain();
    
    // volume stuff
    volumeIcon.addEventListener("click", () => {
        if (volumeIcon.classList.contains("muted")) {
            volumeIcon.classList.remove("muted");
            volumeIcon.innerHTML = SVG_ICON.volume;
            volumeRange.value = currentVolume;
            volumeNode.gain.value = currentVolume/100;
        } else {
            volumeIcon.classList.add("muted");
            volumeIcon.innerHTML = SVG_ICON.muted;
            currentVolume = volumeRange.value;
            volumeRange.value = 0;
            volumeNode.gain.value = 0;
        }
    });
    
    volumeRange.addEventListener("input", () => {
        currentVolume = volumeRange.value;
        volumeNode.gain.value = volumeRange.value/100;
    });
    
    // channel balance feature
    let channelBalanceSlider = document.querySelector("div.settings-row input[name='balance-vol']");
    let rightVol = 1;
    let leftVol = 1;
    
    function updateChannelBalance(leftVol, rightVol) {
        leftChannel.gain.setValueAtTime(leftVol, audioContext.currentTime);
        rightChannel.gain.setValueAtTime(rightVol, audioContext.currentTime);
    }
    
    channelBalanceSlider.addEventListener("input", () => {
        let balValue = channelBalanceSlider.value;
        leftVol = balValue < 0 ? Math.pow(10, Math.abs(balValue) / 20) : 1;
        rightVol = balValue > 0 ? Math.pow(10, Math.abs(balValue) / 20) : 1;
    
        updateChannelBalance(leftVol, rightVol);
    
        // update volume text display
        doc.select("#vol-left").node().value = balValue < 0 ? Math.abs(balValue) : 0.0;
        doc.select("#vol-right").node().value = balValue > 0 ? Math.abs(balValue) : 0.0;
    });
    
    // channel balance text input
    doc.select("#vol-left").on("change input", function () {
        let balValue = doc.select("#vol-left").node().value;
        leftVol = balValue > 0 ? Math.pow(10, Math.abs(balValue) / 20) : 1;
        updateChannelBalance(leftVol, rightVol);
    
        // update balance slider
        channelBalanceSlider.value = -balValue;
    });
    
    doc.select("#vol-right").on("change input", function () {
        let balValue = doc.select("#vol-right").node().value;
        rightVol = balValue > 0 ? Math.pow(10, Math.abs(balValue) / 20) : 1;
        updateChannelBalance(leftVol, rightVol);
    
        // update balance slider
        channelBalanceSlider.value = balValue;
    });

    // connect the splitter and merger
    channelSplitter.connect(leftChannel, 0);
    channelSplitter.connect(rightChannel, 1);
    leftChannel.connect(channelMerger, 0, 0);
    rightChannel.connect(channelMerger, 0, 1);

    // connect overall volume to merger and then to destination
    channelMerger.connect(volumeNode);
    volumeNode.connect(audioContext.destination);

    // Filters
    function updateFilters(filters) {
        if (filters.length == 0) {
            filters = [{ type: "PK", freq: 20, q: 0, gain: 0 }];
        }
    
        applyFilters(audioContext, currentSource, filters);
    }

    function applyFilters(audioContext, inputNode, filters) {
        const nodes = [inputNode];
    
        nodes[nodes.length - 1].disconnect();

        if (inputNode == pinkNoiseSource || inputNode == toneGeneratorOsc) {
            // Duplicate the mono/stereo channel into stereo
            const splitter = audioContext.createChannelSplitter(2);
            inputNode.connect(splitter);
            nodes.push(splitter);
        
            const merger = audioContext.createChannelMerger(2);
            nodes[nodes.length - 1].connect(merger, 0, 0); // Connect to the left channel
            nodes[nodes.length - 1].connect(merger, 0, 1); // Connect to the right channel
            nodes.push(merger);
        }
        
        filters.forEach(filterInfo => {
            const filter = audioContext.createBiquadFilter();
            let type;
            if (filterInfo.type == "PK") {
                type = "peaking";
            } else if (filterInfo.type == "LSQ") {
                type = "lowshelf";
            } else if (filterInfo.type == "HSQ") {
                type = "highshelf";
            }
            filter.type = type;
            filter.frequency.value = filterInfo.freq;
            filter.Q.value = filterInfo.q;
            filter.gain.value = filterInfo.gain;
            
            nodes[nodes.length - 1].connect(filter);
            nodes.push(filter);
        });
        
        nodes[nodes.length - 1].connect(channelSplitter);
    }

    // load pink noise audio file
    document.addEventListener("DOMContentLoaded", () => {
        pinkNoiseAudio = document.getElementById("pinkNoiseAudio");
        pinkNoiseSource = audioContext.createMediaElementSource(pinkNoiseAudio);
        scarletFireAudio = document.getElementById("scarletFIRE");
        scarletFireSource = audioContext.createMediaElementSource(scarletFireAudio);
        currentAudio = pinkNoiseAudio;
        currentSource = pinkNoiseSource;

        // apply filters
        applyFilters(audioContext, currentSource, elemToFilters());

        // track swapping
        let pinkNoisePlayButton = document.getElementById("play-button");
        let eqDemo = document.querySelector("div.eq-demo");
        let eqTrack = eqDemo.querySelector(".eq-track");
        eqTrack.addEventListener("change", () => {
            // pause and reset audio
            if (toneGenActive && toneGeneratorOsc) {
                currentSource.stop();
                toneGeneratorOsc = null;
            } else {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }

            pinkNoisePlayButton.classList.remove("playing");
            pinkNoisePlayButton.innerHTML = SVG_ICON.play;

            switch (eqTrack.value) {
                default:
                    toneGenActive = false;
                    toneGenRange.classList.add("hidden");
                    toneGenSlider.classList.add("hidden");
                    currentAudio = pinkNoiseAudio;
                    currentSource = pinkNoiseSource;
                    break;
                case "scarlet":
                    toneGenActive = false;
                    toneGenRange.classList.add("hidden");
                    toneGenSlider.classList.add("hidden");
                    currentAudio = scarletFireAudio;
                    currentSource = scarletFireSource;
                    break;
                case "custom-eq-track":
                    if (!uploadedAudio || !uploadedSource) {
                        alert("Please upload an audio file first.");
                        eqTrack.value = "pink";
                        currentAudio = pinkNoiseAudio;
                        currentSource = pinkNoiseSource;
                        return;
                    }
                    toneGenActive = false;
                    toneGenRange.classList.add("hidden");
                    toneGenSlider.classList.add("hidden");
                    currentAudio = uploadedAudio;
                    currentSource = uploadedSource;
                    break;
                case "tone":
                    toneGenActive = true;
                    toneGenRange.classList.remove("hidden");
                    toneGenSlider.classList.remove("hidden");
                    break;
            }

            // display current song time progress
            let songProgressSlider = document.querySelector("div.eq-demo input[name='demo-time']");
            let songTimeText = document.getElementById("songTime");
    
            currentAudio.addEventListener("timeupdate", () => {
                let songTime = currentAudio.currentTime;
                let songMinutes = Math.floor(songTime / 60);
                let songSeconds = Math.floor(songTime % 60);
                let songHours = Math.floor(songMinutes / 60);
                songMinutes %= 60;
                songSeconds = songSeconds < 10 ? "0" + songSeconds : songSeconds;
                songMinutes = songMinutes < 10 ? "0" + songMinutes : songMinutes;
                songHours = songHours < 10 ? "0" + songHours : songHours;
                songTimeText.innerText = songHours + ":" + songMinutes + ":" + songSeconds;
                songProgressSlider.value = (songTime / currentAudio.duration) * 100;
            });    

            // skip forward and backward on song progress slider
            songProgressSlider.addEventListener("input", () => {
                currentAudio.currentTime = (songProgressSlider.value / 100) * currentAudio.duration;
            });
        });

        // tone generator frequency slider
        toneGeneratorSlider.addEventListener("input", () => {
            let from = Math.min(Math.max(parseInt(toneGeneratorFromInput.value) || 0, 20), 20000);
            let to = Math.min(Math.max(parseInt(toneGeneratorToInput.value) || 0, from), 20000);
            let position = parseFloat(toneGeneratorSlider.value) || 0;
            let freq = Math.round(Math.exp( // Slider move in log scale
                Math.log(from) + (Math.log(to) - Math.log(from)) * position));
            toneGeneratorText.innerText = freq;
            if (toneGeneratorOsc) {
                let t = audioContext.currentTime;
                toneGeneratorOsc.frequency.cancelScheduledValues(t);
                toneGeneratorOsc.frequency.setTargetAtTime(freq, t, 0.2);
            }
        });

        // when song ends, reset button
        currentAudio.addEventListener("ended", () => {
            pinkNoisePlayButton.classList.remove("playing");
            pinkNoisePlayButton.innerHTML = SVG_ICON.play;
        });

        // play pink noise when button class="pink-noise" is clicked and stop when clicked again
        pinkNoisePlayButton.addEventListener("click", () => {
            if (pinkNoisePlayButton.classList.contains("playing")) {
                if (toneGenActive && toneGeneratorOsc) {
                    currentSource.stop();
                    toneGeneratorOsc = null;
                } else {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }
                pinkNoisePlayButton.classList.remove("playing");
                pinkNoisePlayButton.innerHTML = SVG_ICON.play;
            } else {
                audioContext.resume();
                if (toneGenActive) {
                    toneGeneratorOsc = audioContext.createOscillator();
                    toneGeneratorOsc.type = "sine";
                    toneGeneratorOsc.frequency.value = parseInt(toneGeneratorText.innerText);
                    currentSource = toneGeneratorOsc;
                    updateFilters(elemToFilters());
                    currentSource.start();
                } else {
                    updateFilters(elemToFilters());
                    currentAudio.play();
                }
                pinkNoisePlayButton.classList.add("playing");
                pinkNoisePlayButton.innerHTML = SVG_ICON.pause;
            }
        });
    });

    // get average of all active headphones except targets
    function getAvgAll() {
        let v = activePhones.filter(p => !p.isTarget && !p.isPrefBounds).map(getAvgArithmetic);
        return avgCurvesArithmetic(v);
    }
    // draw average of all active headphones
    let avgAllBtn = document.querySelector("button#avg-all");

    avgAllBtn.addEventListener("click", function() {
        let avgAll = getAvgAll();
        let p = { name: "Average of All SPLs"};
        let ch = [avgAll];
        let phone = addOrUpdatePhone(brandMap.Uploaded, p, ch);
        // if avg-all button not classed with selected class
        if (!avgAllBtn.classList.contains("selected")) {
            showPhone(phone, false);
            // add selected class to avg-all button
            avgAllBtn.classList.add("selected");
        } else {
            // remove selected class from avg-all button
            avgAllBtn.classList.remove("selected");
            // remove avg-all phone
            removePhone(phone);
        }
        updatePaths(true);
    });
    
    // Wrap up preamp Calculation Function for plugin
    let calcEqDevPreamp = (filters) => {
        const phoneSelected = eqPhoneSelect.value;
        const phoneObj = phoneSelected &&
            activePhones.find(
                (p) => p.fullName === phoneSelected && p.eq
            );

        return Equalizer.calc_preamp(
            phoneObj.rawChannels.filter(Boolean)[0],
            phoneObj.eq.rawChannels.filter(Boolean)[0]
        );
    }

    /**
     * Dynamically load a plugin from a sub-folder passing it the useful context
     * @param pluginsToLoad
     * @param context
     * @returns {Promise<void>}
     */
    async function loadPlugins(pluginsToLoad, context) {
        for (const pluginPath of pluginsToLoad) {
            try {
                let initializePlugin;

                if (typeof module !== 'undefined' && module.exports) {
                    // CommonJS environment (e.g., Node.js)
                    initializePlugin = require(pluginPath);
                } else {
                    // ES Module environment (e.g., modern browsers)
                    const module = await import(pluginPath);
                    initializePlugin = module.default;
                }

                // Call the plugin function with the provided context
                await initializePlugin(context);
                console.log(`Successfully loaded plugin: ${pluginPath}`);
            } catch (error) {
                console.error(`Error loading plugin ${pluginPath}:`, error.message);
            }
        }
    }
    // Might come from the config.js
    let config = {advanced:true, showLogs:true}; // Hide the extra selection of network based devices for now

    // Load the plugin with the provided functions
    if (typeof extraEQplugins !== "undefined") {
        loadPlugins(extraEQplugins, {
            filtersToElem,  // Put Filters back to Html Elements
            elemToFilters,  // Get Filters from Html Elements
            calcEqDevPreamp,// Reuse existing gain calculations
            applyEQ,         // Apply EQ
            config
        });
    }
}
addExtra();
