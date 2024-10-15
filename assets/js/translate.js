function loadCurrentLanguage() {
  const _defLang = defaultLanguage || "en";

  // If defaultLanguage is not included in the availableLanguages list, throw an alert
  if (!availableLanguages.includes(_defLang)) {
    alert('Warning: Default Language is not included in the Available Languages list.');
  }
  
  // If the browser language is supported, use it, otherwise use the default language
  if (useBrowserLangAsDefault) {
    const browserLang = navigator.language.split('-')[0];
    return availableLanguages.includes(browserLang) ? browserLang : _defLang;
  } else {
    return _defLang;
  }
}

let currentLanguage = loadCurrentLanguage();
let enStrings = {};
let translations = {};

async function loadTranslations(lang) {
  try {
    // Load English strings if not already loaded
    if (Object.keys(enStrings).length === 0) {
      const enResponse = await fetch(`assets/lang/en.json`);
      enStrings = await enResponse.json();
    }

    // Load translations for the specified language
    const response = await fetch(`assets/lang/${lang}.json`);
    translations = await response.json();

    // Set up header, tutorial, and accessories content if the language is English
    if(lang == "en") {
      whichHeaderLogoTextToUse = headerLogoText;
      whichHeaderLinksToUse = headerLinks;
      whichTutorialDefinitionsToUse = tutorialDefinitions;
      whichAccessoriesToUse = simpleAbout;
    }
    // Otherwise, use translated content
    else {
      if (translateHeader) {
        whichHeaderLogoTextToUse = translations.header.logoText || headerLogoText;
        whichHeaderLinksToUse = translations.header.links || headerLinks;
      }
      if (translateTutorial) {
        whichTutorialDefinitionsToUse = translations.tutorial || tutorialDefinitions;
      }
      if (translateAccessories) {
        whichAccessoriesToUse = translations.accessories.content || simpleAbout;
      }
    }

    // Update the page translations
    updatePageTranslations();
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
  }
}

function updatePageTranslations() {
  // Update the content of the page
  updateTranslations();
  // Update header content
  if (translateHeader) {
    updateHeaderContent();
  }
  // Update tutorial content
  if (translateTutorial) {
    updateTutorialContent();
  }
  // Update accessories content
  if (translateAccessories) {
    updateAccessoriesContent();
  }
  // Update target types content
  if (translateTargetTypes) {
    updateTargetTypesContent();
  }
}

// Initialize language system
document.addEventListener("DOMContentLoaded", () => {
  loadTranslations(currentLanguage);
});

// Update Main Translations
function updateTranslations() {
  const t = translations.main || enStrings.main || {}; // Use empty object as fallback

  // Update text content for various elements
  //doc.select("#baseline-icon text").text(d => d === 'BASE' ? (t.base || 'BASE') : (t.line || '-LINE'));
  doc.selectAll("#pin-icon text").text(t.pin);

  // Left (Secondary) panel
  doc
    .selectAll(".selector-tabs button")
    .data([
      t.selectBrands,
      t.selectModels,
      t.selectEqualizer,
    ])
    .text((d) => d);
  doc
    .select(".selector-panel .search")
    .attr("placeholder", t.searchBar);

  // Tools panel
  doc.select("#copy-url").text(t.copyUrl);
  doc.select("#download-faux").text(t.screenshot);
  doc.select("#avg-all").text(t.averageAll);

  doc.select(".yscaler span").text(t.yAxisScale);

  doc.select(".zoom span").text(t.zoom);
  doc
    .selectAll(".zoom button")
    .data([t.bass, t.mids, t.treble])
    .text((d) => d);

  doc.select(".normalize span").text(t.normalize);

  doc.select(".smooth span").text(t.smooth);

  doc
    .selectAll(".miscTools button")
    .data([
      { id: "inspector", text: t.inspect },
      { id: "label", text: t.label },
      { id: "download", text: t.screenshot },
      { id: "recolor", text: t.recolor },
      { id: "theme", text: t.darkmode },
    ])
    .text((d) => d.text);

  // Custom DF
  doc
    .select(".customDF > span")
    .text(t.preferenceAdjustments);
  doc
    .selectAll(".customDF > div > span")
    .data([
      t.tiltUnit,
      t.bassUnit,
      t.trebleUnit,
      t.earGainUnit,
    ])
    .text((d) => d);

  doc
    .select("#cusdf-UnTiltTHIS")
    .text(t.removeAdjustments);
  doc.select("#cusdf-harmanfilters").text(t.harmanFilters);
  doc.select("#cusdf-bounds").text(t.preferenceBounds);

  doc
    .select(".manageTable .helpText")
    .text(t.addHelp);
  doc.select(".manageTable .addLock").text(t.lock);

  // Tbody Alert
  const alertText = t.selectModelAlert;
  const alertTextStyle = document.createElement('style');
  alertTextStyle.textContent = `
    tbody.curves:empty:before {
      content: '${alertText}';
    }
  `;
  document.head.appendChild(alertTextStyle);

  // Mobile Helper
  const mobileHelperText = t.mobileHelper;
  const mobileHelperTextStyle = document.createElement('style');
  mobileHelperTextStyle.textContent = `
    @media (max-width: 1000px) {
      tr.mobile-helper:before {
        content: '${mobileHelperText}';
      }
    }
    @media (min-width: 1001px) {
      tr.mobile-helper:before {
        content: none;
        display: none;
      }
    }
  `;
  document.head.appendChild(mobileHelperTextStyle);

  // Equalizer panel
  doc.select(".extra-panel h4").text(t.uploading);
  doc.select(".upload-fr").text(t.uploadFR);
  doc.select(".upload-target").text(t.uploadTarget);
  doc.select(".upload-track").text(t.uploadSong);
  doc
    .select(".extra-upload small")
    .text(t.uploadWarning);

  doc
    .selectAll(".extra-eq h4:not(#preamp-disp)")
    .data([
      t.parametricEqualizer,
      t.autoEQ,
      t.eqDemo,
      t.miscellaneous,
    ])
    .text((d) => d);

  doc
    .select(".select-eq-phone option")
    .text(t.chooseEQModel);
  //doc.select("#preamp-disp").text(`${t.preamp}: 0.0 dB`);

  doc
    .selectAll(".filters-header span")
    .data([
      t.type,
      t.frequency,
      t.gain,
      t.q,
    ])
    .text((d) => d);

  //doc.select(".add-filter").text(t.add || '+');
  //doc.select(".remove-filter").text(t.remove || '-');
  doc.select(".sort-filters").text(t.sort);
  doc.select(".disable-filters").text(t.disable);
  doc.select(".save-filters").text(t.saveEQ);

  doc
    .selectAll(".settings-row [name='title']")
    .data([
      t.autoEqFrequencyRange,
      t.autoEqGainRange,
      t.autoEqQRange,
    ])
    .text((d) => d);

  doc.select(".auto-eq-button .autoeq").text(t.autoEQ);
  doc.select(".auto-eq-button .readme").text(t.readme);

  doc
    .selectAll(".eq-track option")
    .data([
      t.pinkNoise,
      t.scarletFire,
      t.toneGenerator,
      t.uploaded,
    ])
    .text((d) => d);

  doc
    .select("[name='tone-gen-range'] [name='title']")
    .text(t.toneGeneratorRange);
  //doc.select("[name='current-freq']").text(`${t.freq || 'Freq'}: <span class="freq-text">20</span> Hz`);

  doc.select(".settings-row [name='balance-l']").text(t.left);
  doc
    .select(".settings-row [name='balance-title']")
    .text(t.channelBalance);
  doc.select(".settings-row [name='balance-r']").text(t.right);

  doc.select(".import-filters").text(t.importEQ);
  doc
    .select(".export-filters")
    .text(t.exportParametricEQ);
  doc
    .select(".export-graphic-filters")
    .text(t.exportGraphicEQ);

  doc
    .select(".extra-eq-overlay")
    .text(
      t.autoEQRunning
    );
}

// Update Header Content
function updateHeaderContent() {
  const logoImgElement = document.querySelector(".logo a img");
  if (logoImgElement) {
    logoImgElement.src = whichHeaderLogoImgUrlToUse || headerLogoImgUrl;
  }

  const logoTextElement = document.querySelector(".logo a span");
  if (logoTextElement) {
    logoTextElement.textContent = whichHeaderLogoTextToUse || headerLogoText;
  }

  const headerLinks = document.querySelectorAll(".header-links a");
  headerLinks.forEach((linkElement, i) => {
    const link = whichHeaderLinksToUse[i] || headerLinks[i];
    linkElement.textContent = link.name || headerLinks[i].name;
    linkElement.setAttribute("href", link.url || headerLinks[i].url);
  });
}

// Update Tutorial Content
function updateTutorialContent() {
  const tutorialButtons = document.querySelectorAll(
    ".tutorial-buttons .button-segment"
  );
  tutorialButtons.forEach((button, i) => {
    const tutorialData = whichTutorialDefinitionsToUse[i] || tutorialDefinitions[i];
    button.textContent = tutorialData.name || "";
  });

  const tutorialDescriptions = document.querySelectorAll(
    ".tutorial-description .description-segment p"
  );
  tutorialDescriptions.forEach((description, i) => {
    const tutorialData = whichTutorialDefinitionsToUse[i] || tutorialDefinitions[i];
    description.textContent =
      tutorialData.description || "";
  });
}

// Update Accessories Content
function updateAccessoriesContent() {
  doc.select(".accessories aside").html(whichAccessoriesToUse || paragraphs);
}

// Update Target Types Content
function updateTargetTypesContent() {
  const targetTypeLabels = document.querySelectorAll(".targets div .targetLabel span");

  targetTypeLabels.forEach((targetTypeLabel, i) => {
    const targetType = targets[i].type;
    if (currentLanguage === "en") {
      targetTypeLabel.textContent = targetType;
    } else {
      targetTypeLabel.textContent = translations.targets[targetType] || targetType;
    }
  });

  const targetLabels = document.querySelectorAll(".targets div .targetLabel");
  targetLabels.forEach(label => {
    const suffix = currentLanguage === "en" ? " Targets:" : ` ${translations.targets.TARGETS}:`;
    label.setAttribute("targetLabelSuffix", suffix);
  });
}

// Get Alert Message
function getAlertMessage(key) {
  // If translateAlertMessages is true, use translated alert messages, otherwise use English alert messages
  if (translateAlertMessages) {
    return translations.alertMessages[key] || enStrings.alertMessages[key];
  } else {
    return enStrings.alertMessages[key];
  }
}
