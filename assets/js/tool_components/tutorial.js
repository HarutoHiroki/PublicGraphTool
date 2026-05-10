// Frequency-response tutorial overlay
// Activated when `alt_tutorial` is enabled in config; reads `tutorialDefinitions`.

function addTutorial() {
    let partsPrimary = document.querySelector("section.parts-primary"),
        graphContainer = document.querySelector("div.graph-sizer"),
        manageContainer = document.querySelector("div.manage"),
        overlayContainer = document.createElement("div"),
        buttonContainer = document.createElement("div"),
        descriptionContainer = document.createElement("div"),
        zoomButtons = document.querySelectorAll("div.zoom button");

    overlayContainer.className = "tutorial-overlay";
    graphContainer.prepend(overlayContainer);

    buttonContainer.className = "tutorial-buttons";
    descriptionContainer.className = "tutorial-description";

    manageContainer.prepend(descriptionContainer);
    manageContainer.prepend(buttonContainer);

    tutorialDefinitions.forEach(function(def) {
        let defOverlay = document.createElement("div"),
            defButton = document.createElement("button"),
            defDescription = document.createElement("article"),
            defDescriptionCopy = document.createElement("p");

        defOverlay.setAttribute("tutorial-def", def.name);
        defOverlay.setAttribute("tutorial-on", "false");
        defOverlay.className = "overlay-segment";
        defOverlay.setAttribute("style", "flex-basis: "+ def.width +";")
        overlayContainer.append(defOverlay);

        defButton.setAttribute("tutorial-def", def.name);
        defButton.setAttribute("tutorial-on", "false");
        defButton.className = "button-segment";
        defButton.textContent = def.name;
        buttonContainer.append(defButton);

        defDescription.setAttribute("tutorial-def", def.name);
        defDescription.setAttribute("tutorial-on", "false");
        defDescription.className = "description-segment";
        defDescriptionCopy.innerHTML = def.description;
        defDescription.append(defDescriptionCopy);
        descriptionContainer.append(defDescription);

        defButton.addEventListener("click", function() {
            let activeStatus = defButton.getAttribute("tutorial-on"),
                activeTutorialElements = document.querySelectorAll("[tutorial-on='true']"),
                activeOverlay = document.querySelector("div.overlay-segment[tutorial-on='true']"),
                activeButton = document.querySelector("button.button-segment[tutorial-on='true']"),
                activeDescription = document.querySelector("article.description-segment[tutorial-on='true']");

            if (activeOverlay) { activeOverlay.setAttribute("tutorial-on", "false"); }
            if (activeButton) { activeButton.setAttribute("tutorial-on", "false"); }

            if (activeStatus === "false") {
                if (activeDescription) { activeDescription.setAttribute("tutorial-on", "false"); }

                defOverlay.setAttribute("tutorial-on", "true");
                defButton.setAttribute("tutorial-on", "true");
                defDescription.setAttribute("tutorial-on", "true");

                partsPrimary.setAttribute("tutorial-active", "true");
                disableZoom();

                // Analytics event
                if (analyticsEnabled) { pushEventTag("tutorial_activated", targetWindow, def.name); }
            } else {
                partsPrimary.setAttribute("tutorial-active", "false");
            }
        });

        defButton.addEventListener("mouseover", function() {
            defOverlay.setAttribute("tutorial-hover", "true");
        });

        defButton.addEventListener("mouseout", function() {
            defOverlay.setAttribute("tutorial-hover", "false");
        });

        defButton.addEventListener("touchend", function() {
            defOverlay.setAttribute("tutorial-hover", "false");
        });
    });

    // Disable zoom if tutorial is engaged
    function disableZoom() {
        let activeZoomButton = document.querySelector("div.zoom button.selected");

        if (activeZoomButton) { activeZoomButton.click(); }
    }

    // Disable tutorial if zoom is engaged
    zoomButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            let tutorialState = document.querySelector("section.parts-primary").getAttribute("tutorial-active");

            if (button.classList.contains("selected") && tutorialState === "true") {
                let activeOverlay = document.querySelector("div.overlay-segment[tutorial-on='true']"),
                    activeButton = document.querySelector("button.button-segment[tutorial-on='true']"),
                    activeDescription = document.querySelector("article.description-segment[tutorial-on='true']");

                document.querySelector("section.parts-primary").setAttribute("tutorial-active","false");
                activeOverlay.setAttribute("tutorial-on", "false");
                activeButton.setAttribute("tutorial-on", "false");
            }
        });
    });
}
if (alt_tutorial) { addTutorial(); }
