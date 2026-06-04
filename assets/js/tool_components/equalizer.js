/*
Biquad algorithms are taken from:
https://github.com/jaakkopasanen/AutoEq/blob/master/biquad.py
https://github.com/mohayonao/biquad-coeffs/tree/master/packages/biquad-coeffs-cookbook
*/

Equalizer = (function() {
    let config = {
        // Change sample rate will affect the curve of filters close to nyquist frequency
        // Here I choosed a common used value, but not all DSP software use this sample rate for EQ
        DefaultSampleRate: 48000,
        // Avoid filters close to nyquist frequency by default, because the behavior is implementation dependent
        // https://github.com/jaakkopasanen/AutoEq/issues/240
        // https://github.com/jaakkopasanen/AutoEq/issues/411
        AutoEQRange: [20, 15000],
        // Minimum and maximum Q for AutoEQ feature
        OptimizeQRange: [.3, 3],
        // Minimum and maximum Gain for AutoEQ feature
        OptimizeGainRange: [-16, 16],
        // Use to get response diff by EQ before smoothing
        GraphicEQRawFrequences: ( // ~= 1/96 octave
            new Array(Math.ceil(Math.log(20000 / 20) / Math.log(1.0072))).fill(null)
            .map((_, i) => 20 * Math.pow(1.0072, i))),
        // Smoothed 127 bands frequencies for graphic eq (wavelet)
        GraphicEQFrequences: Array.from(new Set(
            new Array(Math.ceil(Math.log(20000 / 20) / Math.log(1.0563))).fill(null)
            .map((_, i) => Math.floor(20 * Math.pow(1.0563, i))))).sort((a, b) => a - b),
    };

    let inst = null;

    let interp = function (fv, fr) {
        let i = 0;
        return fv.map(f => {
            for (; i < fr.length-1; ++i) {
                let [f0, v0] = fr[i];
                let [f1, v1] = fr[i+1];
                if (i == 0 && f < f0) {
                    return [f, v0];
                } else if (f >= f0 && f < f1) {
                    let v = v0 + (v1 - v0) * (f - f0) / (f1 - f0);
                    return [f, v];
                }
            }
            return [f, fr[fr.length-1][1]];
        });
    };

    let lowshelf = function (freq, q, gain, sampleRate) {
        freq = freq / (sampleRate || config.DefaultSampleRate);
        freq = Math.max(1e-6, Math.min(freq, 1));
        q    = Math.max(1e-4, Math.min(q, 1000));
        gain = Math.max(-40, Math.min(gain, 40));

        let w0 = 2 * Math.PI * freq;
        let sin = Math.sin(w0);
        let cos = Math.cos(w0);
        let a = Math.pow(10, (gain / 40));
        let alpha = sin / (2 * q);
        let alphamod = (2 * Math.sqrt(a) * alpha) || 0;

        let a0 =          ((a+1) + (a-1) * cos + alphamod);
        let a1 = -2 *     ((a-1) + (a+1) * cos           );
        let a2 =          ((a+1) + (a-1) * cos - alphamod);
        let b0 =      a * ((a+1) - (a-1) * cos + alphamod);
        let b1 =  2 * a * ((a-1) - (a+1) * cos           );
        let b2 =      a * ((a+1) - (a-1) * cos - alphamod);

        return [ 1.0, a1/a0, a2/a0, b0/a0, b1/a0, b2/a0 ];
    };

    let highshelf = function (freq, q, gain, sampleRate) {
        freq = freq / (sampleRate || config.DefaultSampleRate);
        freq = Math.max(1e-6, Math.min(freq, 1));
        q    = Math.max(1e-4, Math.min(q, 1000));
        gain = Math.max(-40, Math.min(gain, 40));

        let w0 = 2 * Math.PI * freq;
        let sin = Math.sin(w0);
        let cos = Math.cos(w0);
        let a = Math.pow(10, (gain / 40));
        let alpha = sin / (2 * q);
        let alphamod = (2 * Math.sqrt(a) * alpha) || 0;

        let a0 =          ((a+1) - (a-1) * cos + alphamod);
        let a1 =  2 *     ((a-1) - (a+1) * cos           );
        let a2 =          ((a+1) - (a-1) * cos - alphamod);
        let b0 =      a * ((a+1) + (a-1) * cos + alphamod);
        let b1 = -2 * a * ((a-1) + (a+1) * cos           );
        let b2 =      a * ((a+1) + (a-1) * cos - alphamod);

        return [ 1.0, a1/a0, a2/a0, b0/a0, b1/a0, b2/a0 ];
    };

    let peaking = function (freq, q, gain, sampleRate) {
        freq = freq / (sampleRate || config.DefaultSampleRate);
        freq = Math.max(1e-6, Math.min(freq, 1));
        q    = Math.max(1e-4, Math.min(q, 1000));
        gain = Math.max(-40, Math.min(gain, 40));

        let w0 = 2 * Math.PI * freq;
        let sin = Math.sin(w0);
        let cos = Math.cos(w0);
        let a = Math.pow(10, (gain / 40));
        let alpha = sin / (2 * q);

        let a0 =  1 + alpha / a;
        let a1 = -2 * cos;
        let a2 =  1 - alpha / a;
        let b0 =  1 + alpha * a;
        let b1 = -2 * cos;
        let b2 =  1 - alpha * a;

        return [ 1.0, a1/a0, a2/a0, b0/a0, b1/a0, b2/a0 ];
    };

    let calc_gains = function (freqs, coeffs, sampleRate) {
        sampleRate = sampleRate || config.DefaultSampleRate;
        let gains = new Array(freqs.length).fill(0);

        for (let i = 0; i < coeffs.length; ++i) {
            let [ a0, a1, a2, b0, b1, b2] = coeffs[i];
            for (let j = 0; j < freqs.length; ++j) {
                let w = 2 * Math.PI * freqs[j] / sampleRate;
                let phi = 4 * Math.pow(Math.sin(w / 2), 2);
                let c = (
                    10 * Math.log10(Math.pow(b0 + b1 + b2, 2) +
                        (b0 * b2 * phi - (b1 * (b0 + b2) + 4 * b0 * b2)) * phi) -
                    10 * Math.log10(Math.pow(a0 + a1 + a2, 2) +
                        (a0 * a2 * phi - (a1 * (a0 + a2) + 4 * a0 * a2)) * phi));
                gains[j] += c;
            }
        }
        return gains;
    };

    let calc_preamp = function (fr1, fr2) {
        let maxGain = -Infinity;
        for (let i = 0; i < fr1.length; ++i) {
            maxGain = Math.max(maxGain, fr2[i][1] - fr1[i][1]);
        }
        return -maxGain;
    };

    let autoeq = async function (fr, frTarget, maxFilters, mode) {
        if (!inst)
            inst = await AutoEq.make();

        maxFilters = Math.min(Math.max(maxFilters, 1), 32);

        const dst = AutoEq.interp(frTarget.map(x => x[0]), frTarget.map(x => x[1])),
              src = AutoEq.interp(fr.map(x => x[0]), fr.map(x => x[1]));

        const c = AutoEq.CONFIGS.STANDARD(
            maxFilters,
            config.AutoEQRange[0],
            config.AutoEQRange[1],
            config.OptimizeGainRange[0],
            config.OptimizeGainRange[1],
            config.OptimizeQRange[0],
            config.OptimizeQRange[1]
        );

        if (maxFilters <= 3) {
            // with 3 or less filters shelving filters are not worth it so just use peaking
            c.specs = Array(maxFilters).fill({
                type: AutoEq.Type.PK,
                f0: [config.AutoEQRange[0], config.AutoEQRange[1]],
                gain: [config.OptimizeGainRange[0], config.OptimizeGainRange[1]],
                q: [config.OptimizeQRange[0], config.OptimizeQRange[1]],
            });
        }

        const res = AutoEq.run(inst, dst, src, c,
            mode === 'OE' ? AutoEq.Smooth.OE : AutoEq.Smooth.IE);
        if (!res)
            return [[], 0];

        function round(x, n) {
            const f = Math.pow(10, n);
            return Math.round(f*x) / f;
        }

        const out = [];
        for (const filt of res.filters) {
            out.push({
                type: filt.type === 'HSC' ? 'HSQ' : filt.type === 'LSC' ? 'LSQ' : 'PK',
                freq: round(filt.f0, 0),
                gain: round(filt.gain, 1),
                q: round(filt.q, 2),
            });
        }

        out.sort((a, b) => a.freq - b.freq);

        console.log(`[autoeq] took: ${res.time.toFixed(0)} ms`);

        return [out, round(res.amp, 2)];
    };

    let filters_to_coeffs = function (filters, sampleRate) {
        return filters.map(f => {
            if (!f.freq || !f.gain || !f.q) {
                return null;
            } else if (f.type === "LSQ") {
                return lowshelf(f.freq, f.q, f.gain, sampleRate);
            } else if (f.type === "HSQ") {
                return highshelf(f.freq, f.q, f.gain, sampleRate);
            } else if (f.type === "PK") {
                return peaking(f.freq, f.q, f.gain, sampleRate);
            }
            return null;
        }).filter(f => f);
    };

    let apply = function (fr, filters, sampleRate) {
        let freqs = new Array(fr.length).fill(null);
        for (let i = 0; i < fr.length; ++i) {
            freqs[i] = fr[i][0];
        }
        let coeffs = filters_to_coeffs(filters, sampleRate);
        let gains = calc_gains(freqs, coeffs, sampleRate);
        let fr_eq = new Array(fr.length).fill(null);
        for (let i = 0; i < fr.length; ++i) {
            fr_eq[i] = [fr[i][0], fr[i][1] + gains[i]];
        }
        return fr_eq;
    };

    let as_graphic_eq = function (filters, sampleRate) {
        let rawFS = config.GraphicEQRawFrequences, fs = config.GraphicEQFrequences;
        let coeffs = filters_to_coeffs(filters, sampleRate);
        let gains = calc_gains(rawFS, coeffs, sampleRate);
        let rawFR = rawFS.map((f, i) => [f, gains[i]]);
        let i = 0;
        let resultFR = fs.map((f, j) => {
            let freqTo = (j < fs.length-1) ? Math.sqrt(f * fs[j+1]) : 20000;
            let points = [];
            for (; i < rawFS.length; ++i) {
                if (rawFS[i] < freqTo) {
                    points.push(rawFR[i][1]);
                } else {
                    break
                }
            }
            let avg = points.reduce((a, b) => a + b, 0) / points.length;
            return [f, avg];
        });
        let maxGain = resultFR.reduce((a, b) => a > b[1] ? a : b[1], -Infinity);
        resultFR = resultFR.map(([f, v]) => [f, v-maxGain]);
        return resultFR;
    };

    return {
        config,
        interp,
        lowshelf,
        highshelf,
        peaking,
        calc_gains,
        calc_preamp,
        apply,
        as_graphic_eq,
        autoeq
    }
})();