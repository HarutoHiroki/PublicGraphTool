// Phone-table UI

// Owns the right-side phone table (rows, color picker popup, variant
// selector, channel selector, hide/pin/baseline buttons, color refresh).
// Reads many globals from graphtool.js (table, gpath, baseline, activePhones,
// etc.) and from sibling modules (color.js, smoothing.js, normalization.js,
// prefBounds.js); cross-script let/const at top level resolve via the realm's
// shared global lexical environment.

// --- Row styling + channel-box layout helpers ---
function setPhoneTr(phtr) {
    phtr.each(function (p) {
        p.highlight = p.active;
        let o = p.objs; if (!o) return;
        p.objs = o = o.filter(q=>q.active);
        if (o.length === 0) {
            delete p.objs;
        } else if (!p.active) {
            p.id = o[0].id;
            p.highlight = true;
        }
    });
    phtr.style("background",p=>p.isTarget&&!p.active?null:getDivColor(p.id,p.highlight,p.hexColor))
        .style("border-color",p=>p.highlight?getDivColor(p.id,1,p.hexColor):null);
    phtr.filter(p=>!p.isTarget)
        .select(".phone-item-add")
        .selectAll(".remove").data(p=>p.highlight?[p]:[])
        .join("span").attr("class","remove").text("⊗")
        .on("click", p => { d3.event.stopPropagation(); removeCopies(p); });
}

let channelbox_x = c => c?-86:-36,
    channelbox_tr = c => "translate("+channelbox_x(c)+",0)";

// --- Hide toggle and color-bar SVG data URI ---
let colorBar = p=>'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 8"><path d="M0 8v-8h1c0.05 1.5,-0.3 3,-0.16 5s0.1 2,0.15 3z" fill="'+getBgColor(p)+'"/></svg>\')';

function toggleHide(p) {
    let h = p.hide;
    let t = table.selectAll("tr").filter(q=>q===p);
    t.select(".keyLine").on("click", h?null:toggleHide)
        .selectAll("path,.imbalance").attr("opacity", h?null:0.5);
    t.select(".hideIcon").classed("selected", !h);
    gpath.selectAll("path").filter(c=>c.p===p)
        .attr("opacity", h?null:0);
    p.hide = !h;
    if (labelsShown) {
        clearLabels();
        drawLabels();
    }
}

// --- Main table builder + channel/comp wiring ---
function updatePhoneTable() {
    let c = table.selectAll("tr").data(activePhones.filter(p => !p.isPrefBounds), p=>p.fileName);
    c.exit().remove();

    let f = c.enter().append("tr").attr("data-filename", p=>p.fileName),
        td = () => f.append("td");
    f   .call(setHover, h => p => hl(p,h))
        .style("color", p => getDivColor(p.id,true,p.hexColor));

    td().attr("class","remove").text("⊗")
        .attr("title", "Remove graph")
        .on("click", removePhone)
        .style("background-image",colorBar)
        .append("svg").call(addColorPicker); // .filter(p=>!p.isTarget) if you want to exclude target from color picker
    td().attr("class","item-line item-target")
        .call(s=>s.filter(p=>!p.isTarget).attr("class","item-line item-phone")
                  .append("span").attr("class","brand").text(p=>p.dispBrand))
        .call(addModel);
    td().attr("class","curve-color").append("button")
        .style("background-color",p=>getCurveColor(p.id,0,p.hexColor))
        .call(makeColorPicker); // .filter(p=>!p.isTarget) if you want to exclude target from color picker
    td().attr("class","channels").append("svg").call(addKey)
    td().attr("class","levels").append("input")
        .attrs({type:"number",step:"any",value:0})
        .property("value", p=>p.offset)
        .on("change input",function(p){ setOffset(p, +this.value); });
    let cSel = f.filter(p=>!p.isTarget).append("td").attr("class", "comp").append("select");
    cSel.selectAll("option").data(["<no comp>", ...compTargets])
        .enter().append("option").text(d=>d);
    cSel.property("value", p=>p.comp);
    cSel.on("change", function(p) { handleComp(p, this.value); });
    td().attr("class","button button-baseline")
        .attr("title", "Set as baseline")
        .html("<svg viewBox='-170 -120 340 240'><use xlink:href='#baseline-icon'></use></svg>")
        .on("click", p => {
            let isBaselined = p===baseline.p || (p.basedOn && p.basedOn===baseline.p);
            setBaseline(isBaselined ? baseline0 : getBaseline(p));
        });

    function showNinetyInclusion(p) {
        let t = table.selectAll("tr").filter(q=>q===p);
        t.select(".button-ninety").classed("selected", !t.select(".button-ninety").classed("selected"));
        if (t.select(".button-ninety").classed("selected")) {
            // Calculate 90% Confidence Interval
            // let ch = calculateConfidenceIntervals(p.rawChannels);
            // Calculate 90% inclusion zone
            let rawChannels = [];
            if (p.fileNames) { // collecting raw channels from all variants
                let promises = p.fileNames.map(fileName => {
                    return new Promise((resolve, reject) => {
                        loadFiles({ ...p, fileName }, channels => {
                            if (channels) {
                                rawChannels = rawChannels.concat(channels);
                            }
                            resolve();
                        });
                    });
                });

                Promise.all(promises).then(() => {
                    let ch = calculateInclusionWindows(rawChannels);
                    let ninetyPercentInclusion = setBoundsPhone(p, ch);
                    showPhone(ninetyPercentInclusion);
                    console.log(rawChannels)
                });
            } else {
                let ch = calculateInclusionWindows(p.rawChannels);
                let ninetyPercentInclusion = setBoundsPhone(p, ch);
                showPhone(ninetyPercentInclusion);
            }
        } else {
            let ninetyPercentInclusion = activePhones.filter(q=>q.fullName===p.fullName+inclusionName);
            removePhone(ninetyPercentInclusion[0]);
        }
    }
    f.filter(p=>!p.isTarget && !p.is90Bounds).append("td").attr("class","button button-ninety")
        .html("<svg width='100' height='100' viewBox='0 0 100 100' stroke-width='1.5'><use xlink:href='#ninety-icon'></use></svg>")
        .on("click", showNinetyInclusion);

    td().attr("class","button hideIcon")
        .attr("title", "Hide graph")
        .html("<svg viewBox='-2.5 0 19 12'><use xlink:href='#hide-icon'></use></svg>")
        .on("click", toggleHide);
    td().attr("class","button button-pin")
        .attr("title", "Pin graph")
        .attr("data-pinned","false")
        .html("<svg viewBox='-135 -100 270 200'><use xlink:href='#pin-icon'></use></svg>")
        .on("click",function(p){
            // Pin is one-way: replace the button with a permanent pin mark.
            p.pin = true;
            nextPN = null;
            this.setAttribute("data-pinned","true");
            d3.select(this)
                .text(null).classed("button",false).on("click",null)
                .insert("svg").attr("class","pinMark")
                .attr("viewBox","0 0 280 145")
                .insert("path").attrs({
                    fill:"none",
                    "stroke-width":30,
                    "stroke-linecap":"round",
                    d:"M265 110V25q0 -10 -10 -10H105q-24 0 -48 20l-24 20q-24 20 -2 40l18 15q24 20 42 20h100"
                });
            if (!userConfigApplicationActive) setUserConfig();
        });
    if (allowSquigDownload) {
        function saveSquiggle(p) {
            let channels = p.activeCurves.map(c => c.l);
            let LR = p.activeCurves.map(c => c.id.match(/(?<=\().(?=\))/)? c.id.match(/(?<=\().(?=\))/)[0] : "Target");
            
            let squig = document.createElement("a");
            squig.style.display = 'none';
            document.body.appendChild(squig);

            // this code is if you want to download the average curve if multiple channels are visible
            if (channels.length > 1) {
                let squigName = p.fullName + " AVG";
                p.comp ? squigName += " - Comp: " + p.comp : null;
                let filename = squigName + ".txt";
                let data = avgCurves(channels).map(d => d.join("\t")).join("\n");
                let blob = new Blob([data], {type: "text/plain; charset=utf-8"});
                let url = URL.createObjectURL(blob);

                squig.href = url;
                squig.download = filename;
                squig.click();
                URL.revokeObjectURL(url);
            } else {
                let squigName = p.fullName + " " + LR[0];
                p.comp ? squigName += " - " + p.comp : null;
                let filename = squigName + ".txt";
                let data = channels[0].map(d => d.join("\t")).join("\n");
                let blob = new Blob([data], {type: "text/plain; charset=utf-8"});
                let url = URL.createObjectURL(blob);

                squig.href = url;
                squig.download = filename;
                squig.click();
                URL.revokeObjectURL(url);
            }

            // cleanup
            document.body.removeChild(squig);
        }

        td().attr("class","button button-saveSquig")
            .html("<svg viewBox='0 0 24 24'><use xlink:href='#save-icon'></svg>")
            .on("click", saveSquiggle);
    }
}

function updateChannels(p, ch, comp) {
    if (comp) { // if comp exists means we are compensating
        // subtract the comp curve from the phone curve
        for (let i=0; i<ch.length; i++) {
            ch[i] = ch[i].map((d, j) => [d[0], d[1] - comp[Math.min(j, comp.length-1)]]);
        }
    }

    p.channels = ch;
    p.rawChannels = ch;
    if (p.activeCurves.length > 1) {
        for (let i=0; i<p.activeCurves.length; i++) {
            p.activeCurves[i].l = ch[i];
            p.activeCurves[i].p = p;
        }
    } else {
        p.activeCurves[0].l = avgCurves(ch);
    }
    normalizePhone(p);
    p.smooth = null;
    smoothPhone(p);
        
    // update the graph
    updatePaths();
}

function handleComp(p, opt) {
    if (!p.preComp) p.preComp = p.rawChannels; // save the original channels
    let ch = [...p.preComp]; // copy the original channels
    if (opt !== "<no comp>") {
        let compTarget = window.brandTarget.phoneObjs.find(p => p.dispName == opt);
        p.comp = opt;
        if (!compTarget.rawChannels) {
            loadFiles(compTarget, function (tch) { // Haruto: fuck promises imma just slap down a "it works for now" solution
                compTarget.rawChannels = tch;
                let comp = compTarget.rawChannels[0].map(d => d[1]);
            
                updateChannels(p, ch, comp);
            });
        } else {
            let comp = compTarget.rawChannels[0].map(d => d[1]);
        
            updateChannels(p, ch, comp);
        }
    } else {
        p.comp = opt;
        updateChannels(p, ch);
    }
}

// --- Per-row key line, variants, color picker popup, colorPhones ---
function addKey(s) {
    let dim={x:-19-keyLeft, y:-12, width:65+keyLeft, height:24}
    s.attr("class","keyLine").attr("viewBox",[dim.x,dim.y,dim.width,dim.height].join(" "));
    let defs = s.append("defs");
    defs.append("linearGradient").attr("id", p=>"chgrad"+p.id)
        .attrs({x1:0,y1:0, x2:0,y2:1})
        .selectAll().data(p=>[0.1,0.4,0.6,0.9].map(o =>
            [o, getCurveColor(p.id, o<0.3?-1:o<0.7?0:1,p.hexColor)]
        )).join("stop")
        .attr("offset",i=>i[0])
        .attr("stop-color",i=>i[1]);
    defs.append("linearGradient").attr("id","blgrad")
        .selectAll().data([0,0.25,0.31,0.69,0.75,1]).join("stop")
        .attr("offset",o=>o)
        .attr("stop-color",(o,i) => i==2||i==3?"white":"#333");
    let m = defs.append("mask").attr("id",p=>"chmask"+p.id);
    m.append("rect").attrs(dim).attr("fill","#333");
    m.append("rect").attrs({"class":"keyMask", x:p=>channelbox_x(p.avg), y:-12, width:120, height:24, fill:"url(#blgrad)"});
    let t = s.append("g");
    t.append("path")
        .attr("stroke", p => notMultichannel(p) ? getCurveColor(p.id,0,p.hexColor)
                                                : "url(#chgrad"+p.id+")");
    t.selectAll().data(p=>p.isTarget?[]:LR)
        .join("text").attr("class","keyCLabel")
        .attrs({x:17+keyExt, y:(_,i)=>12*(i-(LR.length-1)/2),
                dy:"0.32em", "text-anchor":"start", "font-size":10.5})
        .text(t=>t);
    t.filter(p=>p.isTarget).append("text")
        .attrs(keyExt?{x:7,y:6,"text-anchor":"middle"}
                     :{x:17,y:0,"text-anchor":"start"})
        .attrs({dy:"0.32em", "font-size":8, fill:p=>getCurveColor(p.id,0,p.hexColor)})
        .text("Target");
    let uchl = f => function (p) {
        updateCurves(p, f(p)); hl(p,true);
    }
    s.append("rect").attr("class","keySelBoth")
        .attrs({x:40+channelbox_x(0), width:40, height:12,
                opacity:0, display:"none"})
        .on("click", uchl(p=>0));
    s.append("g").attr("class","keySel")
        .attr("transform",p=>channelbox_tr(p.avg))
        .on("click", uchl(p=>!p.avg))
        .selectAll().data([0,80]).join("rect")
        .attrs({x:d=>d, y:-12, width:40, height:24, opacity:0});
    let o = s.filter(p=>!notMultichannel(p))
        .selectAll().data(p=>[[p,0],[p,1]])
        .join("g").attr("class","keyOnly")
        .attr("transform",pi=>"translate(25,"+[-6,6][pi[1]]+")")
        .call(setHover, h => function (pi) {
            let p = pi[0], cs = p.activeCurves;
            if (!p.hide && cs.length===2) {
                d3.event.stopPropagation();
                hl(p, h ? (c=>c===cs[pi[1]]) : true);
                gpath.selectAll("path").filter(c=>c.p===p).attr("opacity",h ? (c=>c!==cs[pi[1]]?0.7:null) : null);
            }
        })
        .on("click", pi => updateCurves(pi[0], false, pi[1]));
    o.append("rect").attrs({x:0,y:-6,width:30,height:12,opacity:0});
    o.append("text").attrs({x:0, y:0, dy:"0.28em", "text-anchor":"start",
                            "font-size":7.5 })
        .text("only");
    s.append("text").attr("class","imbalance")
        .attrs({x:8,y:0,dy:"0.35em","font-size":10.5})
        .text("!");
    if (sampnums.length>1) {
        let a = s.filter(p=>!p.isTarget);
        let f = LR.length>1 ? (n=>"all "+n) : (n=>n+" samples");
        let t = a.selectAll()
            .data(p=>["AVG",f(Math.floor(validChannels(p).length/LR.length))]
                        .map((t,i)=>[t,i===+p.samp?1:0.6]))
            .join("text").attr("class","keySamp")
            .attrs({x:-18.5-keyLeft, y:(_,i)=>12*(i-1/2), dy:"0.33em",
                    "text-anchor":"start", "font-size":7, opacity:t=>t[1] })
            .text(t=>t[0]);
        a.append("rect")
            .attrs({x:-19-keyLeft, y:-12, width:keyLeft?16:38, height:24, opacity:0})
            .on("click", p=>updateCurves(p, undefined, p.lr, !p.samp));
    }
    updateKey(s);
}

function updateKey(s) {
    let disp = fn => e => e.attr("display",p=>fn(p)?null:"none"),
        cs = hasChannelSel;
    s.select(".imbalance").call(disp(hasImbalance));
    s.select(".keySel").call(disp(p=>cs(p)));
    s.selectAll(".keyOnly").call(disp(pi=>cs(pi[0])));
    s.selectAll(".keyCLabel").data(p=>p.channels).call(disp(c=>c));
    s.select("g").attr("mask",p=>cs(p)?"url(#chmask"+p.id+")":null);
    let l=-17-(keyLeft?8:0);
    s.select("path").attr("d", p =>
        notMultichannel(p) ? "M"+(15+keyExt)+" 0H"+l :
        ["M15 -6H9C0 -6,0 0,-9 0H"+l,"M"+l+" 0H-9C0 0,0 6,9 6H15"]
            .filter((_,i) => p.channels[i])
            .reduce((a,b) => a+b.slice(6))
    );
}

function addModel(t) {
    let n = t.append("div").attr("class","phonename").text(p=>p.dispName);
    t.filter(p=>p.fileNames)
        .append("div").attr("class","variants")
        .call(function (s) {
            s.append("svg").attr("viewBox","0 -2 10 11")
                .append("path").attr("fill","currentColor")
                .attr("d","M1 2L5 6L9 2L8 1L6 3Q5 4 4 3L2 1Z");
        })
        .attr("tabindex",0) // Make focusable
        .on("focus", function (p) {
            if (p.selectInProgress) return;
            p.selectInProgress = true;
            p.vars[p.fileName] = p.rawChannels;
            d3.select(this)
                .on("mousedown", function () {
                    d3.event.preventDefault();
                    this.blur();
                })
                .select("path").attr("transform","translate(0,7)scale(1,-1)");
            let n = d3.select(this.parentElement).select(".phonename");
            n.text("");
            let q = p.copyOf || p,
                o = q.objs || [p],
                active_fns = o.map(v=>v.fileName),
                vars = p.fileNames.map((f,i) => {
                    let j = active_fns.indexOf(f);
                    return j!==-1 ? o[j] :
                        {fileName:f, dispName:q.dispNames[i]};
                });
            let nVariantNames = n.append("div").attr("class","variant-names");
            let nVariantPopouts = n.append("div").attr("class","variant-popouts");
            let d = nVariantNames.selectAll().data(vars).join("div")
                     .attr("class","variantName").text(v=>v.dispName),
                w = d3.max(d.nodes(), d=>d.getBoundingClientRect().width);
            d.style("width",w+"px");
            d.filter(v=>v.active)
                .style("cursor","initial")
                .style("color", getTextColor)
                .call(setHover, h => p =>
                    table.selectAll("tr").filter(q=>q===p)
                        .classed("highlight", h)
                );
            let c = nVariantPopouts.selectAll().data(vars).join("span")
                .html("&nbsp;+&nbsp;").attr("class","variantPopout")
                .style("left",(w+5)+"px")
                .style("display",v=>v.active?"none":null);
            [d,c].forEach(e=>e.transition().style("top",(_,i)=>i*1.3+"em"));
            d.filter(v=>!v.active).on("mousedown", v => Object.assign(p,v));
            c.on("mousedown", function (v) {
                showVariant(q, v);
            });
        })
        .on("blur", function endSelect(p) {
            if (document.activeElement === this) return;
            p.selectInProgress = false;
            d3.select(this)
                .on("mousedown", null)
                .select("path").attr("transform", null);
            let n = d3.select(this.parentElement).select(".phonename");
            n.selectAll("div")
                .call(setHover, h=>p=>null)
                .transition().style("top",0+"em").remove()
                .end().then(()=>n.text(p=>p.dispName));
            changeVariant(p, updateVariant);
            table.selectAll("tr").classed("highlight", false); // Prevents some glitches
        });
    t.filter(p=>p.isTarget).append("span").text(" Target");
}

function updateVariant(p) {
    updateKey(table.selectAll("tr").filter(q=>q===p).select(".keyLine"));
    normalizePhone(p);
    updatePaths();
}
function changeVariant(p, update, trigger) {
    let fn = p.fileName,
        ch = p.vars[fn];
    function set(ch) {
        p.rawChannels = ch; p.smooth = undefined;
        smoothPhone(p);
        setCurves(p);
        update(p, 0, 0, trigger);
    }
    if (ch) {
        set(ch);
    } else {
        loadFiles(p, set);
    }
}
function showVariant(p, c, trigger) {
    if (!p.objs) { p.objs = [p]; }
    p.objs.push(c);
    c.active=true; c.copyOf=p;
    ["brand","dispBrand","fileNames","vars"].map(k=>c[k]=p[k]);
    changeVariant(c, showPhone, trigger);
}

function cpCircles(svg) {
    svg.selectAll("circle")
        .data(p => [[3,3,2],[6.6,4,1]].map(([cx,cy,r])=>({cx,cy,r,fill:getBgColor(p)})))
        .join("circle").attrs(d=>d);
}
function addColorPicker(svg) {
    svg.attr("viewBox","0 0 9 5.3");
    svg.append("rect").attrs({x:0,y:0,width:9,height:5.3,fill:"none"});
    svg.call(cpCircles);
    makeColorPicker(svg);
}
function hclToHex(hcl) {
    return d3.hcl(hcl).formatHex();
}
function createPopupMenu(p, x, y) {
    // Remove any existing popup
    d3.select(".colorStylePicker").remove();

    // Create the popup menu
    let popup = d3.select("body").append("div")
        .attr("class", "colorStylePicker")
        .style("position", "absolute")
        .style("left", `${x}px`)
        .style("top", `${y}px`)
        .style("padding", "10px")

    
    // Add a color wheel to the left side
    let colorWheelElement = popup.append("div").attr("class", "left-side").node();
    let colorWheel = new ReinventedColorWheel({
        appendTo: colorWheelElement,
        wheelDiameter: 150,
        wheelThickness: 10,
        handleDiameter: 16,
        wheelReflectsSaturation: true,
        hex: p.hexColor ? p.hexColor : hclToHex(getCurveColor(p.id,0)),
        onChange: function(color) {
            p.hexColor = color.hex;
            input.node().value = color.hex;
            colorPhones();
        }
    })

    // Add a right side menu
    let menuRightSide = popup.append("div").attr("class", "right-side");

    // lmao why button when can div
    menuRightSide.append("div")
    .style("margin-bottom", "3px")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "flex-end")
    .append("span").text("X").style("cursor", "pointer").on("click", function() {popup.remove();});

    // Add input row for hex code
    menuRightSide.append("div").style("margin-bottom", "3px").append("span").text("Custom Graph Color").style("margin-right", "108px");
    let hexMenu = menuRightSide.append("div").attr("class", "row");
    hexMenu.append("span").text("Hex Color");
    let input = hexMenu.append("input")
        .attr("type", "text")
        .attr("value", p.hexColor ? p.hexColor : hclToHex(getCurveColor(p.id,0)))
        .on("input", function() {
            if (!this.value.startsWith("#")) {
                this.value = "#" + this.value.replace(/#/g, "");
            }
            if (this.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                colorWheel.hex = this.value;
            }
        });

    // Add a button to apply random colors
    hexMenu.append("button").text("Random").on("click", function() {
        p.id = getPhoneNumber();
        // colorPhones();
        colorWheel.hex = hclToHex(getCurveColor(p.id,0));
        // change the hex color input value
        // input.node().value = p.hexColor ? p.hexColor : hclToHex(getCurveColor(p.id,0));
    });

    // Add a 2nd row for dash-style buttons
    menuRightSide.append("div").style("margin", "10px 0 3px 0").append("span").text("Custom Graph Dash-Style");
    let styleMenu = menuRightSide.append("div").attr("class", "row");

    let tick, space;
    function getDashStyle() {
        if (!p.dashStyle) {
            if (p.isTarget) {
                tick = 6;
                space = 3;
            } else if (p.isPrefBounds) {
                tick = 6;
                space = 3;
            } else {
                tick = 1;
                space = 0;
            }
        } else {
            let dash = p.dashStyle.split(", ");
            tick = dash[0];
            space = dash[1];
        }
    }
    function resolveDashStyle() {
        p.dashStyle = tick + ", " + space;
        updatePaths();
    }
    getDashStyle();

    styleMenu.append("span").text("Tick").attr("class", "tickText");
    styleMenu.append("input")
        .attr("class", "tickInput")
        .attr("type", "number")
        .attr("value", tick)
        .attr("min", 1)
        .on("input", function() {
            tick = this.value;
            resolveDashStyle();
        });
    styleMenu.append("span").text("Space").style("margin-left", "11px").attr("class", "spaceText");
    styleMenu.append("input")
        .attr("class", "spaceInput")
        .attr("type", "number")
        .attr("value", space)
        .attr("min", 0)
        .on("input", function() {
            space = this.value;
            resolveDashStyle();
        });
    
    // Add an event listener to close the popup when clicking outside of it
    document.addEventListener("click", function(event) {
        if (!popup.node().contains(event.target)) {
            popup.remove();
            document.removeEventListener("click", arguments.callee);
        }
    });
}
function makeColorPicker(elt) {
    elt.on("click", function (p) {
        // Get the bounding box of the clicked element
        let bbox = this.getBoundingClientRect();
        
        // Calculate the position for the popup menu
        let x = bbox.left + window.scrollX + 20;
        let y = bbox.top + window.scrollY - 150;

        createPopupMenu(p, x, y);
        d3.event.stopPropagation();
    });
}

function colorPhones() {
    updatePaths();
    let c = p=>p.active?getDivColor(p.id,true,p.hexColor):null;
    doc.select("#phones").selectAll("div")
        .style("background",c).style("border-color",c);
    let t = table.selectAll("tr").filter(p=>!p.isTarget)
        .style("color", c);
    t.select("button").style("background-color",p=>getCurveColor(p.id,0,p.hexColor));
    t= t.call(s => s.select(".remove").style("background-image",colorBar)
                    .select("svg").call(cpCircles))
        .select("td.channels"); // Key line
    t.select("svg").remove();
    t.append("svg").call(addKey);
}
