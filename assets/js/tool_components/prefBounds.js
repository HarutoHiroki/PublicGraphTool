// Preference bounds; load + setup + per-DF re-composition.

var prefBoundsObj; // Preference Bounds Phone object

// load preference bounds files
function loadPrefBounds(boundsName, callback) {
    let lpf = pf => d3.text(preference_bounds_dir+pf+".txt").catch(()=>null);
    let f = LR.map(s =>lpf(boundsName+" "+s))
    Promise.all(f).then(function (frs) {
        if (!frs.some(f=>f!==null)) {
            alert("Bounds not found!");
        } else {
            let ch = frs.map(f => f && Equalizer.interp(f_values, tsvParse(f)));
            ch = ch.filter(c => c !== null); // Remove null elements
            callback(ch);
        }
    });
}

function setPrefBounds(ch) {
    prefBoundsObj = { isPrefBounds:true, phone:"Preference Bounds",
    fullName:"Preference Bounds", dispName:"Preference Bounds",
    fileName:"Preference Bounds", rawChannels:ch, preComp:ch, id:-70 };
    smoothPhone(prefBoundsObj);
    normalizePhone(prefBoundsObj);
    prefBoundsObj.offset=prefBoundsObj.offset||0;
    let ap = activePhones.filter(p => !p.isTarget);
    if (ap.length===1 && ap[0].activeCurves.length!==1) {
        setCurves(ap[0], true);
    }

    if (preference_bounds_startup) {
        if (activePhones.filter(p => p.phone == "Preference Bounds").length !== 0) removePhone(activePhones.filter(p => p.phone == "Preference Bounds")[0]);
        doc.select("#cusdf-bounds").classed("selected", true);
        activePhones.push(prefBoundsObj);
        prefBoundsObj.active = true;
        setCurves(prefBoundsObj, undefined, prefBoundsObj.lr);
        updatePaths();
    }
}

// create preference bounds phone object
loadPrefBounds(preference_bounds_name, setPrefBounds);

// multiply/add pref bounds by base target
var prepPrefBounds = () => {
    let ch = [...prefBoundsObj.preComp]; // copy the original channels
    let base = df.rawChannels[0].map(d => d[1]);
    for (let i=0; i<ch.length; i++) {
        ch[i] = ch[i].map((d, j) => [d[0], d[1] + base[Math.min(j, base.length-1)]]);
    }
    prefBoundsObj.rawChannels = prefBoundsObj.channels = prefBoundsObj.lr = ch;
    normalizePhone(prefBoundsObj);
    prefBoundsObj.smooth = null;
    smoothPhone(prefBoundsObj);
}
