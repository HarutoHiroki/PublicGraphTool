let mode = 'prod',
    cacheBuster = new Date().getTime();

// Set site-specific variables
let optedOut = [
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

// The rest
function loadJquery() {
    let body = document.querySelector('body'),
        scriptJquery = document.createElement('script'),
        localJquery = 'https://squig.link/jquery.js',
        hostedJquery = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js';
    
    scriptJquery.setAttribute('type', 'text/javascript');
    scriptJquery.setAttribute('src', localJquery);
    scriptJquery.addEventListener('load', function() {
        createSquigSelect();
        initDbExplorer();
        if (!currentSiteOptedOut) loadShoplinks();
    });
    
    body.append(scriptJquery);
}
loadJquery();

function createSquigSelect() {
    if ( document.querySelectorAll('header.header').length > 0 ) {
        let squigsitesJson = mode === 'dev' ? 'squigsites.json' : 'https://squig.link/squigsites.json?' + cacheBuster,
            squigSelect = document.createElement('select'),
            squigSelectBlank = document.createElement('option'),
            squigSelectGroup5128 = document.createElement('optgroup'),
            squigSelectGroupIems = document.createElement('optgroup'),
            squigSelectGroupHeadphones = document.createElement('optgroup'),
            squigSelectGroupEarbuds = document.createElement('optgroup'),
            squigSelectGroupOfficial = document.createElement('optgroup'),
            newLi = document.createElement('li'),
            headerLinksUl = document.querySelector('ul.header-links'),
            currentDb = window.location.pathname.indexOf('/lab/') === -1 ? window.location.pathname : window.location.pathname.replace('/lab/' + currentSite, '');
        
        newLi.className = 'squig-select-li';
        squigSelect.className = 'squig-select';
        squigSelect.addEventListener('change', squigsiteChange);

        squigSelectBlank.setAttribute('disabled','');
        squigSelectBlank.setAttribute('selected','');
        squigSelectBlank.setAttribute('value','');
        squigSelectBlank.textContent = 'More squiglinks';
        squigSelect.append(squigSelectBlank);

        squigSelectGroup5128.setAttribute('label', '5128');
        squigSelectGroupIems.setAttribute('label', 'IEMs');
        squigSelectGroupHeadphones.setAttribute('label', 'Headphones');
        squigSelectGroupEarbuds.setAttribute('label', 'Earbuds');
        
        squigSelect.append(squigSelectGroup5128);
        squigSelect.append(squigSelectGroupIems);
        squigSelect.append(squigSelectGroupHeadphones);
        squigSelect.append(squigSelectGroupEarbuds);

        $.getJSON(squigsitesJson, function(squigSites) {
            squigSites.forEach(function(site) {
                let username = site.username,
                    name = site.name,
                    rootDomain = site.urlType === "root" ? true : false,
                    subDomain = site.urlType === "subdomain" ? true : false,
                    altDomain = site.urlType === "altDomain" ? true : false,
                    url = rootDomain ? 'https://squig.link' : altDomain ? site.altDomain : subDomain ? 'https://' + username + '.squig.link' : 'https://squig.link/lab/' + username,
                    option = document.createElement('option'),
                    dbs = site.dbs;
                
                //if (mode === 'dev') console.log(name, '\nRoot: ' + rootDomain, '\nSub: ' + subDomain, '\nAlt: ' + altDomain, '\n' + url);

                dbs.forEach(function(db) {
                    let type = db.type,
                        folder = db.folder,
                        dbUrl = url + folder,
                        deltaReady = db.deltaReady ? 1 : 0,
                        dbOption = document.createElement('option'),
                        targetOptGroup = type === 'IEMs' ? squigSelectGroupIems : type === 'Headphones' ? squigSelectGroupHeadphones : type === 'Earbuds' ? squigSelectGroupEarbuds : type === '5128' ? squigSelectGroup5128 : false;

                    dbOption.textContent = name;
                    dbOption.value = dbUrl;
                    dbOption.setAttribute('data-username', username)

                    if (username === currentSite && currentDb === folder) {
                        dbOption.setAttribute('selected','');
                    }

                    targetOptGroup.append(dbOption);
                });
            });

            if (squigSites.length) {
                newLi.append(squigSelect);
                headerLinksUl.append(newLi);

                let squigSelectStyle = document.createElement('style'),
                    squigSelectCss = `
                        @media (min-width: 1001px) {
                            ul.header-links {
                                justify-content: flex-end;
                            }
                        }
                        ul.header-links li.squig-select-li {
                            order: -1;
                            position: relative;
                            padding: 6px 16px 0 0;
                            margin: 0 auto 0 -16px;

                            color: #fff;
                        }

                        li.squig-select-li:after {
                            position: absolute;
                            top: 21px;
                            right: 32px;

                            content: '';
                            display: block;
                            width: 4px;
                            height: 4px;

                            border-right: 1px solid var(--background-color-contrast-more);
                            border-bottom: 1px solid var(--background-color-contrast-more);

                            transform: rotate(45deg);
                        }

                        select.squig-select {
                            appearance: none;
                            position: relative;

                            display: flex;
                            box-sizing: border-box;
                            height: 36px;
                            padding: 2px 30px 0 16px;


                            background-color: transparent;
                            border: 1px solid var(--background-color-contrast-more);
                            border-radius: 18px;

                            color: currentColor;
                            outline:none;
                        }

                        select.squig-select option {
                            color: initial;
                        }

                        @media ( max-width: 1000px ) {
                            ul.header-links li.squig-select-li {
                                order: 1;

                                width: 100%;
                                height: auto;
                                padding-top: 16px;
                                margin: 36px 0 0 0;

                                border-top: 1px solid var(--font-color-primary);

                                color: var(--font-color-primary);
                            }

                            select.squig-select {
                                width: 100%;
                            }

                            li.squig-select-li:after {
                                top: 32px;
                            }
                        }
                    `;

                squigSelectStyle.setAttribute('type','text/css');
                squigSelectStyle.textContent = squigSelectCss;
                document.querySelector('body').append(squigSelectStyle);
            }
        });

        function squigsiteChange(event) {
            let selectedSite = squigSelect.options[squigSelect.selectedIndex].value,
                selectedSiteName = squigSelect.options[squigSelect.selectedIndex].textContent;

            pushEventTag('squigsite_changed', targetWindow, selectedSiteName);
            window.location = selectedSite;
        }
    }
}



// Init dbExplorer when the input field is focused
function initDbExplorer() {
    let filterInput = document.querySelector('input.search');
    
    filterInput.addEventListener('focus', handleInput);
    
    function handleInput() {
        filterInput.removeEventListener('focus', handleInput);
        
        let readyTimer = setInterval(checkReady, 200);
        
        function checkReady() {
            let phoneCount = document.querySelectorAll('div.phone-item').length;
            
            if (phoneCount > 1) {
                clearInterval(readyTimer);
                dbExplorer();
            }
        }
    }
}

// Add other squigsite databases to phones list
function dbExplorer() {
    let squigsitesJson = mode === 'dev' ? 'squigsites.json' : 'https://squig.link/squigsites.json?' + cacheBuster,
        currentDb = window.location.pathname.indexOf('/lab/') === -1 ? window.location.pathname : window.location.pathname.replace('/lab/' + currentSite, '');
    
    let dbExplorerStyle = document.createElement('style'),
        dbExplorerCss = `:root {
                --icon-new-tab: url("data:image/svg+xml,%3Csvg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cdefs%3E%3Cstyle%3E.cls-1,.cls-2%7Bfill:none;stroke:%23231f20;%7D.cls-2%7Bstroke-linecap:round;%7D%3C/style%3E%3C/defs%3E%3Cpath class='cls-1' d='M21,11v2c0,3.77,0,5.66-1.17,6.83S16.77,21,13,21H11c-3.77,0-5.66,0-6.83-1.17S3,16.77,3,13V11C3,7.23,3,5.34,4.17,4.17S7.23,3,11,3h1'/%3E%3Cpath class='cls-2' d='M21,3.15H16.76m4.24,0V7.39m0-4.24-8.49,8.48'/%3E%3C/svg%3E");
            }

            section.db-all-sites-container {
                display: flex;
                flex-direction: column;

                margin: 0;
                padding: 0;
            }

            section.db-site-container {
                display: none;
                flex-direction: column;

                order: 1;
                background-color: var(--background-color-contrast);
                border-radius: 0 0 6px 0;
            }

            section.db-site-container[data-delta-ready="true"] {
                order: 0;
            }

            section.db-site-container[data-source-5128="true"] {
                order: -1;
            }

            section.db-site-container[data-delta-ready="true"] div.db-site-header:after {
                content: '';
                flex: 54px 0 0;
                height: 18px;
                margin: 0 12px 0 0;

                background: linear-gradient(135deg, var(--background-color-contrast-more) 40%, var(--accent-color), var(--background-color-contrast-more) 50%);
                background-size: 800% 800%;
                animation: gradient-flash 6s ease-in-out infinite;

                mask: var(--icon-5128);
                -webkit-mask: var(--icon-5128);
                mask-size: 100%;
                mask-repeat: no-repeat;
                mask-position: center;
                -webkit-mask-size: 100%;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: center;
            }

            div.db-site-header {
                position: sticky;
                top:  -26px;
                z-index: 1;

                display: flex;
                align-items: center;
                flex-wrap: wrap;
                margin: 0 0 6px 0;

                background-color: var(--background-color-contrast);
                border-bottom: 1px solid var(--background-color);
                border-radius: 6px 6px 0 0;

                color: var(--accent-color);
                font-weight: bold;
            }

            div.db-site-header:before {
                content: '';
                display: block;
                flex: 100% 0 0;
                height: 11px;

                background-color: var(--background-color);
            }

            div.db-site-header a {
                display: flex;
                flex: auto 1 1;
                padding: 11px 0 11px 12px;

                color: var(--accent-color-contrast);
                font-weight: 400;
                font-size: 12px;
                line-height: 1.5em;
                text-decoration: none;
            }

            div.db-site-header a:hover {
                text-decoration: underline;
            }

            div.db-site-header a span.db-site-tag {
                margin: 0 0 0 6px;
                color: var(--background-color-contrast-more);
                font-size: 11px;
                font-family: var(--font-secondary);
                text-transform: uppercase;
            }

            div.fauxn-item {
                display: flex;
                display: none;
                padding: 0 0 6px 0;

                color: var(--font-color-primary);
                font-weight: 400;
                font-size: 12px;
                line-height: 1.5em;
            }

            div.fauxn-item a {
                display: flex;
                align-items: flex-start;
                flex: auto 1 1;
                padding: 11px 0 11px 12px;

                color: var(--font-color-primary);
                text-decoration: none;
            }

            div.fauxn-item a:hover {
                text-decoration: underline;
            }

            div.db-site-header span,
            div.fauxn-item span {
                flex: auto 1 1;
            }

            div.fauxn-item a:before {
                content: '';
                display: block;
                flex: 18px 0 0;
                height: 18px;
                margin: 0 8px 0 0;

                background-color: var(--background-color-contrast-more);
                background-color: var(--accent-color-contrast);
                mask: var(--icon-new-tab);
                -webkit-mask: var(--icon-new-tab);
                mask-size: 14px;
                mask-repeat: no-repeat;
                mask-position: center;
                -webkit-mask-size: 14px;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: center;
            }

            div.fauxn-item[data-delta-ready="true"] a:after {
                content: '';
                flex: 18px 0 0;
                height: 18px;
                margin: 0 12px 0 0;

                background: linear-gradient(135deg, var(--background-color-contrast-more) 40%, var(--accent-color), var(--background-color-contrast-more) 50%);
                background-size: 800% 800%;
                animation: gradient-flash 6s ease-in-out infinite;

                mask: var(--icon-5128-sm);
                -webkit-mask: var(--icon-5128-sm);
                mask-size: 100%;
                mask-repeat: no-repeat;
                mask-position: center;
                -webkit-mask-size: 100%;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: center;
            }

            @media (max-width: 1000px) {
                section.db-site-container {
                    margin-right: 6px;
                }

                div.db-site-header {
                    position: relative;
                    top: 0;

                    margin-right: 2px;
                }

                div.fauxn-item {
                    margin-right: 2px;
                }
            }`;

    dbExplorerStyle.setAttribute('type','text/css');
    dbExplorerStyle.textContent = dbExplorerCss;
    document.querySelector('body').append(dbExplorerStyle);
    
    // Get data about each site
    $.getJSON(squigsitesJson, function(squigSites) {
        let phoneList = document.querySelector('div#phones'),
            allSitesContainer = document.createElement('section');
        
        allSitesContainer.className = 'db-all-sites-container';
        phoneList.append(allSitesContainer);
        
        squigSites.forEach(function(site) {
            let name = site.name,
                username = site.username,
                isCurrentSite = username === currentSite ? 1 : 0,
                
                rootDomain = site.urlType === "root" ? true : false,
                subDomain = site.urlType === "subdomain" ? true : false,
                altDomain = site.urlType === "altDomain" ? true : false,
                url = rootDomain ? 'https://squig.link' : altDomain ? site.altDomain : subDomain ? 'https://' + username + '.squig.link' : 'https://squig.link/lab/' + username,
                dbs = site.dbs;
            
            dbs.forEach(function(db) {
                let siteContainer = document.createElement('section'),
                    siteHeader = document.createElement('div'),
                    siteHeaderLabel = document.createElement('span'),
                    siteHeaderLink = document.createElement('a'),
                    siteHeaderTag = document.createElement('span'),
                    siteType = db.type;
                
                    //if (!isCurrentSite) {
                    siteContainer.className = 'db-site-container';
                    siteContainer.setAttribute('name-lower', name.toLowerCase());
                    siteHeader.className = 'db-site-header';
                    siteHeaderLabel.textContent = name;
                    siteHeaderTag.textContent = siteType;
                    siteHeaderTag.className = 'db-site-tag';

                    siteHeaderLink.setAttribute('href', url);
                    siteHeaderLink.setAttribute('target', '_blank');
                    siteHeader.append(siteHeaderLink);
                    siteHeaderLink.append(siteHeaderLabel);
                    siteHeaderLabel.append(siteHeaderTag);

                    siteHeaderLink.addEventListener('click', function() {
                        pushEventTag("clicked_dbExplorer", targetWindow, name);
                    });

                    siteContainer.append(siteHeader);
                    allSitesContainer.append(siteContainer);

                    // Get phone_book json
                    let folder = db.folder,
                        deltaReady = db.deltaReady ? 1 : 0,
                        source5128 = db.type === '5128',
                        processThisJson = isCurrentSite ? currentDb === folder ? 0 : 1 : 1,
                        phoneBookJson = url + folder + 'data/phone_book.json';
                
                    //if (mode === 'dev') console.log(name, '\nURL: ' + url, '\nPhonebook: ' + phoneBookJson);
                    
                    if (deltaReady) siteContainer.setAttribute('data-delta-ready', 'true');
                    if (source5128) siteContainer.setAttribute('data-source-5128', 'true');
                    
                    if (processThisJson) {
                        $.getJSON(phoneBookJson, function(phoneBook) {
                            phoneBook.forEach(function(brandPhones) {
                                let brandName = brandPhones.name;

                                brandPhones.phones.forEach(function(phone) {
                                    let phoneName = phone.name,
                                        displayName = brandName + ' ' + phoneName,
                                        siteContainerNameLower = siteContainer.getAttribute('name-lower'),
                                        fileIsArray = Array.isArray(phone.file),
                                        fileName = fileIsArray ? phone.file[0] : phone.file,
                                        linkParam = fileName.replace(/ /g,"_"),
                                        link = url + folder + '?share=' + linkParam;

                                    let fauxnItem = document.createElement('div'),
                                        fauxnLink = document.createElement('a'),
                                        fauxnLabel = document.createElement('span');


                                    fauxnItem.className = 'fauxn-item';
                                    fauxnItem.setAttribute('name', name + ': ' + displayName);
                                    fauxnItem.setAttribute('name-lower', name.toLowerCase() + ': ' + displayName.toLowerCase());
                                    if (deltaReady) fauxnItem.setAttribute('data-delta-ready', 'true');
                                    siteContainer.setAttribute('name-lower', siteContainerNameLower + ' ' + displayName.toLowerCase());

                                    fauxnLink.className = 'fauxn-link';
                                    fauxnLink.setAttribute('href', link);
                                    fauxnLink.setAttribute('target','_blank');

                                    fauxnLabel.textContent = displayName;
                                    fauxnLink.append(fauxnLabel);
                                    fauxnItem.append(fauxnLink);
                                    siteContainer.append(fauxnItem);
                                    
                                    // Handle clicks on faunx items
                                    function handleFaunxClick(e) {
                                        if (deltaReady) {
                                            e.preventDefault();

                                            let baselinePhoneFileName = baseline.p ? baseline.p.fileName : 0,
                                                linkAdd = baseline.p ? encodeURI(baselinePhoneFileName.replace(/ /g,"_")) : 0,
                                                newLink = baseline.p ? link + ',' + linkAdd : link;
                                            
                                            window.open(newLink, '_blank');
                                        }
                                        
                                        pushEventTag("clicked_dbExplorer", targetWindow, name + ': ' + displayName);
                                    }

                                    fauxnLink.addEventListener('click', function(e) {
                                        handleFaunxClick(e);
                                    });

                                    fauxnLink.addEventListener('auxclick', function(e) {
                                        handleFaunxClick(e);
                                    });
                                });
                            });
                        });
                    }
                });
                // end get phone_book json
            //}
            // end if
       });
    });
}

function dbExplorerFilter() {
    let filterInput = document.querySelector('input.search'),
        dbExplorerFilterStyle = document.createElement('style');
    
    dbExplorerFilterStyle.setAttribute('type','text/css');
    document.querySelector('body').append(dbExplorerFilterStyle);
    
    filterInput.addEventListener('input', function(e) {
        try { clearTimeout(filterDelay); } catch {}
        filterDelay = setTimeout(function() {
            dbExplorerFilterStyle.textContent = '';
            
            // https://css-tricks.com/multiple-attribute-values/
            let filterValues = filterInput.value.toLowerCase().split(','),
                selectors = constructSelector(filterValues);
            
            function constructSelector(filterValues) {
                let singleSelectorArr = [],
                    comboSelectorArr = [],
                    selectors = [];
                
                filterValues.forEach(function(value) {
                    let thisSingleSelector = 'div.fauxn-item[name-lower*="'+ value.trim() +'"],',
                        thisComboSelector = '[name-lower*="'+ value.trim() +'"]';
                    
                    singleSelectorArr.push(thisSingleSelector);
                    comboSelectorArr.push(thisComboSelector);
                });
                
                selectors.push(singleSelectorArr.join(''));
                selectors.push(comboSelectorArr.join(''));
                
                return selectors;
            }
            
            let filterValue = filterInput.value.toLowerCase(),
                dbExplorerFilterCss = selectors[0] +`
                    section.db-site-container`+ selectors[1] +`{
                        display: flex;
                    }
                `;
            
            dbExplorerFilterStyle.textContent = dbExplorerFilterCss;
            document.querySelector('div.scroll#phones').scrollTop = 0;
        }, 500);
    })
}
dbExplorerFilter();

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

// Delta target behavior
function deltaTargetMods() {
    let deltaTargetsStyle = document.createElement('style'),
        deltaTargetsCss = `
            :root {
                --icon-5128: url("data:image/svg+xml,%3Csvg width='600' height='200' viewBox='0 0 600 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_334_11)'%3E%3Crect x='10' y='10' width='580' height='180' stroke='black' stroke-width='20'/%3E%3Cpath d='M77.49 142.96C74.85 142.96 71.93 142.84 68.73 142.6C65.53 142.44 62.37 142.2 59.25 141.88C56.13 141.48 53.29 141 50.73 140.44V125.56C53.53 125.8 56.41 126.04 59.37 126.28C62.41 126.44 65.29 126.6 68.01 126.76C70.73 126.84 73.09 126.88 75.09 126.88C78.29 126.88 80.85 126.76 82.77 126.52C84.69 126.2 86.17 125.68 87.21 124.96C88.33 124.24 89.09 123.2 89.49 121.84C89.89 120.4 90.09 118.6 90.09 116.44C90.09 114.12 89.85 112.28 89.37 110.92C88.97 109.48 88.21 108.44 87.09 107.8C85.97 107.08 84.41 106.6 82.41 106.36C80.41 106.12 77.85 106 74.73 106C72.65 106 70.25 106.08 67.53 106.24C64.81 106.32 62.09 106.48 59.37 106.72C56.65 106.88 54.09 107.08 51.69 107.32V59.44H104.97V75.64H69.93V91.12C71.29 90.96 72.85 90.8 74.61 90.64C76.45 90.48 78.29 90.36 80.13 90.28C81.97 90.2 83.65 90.16 85.17 90.16C90.37 90.16 94.65 90.72 98.01 91.84C101.37 92.96 104.01 94.6 105.93 96.76C107.85 98.84 109.17 101.4 109.89 104.44C110.69 107.48 111.09 111 111.09 115C111.09 119.88 110.61 124.08 109.65 127.6C108.69 131.12 106.97 134.04 104.49 136.36C102.09 138.6 98.69 140.28 94.29 141.4C89.97 142.44 84.37 142.96 77.49 142.96ZM154.17 142V80.44L138.69 86.92V70.48L160.77 59.44H175.05V142H154.17ZM209.554 142V130.6C209.554 126.04 209.674 122.12 209.914 118.84C210.154 115.56 210.674 112.76 211.474 110.44C212.354 108.12 213.714 106.16 215.554 104.56C217.394 102.88 219.914 101.36 223.114 100L241.354 92.68C243.674 91.72 245.394 90.88 246.514 90.16C247.634 89.36 248.354 88.4 248.674 87.28C248.994 86.16 249.154 84.6 249.154 82.6C249.154 80.12 248.754 78.32 247.954 77.2C247.154 76 245.714 75.28 243.634 75.04C241.554 74.72 238.634 74.56 234.874 74.56C233.114 74.56 230.914 74.64 228.274 74.8C225.714 74.96 222.954 75.16 219.994 75.4C217.034 75.64 214.114 75.92 211.234 76.24V61.12C213.874 60.64 216.874 60.2 220.234 59.8C223.594 59.4 227.034 59.08 230.554 58.84C234.154 58.6 237.474 58.48 240.514 58.48C244.514 58.48 248.274 58.76 251.794 59.32C255.394 59.8 258.554 60.8 261.274 62.32C263.994 63.84 266.114 66.12 267.634 69.16C269.234 72.2 270.034 76.28 270.034 81.4C270.034 86.52 269.474 90.64 268.354 93.76C267.314 96.88 265.754 99.36 263.674 101.2C261.594 103.04 259.074 104.56 256.114 105.76L235.474 113.8C233.874 114.44 232.634 115.12 231.754 115.84C230.954 116.48 230.394 117.36 230.074 118.48C229.754 119.52 229.594 120.92 229.594 122.68V125.8H270.034V142H209.554ZM336.67 142.96C329.63 142.96 323.83 142.44 319.27 141.4C314.79 140.36 311.31 138.84 308.83 136.84C306.43 134.84 304.75 132.44 303.79 129.64C302.83 126.76 302.35 123.52 302.35 119.92C302.35 115.36 302.91 111.8 304.03 109.24C305.23 106.6 306.95 104.6 309.19 103.24C311.43 101.88 314.15 100.84 317.35 100.12V99.64C312.55 98.6 308.95 96.6 306.55 93.64C304.23 90.68 303.07 86.2 303.07 80.2C303.07 76.68 303.59 73.56 304.63 70.84C305.75 68.12 307.55 65.84 310.03 64C312.59 62.16 316.03 60.8 320.35 59.92C324.75 58.96 330.19 58.48 336.67 58.48C343.15 58.48 348.55 58.96 352.87 59.92C357.27 60.8 360.71 62.16 363.19 64C365.75 65.84 367.55 68.12 368.59 70.84C369.71 73.56 370.27 76.68 370.27 80.2C370.27 86.2 369.07 90.68 366.67 93.64C364.35 96.6 360.79 98.6 355.99 99.64V100.12C359.27 100.84 361.99 101.88 364.15 103.24C366.39 104.6 368.07 106.6 369.19 109.24C370.39 111.8 370.99 115.36 370.99 119.92C370.99 123.52 370.51 126.76 369.55 129.64C368.59 132.44 366.87 134.84 364.39 136.84C361.91 138.84 358.43 140.36 353.95 141.4C349.47 142.44 343.71 142.96 336.67 142.96ZM336.67 127.36C340.27 127.36 343.03 127.2 344.95 126.88C346.87 126.48 348.19 125.6 348.91 124.24C349.71 122.8 350.11 120.6 350.11 117.64C350.11 115.4 349.91 113.6 349.51 112.24C349.19 110.88 348.51 109.88 347.47 109.24C346.51 108.52 345.15 108.04 343.39 107.8C341.63 107.56 339.39 107.44 336.67 107.44C333.95 107.44 331.71 107.56 329.95 107.8C328.19 108.04 326.83 108.52 325.87 109.24C324.91 109.88 324.23 110.88 323.83 112.24C323.51 113.6 323.35 115.4 323.35 117.64C323.35 120.6 323.71 122.8 324.43 124.24C325.15 125.6 326.47 126.48 328.39 126.88C330.39 127.2 333.15 127.36 336.67 127.36ZM336.67 93.04C340.35 93.04 343.07 92.84 344.83 92.44C346.67 92.04 347.87 91.16 348.43 89.8C349.07 88.44 349.39 86.4 349.39 83.68C349.39 80.8 349.07 78.72 348.43 77.44C347.87 76.08 346.67 75.2 344.83 74.8C343.07 74.32 340.35 74.08 336.67 74.08C333.07 74.08 330.35 74.32 328.51 74.8C326.67 75.2 325.47 76.08 324.91 77.44C324.35 78.72 324.07 80.8 324.07 83.68C324.07 86.4 324.35 88.44 324.91 89.8C325.47 91.16 326.67 92.04 328.51 92.44C330.35 92.84 333.07 93.04 336.67 93.04Z' fill='black'/%3E%3Cg clip-path='url(%23clip1_334_11)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M400 0H415H430H570H584H600V200H584H570H430H415H400V0ZM454.114 144.592L455.01 146H544.738L545.762 144.336L499.81 51.792H497.25L454.114 144.592ZM516.194 127.824H481.25L498.146 90.192L516.194 127.824Z' fill='black'/%3E%3C/g%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_334_11'%3E%3Crect width='600' height='200' fill='white'/%3E%3C/clipPath%3E%3CclipPath id='clip1_334_11'%3E%3Crect width='200' height='200' fill='white' transform='translate(400)'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
                --icon-5128-sm: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_343_25)'%3E%3Cpath d='M54.896 147.208L54 145.8L97.136 53H99.696L145.648 145.544L144.624 147.208H54.896ZM81.136 129.032H116.08L98.032 91.4L81.136 129.032Z' fill='black'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_343_25'%3E%3Crect width='200' height='200' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");

                --icon-5128: url("data:image/svg+xml,%3Csvg width='685' height='200' viewBox='0 0 685 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_1_44)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M485 20H20V180H485V20ZM485 0H0V200H485H685V0H485ZM59.088 55.936V144H89.936C97.7867 144 104.187 143.616 109.136 142.848C114.085 141.995 117.968 140.629 120.784 138.752C123.6 136.789 125.605 134.144 126.8 130.816C128.08 127.403 128.891 123.179 129.232 118.144C129.573 113.109 129.744 107.051 129.744 99.968C129.744 92.8853 129.573 86.8267 129.232 81.792C128.891 76.7573 128.08 72.576 126.8 69.248C125.605 65.8347 123.6 63.1893 120.784 61.312C117.968 59.3493 114.085 57.984 109.136 57.216C104.187 56.3627 97.7867 55.936 89.936 55.936H59.088ZM89.424 126.848H81.36V73.088H89.424C92.9227 73.088 95.7813 73.1733 98 73.344C100.219 73.5147 101.968 74.0267 103.248 74.88C104.528 75.7333 105.467 77.1413 106.064 79.104C106.661 80.9813 107.003 83.6267 107.088 87.04C107.259 90.368 107.344 94.6773 107.344 99.968C107.344 105.259 107.259 109.611 107.088 113.024C107.003 116.352 106.661 118.997 106.064 120.96C105.552 122.837 104.613 124.203 103.248 125.056C101.968 125.824 100.219 126.336 98 126.592C95.7813 126.763 92.9227 126.848 89.424 126.848ZM210.654 144H148.958V55.936H210.654V73.088H171.23V91.136H204.638V108.032H171.23V126.848H210.654V144ZM252.975 55.936H230.703V144H287.279V126.08H252.975V55.936ZM308.978 144V73.856H284.914V55.936H355.442V73.856H331.25V144H308.978ZM379.145 144H357.129L385.033 55.936H415.369L443.401 144H420.873L415.625 126.72H384.265L379.145 144ZM389.001 109.952H410.761L400.265 75.136H399.369L389.001 109.952ZM538.755 142.367C537.987 143.901 537.603 144.668 537.695 145.292C537.775 145.836 538.076 146.323 538.527 146.639C539.043 147 539.901 147 541.616 147H627.384C629.099 147 629.957 147 630.473 146.639C630.924 146.323 631.225 145.836 631.305 145.292C631.397 144.668 631.013 143.901 630.245 142.367L587.361 56.7151C586.44 54.8753 585.98 53.9554 585.357 53.6601C584.815 53.4031 584.186 53.4031 583.643 53.6601C583.02 53.9554 582.56 54.8753 581.639 56.7151L538.755 142.367ZM584.5 93.4398L567.197 128H601.803L584.5 93.4398Z' fill='black'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_1_44'%3E%3Crect width='685' height='200' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A");
            }

            div.targetClass.delta-targets:before {
                content: '';
                display: block;
                width: 108px;
                height: 36px;
                margin: 0 10px 0 0;

                background-size: 100%;
                background-position: center;
                background-repeat: no-repeat;

                background: linear-gradient(135deg, var(--background-color-contrast-more) 40%, var(--accent-color), var(--background-color-contrast-more) 50%);
                background-size: 800% 800%;
                animation: gradient-flash 6s ease-in-out infinite;

                mask: var(--icon-5128);
                -webkit-mask: var(--icon-5128);
                mask-size: 100%;
                mask-repeat: no-repeat;
                mask-position: center;
                -webkit-mask-size: 100%;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: center;
            }

            @keyframes gradient-flash {
                0% {
                    background-position: 0% 0%;
                }
                40% {
                    background-position: 100% 100%;
                }
                40.1% {
                    background-position: 0% 0%;
                }
                100% {
                    background-position: 0% 0%;
                }
            }

            div.targetClass.delta-targets div.targetLabel {
                display: none;
            }
        `;

    deltaTargetsStyle.setAttribute('type','text/css');
    deltaTargetsStyle.textContent = deltaTargetsCss;
    document.querySelector('body').append(deltaTargetsStyle);
    
    let targetLabels = document.querySelectorAll('div.targetLabel span');

    targetLabels.forEach(function(label) {
        let labelText = label.textContent,
            labelIsDelta = labelText.includes('Δ');

        if (labelIsDelta) {
            let targetCollection = label.closest('div.targetClass');

            // Set class on Delta targets container & style
            targetCollection.classList.add('delta-targets');
            
            // Set baseline behavior on delta targets
            let deltaTargets = targetCollection.querySelectorAll('div.target');
            
            // Set up mutation observers
            deltaTargets.forEach(function(target) {
                let targetName = target.textContent;
                
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.target.getAttribute('style').length) {
                            let targetInTable = document.querySelector('tr[data-filename="'+ targetName +' Target"]'),
                                targetBaselineReady = targetInTable.querySelector('td.button-baseline:not(.selected)');
                            
                            if (targetBaselineReady) {
                                targetBaselineReady.click();
                            }
                        }
                    });
                });

                // Notify me of style changes
                var observerConfig = {
                    attributes: true, 
                    attributeFilter: ['style']
                };

                observer.observe(target, observerConfig);
                
                // Set as baseline on init
                activePhones.forEach(function(phone) {
                    if (phone.dispName === targetName) {
                        let targetInTable = document.querySelector('tr[data-filename="'+ targetName +' Target"]'),
                            targetBaselineReady = targetInTable.querySelector('td.button-baseline:not(.selected)');

                        if (targetBaselineReady) {
                            targetBaselineReady.click();
                        }
                    }
                });
            });
        }
    });
}

window.addEventListener('load', function() {
    //let squigReadyEvent = new Event('squig-ready');
    //window.dispatchEvent(squigReadyEvent);

    let deltaInterval = setInterval(initDeltaTargetMods, 200);

    function initDeltaTargetMods() {
        let targetLabelsCount = document.querySelectorAll('div.targetLabel').length;
        
        if (targetLabelsCount) {
            deltaTargetMods();
            clearInterval(deltaInterval);
        }
    }
});
