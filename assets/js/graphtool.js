// Original code by Marshall Lochbaum (https://github.com/mlochbaum)
// Heavily modified by HarutoHiroki (https://harutohiroki.com)
var doc = d3.select(".graphtool");
doc.html(`
  <svg style="display: none;">
    <defs>
      <g id="baseline-icon" text-anchor="middle" font-size="100px" fill="currentColor">
        <text dominant-baseline="central" y="-57">BASE</text>
        <text dominant-baseline="central" y="57">-LINE</text>
      </g>
      <g id="hide-icon">
        <path d="M2 6Q7 0 12 6Q7 12 2 6Z" stroke-width="1" stroke="currentColor" fill="none"/>
        <circle cx="7" cy="6" r="2" stroke="none" fill="currentColor"/>
        <line stroke-width="1" x1="4.4" y1="10.3" x2="10.4" y2="2.3" class="keyBackground"/>
        <line stroke-width="1" x1="3.6" y1= "9.7" x2= "9.6" y2="1.7" stroke="currentColor"/>
      </g>
      <g id="pin-icon" text-anchor="middle" font-size="100px" fill="currentColor">
        <text dominant-baseline="central">
          PIN
        </text>
      </g>
      <g id="save-icon">
        <path d='M16 11h5l-9 10-9-10h5v-11h8v11zm1 11h-10v2h10v-2z'/>
      </g>
      <g id="ninety-icon">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M14 10v4a2 2 0 1 0 4 0v-4a2 2 0 1 0 -4 0" />
        <path d="M6 15a1 1 0 0 0 1 1h2a1 1 0 0 0 1 -1v-6a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h3" />
      </g>
    </defs>
  </svg>

  <main class="main">
    <section class="parts-primary">
    <div class="graphBox" data-sticky-graph="`+ alt_sticky_graph +`" data-animated="`+ alt_animated +`">
      <div class="graph-sizer">
        <svg id="fr-graph" viewBox="0 0 800 346" data-labels-position="`+ labelsPosition +`"></svg>
      </div>

      <div class="tools collapseTools">
        <div class="copy-url">
          <button id="copy-url">Copy URL</button>
          <button id="download-faux">Screenshot</button>
          <button id="avg-all">Average All</button>
        </div>

        <div class="yscaler">
          <span>Y-axis Scale:</span>
          <div>
            <button id="yscalebtn" class="40db">40dB</button>
          </div>
        </div>

        <div class="zoom">
          <span>Zoom:</span>
          <button>Bass</button>
          <button>Mids</button>
          <button>Treble</button>
        </div>

        <div class="normalize">
          <span>Normalize:</span>
          <div>
            <input type="number" inputmode="decimal" id="norm-phon" required min="0" max="100" value="`+ default_norm_db +`" step="1" onclick="this.focus();this.select()"></input>
            <span>dB</span>
          </div>
          <div>
            <input type="number" inputmode="decimal" id="norm-fr" required min="20" max="20000" value="`+ default_norm_hz +`" step="1" onclick="this.focus();this.select()"></input>
            <span>Hz</span>
          </div>
          <span class="helptip">
            ?<span>Choose a dB value to normalize to a target listening level, or a Hz value to make all curves match at that frequency.</span>
          </span>
        </div>

        <div class="smooth">
          <span>Smooth:</span>
          <input type="number" inputmode="decimal" id="smooth-level" required min="0" value="5" step="any" onclick="this.focus();this.select()"></input>
        </div>

        <div class="miscTools">
          <button id="inspector"><span>╞</span> inspect</button>
          <button id="label"><span>▭</span> label</button>
          <button id="download"><span><u>⇩</u></span> screenshot</button>
          <button id="recolor"><span>○</span> recolor</button>
        </div>

        <div class="expand-collapse">
            <button id="expand-collapse"></button>
        </div>

        <svg id="expandTools" viewBox="0 0 14 12">
          <path d="M2 2h10M2 6h10M2 10h10" stroke-width="2px" stroke="#878156"    stroke-linecap="round" transform="translate(0,0.3)"/>
          <path d="M2 2h10M2 6h10M2 10h10" stroke-width="2px" stroke="currentColor" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

      <div class="manage">
        <div class="customDF">
          <span>Preference Adjustments:</span>
          <div>
            <input type="number" inputmode="decimal" id="cusdf-tilt" value="`+ default_tilt +`" step="0.1""></input>
            <span>Tilt (dB/Oct)</span>
          </div>
          <div>
            <input type="number" inputmode="decimal" id="cusdf-bass" value="`+ default_bass_shelf +`" step="1""></input>
            <span>Bass (dB)</span>
          </div>
          <div>
            <input type="number" inputmode="decimal" id="cusdf-treb" value="`+ default_treble +`" step="0.1""></input>
            <span>Treble (dB)</span>
          </div>
          <div>
            <input type="number" inputmode="decimal" id="cusdf-ear" value="`+ default_ear +`" step="0.1""></input>
            <span>Ear Gain (dB)</span>
          </div>
          <button id="cusdf-UnTiltTHIS" style="margin-right: 10px">Remove Adjustments</button>
          <button id="cusdf-harmanfilters" style="margin-right: 10px">Harman Filters</button>
          <button id="cusdf-bounds">Preference Bounds</button>
        </div>
        <table class="manageTable">
          <colgroup>
            <col class="remove">
            <col class="phoneId">
            <col class="key">
            <col class="calibrate">
            <col class="baselineButton">
            <col class="hideButton">
            <col class="lastColumn">
          </colgroup>
          <tbody class="curves"></tbody>
          <tr class="addPhone">
            <td class="addButton">⊕</td>
            <td class="helpText" colspan="5">(or middle/ctrl-click when selecting; or pin other IEMs)</td>
            <td class="addLock">LOCK</td>
          </tr>
          <tr class="mobile-helper"></tr>
        </table>
      </div>

      <div class="accessories"></div>

      <div class="external-links"></div>
    </section>

    <section class="parts-secondary">
      <div class="controls">
        <div class="select" data-selected="models">
          <div class="selector-tabs">
            <button class="brands" data-list="brands">Brands</button>
            <button class="models" data-list="models">Models</button>
            <button class="extra">Equalizer</button>
          </div>

          <div class="selector-panel">
            <input class="search" type="text" inputmode="search" placeholder="Search" onclick="this.focus();this.select()"/>

            <svg class="chevron" viewBox="0 0 12 8" preserveAspectRatio="none">
              <path d="M0 0h4c0 1.5,5 3,7 4c-2 1,-7 2.5,-7 4h-4c0 -3,4 -3,4 -4s-4 -1,-4 -4"/>
            </svg>
            <svg class="stop" viewBox="0 0 4 1">
              <path d="M4 1H0C3 1 3.2 0.8 4 0Z"/>
            </svg>

            <div class="scroll-container">
              <div class="scrollOuter" data-list="brands"><div class="scroll" id="brands"></div></div>
              <div class="scrollOuter" data-list="models"><div class="scroll" id="phones"></div></div>
            </div>
          </div>

          <div class="extra-panel" style="display: none;">
            <div class="extra-upload">
              <h4 style="margin:0 0 6px 0">Uploading</h4>
              <div class="extra-upload-buttons">
                <button class="upload-fr">Upload FR</button>
                <button class="upload-target">Upload Target</button>
                <button class="upload-track">Upload Song</button>
                <form style="display:none"><input type="file" id="file-fr" accept=".csv,.txt" /></form>
                <form style="display:none"><input type="file" id="file-audio" accept="audio/*" /></form>
              </div>
              <span style="margin: 0 0 1em 0"><small>Uploaded data will not be persistent</small></span>
            </div>
            <div class="extra-eq">
              <h4 style="margin:0 0 6px 0">Parametric Equalizer</h4>
              <div class="select-eq-phone">
                <select name="phone">
                    <option value="" selected>Choose EQ model</option>
                </select>
              </div>
              <h4 id="preamp-disp" style="margin-top:12px">Pre-amp: 0.0 dB</h4>
              <div class="filters-header">
                <span>Type</span>
                <span>Frequency</span>
                <span>Gain</span>
                <span>Q</span>
              </div>
              <div class="filters">
                <div class="filter">
                    <span>
                      <input name="enabled" type="checkbox" checked></input>
                      <select name="type">
                        <option value="PK" selected>PK</option>
                        <option value="LSQ">LSQ</option>
                        <option value="HSQ">HSQ</option>
                      </select>
                    </span>
                    <span><input name="freq" type="number" min="20" max="20000" step="1" value="0"></input></span>
                    <span><input name="gain" type="number" min="-40" max="40" step="0.1" value="0"></input></span>
                    <span><input name="q" type="number" min="0" max="10" step="0.1" value="0"></input></span>
                </div>
              </div>
              <div class="filters-button">
                <span class="eqopts"><button class="add-filter" style="margin-right:7px;">+</button><button class="remove-filter">-</button></span>
                <span class="eqopts"><button class="sort-filters">Sort</button></span>
                <span class="eqopts"><button class="disable-filters">Disable</button></span>
                <span class="eqopts"><button class="save-filters">Save EQ</button></span>
              </div>
              <h4 style="margin: 6px 0 3px 0" >AutoEQ</h4>
              <div class="settings-row" style="margin:0 0 2px 0">
                <span name="title">Frequency Range</span>
                <span><input name="autoeq-from" type="number" min="20" max="20000" step="1" value="20"></input></span>
                <span><input name="autoeq-to" type="number" min="20" max="20000" step="1" value="20000"></input></span>
              </div>
              <div class="settings-row" style="margin:0 0 2px 0">
                <span name="title">Gain Range</span>
                <span><input name="autoeq-gain-from" type="number" min="-20" max="20" step="0.5" value="-20"></input></span>
                <span><input name="autoeq-gain-to" type="number" min="-20" max="20" step="0.5" value="20"></input></span>
              </div>
              <div class="settings-row" style="margin-top:0;">
                <span name="title">Q Range</span>
                <span><input name="autoeq-q-from" type="number" min="0.1" max="10" step="0.1" value="0.1"></input></span>
                <span><input name="autoeq-q-to" type="number" min="0.1" max="10" step="0.1" value="3"></input></span>
              </div>
              <div class="auto-eq-button" style="margin-bottom:6px">              
                <button class="autoeq">AutoEQ</button>
                <button class="readme">Readme</button>
              </div>
              <h4 style="margin:0">EQ Demo</h4>
              <div class="eq-demo">
                <select class="eq-track">
                    <option value="pink" selected>Pink Noise</option>
                    <option value="scarlet">Scarlet Fire</option>
                    <option value="tone">Tone Generator</option>
                    <option value="custom-eq-track">Uploaded</option>
                </select>
                <span id="songTime">00:00:00</span>
                <input name="demo-time" type="range" min="0" max="100" step="1" value="0"></input>
                <div class="volume-button">
                  <div class="volume-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 7l8-5v20l-8-5v-10zm-6 10h4v-10h-4v10zm20.264-13.264l-1.497 1.497c1.847 1.783 2.983 4.157 2.983 6.767 0 2.61-1.135 4.984-2.983 6.766l1.498 1.498c2.305-2.153 3.735-5.055 3.735-8.264s-1.43-6.11-3.736-8.264zm-.489 8.264c0-2.084-.915-3.967-2.384-5.391l-1.503 1.503c1.011 1.049 1.637 2.401 1.637 3.888 0 1.488-.623 2.841-1.634 3.891l1.503 1.503c1.468-1.424 2.381-3.309 2.381-5.394z"/></svg>
                  </div>
                  <div class="volume-slider">
                    <input type="range" min="0" max="100" step="0.5" value="12.5" id="volumeRange">
                  </div>
                </div>
                <div id="play-button" style="fill: var(--accent-color-contrast) !important;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 22v-20l18 10-18 10z"/></svg>
                </div>
              </div>
              <div class="settings-row hidden" name="tone-gen-range" style="margin-top:0;">
                <span name="title">Tone Generator Range</span>
                <span><input name="tone-generator-from" type="number" min="20" max="20000" step="1" value="20"></input></span>
                <span><input name="tone-generator-to" type="number" min="20" max="20000" step="1" value="20000"></input></span>
              </div>
              <div class="eq-demo hidden" name="tone-gen-slider" style="margin:2px 0 6px 0;">
                <span name="current-freq">Freq: <span class="freq-text">20</span> Hz</span>
                <input name="tone-generator-freq" type="range" min="0" max="1" step="0.0001" value="0" />
              </div>
              <h4 style="margin:0 0 3px 0">Miscellaneous</h4>
              <div class="settings-row" name="tone-gen-range" style="margin-top:0; text-align:center">
                <span name="balance-l">Left</span>
                <span name="balance-title" style="width:50%">Channel Balance</span>
                <span name="balance-r">Right</span>
              </div>
              <div class="settings-row" style="margin:3px 0 6px 0;">
                <span><input id="vol-left" name="vol-left" type="number" min="0" max="10" step="0.1" value="0"></input></span>
                <span name="title"></span>
                <span><input id="vol-right" name="vol-right" type="number" min="0" max="10" step="0.1" value="0"></input></span>
              </div>
              <div class="settings-row" name="tone-gen-range" style="margin:3px 0 6px 0;">
                <input name="balance-vol" type="range" min="-10" max="10" step="0.1" value="0"></input>
              </div>
              <div class="exports">
                <button class="import-filters">Import EQ</button>
                <button class="export-filters">Export Parametric EQ</button>
                <button class="export-graphic-filters">Export Graphic EQ (Wavelet)</button>
              </div>
              <a style="display: none" id="file-filters-export"></a>
              <form style="display:none"><input type="file" id="file-filters-import" accept=".txt" /></form>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div style="display: none;" class="extra-eq-overlay">AutoEQ is running, it could take 5~20 seconds or more.</div>
  </main>
`);


let pad = { l:15, r:15, t:10, b:36 };
let W0 = 800, W = W0 - pad.l - pad.r,
    H0 = 360, H = H0 - pad.t - pad.b;

let gr = doc.select("#fr-graph"),
    defs = gr.append("defs");


gr.append("rect").attrs({x:0, y:pad.t-8, width:W0, height:H0-22, rx:4,
                         "class":"graphBackground"});
watermark(gr);

// Hidden features activation by Konami code
let konami = false;
let konami_code = [38,38,40,40,37,39,37,39,66,65]; // up up down down left right left right b a
let konami_pos = 0;
doc.on("keydown", function() {
    if (konami) return;
    if (d3.event.keyCode == konami_code[konami_pos]) {
        konami_pos++;
        if (konami_pos == konami_code.length) {
            konami = true;
            console.log("Konami code activated");
        }
    } else {
        konami_pos = 0;
    }
});

// custom DF stuff
let boost = default_bass_shelf;
let tilt = default_tilt;
let ear = default_ear;
let treble = default_treble;
// `prepPrefBounds` is now declared in prefBounds.js.
var df, dfBase, updateDF;
let customTiltName = default_DF_name;

// Scales
let x = d3.scaleLog()
    .domain([20,20000])
    .range([pad.l,pad.l+W]);

let yD = [40,80], // Decibels
    yR = [pad.t+H,pad.t+10];
let y = d3.scaleLinear().domain(yD).range(yR);


// y axis
defs.append("filter").attr("id","blur").attr("filterUnits","userSpaceOnUse")
    .attrs({x:-W-4,y:-2,width:W+8,height:4})
    .append("feGaussianBlur").attr("in","SourceGraphic")
    .attr("stdDeviation", 0.8);
let yAxis = d3.axisLeft(y).tickSize(W).tickSizeOuter(0).tickPadding(1);
function fmtY(ya) {
    let d = y.domain(),
        r = d[1] - d[0],
        t = r<40 ? 1 : 5,
        y0= Math.ceil (d[0]/t),
        y1= Math.floor(d[1]/t),
        isMinor = t===5 ? (()=>false) : ((_,i)=>(y0+i)%5!==0);
    yAxis.tickValues(d3.range(y1-y0+1).map(i=>t*(y0+i)))(ya);
    ya.select(".domain").remove();
    ya.selectAll(".tick line")
      .attr("stroke-linecap", "round")
      .attrs((_,i) => {
          let m = isMinor(_,i);
          return {
              filter: m ? null : "url(#blur)",
              "stroke-width": m ? 0.2*(1-r/45) : 0.15*(1+45/r)
          };
      });
    ya.selectAll(".tick text")
      .attr("text-anchor","start")
      .attr("x",-W+3)
      .attr("dy",-2)
      .filter(isMinor).attr("display","none");
}
let yAxisObj = gr.append("g")
    .attr("transform", "translate("+(pad.l+W)+",0)")
    .call(fmtY);
yAxisObj.insert("text")
    .attr("transform","rotate(-90)")
    .attr("fill","currentColor")
    .attr("text-anchor","end")
    .attr("y",-W-2).attr("x",-pad.t)
    .text("dB");


// x axis
let xvals = [2,3,4,5,6,8,10,15];
let xAxis = d3.axisBottom(x)
    .tickSize(H+3).tickSizeOuter(0)
    .tickValues(d3.merge([1,2,3].map(e=>xvals.map(m=>m*Math.pow(10,e)))).concat([250,20000]))
    .tickFormat(f => f>=1000 ? (f/1000)+"k" : f);

let tickPattern = [3,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,3,0,3,0,3,0,0,0,3],
    getTickType = i => i =  tickPattern[i],
    tickThickness = [2,4,4,9,15].map(t=>t/10);

function fmtX(xa) {
    xAxis(xa);
    (xa.selection ? xa.selection() : xa).select(".domain").remove();
    xa.selectAll(".tick line")
      .attr("y1", 10)
      .attr("y2", 312)
      .attr("stroke", "#333")
      .attr("stroke-width", (_,i) => tickThickness[getTickType(i)])
      .attr("opacity", "0.6");
    xa.selectAll(".tick text").filter((_,i) => tickPattern[i] === 0)
      .attr("font-size","92%")
      .attr("font-weight","lighter")
      .attr("opacity", "0.5");
    xa.selectAll(".tick text").filter((_,i) => tickPattern[i] != 0)
      //.attr("font-size","92%")
      .attr("font-weight","lighter")
      //.attr("opacity", "0.9");
    xa.select(".tick:last-of-type text")
      .attr("dx",-5)
      .text("20kHz");
    xa.select(".tick:first-of-type text")
      .attr("dx",4)
      .text("20Hz");
}
defs.append("clipPath").attr("id","x-clip")
    .append("rect").attrs({x:0, y:0, width:W0, height:H0});
let xAxisObj = gr.append("g")
    .attr("clip-path", "url(#x-clip)")
    .attr("transform", "translate(0,"+pad.t+")")
    .call(fmtX);


// Plot line
defs.selectAll().data([0,1]).join("linearGradient")
    .attrs({x1:0,y1:0, x2:1,y2:0})
    .attr("id", i=>"grad"+i)
    .selectAll().data(i=>[i,1-i]).join("stop")
    .attr("offset",(_,i)=>i)
    .attr("stop-color",j=>["black","white"][j]);
let fW = 7,  // Fade width
    fWm= 30; // Width at an interior edge
let fade = defs.append("mask")
    .attr("id", "graphFade")
    .attr("maskUnits", "userSpaceOnUse")
    .append("g").attr("transform", "translate("+pad.l+","+pad.t+")");
fade.append("rect").attrs({ x:0, y:0, width:W, height:H, fill:"white" });
let fadeEdge = fade.selectAll().data([0,1]).join("rect")
    .attrs(i=>({ x:i?W-fW:0, width:fW, y:0,height:H, fill:"url(#grad"+i+")" }));
let line = d3.line()
    .x(d=>x(d[0]))
    .y(d=>y(d[1]))
    .curve(d3.curveNatural);


// Range buttons
let selectedRange = 3; // Full range
let ranges = [[20,400],[100,4000],[1000,20000], [20,20000]],
    edgeWs = [[fW,fWm],[fWm,fWm],[fWm,fW],[fW,fW]];
let rangeSel = doc.select(".zoom").selectAll("button");
rangeSel.on("click", function (_,i) {
    let r = selectedRange,
        s = selectedRange = r===i ? 3 : i;
    rangeSel.classed("selected", (_,j)=>j===s);
    x.domain(ranges[s]);
    // More time to go between bass and treble
    let dur = Math.min(r,s)===0 && Math.max(r,s)===2 ? 1100 : 700;
    clearLabels();
    gpath.selectAll("path").transition().duration(dur).attr("d", drawLine);
    let e = edgeWs[s];
    fadeEdge.transition().duration(dur).attrs(i=>({x:i?W-e[i]:0, width:e[i]}));
    xAxisObj.transition().duration(dur).call(fmtX);
});


// y-axis scaler
let dB = {
    y: y(60),
    h: 15,
    H: y(60)-y(70),
    min: pad.t,
    max: pad.t+H,
    tr: _ => "translate("+(pad.l-9)+","+dB.y+")"
};
dB.all   = gr.append("g").attr("class","dBScaler").attr("opacity", "0.5");
dB.trans = dB.all.append("g").attr("transform", dB.tr());
dB.scale = dB.trans.append("g").attr("transform", "scale(1,1)");
dB.scale.selectAll().data([-1,1])
    .join("path").attr("stroke","none")
    .attr("d", function (s) {
        function getPathPart(l) {
            let v=l[0].toLowerCase()==="v";
            for (let i=2-v; i<l.length; i+=2)
                l[i] *= s;
            return l[0]+l.slice(1).join(" ");
        }
        return [ ["M", 9.9,-1   ],
                 ["V",      dB.H],
                 ["h",-1        ],
                 ["l",-1  ,-1.5 ],
                 ["l",-2.1, 2   ],
                 ["h",-5.6      ],
                 ["v",     -1.5 ],
                 ["q",7,2,8,-7  ],
                 ["V",     29   ],
                 ["c",1,-16,-10,-15,-10,-14],
                 ["V",     -1   ] ].map(getPathPart).join("");
    });
dB.scale.selectAll().data([10,7,13])
    .join("rect").attrs((d,i)=>({x:i*2.8,y:-d,width:0.8,height:2*d,fill:"#bbb"}));
function getDrag(fn) {
    return d3.drag()
        .on("drag",fn)
        .on("start",function(){dB.all.classed("active",true );})
        .on("end"  ,function(){dB.all.classed("active",false);});
}
dB.mid = dB.all.append("rect")
    .attrs({x:(pad.l-11),y:dB.y-dB.h,width:12,height:2*dB.h,opacity:0})
    .call(getDrag(function () {
        dB.y = d3.event.y;
        dB.y = Math.min(dB.y, dB.max-dB.h*(dB.H/15));
        dB.y = Math.max(dB.y, dB.min+dB.h*(dB.H/15));
        d3.select(this).attr("y",dB.y-dB.h);
        dB.trans.attr("transform", dB.tr());
        dB.updatey();
    }));
dB.circ = dB.trans.selectAll().data([-1,1]).join("circle")
    .attrs({cx:5,cy:s=>dB.H*s,r:7,opacity:0})
    .call(getDrag(function () {
        let h  = Math.max(30, Math.abs(d3.event.y));
        h = Math.min(h, Math.min(dB.max-dB.y, dB.y-dB.min));
        let sc = h/dB.H;
        dB.circ.attr("cy",s=>h*s);
        dB.scale.attr("transform", "scale(1,"+sc+")");
        dB.h = 15*sc;
        dB.mid.attrs({y:dB.y-dB.h,height:2*dB.h});
        updateBoundsScaling(h);
        dB.updatey();
    }));
let yCenter = 60;
dB.updatey = function (dom) {
    let d = l => l[1]-l[0];
    y.domain(yR.map(y=>yCenter+(y-dB.y)*(15/dB.h)*d(yD)/d(yR)));
    yAxisObj.call(fmtY);
    let getTr = o => o ? "translate(0,"+(y(o)-y(0))+")" : null;
    //clearLabels();
    gpath.selectAll("path").call(redrawLine);
}

// y-axis scaler button
const defY = dB.y;
const scales = {
  "20db": {name:"20dB", h:152, y:172},
  "30db": {name:"30dB", h:101.33, y:172},
  "40db": {name:"40dB", h: dB.H, y:defY},
  "50db": {name:"50dB", h:60.79, y:172},
  "crin": {name:"Crin", h:54.77, y:156.94},
}

function updateBoundsScaling(h) {
    let scale = h/76;
    gr.select("[id=bounds]").attr("transform", "scale(1,"+scale+")");
    gr.select("[id=bounds]").attr("transform-origin", "0 25");
}
updateBoundsScaling(dB.H);

function changeScaling(to) {
    let btn = document.querySelector("#yscalebtn")
    let s = scales[to.toLowerCase()];
    if (!s) return;
    let sc = s.h/dB.H;
    dB.h = 15*sc;
    dB.y = s.y;
    dB.circ.attr("cy",sm=>s.h*sm);
    dB.scale.attr("transform", "scale(1,"+sc+")");
    dB.mid.attrs({y:dB.y-dB.h,height:2*dB.h});
    dB.trans.attr("transform", dB.tr());
    btn.className = s.name.toLowerCase();
    btn.innerHTML = s.name;
    dB.updatey();
    updateBoundsScaling(s.h);
}

doc.select("#yscalebtn").on("click", function() {
    let keys = Object.keys(scales);
    let i = keys.indexOf(this.className);
    changeScaling(keys[(i+1)%keys.length]);
    console.log(scales[keys[(i+1)%keys.length]]);
});

// Label drawing and screenshot
let getFullName = p => p.dispBrand+" "+p.dispName,
    getChannelName = p => n => getFullName(p) + " ("+n+")";

let labelButton = doc.select("#label"),
    labelsShown = false;
function setLabelButton(l) {
    labelButton.classed("selected", labelsShown = l);
}
function clearLabels() {
    gr.selectAll(".lineLabel").remove();
    setLabelButton(false);
}

function drawLabels() {
    let curves = d3.merge(
        activePhones.filter(p=>!p.hide && !p.isPrefBounds).map(p =>
            p.is90Bounds ? [{p:p, o:-1, id:p.fullName, l: p.activeCurves[0].l}]
            : p.isTarget||!p.samp||p.avg ? p.activeCurves
            : LR.map((l,i) => ({
                p:p, o:getO(i), id:getChannelName(p)(l), multi:true,
                l:(n=>p.channels.slice(i*n,(i+1)*n))(sampnums.length)
                    .filter(c=>c!==null)
              }))
        )
    );
    if (!curves.length) return;

    let bcurves = curves.slice(),
        bp = baseline.p;
    if (bp && bp.hide) {
        bcurves.push({
            p:bp, o:0,
            id:"Baseline: "+(bp.isTarget?bp.fullName:getFullName(bp))
        });
    }

    gr.selectAll(".lineLabel").remove();
    let g = gr.selectAll(".lineLabel").data(bcurves)
        .join("g").attr("class","lineLabel").attr("opacity", 0);
    let t = g.append("text")
        .attrs({x:0, y:0, fill:c=>getTooltipColor(c)})
        .text(c=>c.id);
    g.datum(function(){return this.getBBox();});
    g.select("text").attrs(b=>({x:3-b.x, y:3-b.y}));
    g.insert("rect", "text")
        .attrs(b=>({x:2, y:2, width:b.width+2, height:b.height+2}));
    let boxes = g.data(),
        w = boxes.map(b=>b.width +6),
        h = boxes.map(b=>b.height+6);

    // Slice to fit in range
    let r = x.domain().map(v => d3.bisectLeft(f_values, v));
    rsl = a => a.slice(Math.max(r[0],0), r[1]+1);
    let rf_values = rsl(f_values);
    let v = curves.map(c => {
        let o = getOffset(c.p);
        return (c.multi?c.l:[c.l])
            .map(l => rsl(baseline.fn(l).map(d=>d[1]+o)));
    });
    let tr;

    if (curves.length === 1) {
        let x0 = 50, y0 = 10,
            sl = range_to_slice([0,w[0]], o=>x0+o),
            e = d3.extent(d3.merge(v[0].map(sl)).map(y));
        if (y0+h[0] >= e[0]) { y0 = Math.max(y0, e[1]); }
        tr = [[x0,y0]];
    } else {
        let n = v.length;
        let invd = (sc,d) => sc.invert(d)-sc.invert(0),
            xr = x.range(),
            yd = y.domain(),
            wind = w => Math.ceil((w/(xr[1]-xr[0]))*rf_values.length),
            mw = wind(d3.min(w));
        let winReduce = (l,w,d0,fn) => {
            l = l.slice();
            for (let d=d0; d<w; ) {
                let diff = Math.min(2*d,w) - d;
                for (let i=0; i<l.length-diff; i++) {
                    l[i] = fn(l[i], l[i+diff]);
                }
                d += diff;
            }
            l.length -= w-d0;
            return l;
        }
        let rangeGetters = [Math.min, Math.max].map(f => {
            let r = c => c.reduce((a,b)=>a.map((ai,i)=>f(ai,b[i])));
            let t = v.map(c => winReduce(r(c), mw, 1, f));
            return w => t.map(c => winReduce(c, w, mw, f));
        });
        let top = 0; // Use top left if we can't find a spot
        tr = v.map((_,j) => {
            let we = wind(w[j]),
                he = -invd(y,h[j]),
                range = d3.transpose(rangeGetters.map(r => r(we))),
                ds;
            ds = range[j].map(function (r,ri) {
                let le = r.length,
                    s = [[-he,0],[0,he]][ri].map(o=>r.map(d=>d+o)),
                    d = r.map(_=>1e10);
                for (let k=0; k<n; k++) if (k!==j) {
                    let t = range[k];
                    for (let i=0; i<le; i++) {
                        d[i] = Math.min(d[i], Math.max(s[0][i]-t[1][i],
                                                       t[0][i]-s[1][i]));
                    }
                }
                return d;
            });
            let sep = 0, pos = null;
            ds.forEach(function (drow,k) {
                for (let ii=0; ii<drow.length; ) {
                    let i=ii, d=drow[i],
                        rjk=range[j][k], m=rjk[i];
                    while (ii++, ii<drow.length && rjk[ii]===m) {
                        let di = drow[ii];
                        if (di<d && di<1) break;
                        d = Math.max(d,drow[ii]);
                    }
                    let clip = x => x/Math.sqrt(1+x*x);
                    d = 4*clip(d/4) + clip((ii-i)/3);
                    i = Math.floor((i+ii)/2);
                    let dl = drow.length,
                        r = i/dl;
                    d *= Math.sqrt((0.8+r)*Math.sqrt(1-r));
                    d *= clip(0.2+Math.max(0,(i>=15?drow[i-15]:0)+(i<dl-15?drow[i+15]:0)));
                    if (d>sep) {
                        let dy = range[j][k][i]+(k?he:0),
                            yd = y.domain();
                        if (yd[0]+he<=dy && dy<=yd[1]) { sep=d; pos=[i,dy]; }
                    }
                }
            });
            return pos ? [x(rf_values[pos[0]]), y(pos[1])]
                       : [60, 20+30*top++];
        });
    }
    for (let j=curves.length; j<bcurves.length; j++) {
        tr.push([pad.l+(W-w[j])/2, pad.t+H-h[j]+2]);
    }
    g.attr("transform",(_,i)=>"translate("+tr[i].join(",")+")");
    g.attr("opacity",null);
    setLabelButton(true);
}

labelButton.on("click", () => (labelsShown?clearLabels:drawLabels)());

function saveGraph(ext) {
    let fn = {png:saveSvgAsPng, svg:saveSvg}[ext];
    let showControls = s => dB.all.attr("visibility",s?null:"hidden");
    gpath.selectAll("path").classed("highlight",false);
    drawLabels();
    showControls(false);
    fn(gr.node(), "graph."+ext, {scale:3})
        .then(()=>showControls(true));
    
    // Analytics event
    if (analyticsEnabled) { pushEventTag("clicked_download", targetWindow); }
}
doc.select("#download")
    .on("click", () => saveGraph("png"))
    .on("contextmenu", function () {
        d3.event.returnValue=false;
        let b = d3.select(this);
        let choice = b.selectAll("div")
            .data(["png","svg"]).join("div")
            .styles({position:"absolute", left:0, top:(_,i)=>i*1.3+"em",
                     background:"inherit", padding:"0.1em 1em"})
            .text(d => "As ."+d)
            .on("click", function (d) {
                saveGraph(d);
                choice.remove();
                d3.event.stopPropagation();
            });
        b.on("blur", ()=>choice.remove());
    });

// Smoothing math lives in assets/js/smoothing.js.

doc.select("#smooth-level").on("change input", function () {
    if (!this.checkValidity()) return;
    smooth_level = +this.value;
    smooth_param = undefined;
    line.curve(smooth_level ? d3.curveNatural : d3.curveCardinal.tension(0.5));
    activePhones.forEach(smoothPhone);
    updatePaths();
});


// ISO 226 loudness normalization math lives in assets/js/normalization.js.

// File loading and channel management
var LR = typeof default_channels !== "undefined" ? default_channels
                                                 : ["L","R"];
let getO = i => LR.length>1 ? -1+i*2/(LR.length-1) : 0;
const sampnums = typeof num_samples !== "undefined" ? d3.range(1,num_samples+1)
                                                    : [""];
function loadFiles(p, callback) {
    let l = f => d3.text(DIR+f+".txt").catch(()=>null);
    let lt = f => d3.text(DIR+"targets/"+f+".txt").catch(()=> l(f));
    let f = p.isTarget ? [lt(p.fileName)]
          : d3.merge(LR.map(s =>
                sampnums.map(n => l(p.fileName+" "+s+n))));
    Promise.all(f).then(function (frs) {
        if (!frs.some(f=>f!==null)) {
            alert("Headphone not found!");
        } else {
            let ch = frs.map(f => f && Equalizer.interp(f_values, tsvParse(f)));
            ch = ch.filter(c => c !== null); // Remove null elements
            callback(ch);
        }
    });
}
let validChannels = p => p.channels.filter(c=>c!==null);
let numChannels = p => d3.sum(p.channels, c=>c!==null);
let notMultichannel = LR.length===1 ? p=>true : p=>p.isTarget;
let hasChannelSel = p => !notMultichannel(p) && numChannels(p)>1;
let keyExt = LR.length===1 ? 16 : 0;
let keyLeft= keyExt ? 0 : sampnums.length>1 ? 11 : 0;
if (keyLeft) d3.select(".key").style("width","17%")

function avgCurves(curves) {
    return curves
        .map(c=>c.map(d=>Math.pow(10,d[1]/20)))
        .reduce((as,bs) => as.map((a,i) => a+bs[i]))
        .map((x,i) => [curves[0][i][0], 20*Math.log10(x/curves.length)]);
}
function avgCurvesArithmetic(curves) {
    return curves[0].map((_, i) => {
        const sum = curves.reduce((acc, curve) => acc + curve[i][1], 0);
        return [curves[0][i][0], sum / curves.length];
    });
}
function getAvg(p) {
    if (p.avg) return p.activeCurves[0].l;
    let v = validChannels(p);
    return v.length===1 ? v[0] : avgCurves(v);
}
function getAvgArithmetic(p) {
    if (p.avg) return p.activeCurves[0].l;
    let v = validChannels(p);
    return v.length===1 ? v[0] : avgCurvesArithmetic(v);
}
function hasImbalance(p) {
    if (!hasChannelSel(p)) return false;
    let as = p.channels[0], bs = p.channels[1];
    let s0=0, s1=0;
    return as.some((a,i) => {
        let d = a[1]-bs[i][1];
        d *= 1/(50 * Math.sqrt(1+Math.pow(a[0]/1e4,6)));
        s0 = Math.max(s0+d,0);
        s1 = Math.max(s1-d,0);
        return Math.max(s0,s1) > max_channel_imbalance;
    });
}

var activePhones = [];
let baseline0 = { p:null, l:null, fn:l=>l },
    baseline = baseline0;

let gpath = gr.insert("g",".dBScaler")
    .attr("fill","none")
    .attr("stroke-width",2.1)
    .attr("class", "curves-g")
    .attr("mask","url(#graphFade)");
function hl(p, h) {
    gpath.selectAll("path").filter(c=>c.p===p).classed("highlight",h);
}
let table = doc.select(".curves");

// Color helpers live in assets/js/color.js (getCurveColor, getDivColor,
// getTooltipColor, phoneNumber/nextPN counters, etc.).
// Phone-table UI (setPhoneTr, channelbox_x/_tr, toggleHide, colorBar,
// updatePhoneTable, updateChannels, handleComp, addKey, updateKey, addModel,
// updateVariant, changeVariant, showVariant, addColorPicker, makeColorPicker,
// hclToHex, createPopupMenu, cpCircles, colorPhones) lives in
// assets/js/phoneTable.js.

function setCurves(p, avg, lr, samp) {
    if (avg ===undefined) avg = p.avg;
    if (p.is90Bounds) avg = false;
    if (samp===undefined) samp = avg ? false : LR.length===1||p.ssamp||false;
    else { p.ssamp = samp; if (samp) avg = false; }
    let dx = +avg - +p.avg,
        n  = p.channels.length/2,
        selCh = (l,i) => l.slice(i*n,(i+1)*n);
    p.avg = avg;
    p.samp = samp = n>1 && samp;
    if (!p.isTarget) {
        let id = getChannelName(p),
            v  = cs => cs.filter(c=>c!==null),
            cs = p.channels,
            cv = v(cs),
            mc = cv.length>1,
            pc = (idstr, l, oi) => ({id:id(idstr), l:l, p:p,
                                     o:oi===undefined?0:getO(oi)});
        p.activeCurves
            = avg && mc ? [pc("AVG", avgCurves(cv))]
            : !samp && mc ? LR.map((l,i) => pc(l, avgCurves(v(selCh(cs,i))), i))
            : cs.map((l,i) => {
                let j = Math.floor(i/n);
                return pc(LR[j]+sampnums[i%n], l, j);
            }).filter(c => c.l);
    } else {
        p.activeCurves = [{id:p.fullName, l:p.channels[0], p:p, o:0}];
    }
    let y = 0;
    let k = d3.selectAll(".keyLine").filter(q=>q===p);
    let ksb = k.select(".keySelBoth").attr("display","none");
    p.lr = lr;
    if (lr!==undefined) {
        p.activeCurves = p.samp ? selCh(p.activeCurves, lr) : [p.activeCurves[lr]];
        y = [-1,1][lr];
        ksb.attr("display",null).attr("y", [0,-12][lr]);
    }
    k.select(".keyMask")
        .transition().duration(400)
        .attr("x", channelbox_x(avg))
        .attrTween("y", function () {
            let y0 = +this.getAttribute("y"),
                y1 = 12*(-1+y);
            if (!dx) { return d3.interpolateNumber(y0,y1); }
            let ym = y0 + (y1-y0)*(3-2*dx)/6;
            y0-=ym; y1-=ym;
            return t => { t-=1/2; return ym+(t<0?y0:y1)*Math.pow(2,20*(Math.abs(t)-1/2)); };
        });
    k.select(".keySel").attr("transform", channelbox_tr(avg));
    k.selectAll(".keySamp").attr("opacity",(_,i)=>i===+samp?1:0.6);
}
function updateCurves() {
    setCurves.apply(null, arguments);
    updatePaths();
}

let drawLine = d => line(baseline.fn(d.l));
function redrawLine(p) {
    let getTr = o => o ? "translate(0,"+(y(o)-y(0))+")" : null;
    p.attr("transform", c => getTr(getOffset(c.p))).attr("d", drawLine);
}
function updateYCenter() {
    let c = yCenter;
    yCenter = baseline.p ? 0 : norm_sel ? 60 : norm_phon;
    y.domain(y.domain().map(d=>d+(yCenter-c)));
    yAxisObj.call(fmtY);
}
function setBaseline(b, no_transition) {
    baseline = b;
    updateYCenter();
    if (no_transition) return;
    gpath.selectAll("path")
        .transition().duration(500).ease(d3.easeQuad)
        .attr("d", drawLine);
    table.selectAll("tr").select(".button")
        .classed("selected", p => p===baseline.p || (p.basedOn && p.basedOn===baseline.p));
    
    // Analytics event
    if (analyticsEnabled && b.p) { pushPhoneTag("baseline_set", b.p); }
}
function getBaseline(p) {
    let b = getAvg(p).map(d => d[1]+getOffset(p));
    return { p:p, fn:l=>l.map((e,i)=>[e[0],e[1]-b[Math.min(i,b.length-1)]]) };
}

function setOffset(p, o) {
    p.offset = +o;
    if (baseline.p === p) { baseline = getBaseline(p); }
    updatePaths();
}
let getOffset = p => p.offset + p.norm;

function setHover(elt, h) {
    elt.on("mouseover", h(true)).on("mouseout", h(false));
}

// See if iframe gets CORS errors when interacting with window.top / window.top.document
let accessWindowTop, accessDocumentTop, targetWindow;
try {
    let emb = window.location.href.includes('embed');
    accessWindowTop = Boolean(window.top.location.href);
    targetWindow = emb ? window : window.top;
} catch {
    accessWindowTop = false;
    targetWindow = window;
}
try {
    accessDocumentTop = Boolean(window.top.document);
} catch {
    accessDocumentTop = false;
}

let ifURL = typeof share_url !== "undefined" && share_url;
let baseTitle = typeof page_title !== "undefined" ? page_title : "Haruto's Graph Tool (CrinGraph)";
let baseDescription = typeof page_description !== "undefined" ? page_description : "View and compare frequency response graphs";
let baseURL;  // Set by setInitPhones
function addPhonesToUrl() {
    let title = baseTitle,
        url = baseURL,
        names = activePhones.filter(p => !p.isDynamic && !p.isPrefBounds).map(p => p.fileName),
        namesCombined = names.join(", ");
    
    if (names.length) {
        url += "?share=" + encodeURI(names.join().replace(/ /g,"_"));
        title = namesCombined + " - " + title;
    }
    if (tiltableTargets.some(target => names.includes(target + " Target"))) {
        url += "&bass="+boost+"&tilt="+tilt+"&treble="+treble+"&ear="+ear;
    }
    if (names.length === 1) {
        targetWindow.document.querySelector("link[rel='canonical']").setAttribute("href",url)
    } else {
        targetWindow.document.querySelector("link[rel='canonical']").setAttribute("href",baseURL)
    }
    targetWindow.history.replaceState("", title, url);
    targetWindow.document.title = title;
    targetWindow.document.querySelector("meta[name='description']").setAttribute("content",baseDescription + ", including " + namesCombined +".");
}

function setModeEmbed() {
    document.querySelector("body").setAttribute("embed-mode", "true");
}

function updatePaths(trigger) {
    clearLabels();
    let c = d3.merge(activePhones.map(p => p.activeCurves)),
        p = gpath.selectAll("path").data(c, d=>d.id);
    let graphLines = p.join("path").attr("opacity", c=>c.p.hide?0:null)
        .classed("sample", c=>c.p.samp);
    graphLines.attr("stroke", getColor_AC).call(redrawLine);
    let t = graphLines.filter(c=>c.p.isTarget)
        .attr("class", "target")
        .style("stroke-dasharray", "6, 3");
    let pfb = graphLines.filter(c=>c.p.isPrefBounds)
        .style("stroke-dasharray", "6, 3");

    if (targetColorCustom) t.attr("stroke", targetColorCustom);
    let nodes = graphLines.nodes();
    for (let i = 0; i < nodes.length; i++) {
        let g = nodes[i].__data__;
        if (g.p.lineWeight) {
            d3.select(nodes[i]).style("stroke-width", g.p.lineWeight);
        }
        if (g.p.dashStyle) {
            d3.select(nodes[i]).style("stroke-dasharray", g.p.dashStyle);
        }
    }
    if (ifURL && !trigger) addPhonesToUrl();
    if (stickyLabels) drawLabels();
}

// Preference bounds (loadPrefBounds, setPrefBounds, prepPrefBounds, prefBoundsObj)
// live in assets/js/prefBounds.js.

var f_values = (function() {
    // Standard frequencies, all phone need to interpolate to this.
    let f = [20];
    let step = Math.pow(2, 1/48); // 1/48 octave
    while (f[f.length-1] < 20000) { f.push(f[f.length-1] * step) }
    return f;
})();
let fr_to_ind = fr => d3.bisect(f_values, fr, 0, f_values.length-1);
function range_to_slice(xs, fn) {
    let r = xs.map(v => d3.bisectLeft(f_values, x.invert(fn(v))));
    return a => a.slice(Math.max(r[0],0), r[1]+1);
}

let norm_sel = ( default_normalization.toLowerCase() === "db" ) ? 0:1,
    norm_fr = default_norm_hz,
    norm_phon = default_norm_db;

function normalizePhone(p) {
    if (norm_sel) { // fr
        let i = fr_to_ind(norm_fr);
        let avg = l => 20*Math.log10(d3.mean(l, d=>Math.pow(10,d/20)));
        p.norm = 60 - avg(validChannels(p).map(l=>l[i][1]));
    } else { // phon
        p.norm = find_offset(getAvg(p), norm_phon);
    }
    if (p.eq) {
        p.eq.norm = p.norm; // copy parent's norm to child
    } else if (p.eqParent) {
        p.norm = p.eqParent.norm; // set child's norm from parent
    }
}

let norms = doc.select(".normalize").selectAll("div");
norms.classed("selected",(_,i)=>i===norm_sel);
function setNorm(_, i, change) {
    if (change !== false) {
        if (!this.checkValidity()) return;
        let v = +this.value;
        if (i) { norm_fr=v; } else { norm_phon=v; }
    }
    norm_sel = i;
    norms.classed("selected",(_,i)=>i===norm_sel);
    activePhones.forEach(normalizePhone);
    if (baseline.p) { baseline = getBaseline(baseline.p); }
    updateYCenter();
    
    if (!userConfigApplicationActive) {
        setUserConfig();
        updatePaths();
    } else {
        updatePaths("config");
    }
}
norms.select("input")
    .on("change input",setNorm)
    .on("keypress", function(_, i) {
        if (d3.event.key==="Enter") { setNorm.bind(this)(_,i); }
    });
norms.select("span").on("click", (_,i)=>setNorm(_,i,false));

let addPhoneSet = false, // Whether add phone button was clicked
    addPhoneLock= false;
function setAddButton(a) {
    if (addPhoneSet !== a) {
        addPhoneSet = a;
        doc.select(".addPhone").classed("selected", a)
            .classed("locked", addPhoneLock &= a);
    }
    return true;
}
doc.select(".addPhone").selectAll("td")
    .on("click", ()=>setAddButton(!addPhoneSet));
doc.select(".addLock").on("click", function () {
    d3.event.preventDefault();
    let on = !addPhoneLock;
    if (!setAddButton(on)) return;
    if (on) {
        doc.select(".addPhone").classed("locked", addPhoneLock=true);
    }
});

function showPhone(p, exclusive, suppressVariant, trigger) {
    if (p.isTarget && activePhones.indexOf(p)!==-1) {
        removePhone(p);
        return;
    }
    if (p.isTarget && p.phone !== "Custom Tilt") {
        // Remove the same target with the custom tilt
        if (activePhones.filter(e => e.fileName === p.fileName && e.phone === "Custom Tilt").length > 0) {
            activePhones = activePhones.filter(e => e.fileName !== p.fileName || e.phone !== "Custom Tilt");
            removePhone(p);
            return;
        }
    }
    if (p.isTarget && p.phone === "Custom Tilt") {
        // Replace the same target with the custom tilt
        if (activePhones.filter(e => e.fileName === p.fileName).length > 0) {
            activePhones = activePhones.filter(e => e.fileName !== p.fileName && e.phone !== "Custom Tilt");
            updatePhoneTable();
        }
    }
    if (addPhoneSet) {
        exclusive = false;
        if (!addPhoneLock) {
            setAddButton(false);
        }
    }
    let keep = !exclusive ? (q=>true)
             : (q => q.copyOf===p || q.pin || q.isTarget!==p.isTarget || q.isPrefBounds);
    if (!p.rawChannels) {
        loadFiles(p, function (ch) {
            if (p.rawChannels) return;
            p.rawChannels = ch;
            showPhone(p, exclusive, suppressVariant, trigger);

            // Scroll to selected
            if (trigger) { scrollToActive(); }
            
            // Analytics event
            if (analyticsEnabled) { pushPhoneTag("phone_displayed", p, trigger); }
        });
        return;
    }
    smoothPhone(p);
    if (p.id === undefined) { p.id = getPhoneNumber(); }
    normalizePhone(p); p.offset=p.offset||0;
    if (exclusive) {
        activePhones = activePhones.filter(q => q.active = keep(q));
        if (baseline.p && !baseline.p.active) {
            if (baseline.p.phone != customTiltName && !dfBaseline) setBaseline(baseline0,1);
        }
    }
    if (activePhones.indexOf(p)===-1 && (suppressVariant || !p.objs)) {
        let avg = false;
        if (!p.isTarget) {
            let ap = activePhones.filter(p => !p.isTarget && !p.isPrefBounds);
            avg = ap.length >= 1;
            if (ap.length===1 && ap[0].activeCurves.length!==1) {
                setCurves(ap[0], true);
            }
            activePhones.push(p);
        } else {
            activePhones.unshift(p);
        }
        p.active = true;
        setCurves(p, avg);
    }
    if (p.isTarget && tiltableTargets.includes(p.dispName)) { // Tilt the target
        customTiltName = p.dispName;
        if (df !== p) {
            removePhone(df);
            df = p;
        }
        dfBase = getBaseline(df);
        prepPrefBounds();
        updateDF(boost, tilt, ear, treble);
    } else if (p.isTarget && !tiltableTargets.includes(p.dispName) && p.phone != "Custom Tilt") {
        removePhone(df);
        customTiltName = p.dispName;
        setBaseline(baseline0,1);
    }
    updatePaths(trigger);
    updatePhoneTable();
    d3.selectAll("#phones .phone-item,.target")
        .filter(p=>p.id!==undefined)
        .call(setPhoneTr);
    //Displays variant pop-up when phone displayed
    if (!suppressVariant && p.fileNames && !p.copyOf && window.innerWidth > 1000) {
        table.selectAll("tr").filter(q=>q===p).select(".variants").node().focus();
    } else {
        document.activeElement.blur();
    }
    if (extraEnabled && extraEQEnabled) {
        updateEQPhoneSelect();
    }
    if (!p.isTarget && alt_augment ) { augmentList(p); }
    
    // Apply user config view settings
    if (typeof trigger !== "undefined") {
        userConfigApplyViewSettings(p.fileName);
    }
}

function removeCopies(p) {
    if (p.objs) {
        p.objs.forEach(q=>q.active=false);
        delete p.objs;
    }
    removePhone(p);
}

function removePhone(p) {
    p.active = p.pin = false; nextPN = null;
    activePhones = activePhones.filter(q => q.active);
    if (!p.isTarget) {
        let ap = activePhones.filter(p => !p.isTarget);
        if (ap.length === 1) {
            setCurves(ap[0], false);
        }
    }
    updatePaths();
    if (baseline.p && !baseline.p.active && baseline.p != df) { setBaseline(baseline0); }
    updatePhoneTable();
    d3.selectAll("#phones div,.target")
        .filter(q=>q===(p.copyOf||p))
        .call(setPhoneTr);
    if (extraEnabled && extraEQEnabled) {
        updateEQPhoneSelect();
    }
}

function asPhoneObj(b, p, isInit, inits) {
    if (!isInit) {
        isInit = _ => false;
    }
    let r = { brand:b, dispBrand:b.name };
    if (typeof p === "string") {
        r.phone = r.fileName = p;
        if (isInit(p)) inits.push(r);
    } else {
        r.phone = p.name;
        if (p.collab) {
            r.dispBrand += " x "+p.collab;
            r.collab = brandMap[p.collab];
        }
        let f = p.file || p.name;
        if (typeof f === "string") {
            r.fileName = f;
            if (isInit(f)) inits.push(r);
        } else {
            r.fileNames = f;
            r.vars = {};
            let dns = f;
            if (p.suffix) {
                dns = p.suffix.map(
                    s => p.name + (s ? " "+s : "")
                );
            } else if (p.prefix) {
                let reg = new RegExp("^"+p.prefix+"\s*", "i");
                dns = f.map(n => {
                    n = n.replace(reg, "");
                    return p.name + (n.length ? " "+n : n);
                });
            }
            r.dispNames = dns;
            r.fileName = f[0];
            r.dispName = dns[0];
            let c = r;
            f.map((fn,i) => {
                if (!isInit(fn)) return;
                c.fileName=fn; c.dispName=dns[i];
                inits.push(c);
                c = {copyOf:r};
            });
        }
    }
    r.dispName = r.dispName || r.phone;
    r.fullName = r.dispBrand + " " + r.phone;
    if (alt_augment) {
        r.reviewScore = p.reviewScore;
        r.reviewLink = p.reviewLink;
        r.shopLink = p.shopLink;
        r.price = p.price;
    }
    return r;
}

d3.json(typeof PHONE_BOOK !== "undefined" ? PHONE_BOOK
            : DIR+"phone_book.json?"+ new Date().getTime()).then(function (brands) {
    let brandMap = window.brandMap = {},
        inits = [],
        initReq = typeof init_phones !== "undefined" ? [init_phones].flat() : false;
    loadFromShare = 0;
    
    if (ifURL) {
        let url = targetWindow.location.href,
            par = "share=",
            emb = "embed",
            cDFb = "bass=",
            cDFt = "tilt=",
            cDFtr = "treble=",
            cDFe = "ear=";
        baseURL = url.split("?").shift();
        let match = decodeURIComponent(url.replace(/_/g," ")).match(/share=([^&]+)/);
        let str = match && match[1] ? match[1].replace("share=", "") : null;
        let cTiltParams = decodeURIComponent(url.replace(/_/g," ")).match(/bass=([^&]+)&tilt=([^&]+)&treble=([^&]+)&ear=([^&]+)/);
        if (url.includes(par) && url.includes(emb)) {
            initReq = str.split(",");
            loadFromShare = 2;
            
            setModeEmbed();
        } else if (url.includes(par)) {
            initReq = str.split(",");
            loadFromShare = 1;
        } else if (url.includes(emb)) {
            setModeEmbed();
        }

        if (url.includes(cDFb)) {
            boost = parseFloat(cTiltParams[1]);
        }

        if (url.includes(cDFt)) {
            tilt = parseFloat(cTiltParams[2]);
        }

        if (url.includes(cDFtr)) {
            treble = parseFloat(cTiltParams[3]);
        }

        if (url.includes(cDFe)) {
            ear = parseFloat(cTiltParams[4]);
        }
    }
    
    // Apply user config to inits
    userConfigAppendInits(initReq);
    
    let isInit = initReq ? f => initReq.indexOf(f) !== -1
                         : _ => false;
    
    if (loadFromShare === 1) {
        initMode = "share";
    } else if (loadFromShare === 2) {
        initMode = "embed";
    } else {
        initMode = "config";
    }

    brands.push({ name: "Uploaded", phones: [] });
    brands.forEach(b => brandMap[b.name] = b);
    brands.forEach(function (b) {
        b.active = false;
        b.phoneObjs = b.phones.map(function (p) {
            return asPhoneObj(b, p, isInit, inits);
        });
    });

    let allPhones = window.allPhones = d3.merge(brands.map(b=>b.phoneObjs)),
        currentBrands = [];
    if (!initReq) inits.push(allPhones[0]);

    function setClicks(fn) { return function (elt) {
        elt .on("mousedown", () => d3.event.preventDefault())
            .on("click", p => fn(p,!d3.event.ctrlKey))
            .on("auxclick", p => d3.event.button===1 ? fn(p,0) : 0);
    }; }

    let brandSel = doc.select("#brands").selectAll()
        .data(brands).join("div")
        .text(b => b.name + (b.suffix?" "+b.suffix:""))
        .call(setClicks(setBrand));

    let bg = (h,fn) => function (p) {
        d3.select(this).style("background", fn(p));
        (p.objs||[p]).forEach(q=>hl(q,h));
    }
    window.updatePhoneSelect = () => {
        doc.select("#phones").selectAll("div.phone-item")
            .data(allPhones)
            .join((enter) => {
                let phoneDiv = enter.append("div")
                    .attr("class","phone-item")
                    .attr("name", p=>p.fullName)
                    .on("mouseover", bg(true, p => getDivColor(p.id===undefined?nextPhoneNumber():p.id, true,p.hexColor)))
                    .on("mouseout" , bg(false,p => p.id!==undefined?getDivColor(p.id,p.active,p.hexColor):null))
                    .call(setClicks(showPhone));
                phoneDiv.append("span").text(p=>p.fullName);
                // Adding the + selection button
                phoneDiv.append("div")
                    .attr("class", "phone-item-add")
                    .on("click", p => {
                        d3.event.stopPropagation();
                        showPhone(p, 0);
                    });
           });
    };
    updatePhoneSelect();

    if (targets) {
        let b = window.brandTarget = { name:"Targets", active:false },
            ti = -targets.length,
            ph = t => ({
                isTarget:true, brand:b,
                dispName:t, phone:t, fullName:t+" Target", fileName:t+" Target"
            });
        d3.select(".manage").insert("div",".customDF")
            .attr("class", "targets collapseTools");
        let l = (text,c) => s => s.append("div").attr("class","targetLabel").append("span").text(text);
        let ts = b.phoneObjs = doc.select(".targets").call(l("Targets"))
            .selectAll().data(targets).join("div").call(l(t=>t.type))
            .style("flex-grow",t=>t.files.length).attr("class","targetClass")
            .selectAll().data(t=>t.files.map(ph))
            .join("div").text(t=>t.dispName).attr("class","target")
            .call(setClicks(showPhone))
            .data();
        ts.forEach((t,i) => {
            t.id = i-ts.length;
            if (isInit(t.fileName)) {
                inits.push(t);
                if (tiltableTargets.includes(t.dispName)) df = t;
            }
        });
    }

    if (!df) df = window.brandTarget.phoneObjs.find(p => p.dispName === customTiltName);
    inits.map(p => p.copyOf ? showVariant(p.copyOf, p, initMode)
                            : showPhone(p,0,1, initMode));

    // init phone poofing bandaid
    if (ifURL) {
        let lastSig = null, stable = 0, attempts = 0;
        (function trySync() {
            let sig = activePhones
                .filter(p => !p.isDynamic && !p.isPrefBounds)
                .map(p => p.fileName).join("|");
            if (sig === lastSig) {
                if (++stable >= 2) { addPhonesToUrl(); return; }
            } else {
                lastSig = sig; stable = 0;
            }
            if (++attempts >= 10) { addPhonesToUrl(); return; }
            setTimeout(trySync, 300);
        })();
    }

    // band-aid
    loadFiles(df, function (ch) {
        df.rawChannels = ch;
        smoothPhone(df);
        normalizePhone(df);
        df.offset=df.offset||0;
        dfBase = getBaseline(df);
    });

    // update y scaling
    if (default_y_scale && scales[default_y_scale.toLowerCase()]) changeScaling(default_y_scale);

    // -------------------- Custom DF Tilt -------------------- //
    function updateDispVals() {
        doc.select("#cusdf-bass").node().value = boost;
        doc.select("#cusdf-tilt").node().value = tilt;
        doc.select("#cusdf-ear").node().value = ear;
        doc.select("#cusdf-treb").node().value = treble;
    }
    updateDispVals();

    let UnTiltTHIS = doc.select("#cusdf-UnTiltTHIS");
    // if UnTiltTHIS is clicked, switch df to current active target if exists
    UnTiltTHIS.on("click", function () {
        boost = 0;
        tilt = 0;
        ear = 0;
        treble = 0;
        updateDF(boost, tilt, ear, treble);
        updateDispVals();
    });
    
    updateDF = (boost, tilt, ear, treble, change) => {
        // check if user is trying to tilt non tiltable targets
        let activeTarget = activePhones.filter(p => p.isTarget)[0];
        if (activeTarget.isTarget && !tiltableTargets.includes(activeTarget.dispName) && activeTarget.phone != "Custom Tilt") {
            return alert("This target is not supported for Custom Tilt");
        }
        // Bass Shelf
        let filters = [
            {disabled: false, type:"LSQ", freq:105, q:0.707, gain:boost},
            {disabled: false, type:"PK", freq:2750, q:1, gain:ear},
            {disabled: false, type:"HSQ", freq:2500, q:0.42, gain:treble}
        ]; 
        let bass = df.rawChannels.map(c => c ? Equalizer.apply(c, filters) : null);
        // Tilt
        let tiltOct = new Array(bass.length).fill(null);
        for(let i = 0; i < bass[0].length; i++) {
            let gainAdjustment = 0;
            if (boost == 0) {
                gainAdjustment = tilt * Math.log2(bass[0][i][0]);
            } else {
                // if (bass[0][i][0] >= 200) gainAdjustment = tilt * Math.log2(bass[0][i][0]/200); // stopping tilt at 200hz for bass boost
                gainAdjustment = tilt * Math.log2(bass[0][i][0]);
            }
            let tiltedMagnitude = bass[0][i][1] + gainAdjustment;
            tiltOct[i] = [bass[0][i][0], tiltedMagnitude];
        }
        // New Tilt
        let brand = window.brandTarget;
        let phoneObjs = brand.phoneObjs;
        let parts = [];
        if (tilt   != 0) parts.push("Tilt: " + tilt   + "dB/Oct");
        if (boost  != 0) parts.push("B: "    + boost  + "dB");
        if (treble != 0) parts.push("T: "    + treble + "dB");
        if (ear    != 0) parts.push("3kHz: " + ear    + "dB");
        let preferenceAdjustments = parts.length ? " (" + parts.join(", ") + ")" : " ";

        if (harmanFilters) {
            let match = harmanFilters.find(f =>
                tilt   == f.tilt       && boost == f.bass_shelf &&
                treble == f.treble     && ear   == f.ear);
            if (match) preferenceAdjustments += ` (${match.name} Filters)`;
        }

        let phoneObj = { isTarget:true, brand:brand, phone:"Custom Tilt",
            fullName:customTiltName + preferenceAdjustments,
            dispName:customTiltName + preferenceAdjustments,
            fileName:customTiltName + " Target",
            // basedOn: when dfBaseline auto-applies dfBase, the original `df`
            // target has been filtered out of activePhones, so the Custom Tilt
            // row needs to mirror its baseline-selected state.
            basedOn: df};
        phoneObj.rawChannels = [tiltOct];
        phoneObj.id = -69;
        
        let oldPhoneObj = phoneObjs.filter(p => p.phone == "Custom Tilt")[0];
        if (oldPhoneObj) {
            // Replace in-place rather than removePhone(oldPhoneObj) so the visual transition stays smooth.
            phoneObj.id = oldPhoneObj.id;
            phoneObjs[phoneObjs.indexOf(oldPhoneObj)] = phoneObj;
            oldPhoneObj.active = false;
            activePhones = activePhones.filter(p => p.active);
            updatePhoneTable();
        } else {
            phoneObjs.push(phoneObj);
        }
        showPhone(phoneObj, true);

        if (dfBaseline) {
            setBaseline(dfBase);
            drawLabels();
        }

        // focus cusdf inputs
        if (change === "bass") {
            doc.select("#cusdf-bass").node().focus();
        } else if (change === "tilt") {
            doc.select("#cusdf-tilt").node().focus();
        } else if (change === "ear") {
            doc.select("#cusdf-ear").node().focus();
        } else if (change === "treble") {
            doc.select("#cusdf-treb").node().focus();
        }
    }

    const NUMERIC_INPUT = /^-?\d*(\.\d+)?$/;
    function bindCusdfInput(selector, kind, setter) {
        doc.select(selector).on("change input", function () {
            if (!NUMERIC_INPUT.test(this.value)) return;
            setter(+this.value);
            updateDF(boost, tilt, ear, treble, kind);
        });
    }
    bindCusdfInput("#cusdf-bass", "bass",   v => boost  = v);
    bindCusdfInput("#cusdf-tilt", "tilt",   v => tilt   = v);
    bindCusdfInput("#cusdf-ear",  "ear",    v => ear    = v);
    bindCusdfInput("#cusdf-treb", "treble", v => treble = v);
                            
    // Harman Filters button
    if (harmanFilters) {
        doc.select("#cusdf-harmanfilters").on("click", function () {
            const currentClass = this.classList[0];
            const currentIndex = harmanFilters.findIndex(filter => filter.name.split(' ').join('') === currentClass);
            const nextIndex = (currentIndex + 1) % harmanFilters.length;
            const nextFilter = harmanFilters[nextIndex];
        
            this.classList.remove(currentClass);
            this.classList.add(nextFilter.name.split(' ').join(''));
            tilt = nextFilter.tilt;
            boost = nextFilter.bass_shelf;
            treble = nextFilter.treble;
            ear = nextFilter.ear;
        
            updateDF(boost, tilt, ear, treble);
            updateDispVals();
        });
    }

    // Preference Bounds
    let targetsHiddenByBounds = [];

    // button to toggle preference bounds
    let boundsBtn = doc.select("#cusdf-bounds").on("click", function () {
        // set button class to selected
        if (boundsBtn.classed("selected")) {
            boundsBtn.classed("selected", false);
            // remove preference bounds
            removePhone(prefBoundsObj);

            // Un-hide only the targets we hid, and only if they're still hidden
            // (user may have un-hidden one manually in the meantime).
            targetsHiddenByBounds.forEach(p => { if (p.hide) toggleHide(p); });
            targetsHiddenByBounds = [];
        } else {
            boundsBtn.classed("selected", true);
            // set baseline
            prepPrefBounds();
            setBaseline(dfBase);

            // show preference bounds
            activePhones.push(prefBoundsObj);
            prefBoundsObj.active = true;
            setCurves(prefBoundsObj, undefined, prefBoundsObj.lr);
            updatePaths();

            // Hide currently-shown targets and remember them so disable can restore.
            targetsHiddenByBounds = activePhones.filter(p => p.isTarget && !p.hide);
            targetsHiddenByBounds.forEach(p => toggleHide(p));
        }
    });

    function setBrand(b, exclusive) {
        let phoneSel = doc.select("#phones").selectAll("div.phone-item");
        let incl = currentBrands.indexOf(b) !== -1;
        let hasBrand = (p,b) => p.brand===b || p.collab===b;
        if (exclusive || currentBrands.length===0) {
            currentBrands.forEach(br => br.active = false);
            if (incl) {
                currentBrands = [];
                phoneSel.style("display", null);
                phoneSel.select("span").text(p=>p.fullName);
            } else {
                currentBrands = [b];
                phoneSel.style("display", p => hasBrand(p,b)?null:"none");
                phoneSel.filter(p => hasBrand(p,b)).select("span").text(p=>p.phone);
            }
        } else {
            if (incl) return;
            if (currentBrands.length === 1) {
                phoneSel.select("span").text(p=>p.fullName);
            }
            currentBrands.push(b);
            phoneSel.filter(p => hasBrand(p,b)).style("display", null);
        }
        if (!incl) b.active = true;
        brandSel.classed("active", br => br.active);
    }

    let phoneSearch = new Fuse(
        allPhones,
        {
            shouldSort: false,
            tokenize: false,
            threshold: 0.2,
            minMatchCharLength: 2,
            keys: [
                {weight:0.3, name:"dispBrand"},
                {weight:0.1, name:"brand.suffix"},
                {weight:0.6, name:"phone"}
            ]
        }
    );
    let brandSearch = new Fuse(
        brands,
        {
            shouldSort: false,
            tokenize: false,
            threshold: 0.05,
            minMatchCharLength: 3,
            keys: [
                {weight:0.9, name:"name"},
                {weight:0.1, name:"suffix"},
            ]
        }
    );
    doc.select(".search").on("input", function () {
        //d3.select(this).attr("placeholder",null);
        let fn, bl = brands;
        let c = currentBrands;
        let test = p => c.indexOf(p.brand )!==-1
                     || c.indexOf(p.collab)!==-1;
        if (this.value.length > 1) {
            let s = phoneSearch.search(this.value),
                t = c.length ? s.filter(test) : s;
            if (t.length) s = t;
            fn = p => s.indexOf(p)!==-1;
            let b = brandSearch.search(this.value);
            if (b.length) bl = b;
        } else {
            fn = c.length ? test : (p=>true);
        }
        let phoneSel = doc.select("#phones").selectAll("div.phone-item");
        phoneSel.style("display", p => fn(p)?null:"none");
        brandSel.style("display", b => bl.indexOf(b)!==-1?null:"none");
    });

    doc.select("#recolor").on("click", function () {
        allPhones.forEach(p => { if (!p.isTarget) { delete p.id; } });
        phoneNumber = 0; nextPN = null;
        activePhones.forEach(p => {
            if (!p.isTarget) {
                p.id = getPhoneNumber();
                p.hexColor = hclToHex(getCurveColor(p.id,0));
            }
        });
        colorPhones();
    });
    
    doc.select("#theme").on("click", function () {
        themeChooser("change");
    });
    
    userConfigApplyNormalization();
});

let pathHoverTimeout;
function pathHL(c, m, imm) {
    gpath.selectAll("path").classed("highlight", c ? d=>d===c   : false);
    table.selectAll("tr")  .classed("highlight", c ? p=>p===c.p : false);
    if (pathHoverTimeout) { clearTimeout(pathHoverTimeout); }
    if(!stickyLabels) {
        clearLabels();
        pathHoverTimeout =
            imm ? pathTooltip(c, m) :
            c   ? setTimeout(pathTooltip, 400, c, m) :
            undefined;
    }
}
function pathTooltip(c, m) {
    let g = gr.selectAll(".lineLabel").data([c.id])
        .join("g").attr("class","lineLabel");
    let t = g.append("text")
        .attrs({x:m[0], y:m[1]-6, fill:getTooltipColor(c)})
        .text(t=>t);
    let b = t.node().getBBox(),
        o = pad.l+W - b.width;
    if (o < b.x) { t.attr("x",o); b.x=o; }
    // Background
    g.insert("rect", "text")
        .attrs({x:b.x-1, y:b.y-1, width:b.width+2, height:b.height+2});
}
let interactInspect = false;
let graphInteract = imm => function () {
    let cs = d3.merge(activePhones.map(p=>p.hide?[]:p.activeCurves));
    if (!cs.length) return;
    let m = d3.mouse(this);
    if (interactInspect) {
        let ind = fr_to_ind(x.invert(m[0])),
            x1 = x(f_values[ind]),
            x0 = ind>0 ? x(f_values[ind-1]) : x1,
            sel= m[0]-x0 < x1-m[0],
            xv = sel ? x0 : x1;
        ind -= sel;
        function init(e) {
            e.attr("class","inspector");
            e.append("line").attrs({x1:0,x2:0, y1:pad.t,y2:pad.t+H});
            e.append("text").attr("class","insp_dB").attr("x",2);
        }
        let insp = gr.selectAll(".inspector").data([xv])
            .join(enter => enter.append("g").call(init))
            .attr("transform",xv=>"translate("+xv+",0)");
        let dB = insp.select(".insp_dB").text(f_values[ind]+" Hz");
        let cy = cs.map(c => [c, baseline.fn(c.l)[ind][1]+getOffset(c.p)]);
        cy.sort((d,e) => d[1]-e[1]);
        function newTooltip(t) {
            t.attr("class","lineLabel")
                .attr("fill",d=>getTooltipColor(d));
            t.append("text").attr("x",2).text(d=>d.id);
            t.append("g").selectAll().data([0,1])
                .join("text")
                .attr("x",-16)
                .attr("text-anchor",i=>i?"start":"end");
            t.datum(function(){return this.getBBox();});
            t.insert("rect", "text")
                .attrs(b=>({x:b.x-1, y:b.y-1, width:b.width+2, height:b.height+2}));
        }
        let tt = insp.selectAll(".lineLabel").data(cy.map(d=>d[0]), d=>d.id)
            .join(enter => enter.insert("g","line").call(newTooltip));
        let start = tt.select("g").datum((_,i) => cy[i][1])
            .selectAll("text").data(d => {
                let s=d<-0.05?"-":""; d=Math.abs(d)+0.05;
                return [s+Math.floor(d)+".",Math.floor((d%1)*10)];
            })
            .text(t=>t)
            .filter((_,i)=>i===0)
            .nodes().map(n=>n.getBBox().x-2);
        tt.select("rect")
            .attrs((b,i)=>({x:b.x+start[i]-1, width:b.width-start[i]+2}));
        // Now compute heights
        let hm = d3.max(tt.data().map(b=>b.height)),
            hh = (y.invert(0)-y.invert(hm-1))/2,
            stack = [];
        cy.map(d=>d[1]).forEach(function (h,i) {
            let n = 1;
            let overlap = s => h/n - s.h/s.n <= hh*(s.n+n);
            let l = stack.length;
            while (l && overlap(stack[--l])) {
                let s = stack.pop();
                h += s.h; n += s.n;
            }
            stack.push({h:h, n:n});
        });
        let ch = d3.merge(stack.map((s,i) => {
            let h = s.h/s.n - (s.n-1)*hh;
            return d3.range(s.n).map(k => h+k*2*hh);
        }));
        tt.attr("transform",(_,i) => "translate(0,"+(y(ch[i])+5)+")");
        dB.attr("y", y(ch[ch.length-1]+2*hh)+1);
    } else {
        let d = 30 * W0 / gr.node().getBoundingClientRect().width,
            sl= range_to_slice([-1,1],s=>m[0]+d*s);
        let ind = cs
            .map(c =>
                sl(baseline.fn(c.l))
                    .map(p => Math.hypot(x(p[0])-m[0], y(p[1]+getOffset(c.p))-m[1]))
                    .reduce((a,b)=>Math.min(a,b), d)
            )
            .reduce((a,b,i) => b<a[1] ? [i,b] : a, [-1,d])[0];
        pathHL(ind===-1 ? false : cs[ind], m, imm);
    }
}
function stopInspect() { gr.selectAll(".inspector").remove(); }
gr.append("rect")
    .attrs({x:pad.l,y:pad.t,width:W,height:H,opacity:0})
    .on("mousemove", graphInteract())
    .on("mouseout", ()=>interactInspect?stopInspect():pathHL(false))
    .on("click", graphInteract(true));

doc.select("#inspector").on("click", function () {
    clearLabels();
    stopInspect();
    d3.select(this).classed("selected", interactInspect = !interactInspect);
});

doc.select("#expandTools").on("click", function () {
    let t=doc.select(".tools"), cl="collapseTools", v=!t.classed(cl);
    [t,doc.select(".targets")].forEach(s=>s.classed(cl, v));
});

d3.selectAll(".helptip").on("click", function() {
    let e = d3.select(this);
    e.classed("active", !e.classed("active"));
});

// Copy URL button functionality
function copyUrlInit() {
    let copyUrlButton = document.querySelector("button#copy-url");

    copyUrlButton.addEventListener("click", function(e) {
        let urlHost = document.createElement('input'),
            currentUrl = targetWindow.location.href;

        urlHost.setAttribute("style","position: fixed; opacity: 0.0;");
        urlHost.value = currentUrl;
        document.body.appendChild(urlHost);

        urlHost.select();
        document.execCommand('copy');
        document.body.removeChild(urlHost);

        e.stopPropagation();

        copyUrlButton.classList.add("clicked");
        setTimeout(function() {
            copyUrlButton.classList.remove("clicked");
        }, 600);
        
        // Analytics event
        if (analyticsEnabled) { pushEventTag("clicked_copyUrl", targetWindow); }
    });
}
copyUrlInit();

// Theme switcher (themeChooser) lives in assets/js/theme.js.

// Map faux download button
function mapDownloadFaux() {
    let downloadButton = document.querySelector("button#download"),
        downloadFaux = document.querySelector("button#download-faux");
    
    downloadFaux.addEventListener("click", function() {
        downloadButton.click();
    });
}
mapDownloadFaux();

// Set focused scroll list
function setFocusedList(selectedList) {
    let listsContainer = document.querySelector("div.select");

    listsContainer.setAttribute("data-selected", selectedList)
}

function focusedListClicks() {
    let listClickTragets = document.querySelectorAll("*[data-list=\"brands\"], *[data-list=\"models\"]");

    listClickTragets.forEach((clickedTarget) => {
        clickedTarget.addEventListener("click", () => {
            let selectedList = clickedTarget.getAttribute("data-list")
            setFocusedList(selectedList);
            window.hideExtraPanel && window.hideExtraPanel(selectedList);
        });
    });

    let brandsList = document.querySelector("div.scroll#brands");
    
    brandsList.addEventListener("click", function(e) {
        let clickedElem = e.target,
            clickedElemIsBrand = clickedElem.matches("div.scroll#brands div");
        
        if (clickedElemIsBrand) {
            setFocusedList("models");
            e.stopPropagation();
        }
    });

}
focusedListClicks();

function focusedListSwipes() {
    let horizontalSwipeTarget = document.querySelector("div.scroll-container"),
        listsContainer = document.querySelector("div.select"),
        swipableList = document.querySelector("div.scrollOuter[data-list=\"models\"]");
    touchDelta = 0;
    
    horizontalSwipeTarget.addEventListener("touchstart", function(e) {
        selectedList = listsContainer.getAttribute("data-selected");
        touchStart = e.targetTouches[0].screenX;

        horizontalSwipeTarget.addEventListener("touchmove", function(e) {
            touchNow = e.targetTouches[0].screenX;
            touchDelta = touchNow - touchStart,
            touchDeltaNegative = 0 - touchDelta;
            
            if ( selectedList === "models" && touchDelta > 0 && touchDelta < 100 ) {
                swipableList.setAttribute("style","right: "+ touchDeltaNegative +"px;")
            }
            
            if ( selectedList === "brands" && touchDelta < 0 && touchDelta > -100 ) {
                swipableList.setAttribute("style","right: "+ touchDeltaNegative +"px;")
            }
        });
    });

    horizontalSwipeTarget.addEventListener("touchend", function(e) {
        if ( touchDelta > 49 ) {
            listsContainer.setAttribute("data-selected","brands");
        }

        if ( touchDelta < -50 ) {
            listsContainer.setAttribute("data-selected","models");
        }
        
        swipableList.setAttribute("style","")
        touchStart = 0;
        touchNow = 0;
        touchDelta = 0;
        
        //horizontalSwipeTarget.removeEventListener("touchmove");
    });
}
focusedListSwipes();

// Scroll list to active phone on init
function scrollToActive() {
    try {
        let phoneList = document.querySelector('div.scroll#phones'),
            firstActivePhone = document.querySelector('div.phone-item[style*=border]'),
            offset = firstActivePhone.offsetTop - 26;

        phoneList.scrollTop = offset;
    }
    catch {}
}

// Set focused panel
function setFocusedPanel() {
    let panelsContainer = document.querySelector("main.main"),
        primaryPanel = document.querySelector(".parts-primary"),
        secondaryPanel = document.querySelector(".parts-secondary"),
        phonesList = document.querySelector("div#phones"),
        graphBox = document.querySelector("div.graph-sizer"),
        mobileHelper = document.querySelector("tr.mobile-helper");
    
    panelsContainer.setAttribute("data-focused-panel","secondary");
    
    mobileHelper.addEventListener("click", function() {
        panelsContainer.setAttribute("data-focused-panel","secondary");
    });

    secondaryPanel.addEventListener("click", function() {
        panelsContainer.setAttribute("data-focused-panel","secondary");
    });
    
    graphBox.addEventListener("click", function() {
        let previousState = panelsContainer.getAttribute("data-focused-panel");
        
        if ( previousState === "primary") {
            panelsContainer.setAttribute("data-focused-panel","secondary");
        } else if ( previousState === "secondary" ) {
            panelsContainer.setAttribute("data-focused-panel","primary");
        }
    });
    
    // Touch events
    let verticalSwipeTargets = document.querySelectorAll("div.selector-tabs, input.search");
    
    verticalSwipeTargets.forEach(function(target) {
        target.addEventListener("touchstart", function(e) {
            focusedPanel = document.querySelector("main.main").getAttribute("data-focused-panel");

            touchStart = e.targetTouches[0].screenY;

            target.addEventListener("touchmove", function(e) {
                touchNow = e.targetTouches[0].screenY;
                touchDelta = touchNow - touchStart;

                if ( focusedPanel === "secondary" && touchDelta > 0 && touchDelta < 200) {
                    secondaryPanel.setAttribute("style", "top: " + touchDelta + "px;")
                } else if ( focusedPanel === "primary" && touchDelta < 0 && touchDelta > -200) {
                    secondaryPanel.setAttribute("style", "top: " + touchDelta + "px;")
                }
            });
        });

        target.addEventListener("touchend", function(e) {
            if ( touchDelta > 49 ) {
                panelsContainer.setAttribute("data-focused-panel","primary");
            }

            if ( touchDelta < -50 ) {
                panelsContainer.setAttribute("data-focused-panel","secondary");
            }

            secondaryPanel.setAttribute("style", "")
            touchStart = 0;
            touchNow = 0;
            touchDelta = 0;
        });
    
        target.addEventListener("wheel", function(e) {
            let wheelDelta = e.deltaY;

            if (wheelDelta < -5) {
                panelsContainer.setAttribute("data-focused-panel","primary");
            }

            if (wheelDelta > 5) {
                panelsContainer.setAttribute("data-focused-panel","secondary");
            }
        });
    });
}
setFocusedPanel();

// Blur focus from inputs on submit
function blurFocus() {
    let inputFields = document.querySelectorAll("input"),
        body = document.querySelector("body");
    
    inputFields.forEach(function(field) {
        field.addEventListener("keyup", function(e) {
            if (e.keyCode === 13) {
                field.blur();
            }
        });
        
        field.addEventListener("focus", function() {
            body.setAttribute("data-input-state","focus");
        });
        
        field.addEventListener("blur", function() {
            body.setAttribute("data-input-state","blur");
        });
    });
}
blurFocus();

// Extra panel (parametric EQ, uploads, tone generator) lives in assets/js/eqPanel.js.
// Exposes window.showExtraPanel, window.hideExtraPanel, window.updateEQPhoneSelect.

// Add accessories to the bottom of the page, if configured
function addAccessories() {
    let accessoriesBar = document.querySelector("div.accessories"),
        accessoriesContainer = document.createElement("aside");
    
    accessoriesContainer.innerHTML = whichAccessoriesToUse;
    accessoriesBar.append(accessoriesContainer);
}
if (accessories) { addAccessories(); }

// Add header to alt layout
function addHeader() {
    let graphToolContainer = document.querySelector("div.graphtool"),
        altHeaderElem = document.createElement("header"),
        headerButton = document.createElement("button"),
        headerLogoElem = document.createElement("div"),
        headerLogoLink = document.createElement("a"),
        headerLogoImg = document.createElement("img"),
        headerLogoSpan = document.createElement("span"),
        linksList = document.createElement("ul");
    
    headerButton.className = "header-button";
    headerLogoElem.className = "logo";
    headerLogoElem.setAttribute('style', "margin-right: 0;");
    headerLogoLink.setAttribute('href', site_url);
    headerLogoLink.setAttribute('style', "display:inline-flex; align-items:center; white-space:nowrap;");
    headerLogoSpan.innerText = headerLogoText;
    headerLogoSpan.setAttribute('style', "color: #ffffff; margin-right:10px; margin-left: auto;"); 
    headerLogoLink.append(headerLogoSpan);
    headerLogoImg.setAttribute("src", headerLogoImgUrl);
    headerLogoImg.setAttribute('style', "width:auto; height: 24px; margin-right:auto; fill: #ffffff;");
    headerLogoLink.append(headerLogoImg);
    
    altHeaderElem.append(headerButton);
    headerButton.setAttribute('style', "background-color: #ffffff");
    headerLogoElem.append(headerLogoLink);
    altHeaderElem.setAttribute("data-links", "");
    altHeaderElem.append(headerLogoElem);

    altHeaderElem.className = "header";
    graphToolContainer.prepend(altHeaderElem);
    
    linksList.className = "header-links";
    altHeaderElem.append(linksList);
    
    if(headerLinks) {
        headerLinks.forEach(function(link) {
            let linkContainerElem = document.createElement("li"),
                linkElem = document.createElement("a");
            
            linkElem.setAttribute("href", link.url);
            if ( alt_header_new_tab ) { linkElem.setAttribute("target", "_blank"); }
            if ( link.external ) { linkElem.setAttribute("target", "_blank"); linkElem.classList.add('external'); }
            linkElem.textContent = link.name;
            linkContainerElem.append(linkElem);
            linksList.append(linkContainerElem);
        })
    }

    if (allowCreatorSupport) {
        // custom Ko-fi button
        const scriptHtml = `<a href='https://ko-fi.com/harutohiroki' target='_blank' style="margin-top: auto; margin-bottom: auto; margin-right: 10px"><img height='333' style='border:0px; height:33px;'
                            src='https://storage.ko-fi.com/cdn/kofi5.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>`;
        altHeaderElem.insertAdjacentHTML('beforeend', scriptHtml);
    }
    
    headerButton.addEventListener("click", function() {
        let headerLinksState = altHeaderElem.getAttribute("data-links");
        
        if (headerLinksState === "expanded") {
            altHeaderElem.setAttribute("data-links", "collapsed");
        } else {
            altHeaderElem.setAttribute("data-links", "expanded");
        }
    });
}
if (alt_layout && alt_header) { addHeader(); }

// Add external links to bar at bottom of page, if configured
function addExternalLinks() {
    const externalLinksBar = document.querySelector("div.external-links");

    linkSets.forEach(function(set) {
        let setLabelHtml = document.createElement("span"),
            setLabelText = set.label,
            links = set.links;
        
        setLabelHtml.textContent = setLabelText;
        externalLinksBar.append(setLabelHtml);
        
        links.forEach(function(link) {
            let linkHtml = document.createElement("a"),
                linkName = link.name,
                linkUrl = link.url;
            
            linkHtml.textContent = linkName;
            linkHtml.setAttribute("href", linkUrl);
            externalLinksBar.append(linkHtml);
        });
    });
}
if (externalLinksBar) { addExternalLinks(); }

// Tutorial overlay (addTutorial) lives in assets/js/tutorial.js.

// Set active graph site link
function setActiveDatabase() {
    let url = targetWindow.location.href,
        dbLinks = document.querySelectorAll("div.external-links a");

    dbLinks.forEach(function(link) {
        let linkUrl = link.getAttribute("href");

        if ( url.includes(linkUrl) ) {
            link.setAttribute("class", "active");
        }
    });
}
setActiveDatabase();

// Expand / collapse function
function toggleExpandCollapse() {
    const graphIsIframe = window.top !== window.self,
        graphBody = document.querySelector("body"),
        parentBody = window.top.document.querySelector("body"),
        expandCollapseButton = document.querySelector("button#expand-collapse");
    
    
    if ( graphIsIframe) { graphBody.setAttribute("data-graph-frame", "collapsed"); }
    
    
    if ( graphIsIframe && expandableOnly ) {
        const expandOnlyMax = ( expandableOnly === true ) ? 1000000:expandableOnly,
            expandOnlyStyle = document.createElement("style"),
            expandOnlyCss = `
            @media ( max-width: `+ expandOnlyMax +`px ) {
                body[data-expandable="only"][data-graph-frame="collapsed"] {
                    overflow: hidden;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] div.expand-collapse {
                    position: fixed;
                    top: 0;
                    left: 0;

                    display: flex;
                    justify-content: center;
                    align-items: center;

                    width: 100%;
                    height: 100%;
                    padding: 0;

                    background-color: var(--background-color);
                    background-color: transparent;
                    border: none;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] div.expand-collapse:after {
                    position: absolute;

                    content: 'Tap to launch graph tool';

                    color: var(--font-color-primary);
                    font-family: var(--font-secondary);
                    font-size: 11px;
                    line-height: 1em;
                    text-transform: uppercase;

                    pointer-events: none;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] div.expand-collapse button#expand-collapse {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    width: 100%;
                    height: 100%;

                    background-color: transparent;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] div.expand-collapse button#expand-collapse:before {
                    position: relative;
                    z-index: 1;

                    transform: scale(7);
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] div.expand-collapse button#expand-collapse:after {
                    position: absolute;
                    top: 0;
                    left: 0;

                    content: '';

                    display: block;
                    width: 100%;
                    height: 100%;

                    background-color: var(--background-color);

                    opacity: 0.9;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] section.parts-primary {
                    flex: 100% 1 1;
                    overflow: hidden;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] section.parts-secondary {
                    display: none;
                }
            }
        `;
        
        expandOnlyStyle.textContent = expandOnlyCss;
        expandOnlyStyle.setAttribute("type", "text/css");
        document.querySelector("body").append(expandOnlyStyle);
        
        graphBody.setAttribute("data-expandable", "only");
    } else if ( graphIsIframe && expandable ) {
        graphBody.setAttribute("data-expandable", "true");
    }
    
    const parentStyle = window.top.document.createElement("style"),
          parentCss = `
            :root {
                --header-height: `+ headerHeight +`;
            }
            
            body[data-graph-frame="expanded"] {
                width: 100%;
                height: 100%;
                max-height: -webkit-fill-available;
                overflow: hidden;
            }
            
            body[data-graph-frame="expanded"] button.graph-frame-collapse {
                display: inherit;
            }
            
            body[data-graph-frame="expanded"] iframe#GraphTool {
                position: fixed;
                top: var(--header-height);
                left: 0;
                
                width: 100% !important;
                height: calc(100% - var(--header-height)) !important;

                animation-name: graph-tool-expand;
                animation-duration: 0.15s;
                animation-iteration-count: 1;
                animation-timing-function: ease-out;
                animation-fill-mode: forwards;
            }

            @keyframes graph-tool-expand {
                0% {
                    position: relative;
                    opacity: 1.0;
                    transform: scale(1.0);
                }
                48% {
                    position: relative;
                    opacity: 0.0;
                    transform: scale(0.9);
                }
                50% {
                    position: fixed;
                    opacity: 0.0;
                    transform: scale(0.9);
                }
                52% {
                    position: fixed;
                    opacity: 0.0;
                    transform: scale(0.9);
                }
                100% {
                    position: fixed;
                    opacity: 1.0;
                    transform: scale(1.0);
                }
            }`;
    
    parentStyle.textContent = parentCss;
    parentStyle.setAttribute("type", "text/css");
    parentBody.append(parentStyle);
    
    expandCollapseButton.addEventListener("click", function(e) {
        let frameState = document.querySelector("body").getAttribute("data-graph-frame");
        
        if ( frameState === "expanded" ) {
            graphBody.setAttribute("data-graph-frame", "collapsed");
            parentBody.setAttribute("data-graph-frame", "collapsed");
        } else {
            graphBody.setAttribute("data-graph-frame", "expanded");
            parentBody.setAttribute("data-graph-frame", "expanded");
        }
        
        e.stopPropagation();
    });
        
}

if ( expandable && accessDocumentTop ) { toggleExpandCollapse(); }

// Update user config for target + baseline
function setUserConfig() {
    let urlObj = new URL(document.URL),
        pathClean = urlObj.pathname.replace(/\W/g, ""),
        configName = pathClean.length > 0 ? "_" + pathClean + "_a" : "_a",
        configJson = {
            "phones": [],
            "normalMode": (norm_sel === 1) ? "Hz" : "dB",
            "normalValue": (norm_sel === 1) ? norm_fr : norm_phon
        },
        activeBaseline = baseline.p ? baseline.p.fileName : 0;
    
    activePhones.forEach(function(phone) {
        let phoneJson = {},
            fullName = phone.fullName,
            fileName = phone.fileName,
            isTarget = Boolean(phone.isTarget),
            isHidden = Boolean(phone.hide),
            isBaseline = fileName === activeBaseline,
            isPinned = Boolean(phone.pin);
        
        if (isTarget || isBaseline) {
            phoneJson.fullName = fullName;
            phoneJson.fileName = fileName;
            phoneJson.isTarget = isTarget;
            phoneJson.isHidden = isHidden;
            phoneJson.isBaseline = isBaseline;
            phoneJson.isPinned = isPinned;
            
            configJson.phones.push(phoneJson);
        }
    });
    
    localStorage.setItem("userConfig" + configName, JSON.stringify(configJson));
}

// Insert user config phones to inits
function userConfigAppendInits(initReq) {
    if (targetRestoreLastUsed) {
        let urlObj = new URL(document.URL),
            pathClean = urlObj.pathname.replace(/\W/g, ""),
            configName = pathClean.length > 0 ? "_" + pathClean + "_a" : "_a",
            configJson = JSON.parse(localStorage.getItem("userConfig" + configName)),
            configNumOfPhones = configJson ? configJson.phones.length : 0;

        if (configJson && configNumOfPhones) {
            initReq.slice(0).forEach(function(item) {
                if (item.endsWith(' Target')) {
                    initReq.splice(initReq.indexOf(item), 1);
                }
            });

            configJson.phones.forEach(function(phone) {
                if (!initReq.includes(phone.fileName)) {
                    initReq.push(phone.fileName);
                }
            });
        }
    }
}

// Apply baseline and hide settings
function userConfigApplyViewSettings(phoneInTable) {
    if (targetRestoreLastUsed) {
        userConfigApplicationActive = 1;

        let urlObj = new URL(document.URL),
            pathClean = urlObj.pathname.replace(/\W/g, ""),
            configName = pathClean.length > 0 ? "_" + pathClean + "_a" : "_a",
            configJson = JSON.parse(localStorage.getItem("userConfig" + configName));

        if (configJson) {
            let phone = configJson.phones.find(item => item.fileName === phoneInTable);

            if (typeof phone !== "undefined") {
                let row = document.querySelector("tr[data-filename='"+ phone.fileName +"']"),
                    hideButton  = row.querySelector("td.hideIcon"),
                    baselineButton  = row.querySelector("td.button-baseline"),
                    pinButton = row.querySelector("td.button-pin");

                if (phone.isHidden && !hideButton.classList.contains("selected")) {
                    hideButton.click();
                }

                if (phone.isBaseline && !baselineButton.classList.contains("selected")) {
                    baselineButton.click();
                }

                if (phone.isPinned && pinButton.getAttribute('data-pinned') !== "true") {
                    pinButton.click();
                }
            }
        }

        userConfigApplicationActive = 0;
    }
};

// Apply normalization config
function userConfigApplyNormalization() {
    userConfigApplicationActive = 1;
    
    let urlObj = new URL(document.URL),
        pathClean = urlObj.pathname.replace(/\W/g, ""),
        configName = pathClean.length > 0 ? "_" + pathClean + "_a" : "_a",
        configJson = JSON.parse(localStorage.getItem("userConfig" + configName));
    
    if ( configJson && configJson.normalMode === "Hz" ) {
        document.querySelector("input#norm-fr").value = configJson.normalValue;
        document.querySelector("input#norm-fr").dispatchEvent(new Event("change"));
    } else if ( configJson && configJson.normalMode === "dB" ) {
        document.querySelector("input#norm-phon").value = configJson.normalValue;
        document.querySelector("input#norm-phon").dispatchEvent(new Event("change"));
    }
    
    userConfigApplicationActive = 0;
}
