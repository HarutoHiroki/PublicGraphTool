// Theme switcher (default / dark / contrast)
// Persists choice in localStorage as `theme-pref`.

function themeChooser(command) {
    let docBody = document.querySelector("body"),
        themeButton = document.querySelector("button#theme"),
        themeCurrent = themeButton.getAttribute("current-theme");

    // If a change event, make changes to state
    if (command === "change") {
        if (themeCurrent === "theme-dark") {
            localStorage.setItem("theme-pref", "theme-contrast");
        } else if (themeCurrent === "theme-contrast") {
            localStorage.setItem("theme-pref", "theme-default");
        } else {
            localStorage.setItem("theme-pref", "theme-dark");
        }
    }

    let themePref = localStorage.getItem("theme-pref");

    // Apply state
    if (themePref === "theme-dark") {
        docBody.classList.remove("theme-default", "theme-contrast");
        docBody.classList.add("theme-dark");
        themeButton.textContent = "contrast mode";

    } else if (themePref === "theme-contrast") {
        docBody.classList.remove("theme-default", "theme-dark");
        docBody.classList.add("theme-contrast");
        themeButton.textContent = "default mode";

    } else {
        docBody.classList.remove("theme-dark", "theme-contrast");
        docBody.classList.add("theme-default");
        themeButton.textContent = "dark mode";
    }

    themeButton.setAttribute("current-theme", themePref);
}
if ( themingEnabled ) {
    let themeButton = document.createElement("button"),
        miscTools = document.querySelector("div.miscTools");

    themeButton.setAttribute("id", "theme");
    themeButton.textContent = "dark mode";
    themeButton.setAttribute("current-theme", "theme-default");
    miscTools.append(themeButton);

    themeChooser();
}
