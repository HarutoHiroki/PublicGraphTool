let mode = 'prod'
    cacheBuster = 'squig' //new Date().getTime();

// Set site-specific variables
let optedOut = [
    '64audio',
    'cammyfi',
    'crinacle',
    'eliseaudio',
    'hbb',
    'joycesreview',
    'kr0mka',
    'graph',
    'vsg'
];

currentSite = getCurrentSite();
currentSiteOptedOut = optedOut.includes(currentSite) ? true : false;

function getCurrentSite() {
    let host = window.location.host,
        path = window.location.pathname;
    
    // If site is a subdomain
    if (host.split('.')[1] === 'squig') {
        return host.split('.')[0];
    }
    
    // If site is a /lab folder on Squiglink
    else if (host.split('.')[0] === 'squig' && path.indexOf('/lab/') > -1) {
        return window.location.pathname.split('/')[2];
    }
    
    // If site is squig.link root
    else if (host.split('.')[0] === 'squig' && path.indexOf('/lab/') === -1) {
        return 'superreview';
    }
    
    // If site is hangout.audio
    else if (window.location.host.split('.')[1] === 'hangout') {
         return 'crinacle';
    }
    
    else {
        return 'n/a';
    }
}

// Squiglink intro
function loadSquiglinkIntro() {
    let body = document.querySelector('body'),
        introScript = document.createElement('script'),
        introScriptSrc = mode === 'dev' ? 'squiglink-intro.js' : 'https://squig.link/squiglink-intro.js?' + cacheBuster;

    introScript.setAttribute('type', 'text/javascript');
    introScript.setAttribute('src', introScriptSrc);
    body.append(introScript);
}
loadSquiglinkIntro();

// Shoplinks
function loadShoplinks() {
    let body = document.querySelector('body'),
        shoplinksScript = document.createElement('script'),
        shoplinksScriptSrc = mode === 'dev' ? 'shoplinks.js' : 'https://squig.link/shoplinks.js?' + cacheBuster;

    shoplinksScript.setAttribute('type', 'text/javascript');
    shoplinksScript.setAttribute('src', shoplinksScriptSrc);
    body.append(shoplinksScript);
}