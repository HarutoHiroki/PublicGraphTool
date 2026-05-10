// Curve / phone color helpers
let ld_p1 = 1.1673039782614187;
function getCurveColor(id, o, hex) {
    let p1 = ld_p1,
        p2 = p1*p1,
        p3 = p2*p1;
    let t = o/32;
    let i=id/p3+0.76, j=id/p2+0.79, k=id/p1+0.32;
    if (hex) {
        let rgb = d3.rgb(hex);
        let hcl = d3.hcl(rgb);
        hcl.h = hcl.h + -30 * (o <= 0 ? 0 : 1); // Haruto's Bias, if you want to make the color more dicernable, change the 30 to 60, for the original, change the entire thing to 30 * o
        return hcl;
    } else {
        if (id < 0) { return d3.hcl(360*(1-(-i)%1),5,66); } // Target
        let th = 2*Math.PI*i;
        i += Math.cos(th-0.3)/24 + Math.cos(6*th)/32;
        let s = Math.sin(2*Math.PI*i);
        return d3.hcl(360*((i + t/p2)%1) + (o * 30), // hue varies with "o"
                      88+30*(j%1 + 1.3*s - t/p3),
                      64); //constant luminance
    }
}
var getColor_AC = c => getCurveColor(c.p.id, c.o, c.p.hexColor);
var getColor_ph = (p,i) => getCurveColor(p.id, p.activeCurves[i].o, p.hexColor);
function getDivColor(id, active, hex) {
    let c = getCurveColor(id, 0, hex);
    c.l = 100-(80-Math.min(c.l,60))/(active?1.5:3);
    c.c = (c.c-20)/(active?3:4);
    return c;
}
function color_curveToText(c) {
    if (!alt_layout) {
        c.l = c.l/5 + 10;
        c.c /= 3;
    }
    return c;
}
var getTooltipColor = curve => color_curveToText(getColor_AC(curve));
var getTextColor = p => color_curveToText(getCurveColor(p.id,0,p.hexColor));
var getBgColor = p => {
    let c=getCurveColor(p.id,0,p.hexColor).rgb();
    ['r','g','b'].forEach(p=>c[p]=255-(255-Math.max(0,c[p]))*0.85);
    return c;
}
var phoneNumber = 0;
// Find a phone id which doesn't have a color conflict with pins
var nextPN = 0; // Cached value; invalidated when pinned headphones change
function nextPhoneNumber() {
    if (nextPN === null) {
        nextPN = phoneNumber;
        let pin = activePhones.filter(p => p.pin).map(p=>p.id);
        if (pin.length) {
            let p3 = ld_p1*ld_p1*ld_p1,
                l = a => b => Math.abs(((a-b)/p3 + 0.5) % 1 - 0.5),
                d = id => d3.min(pin, l(id));
            for (let i=nextPN, max=d(i); max<0.12 && ++i<phoneNumber+3; ) {
                let m = d(i);
                if (m > max) { max=m; nextPN=i; }
            }
        }
    }
    return nextPN;
}
function getPhoneNumber() {
    let pn = nextPhoneNumber();
    phoneNumber = pn + 1;
    nextPN = null;
    return pn;
}
