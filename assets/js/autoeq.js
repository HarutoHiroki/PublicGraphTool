/*
 * https://github.com/peqdb/autoeq-c
 *
 * Copyright (C) 2026 PEQdB Inc.
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

AutoEq = (function() {
  const N = 384,
        X0 = 20,
        X1 = 20_000,
        LX0 = Math.log(X0),
        LX1 = Math.log(X1),
        LXR = LX1 - LX0;

  const LX = Array.from({ length: N }, (_, i) => LXR/(N - 1)*i + LX0);
  const X  = LX.map(Math.exp);

  /**
   * @typedef {'PK'|'LSC'|'HSC'} FilterType
   */

  /**
   * @typedef {{
   *   type: FilterType,
   *   f0: number,
   *   gain: number,
   *   q: number,
   * }} Filter
   */

  /**
   * @readonly
   * @enum {number}
   */
  const Type = Object.freeze({
    PK: 0,
    LSC: 1,
    HSC: 2,
  });

  /** @type {ReadonlyArray<FilterType>} */
  const TYPE_NAMES = Object.freeze(['PK', 'LSC', 'HSC']);

  /**
   * @readonly
   * @enum {number}
   */
  const Smooth = Object.freeze({
    NONE: 0,
    IE: 1,
    OE: 2,
  });

  /**
   * @typedef {[number, number]} Lim
   */

  /**
   * @typedef {{
   *   type: number,
   *   f0: Lim,
   *   gain: Lim,
   *   q: Lim,
   * }} Spec
   */

  /**
   * @typedef {{
   *   m: any,
   * }} Inst
   */

  /** @returns {Promise<Inst>} */
  async function make() {
    const m = await AutoEqModule();
    return { m };
  }

  /**
   * @typedef {{
   *   specs: Spec[],
   *   smooth: boolean,
   *   demean: boolean,
   * }} Config
   */

  /**
   * @type {{
   *   STANDARD: (n?: number) => Config,
   *   PRECISE: (n?: number) => Config,
   * }}
   */
  const CONFIGS = {
    STANDARD: (n, f_lo, f_hi, gain_lo, gain_hi, q_lo, q_hi) => ({
      specs: [
        { type: Type.LSC, f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] },
        { type: Type.HSC, f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] },
        ...Array(n - 2).fill(
          { type: Type.PK , f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] })
      ],
      smooth: true,
      demean: true,
    }),
    PRECISE: (n, f_lo, f_hi, gain_lo, gain_hi, q_lo, q_hi) => ({
      specs: [
        { type: Type.LSC, f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] },
        { type: Type.HSC, f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] },
        ...Array(n - 2).fill(
          { type: Type.PK , f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] })
      ],
      smooth: false,
      demean: true,
    }),
  };

  /**
   * @param {Inst} s
   * @param {ArrayLike<number>} dst
   * @param {ArrayLike<number>} src
   * @param {Config} config
   * @param {number} [smooth]
   * @param {number} [steps]
   * @param {number} [fs]
   * @returns {{ filters: Filter[], time: number, loss: number, amp: number } | null}
   */
  function run(s, dst, src, config, smooth = Smooth.NONE, steps = 3000, fs = 48_000) {
    if (dst.length !== N || src.length !== N) {
      console.error(`dst and src must have length ${N}`);
      return null;
    }

    const types = Int32Array.from(config.specs.map(s => s.type));

    let allocs = [];

    function alloc(sz) {
      const p = s.m._malloc(sz);
      allocs.push(p);
      return p;
    }

    const k = N,
          n = types.length;

    const pF   = alloc(k * 4),
          pDst = alloc(k * 4),
          pSrc = alloc(k * 4),
          pR   = alloc(k * 4);

    s.m.HEAPF32.set(X, pF >> 2);
    s.m.HEAPF32.set(dst, pDst >> 2);
    s.m.HEAPF32.set(src, pSrc >> 2);

    const pTypes = alloc(n * 4),
          pF0    = alloc(n * 4),
          pGain  = alloc(n * 4),
          pQ     = alloc(n * 4),
          pAmp   = alloc(4);

    s.m.HEAP32.set(types, pTypes >> 2);

    const pF0Lim   = alloc(n * 8),
          pGainLim = alloc(n * 8),
          pQLim    = alloc(n * 8);

    config.specs.forEach((spec, i) => {
      let p = (pF0Lim >> 2) + 2*i;
      s.m.HEAPF32[p + 0] = spec.f0[0];
      s.m.HEAPF32[p + 1] = spec.f0[1];

      p = (pGainLim >> 2) + 2*i;
      s.m.HEAPF32[p + 0] = spec.gain[0];
      s.m.HEAPF32[p + 1] = spec.gain[1];

      p = (pQLim >> 2) + 2*i;
      s.m.HEAPF32[p + 0] = spec.q[0];
      s.m.HEAPF32[p + 1] = spec.q[1];
    });

    let pSmooth = !config.smooth ? null
      : smooth == Smooth.IE ? s.m._get_ie_smooth()
      : smooth == Smooth.OE ? s.m._get_oe_smooth()
      : null;

    const t0 = performance.now();

    const mean = s.m._preprocess(pF, pDst, pSrc, pR, pSmooth, config.demean);
    const loss = s.m._autoeq(
      steps, pTypes, pF0, pGain, pQ, config.demean ? pAmp : 0,
      pF0Lim, pGainLim, pQLim,
      n, pF, pR, fs);

    const t1 = performance.now();

    const f0   = new Float32Array(s.m.HEAPF32.buffer, pF0, n),
          gain = new Float32Array(s.m.HEAPF32.buffer, pGain, n),
          q    = new Float32Array(s.m.HEAPF32.buffer, pQ, n);

    const amp = config.demean ? s.m.HEAPF32[pAmp >> 2] : 0;

    /** @type {Filter[]} */
    const filters = [];

    for (let i = 0; i < n; i++) {
      filters.push({
        type: TYPE_NAMES[types[i]] ?? /** @type {any} */ (types[i]),
        f0: f0[i],
        gain: gain[i],
        q: q[i],
      });
    }

    allocs.forEach(s.m._free);

    return {
      filters,
      time: t1 - t0,
      loss,
      amp: mean + amp,
    };
  }

  /**
   * @param {number[]} x
   * @param {number[]} y
   * @returns {number[]}
   */
  function interp(x, y) {
    if (x.length !== y.length) {
      console.error('x and y must have the same length');
      return [];
    }

    if (x.length < 2) {
      console.error('x and y must have length >= 2');
      return [];
    }

    const n = x.length;

    const lx = x.map(Math.log);
    const out = Array(X.length);

    let i = 0;
    for (let j = 0; j < X.length; ++j) {
      const t = Math.log(X[j]);

      if (t <= lx[0]) {
        out[j] = y[0];
        continue;
      }

      if (t >= lx[n - 1]) {
        out[j] = y[n - 1];
        continue;
      }

      while (i + 1 < n - 1 && lx[i + 1] < t)
        ++i;

      const x0 = lx[i],
            x1 = lx[i + 1];

      const den = x1 - x0;
      const u = den === 0 ? 0 : (t - x0) / den;

      out[j] = y[i] + u * (y[i + 1] - y[i]);
    }

    return out;
  }

  return {
    CONFIGS,
    make,
    run,
    interp,
    Smooth,
  };
})();
