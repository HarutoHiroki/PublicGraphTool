// Configuration options
const init_phones = ["Haruto 2024 Target", "AudioSense DT200"],// Optional. Which graphs to display on initial load. Note: Share URLs will override this set
      DIR = "data/",                                // Directory where graph files are stored
      default_channels = ["L","R"],                 // Which channels to display. Avoid javascript errors if loading just one channel per phone
      default_normalization = "dB",                 // Sets default graph normalization mode. Accepts "dB" or "Hz"
      default_norm_db = 60,                         // Sets default dB normalization point
      default_norm_hz = 630,                        // Sets default Hz normalization point (500Hz is recommended by IEC)
      max_channel_imbalance = 5,                    // Channel imbalance threshold to show ! in the channel selector
      alt_layout = true,                            // Toggle between classic and alt layouts
      alt_sticky_graph = true,                      // If active graphs overflows the viewport, does the graph scroll with the page or stick to the viewport?
      alt_animated = false,                         // Determines if new graphs are drawn with a 1-second animation, or appear instantly
      alt_header = true,                            // Display a configurable header at the top of the alt layout
      alt_header_new_tab = false,                   // Clicking alt_header links opens in new tab
      alt_tutorial = true,                          // Display a configurable frequency response guide below the graph
      alt_augment = true,                           // Display augment card in phone list, e.g. review sore, shop link
      site_url = '/',                               // URL of your graph "homepage"
      share_url = true,                             // If true, enables shareable URLs
      watermark_text = "CrinGraph",                 // Optional. Watermark appears behind graphs
      watermark_image_url = "assets/images/haruto.svg", // Optional. If image file is in same directory as config, can be just the filename
      rig_description = "clone IEC 711",            // Optional. Labels the graph with a description of the rig used to make the measurement, e.g. "clone IEC 711"
      page_title = "CrinGraph",                     // Optional. Appended to the page title if share URLs are enabled
      page_description = "View and compare frequency response graphs for earphones",
      accessories = true,                           // If true, displays specified HTML at the bottom of the page. Configure further below
      externalLinksBar = true,                      // If true, displays row of pill-shaped links at the bottom of the page. Configure further below
      expandable = false,                           // Enables button to expand iframe over the top of the parent page
      expandableOnly = false,                       // Prevents iframe interactions unless the user has expanded it. Accepts "true" or "false" OR a pixel value; if pixel value, that is used as the maximum width at which expandableOnly is used
      headerHeight = '0px',                         // Optional. If expandable=true, determines how much space to leave for the parent page header
      themingEnabled = true,                        // Enable user-toggleable themes (dark mode, contrast mode)
      targetDashed = true,                          // If true, makes target curves dashed lines
      targetColorCustom = false,                    // If false, targets appear as a random gray value. Can replace with a fixed color value to make all targets the specified color, e.g. "black"
      targetRestoreLastUsed = false,				// Restore user's last-used target settings on load
      labelsPosition = "bottom-left",               // Up to four labels will be grouped in a specified corner. Accepts "top-left," bottom-left," "bottom-right," and "default"
      stickyLabels = true,                          // "Sticky" labels 
      analyticsEnabled = true,                      // Enables Google Analytics 4 measurement of site usage
      extraEnabled = true,                          // Enable extra features
      extraUploadEnabled = true,                    // Enable upload function
      extraEQEnabled = true,                        // Enable parametic eq function
      extraEQBands = 10,                            // Default EQ bands available
      extraEQBandsMax = 20;                         // Max EQ bands available

// Specify which targets to display
const targets = [
    { type:"Reference",  files:["Haruto 2024","Haruto 2021"] },
    { type:"Neutral",    files:["KEMAR DF","IEF Neutral 2023","Etymotic"] },
    { type:"Reviewer",   files:["Antdroid","Banbeucmas","HBB","Precogvision","Super Review 22","Timmy","VSG"] },
    { type:"Preference", files:["Harman IE 2019v2","Harman IE 2017v2","AutoEQ","Rtings","Sonarworks"] }
];

// Haruto's Addons
const  preference_bounds_name = "Bounds",              // Preference bounds name
       preference_bounds_dir = "assets/pref_bounds/",  // Preference bounds directory
       preference_bounds_startup = false,              // If true, preference bounds are displayed on startup
       allowSquigDownload = false,                     // If true, allows download of measurement data
       // PHONE_BOOK = "phone_book.json",              // Path to phone book JSON file         /* UNCOMMENT THIS IF YOU WANT TO MOVE PHONEBOOK OUTSIDE AGAIN */
       default_y_scale = "40db",                       // Default Y scale; values: ["20db", "30db", "40db", "50db", "crin"]
       default_DF_name = "KEMAR DF",                   // Default RAW DF name
       dfBaseline = true,                              // If true, DF is used as baseline when custom df tilt is on
       default_bass_shelf = 8,                         // Default Custom DF bass shelf value
       default_tilt = -0.8,                            // Default Custom DF tilt value
       default_ear = 0,                                // Default Custom DF ear gain value
       default_treble = 0,                             // Default Custom DF treble gain value
       tiltableTargets = ["KEMAR DF"],                 // Targets that are allowed to be tilted
       compTargets = ["KEMAR DF"],                     // Targets that are allowed to be used for compensation
       allowCreatorSupport = true;                     // Allow the creator to have a button top right to support them


const harmanFilters = [
    { name: "Harman C1 2024 IE", tilt: -0.9, bass_shelf: 1, ear: 0, treble: 0.5 },
    { name: "Harman C2 2024 IE", tilt: -0.3, bass_shelf: .5, ear: -0.2, treble: 1 },
    { name: "Harman C3 2024 IE", tilt: -2.1, bass_shelf: 0, ear: 0, treble: 10 },
    { name: "Harman C4 2024 IE", tilt: -2.1, bass_shelf: 0, ear: 0.5, treble: 3.7 },
    { name: "Harman 2013 OE", tilt: 0, bass_shelf: 4.8, ear: 0, treble: -4.4 },
    { name: "Harman 2015 OE", tilt: 0, bass_shelf: 6.6, ear: 0, treble: -1.4 },
    { name: "Harman 2018 OE", tilt: 0, bass_shelf: 6.6, ear: -1.8, treble: -3 },
]

// *************************************************************
// Functions to support config options set above; probably don't need to change these
// *************************************************************

// But I will anyways haha - Haruto

// Set up the watermark, based on config options above
function watermark(svg) {
    let wm = svg.append("g")
        .attr("transform", "translate("+(pad.l+W/2)+","+(pad.t+H/2-20)+")")
        .attr("opacity",0.2);
    
    if ( watermark_image_url ) {
        wm.append("image")
            .attrs({id:'logo', x:-64, y:-64, width:128, height:128, "xlink:href":watermark_image_url, "class":"graph_logo"});
    }
    
    if ( watermark_text ) {
        wm.append("text")
            .attrs({id:'wtext', x:0, y:80, "font-size":28, "text-anchor":"middle", "class":"graph-name"})
            .text(watermark_text);
    }
    
    if ( rig_description ) {
        wm.append("text")
            .attrs({x:380, y:-134, "font-size":8, "text-anchor":"end", "class":"rig-description", "style": "filter: var(--svg-filter);"})
            .text("Measured on: " + rig_description);
    }
    
    let wmSq = svg.append("g")
        .attr("opacity",0.2);
    
    wmSq.append("image")
        .attrs({x:652, y:254, width:100, height:94, "class":"wm-squiglink-logo", "xlink:href":"assets/images/squiglink-giggle.svg"});
    
    wmSq.append("text")
        .attrs({x:641, y:314, "font-size":10, "transform":"translate(0,0)", "text-anchor":"end", "class":"wm-squiglink-address"})
        .text("squig.link/lab/harutohiroki");
}



// Parse fr text data from REW or AudioTool format with whatever separator
function tsvParse(fr) {
    return fr.split(/[\r\n]/)
        .map(l => l.trim()).filter(l => l && l[0] !== '*')
        .map(l => l.split(/[\s,]+/).map(e => parseFloat(e)).slice(0, 2))
        .filter(t => !isNaN(t[0]) && !isNaN(t[1]));
}

// Apply stylesheet based layout options above
function setLayout() {
    function applyStylesheet(styleSheet) {
        var docHead = document.querySelector("head"),
            linkTag = document.createElement("link");
        
        linkTag.setAttribute("rel", "stylesheet");
        linkTag.setAttribute("type", "text/css");
        
        linkTag.setAttribute("href", styleSheet);
        docHead.append(linkTag);
    }

    if ( !alt_layout ) {
        applyStylesheet("assets/css/style.css");
    } else {
        applyStylesheet("assets/css/style-alt.css");
        applyStylesheet("assets/css/style-alt-theme.css");
    }
}
setLayout();



// Configure HTML accessories to appear at the bottom of the page. Displayed only if accessories (above) is true
// There are a few templates here for ease of use / examples, but these variables accept any HTML
const 
    // Short text, center-aligned, useful for a little side info, credits, links to measurement setup, etc. 
    simpleAbout = `
        <p class="center">This web software is based on a heavily modified version of the <a href="https://github.com/mlochbaum/CrinGraph">CrinGraph</a> open source software project by <a href="https://github.com/harutohiroki">HarutoHiroki</a>, with <a href="https://www.teachmeaudio.com/mixing/techniques/audio-spectrum">Audio Spectrum</a>'s definition source.</p>
    `;
    // Which of the above variables to actually insert into the page
    whichAccessoriesToUse = simpleAbout;



// Configure external links to appear at the bottom of the page. Displayed only if externalLinksBar (above) is true
const linkSets = [
    {
        label: "IEM graph databases",
        links: [
            {
                name: "Audio Discourse",
                url: "https://iems.audiodiscourse.com/"
            },
            {
                name: "Bad Guy",
                url: "https://hbb.squig.link/"
            },
            {
                name: "Banbeucmas",
                url: "https://banbeu.com/graph/tool/"
            },
            {
                name: "HypetheSonics",
                url: "https://www.hypethesonics.com/iemdbc/"
            },
            {
                name: "Hangout.Audio",
                url: "https://graph.hangout.audio/"
            },
            {
                name: "HarutoHiroki",
                url: "https://graphtool.harutohiroki.com/"
            },
            {
                name: "Precogvision",
                url: "https://precog.squig.link/"
            },
            {
                name: "Super* Review",
                url: "https://squig.link/"
            },
            {
                name: "Timmy (Gizaudio)",
                url: "https://timmyv.squig.link/"
            },
            {
                name: "Rohsa",
                url: "https://rohsa.gitlab.io/graphtool/"
            },
        ]
    },
    {
        label: "Headphones",
        links: [
            {
                name: "Audio Discourse",
                url: "https://headphones.audiodiscourse.com/"
            },
            {
                name: "In-Ear Fidelity",
                url: "https://crinacle.com/graphs/headphones/graphtool/"
            },
            {
                name: "Listener",
                url: "https://listener800.github.io/"
            },
            {
                name: "Super* Review",
                url: "https://squig.link/hp.html"
            }
        ]
    }
];



// Set up analytics
function setupGraphAnalytics() {
    if ( analyticsEnabled ) {
        const pageHead = document.querySelector("head"),
              graphAnalytics = document.createElement("script"),
              graphAnalyticsSrc = "assets/js/graphAnalytics.js";
        
        graphAnalytics.setAttribute("src", graphAnalyticsSrc);
        pageHead.append(graphAnalytics);
    }
}
setupGraphAnalytics();



// If alt_header is enabled, these are the items added to the header
let headerLogoText = "HarutoHiroki",
    headerLogoImgUrl = "assets/images/haruto.svg",
    headerLinks = [
    {
        name: "Sample",
        url: "https://sample.com"
    },
    {
        name: "Sample External",
        url: "https://sample.com",
        external: true
    }
];

// Source: https://www.teachmeaudio.com/mixing/techniques/audio-spectrum
let tutorialDefinitions = [
    {
        name: 'Sub bass',
        width: '16%',
        description: 'The Rumble, usually out of human\'s hearing range and tend to be felt more than heard, providing a sense of power.'
    },
    {
        name: 'Bass',
        width: '20.6%',
        description: 'Determins how "fat" or "thin" the sound is, boosting around 250hz tend to add a feeling of warmth. If you\'re a bass head you most likely like this range.'
    },
    {
        name: 'Lower Mids',
        width: '10.1%',
        description: 'Low order harmonics of most instruments, generally viewed as the bass presence range. Boosting a signal around 300 Hz adds clarity to the bass and lower-stringed instruments. Too much boost around 500 Hz can make higher-frequency instruments sound muffled.'
    },
    {
        name: 'Midrange',
        width: "20%",
        description: 'The midrange determines how prominent an instrument is in the mix. Boosting around 1000 Hz can give instruments a horn-like quality. Excess output at this range can sound tinny and may cause ear fatigue.'
    },
    {
        name: 'Upper Mids',
        width: "10%",
        description: 'The high midrange is responsible for the attack on percussive and rhythm instruments. If boosted, this range can add presence. However, too much boost around the 3 kHz range can cause listening fatigue.'
    },
    {
        name: 'Presence',
        width: '5.9%',
        description: 'The Presence range is responsible for the clarity and definition of a sound. Over-boosting can cause an irritating, harsh sound. Cutting in this range makes the sound more distant and transparent.'
    },
    {
        name: 'Treble',
        width: '17.4%',
        description: 'The Treble range is composed entirely of harmonics and is responsible for sparkle and air of a sound. Over boosting in this region can accentuate hiss and cause ear fatigue.'
    }
]