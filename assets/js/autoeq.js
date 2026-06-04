/*
 * https://github.com/peqdb/autoeq-c
 *
 * Copyright (C) 2026 PEQdB Inc.
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const PK = 0,
	LSC = 1,
	HSC = 2,
	MAX_N = 32,
	K = 384;

function Core()
{

const MAX_W = 3*MAX_N + 1;

const TYPE_NAMES = [
	'PK',
	'LSC',
	'HSC',
];

const S = {
	b0: 0,
	b1: 0,
	b2: 0,
	a0: 0,
	a1: 0,
	a2: 0,
	db0_dA: 0,
	db1_dA: 0,
	db2_dA: 0,
	da0_dA: 0,
	da1_dA: 0,
	da2_dA: 0,
	db0_dalpha: 0,
	db2_dalpha: 0,
	da0_dalpha: 0,
	da2_dalpha: 0,
	db0_dcos: 0,
	db1_dcos: 0,
	db2_dcos: 0,
	da0_dcos: 0,
	da1_dcos: 0,
	da2_dcos: 0,
};

const IE_SMOOTH = {
	smooth_lo: .3,
	smooth_hi: .03,

	smooth_f0: 3000,
	smooth_f1: 12000,

	bias_lo: .0,
	bias_md: .15,
	bias_hi: .03,

	bias_f0: 10000,
	bias_f1: 13000,
	bias_f2: 14000,
	bias_f3: 20000,

	clip_f: 18500,
};

const OE_SMOOTH = {
	smooth_lo: .3,
	smooth_hi: .03,

	smooth_f0: 5000,
	smooth_f1: 15000,

	bias_lo: .0,
	bias_md: .3,
	bias_hi: .2,

	bias_f0: 6000,
	bias_f1: 9000,
	bias_f2: 9000,
	bias_f3: 20000,

	clip_f: 17000,
};

const dy_dw0 = Array(MAX_N),
	dy_dgain = Array(MAX_N),
	dy_dbw = Array(MAX_N),
	w0_v = new Float32Array(MAX_N),
	pred = new Float32Array(K),
	dL_dy = new Float32Array(K),
	r_init = new Float32Array(K),
	b = new Float32Array(K),
	w = new Float32Array(K);

for (let n = 0; n < MAX_N; ++n) {
	dy_dw0[n] = new Float32Array(K);
	dy_dgain[n] = new Float32Array(K);
	dy_dbw[n] = new Float32Array(K);
}

function clip(x, lo, hi)
{
	return Math.min(Math.max(x, lo), hi);
}

function sq(x)
{
	return x * x;
}

function exp10(x)
{
	return Math.exp(Math.LN10 * x);
}

function limit(x, lim)
{
	return clip(x, lim.lo, lim.hi);
}

function q_to_bw(Q)
{
	return 2 / Math.LN2 * Math.asinh(.5 / Q);
}

function bw_to_q(bw)
{
	return .5 / Math.sinh(.5*Math.LN2 * bw);
}

function pk(A, cos_w, alpha)
{
	const rA = 1 / A,
		rA2 = sq(rA);

	S.b0 = A*alpha + 1;
	S.b1 = -2*cos_w;
	S.b2 = -A*alpha + 1;
	S.a0 = (A + alpha)*rA;
	S.a1 = -2*cos_w;
	S.a2 = (A - alpha)*rA;

	S.db0_dA = alpha;
	S.db1_dA = 0;
	S.db2_dA = -alpha;
	S.da0_dA = -alpha*rA2;
	S.da1_dA = 0;
	S.da2_dA = alpha*rA2;

	S.db0_dalpha = A;
	S.db2_dalpha = -A;
	S.da0_dalpha = rA;
	S.da2_dalpha = -rA;

	S.db0_dcos = 0;
	S.db1_dcos = -2;
	S.db2_dcos = 0;
	S.da0_dcos = 0;
	S.da1_dcos = -2;
	S.da2_dcos = 0;

	return S;
}

function lsc(A, cos_w, alpha)
{
	const p1 = A + 1,
		m1 = A - 1,
		sqrt_A = Math.sqrt(A),
		k = 2*sqrt_A*alpha,
		dk_dA = alpha / sqrt_A,
		dk_dalpha = 2*sqrt_A;

	S.b0 = A*(-cos_w*m1 + k + p1);
	S.b1 = 2*A*(-cos_w*p1 + m1);
	S.b2 = A*(-cos_w*m1 - k + p1);
	S.a0 = cos_w*m1 + k + p1;
	S.a1 = -2*cos_w*p1 - 2*m1;
	S.a2 = cos_w*m1 - k + p1;

	S.db0_dA = -A*cos_w + A*dk_dA + 2*A - cos_w*m1 + k + p1;
	S.db1_dA = -4*A*cos_w + 4*A - 2*cos_w*p1 + 2*m1;
	S.db2_dA = -A*cos_w - A*dk_dA + 2*A - cos_w*m1 - k + p1;
	S.da0_dA = cos_w + dk_dA + 1;
	S.da1_dA = -2*cos_w - 2;
	S.da2_dA = cos_w - dk_dA + 1;

	S.db0_dalpha = A*dk_dalpha;
	S.db2_dalpha = -A*dk_dalpha;
	S.da0_dalpha = dk_dalpha;
	S.da2_dalpha = -dk_dalpha;

	S.db0_dcos = -A*m1;
	S.db1_dcos = -2*A*p1;
	S.db2_dcos = -A*m1;
	S.da0_dcos = m1;
	S.da1_dcos = -2*p1;
	S.da2_dcos = m1;

	return S;
}

function hsc(A, cos_w, alpha)
{
	const p1 = A + 1,
		m1 = A - 1,
		sqrt_A = Math.sqrt(A),
		k = 2*sqrt_A*alpha,
		dk_dA = alpha / sqrt_A,
		dk_dalpha = 2*sqrt_A;

	S.b0 = A*(cos_w*m1 + k + p1);
	S.b1 = -2*A*(cos_w*p1 + m1);
	S.b2 = A*(cos_w*m1 - k + p1);
	S.a0 = -cos_w*m1 + k + p1;
	S.a1 = -2*cos_w*p1 + 2*m1;
	S.a2 = -cos_w*m1 - k + p1;

	S.db0_dA = A*cos_w + A*dk_dA + 2*A + cos_w*m1 + k + p1;
	S.db1_dA = -4*A*cos_w - 4*A - 2*cos_w*p1 - 2*m1;
	S.db2_dA = A*cos_w - A*dk_dA + 2*A + cos_w*m1 - k + p1;
	S.da0_dA = -cos_w + dk_dA + 1;
	S.da1_dA = -2*cos_w + 2;
	S.da2_dA = -cos_w - dk_dA + 1;

	S.db0_dalpha = A*dk_dalpha;
	S.db2_dalpha = -A*dk_dalpha;
	S.da0_dalpha = dk_dalpha;
	S.da2_dalpha = -dk_dalpha;

	S.db0_dcos = A*m1;
	S.db1_dcos = -2*A*p1;
	S.db2_dcos = A*m1;
	S.da0_dcos = -m1;
	S.da1_dcos = -2*p1;
	S.da2_dcos = -m1;

	return S;
}

const BIQUAD_FNS = [
	pk,
	lsc,
	hsc,
];

function spectrum(type, f0, gain, Q, fs, f, y)
{
	const A = exp10(gain / 40),
		w0 = 2*Math.PI/fs * f0,
		cos_w = Math.cos(w0),
		sin_w = Math.sin(w0),
		alpha = sin_w * .5 / Q,
		s = BIQUAD_FNS[type](A, cos_w, alpha),
		b_x0 = sq(s.b0 + s.b1 + s.b2),
		b_x1 = -4*(s.b0*s.b1 + 4*s.b0*s.b2 + s.b1*s.b2),
		b_x2 = 16*s.b0*s.b2,
		a_x0 = sq(s.a0 + s.a1 + s.a2),
		a_x1 = -4*(s.a0*s.a1 + 4*s.a0*s.a2 + s.a1*s.a2),
		a_x2 = 16*s.a0*s.a2;

	for (let k = 0; k < K; ++k) {
		const phi = sq(Math.sin(Math.PI/fs * f[k])),
			b_poly = b_x0 + phi*(b_x1 + phi*b_x2),
			a_poly = a_x0 + phi*(a_x1 + phi*a_x2);

		y[k] += 10*Math.log10(b_poly / a_poly);
	}
}

function grad(c, x, g)
{
	const N = c.N,
		rK = 1 / K,
		opt_amp = !!c.opt_amp,
		pred_init = opt_amp ? exp10(x.v[3*N] / 10) : 1;

	for (let k = 0; k < K; ++k)
		pred[k] = pred_init;

	for (let n = 0; n < N; ++n) {
		const f0 = Math.exp(x.v[0*N + n]),
			gain = x.v[1*N + n],
			bw = x.v[2*N + n],
			A = exp10(gain / 40),
			w0 = 2*Math.PI/c.fs * f0,
			cos_w = Math.cos(w0),
			sin_w = Math.sin(w0),
			kQ = Math.sinh(.5*Math.LN2 * bw),
			alpha = sin_w * kQ,
			s = BIQUAD_FNS[c.types[n]](A, cos_w, alpha),
			dA_dgain = A * Math.LN10/40,
			dalpha_dw0 = cos_w * kQ,
			dalpha_dbw = sin_w * Math.cosh(.5*Math.LN2 * bw) * .5*Math.LN2,
			dcos_dw0 = -sin_w,
			b_x0 = sq(s.b0 + s.b1 + s.b2),
			b_x1 = -4*(s.b0*s.b1 + 4*s.b0*s.b2 + s.b1*s.b2),
			b_x2 = 16*s.b0*s.b2,
			a_x0 = sq(s.a0 + s.a1 + s.a2),
			a_x1 = -4*(s.a0*s.a1 + 4*s.a0*s.a2 + s.a1*s.a2),
			a_x2 = 16*s.a0*s.a2,
			ba = s.b0 + s.b1 + s.b2,
			aa = s.a0 + s.a1 + s.a2;

		w0_v[n] = w0;

		for (let k = 0; k < K; ++k) {
			const phi_k = c.phi[k],
				b_poly = b_x0 + phi_k*(b_x1 + phi_k*b_x2),
				a_poly = a_x0 + phi_k*(a_x1 + phi_k*a_x2);

			pred[k] *= b_poly / a_poly;

			const _8phi2 = 8*sq(phi_k),
				_2phi = 2*phi_k,
				bm = 20/Math.LN10 / b_poly,
				am = -20/Math.LN10 / a_poly,
				dy_db0 = bm * (ba - _2phi*(s.b1 + 4*s.b2) + _8phi2*s.b2),
				dy_db1 = bm * (ba - _2phi*(s.b0 + s.b2)),
				dy_db2 = bm * (ba - _2phi*(4*s.b0 + s.b1) + _8phi2*s.b0),
				dy_da0 = am * (aa - _2phi*(s.a1 + 4*s.a2) + _8phi2*s.a2),
				dy_da1 = am * (aa - _2phi*(s.a0 + s.a2)),
				dy_da2 = am * (aa - _2phi*(4*s.a0 + s.a1) + _8phi2*s.a0),
				dy_dA = dy_db0*s.db0_dA
					+ dy_db1*s.db1_dA
					+ dy_db2*s.db2_dA
					+ dy_da0*s.da0_dA
					+ dy_da1*s.da1_dA
					+ dy_da2*s.da2_dA,
				dy_dalpha = dy_db0*s.db0_dalpha
					+ dy_db2*s.db2_dalpha
					+ dy_da0*s.da0_dalpha
					+ dy_da2*s.da2_dalpha,
				dy_dcos = dy_db0*s.db0_dcos
					+ dy_db1*s.db1_dcos
					+ dy_db2*s.db2_dcos
					+ dy_da0*s.da0_dcos
					+ dy_da1*s.da1_dcos
					+ dy_da2*s.da2_dcos;

			dy_dw0[n][k] = dy_dalpha*dalpha_dw0 + dy_dcos*dcos_dw0;
			dy_dgain[n][k] = dy_dA*dA_dgain;
			dy_dbw[n][k] = dy_dalpha*dalpha_dbw;
		}
	}

	let L = 0,
		dL_dy_sum = 0;

	for (let k = 0; k < K; ++k) {
		const d = 10*Math.log10(pred[k]) - c.r[k];
		L += sq(d);
		dL_dy_sum += dL_dy[k] = 2*d;
	}

	L *= rK;
	g.v[3*N] = opt_amp ? dL_dy_sum * rK : 0;

	for (let n = 0; n < N; ++n) {
		let glf = 0,
			ggain = 0,
			gbw = 0;

		for (let k = 0; k < K; ++k) {
			glf += dL_dy[k]*dy_dw0[n][k];
			ggain += dL_dy[k]*dy_dgain[n][k];
			gbw += dL_dy[k]*dy_dbw[n][k];
		}

		g.v[0*N + n] = glf * rK * w0_v[n];
		g.v[1*N + n] = ggain * rK;
		g.v[2*N + n] = gbw * rK;
	}

	return L;
}

function make_adabelief(N)
{
	const s = {
		m: { v: new Float32Array(MAX_W) },
		s: { v: new Float32Array(MAX_W) },
		b1: 0,
		b2: 0,
		b1t: 0,
		b2t: 0,
		eps: 0,
		eps_root: 0,
		lr: 0,
		N: 0,
		step: 0,
	};

	s.b1t = s.b1 = .9;
	s.b2t = s.b2 = .99;
	s.eps = 1e-12;
	s.eps_root = 1e-12;
	s.lr = 3e-2;
	s.N = N;
	s.step = 0;

	for (let w = 0; w < 3*N + 1; ++w)
		s.m.v[w] = s.s.v[w] = 0;

	return s;
}

function adabelief_step(s, x, g)
{
	const N = s.N;

	for (let w = 0; w < 3*N + 1; ++w) {
		s.m.v[w] = s.b1*s.m.v[w] + (1 - s.b1)*g.v[w];
		s.s.v[w] = s.b2*s.s.v[w] + (1 - s.b2)*sq(g.v[w] - s.m.v[w]);

		const m_hat = s.m.v[w] / (1 - s.b1t),
			s_hat = s.s.v[w] / (1 - s.b2t),
			den = Math.sqrt(s_hat + s.eps_root) + s.eps;

		x.v[w] -= s.lr * m_hat / den;
	}

	s.b1t *= s.b1;
	s.b2t *= s.b2;

	++s.step;
}

function search(x, n, v)
{
	let idx = -1,
		best = 1e9;

	for (let i = 0; i < n; ++i) {
		const d = Math.abs(x[i] - v);
		if (d < best) {
			best = d;
			idx = i;
		}
	}

	return idx;
}

function sgm(x, x0, x1)
{
	const SMOOTH = 4,
		k = SMOOTH / (x1 - x0),
		m = .5 * (x0 + x1),
		y = k * (x - m);

	return .5*Math.tanh(.5*y) + .5;
}

function fit(steps, types, f0, gain, Q, amp, f0_lim, gain_lim, Q_lim, N, f, r, fs)
{
	const lf_lim = Array(MAX_N),
		bw_lim = Array(MAX_N);

	for (let n = 0; n < N; ++n) {
		lf_lim[n] = {
			lo: Math.log(f0_lim[n].lo),
			hi: Math.log(f0_lim[n].hi),
		};
		bw_lim[n] = {
			lo: q_to_bw(Q_lim[n].hi),
			hi: q_to_bw(Q_lim[n].lo),
		};
	}

	const phi = new Float32Array(K);
	for (let k = 0; k < K; ++k)
		phi[k] = sq(Math.sin(Math.PI / fs * f[k]));

	const x = { v: new Float32Array(MAX_W) };

	for (let n = 0; n < N; ++n) {
		x.v[0*N + n] = Math.log(f0[n]);
		x.v[1*N + n] = gain[n];
		x.v[2*N + n] = q_to_bw(Q[n]);
	}
	x.v[3*N] = amp ? amp[0] : 0;

	const g = { v: new Float32Array(MAX_W) },
		best = { v: new Float32Array(MAX_W) };

	let L,
		best_L = 1e9;

	const c = {
		types,
		phi,
		r,
		fs,
		N,
		opt_amp: !!amp,
	};

	const opt = make_adabelief(N);

	for (let step = 0; step < steps; ++step) {
		L = grad(c, x, g);

		adabelief_step(opt, x, g);

		for (let n = 0; n < N; ++n) {
			let x0 = x.v[0*N + n];
			x.v[0*N + n] = limit(x.v[0*N + n], lf_lim[n]);
			if (x.v[0*N + n] !== x0)
				opt.m.v[0*N + n] = 0;

			x0 = x.v[1*N + n];
			x.v[1*N + n] = limit(x.v[1*N + n], gain_lim[n]);
			if (x.v[1*N + n] !== x0)
				opt.m.v[1*N + n] = 0;

			x0 = x.v[2*N + n];
			x.v[2*N + n] = limit(x.v[2*N + n], bw_lim[n]);
			if (x.v[2*N + n] !== x0)
				opt.m.v[2*N + n] = 0;
		}

		if (L < best_L) {
			best_L = L;
			for (let w = 0; w < 3*N + 1; ++w)
				best.v[w] = x.v[w];
		}
	}

	for (let n = 0; n < N; ++n) {
		f0[n] = Math.exp(best.v[0*N + n]);
		gain[n] = best.v[1*N + n];
		Q[n] = bw_to_q(best.v[2*N + n]);
	}

	if (amp)
		amp[0] = best.v[3*N];

	return L;
}

function largest_peak(x, f, lim)
{
	const H = K / 2,
		peaks = new Int32Array(H),
		prominences = new Float32Array(H),
		left_bases = new Int32Array(H),
		right_bases = new Int32Array(H);

	let n = 0,
		i_max = K - 1;

	for (let i = 1; i < i_max; ++i) {
		if (f[i] < lim.lo || f[i] > lim.hi)
			continue;

		if (x[i - 1] >= x[i])
			continue;

		let i_ahead = i + 1;
		while (i_ahead < i_max && x[i_ahead] === x[i])
			++i_ahead;

		if (x[i_ahead] < x[i]) {
			const left_edge = i,
				right_edge = i_ahead - 1;

			peaks[n] = (left_edge + right_edge) >> 1;

			++n;
			i = i_ahead;
		}
	}

	for (let p = 0; p < n; ++p) {
		const peak = peaks[p];

		let i_min = 0,
			i_max = K - 1;

		const x_peak = x[peak];

		left_bases[p] = peak;
		let left_min = x_peak;
		for (let i = peak; i_min <= i && x[i] <= x_peak; --i) {
			if (x[i] < left_min) {
				left_min = x[i];
				left_bases[p] = i;
			}
		}

		right_bases[p] = peak;
		let right_min = x_peak;
		for (let i = peak; i <= i_max && x[i] <= x_peak; ++i) {
			if (x[i] < right_min) {
				right_min = x[i];
				right_bases[p] = i;
			}
		}

		prominences[p] = x_peak - Math.max(left_min, right_min);
	}

	let largest = { width: 0, height: 0, idx: 0 },
		largest_size = 0;

	for (let p = 0; p < n; ++p) {
		const i_min = left_bases[p],
			i_max = right_bases[p],
			peak = peaks[p],
			x_peak = x[peak],
			height = x_peak - .5*prominences[p];

		let i = peak;
		while (i_min < i && height < x[i])
			--i;

		let left_ip = i;
		if (x[i] < height)
			left_ip += (height - x[i]) / (x[i + 1] - x[i]);

		i = peak;
		while (i < i_max && height < x[i])
			++i;

		let right_ip = i;
		if (x[i] < height)
			right_ip -= (height - x[i]) / (x[i - 1] - x[i]);

		const width = right_ip - left_ip,
			size = width * x_peak;

		if (size > largest_size) {
			largest = { idx: peak, width, height: x_peak };
			largest_size = size;
		}
	}

	return largest;
}

function init_pk(y, f, fs, f0_lim, gain_lim, Q_lim)
{
	void fs;

	const rect = new Float32Array(K);

	for (let k = 0; k < K; ++k)
		rect[k] = Math.max(y[k], 0);
	const peak = largest_peak(rect, f, f0_lim);

	for (let k = 0; k < K; ++k)
		rect[k] = Math.max(-y[k], 0);
	const dip = largest_peak(rect, f, f0_lim);

	const p = peak.width*peak.height > dip.width*dip.height ? peak : dip,
		f_0 = f[p.idx],
		gain = p.idx === peak.idx ? peak.height : -dip.height,
		bw = p.width * Math.log(f[1] / f[0]) / Math.LN2,
		bw_exp2 = Math.exp(Math.LN2 * bw),
		Q = Math.sqrt(bw_exp2) / (bw_exp2 - 1);

	return {
		f0: f_0,
		gain: limit(gain, gain_lim),
		Q: limit(Q, Q_lim),
	};
}

function init_lsc(y, f, fs, f0_lim, gain_lim, Q_lim)
{
	f0_lim = {
		lo: Math.max(f0_lim.lo, 40),
		hi: Math.min(f0_lim.hi, 10000),
	};

	let best = 0,
		best_idx = 0,
		a = 0;

	for (let k = 0; k < K; ++k) {
		a += y[k];

		const avg = Math.abs(a / (k + 1));
		if (avg > best) {
			best = avg;
			best_idx = k;
		}
	}

	const f0 = limit(f[best_idx], f0_lim),
		Q = limit(Math.SQRT1_2, Q_lim);

	w.fill(0);
	spectrum(LSC, f0, 1, Q, fs, f, w);

	let p = 0,
		c = 0;
	for (let k = 0; k < K; ++k) {
		p += w[k] * y[k];
		c += w[k];
	}

	return {
		f0,
		gain: limit(p / c, gain_lim),
		Q,
	};
}

function init_hsc(y, f, fs, f0_lim, gain_lim, Q_lim)
{
	f0_lim = {
		lo: Math.max(f0_lim.lo, 40),
		hi: Math.min(f0_lim.hi, 10000),
	};

	let best = 0,
		best_idx = 0,
		a = 0;

	for (let k = 0; k < K; ++k) {
		a += y[K - 1 - k];

		const avg = Math.abs(a / (k + 1));
		if (avg > best) {
			best = avg;
			best_idx = K - 1 - k;
		}
	}

	const f0 = limit(f[best_idx], f0_lim),
		Q = limit(Math.SQRT1_2, Q_lim);

	w.fill(0);
	spectrum(HSC, f0, 1, Q, fs, f, w);

	let p = 0,
		c = 0;
	for (let k = 0; k < K; ++k) {
		p += w[k] * y[k];
		c += w[k];
	}

	return {
		f0,
		gain: limit(p / c, gain_lim),
		Q,
	};
}

const INIT_FNS = [
	init_pk,
	init_lsc,
	init_hsc,
];

function adaptive_smooth(s, f, r)
{
	const H = 48,
		smooth_l0 = Math.log(s.smooth_f0),
		smooth_l1 = Math.log(s.smooth_f1),
		bias_l0 = Math.log(s.bias_f0),
		bias_l1 = Math.log(s.bias_f1),
		bias_l2 = Math.log(s.bias_f2),
		bias_l3 = Math.log(s.bias_f3),
		x = new Float32Array(K);

	x.set(r);

	const clip_idx = search(f, K, s.clip_f);

	for (let k = 0; k < K; ++k) {
		const f_k = f[k],
			l = Math.log(f_k),
			x_k = x[k],
			sigma = s.smooth_lo + (s.smooth_hi - s.smooth_lo)*sgm(l, smooth_l0, smooth_l1),
			bias = s.bias_lo + (s.bias_md - s.bias_lo)*sgm(l, bias_l0, bias_l1)
						  + (s.bias_hi - s.bias_md)*sgm(l, bias_l2, bias_l3);

		let a = 0,
			c = 0;

		for (let j = -H; j <= H; ++j) {
			let s = k + j;
			s = s < 0 ? 0
			  : s > clip_idx ? clip_idx
			  : s;

			const x_s = x[s],
				d_spatial = sq(j * sigma),
				d_range = bias * (x_s - x_k),
				w = Math.exp(-.5*d_spatial + d_range);

			a += w * x[s];
			c += w;
		}

		r[k] = a / c;
	}
}

function center_mean(x, n)
{
	let sum = 0;
	for (let i = 0; i < n; ++i)
		sum += x[i];

	const mean = sum / n;
	for (let i = 0; i < n; ++i)
		x[i] -= mean;

	return mean;
}

function treble_rolloff(f, r, f_treble)
{
	const treble_idx = search(f, K, f_treble),
		n_treble = K - treble_idx,
		inv = 1 / (n_treble - 1);

	for (let i = 0; i < n_treble; ++i) {
		const t = i * inv,
			w = Math.cos(.5*Math.PI * t);

		r[treble_idx + i] *= w;
	}
}

function preprocess(f, dst, src, r, smooth, demean)
{
	const F_TREBLE_SMOOTH = 16000,
		F_TREBLE_UNSMOOTH = 18500;

	b.set(src);

	if (smooth)
		adaptive_smooth(smooth, f, b);

	for (let k = 0; k < K; ++k)
		r[k] = dst[k] - b[k];

	let mean = 0;
	if (demean)
		mean = center_mean(r, K);

	if (smooth)
		treble_rolloff(f, r, smooth ? F_TREBLE_SMOOTH : F_TREBLE_UNSMOOTH);

	return mean;
}

function autoeq(steps, types, f0, gain, Q, amp, f0_lim, gain_lim, Q_lim, N, f, r, fs)
{
	r_init.set(r);

	for (let n = 0; n < N; ++n) {
		const type = types[n],
			p = INIT_FNS[type](r_init, f, fs, f0_lim[n], gain_lim[n], Q_lim[n]);

		spectrum(type, p.f0, -p.gain, p.Q, fs, f, r_init);

		f0[n] = p.f0;
		gain[n] = p.gain;
		Q[n] = p.Q;
	}

	if (amp)
		amp[0] = 0;

	return fit(steps, types, f0, gain, Q, amp, f0_lim, gain_lim, Q_lim, N, f, r, fs);
}

function get_ie_smooth()
{
	return IE_SMOOTH;
}

function get_oe_smooth()
{
	return OE_SMOOTH;
}

return {
	spectrum,
	preprocess,
	autoeq,
	get_ie_smooth,
	get_oe_smooth,
};
}

var AutoEq = (function() {
	const X0 = 20,
		X1 = 20_000,
		LX0 = Math.log(X0),
		LX1 = Math.log(X1),
		LXR = LX1 - LX0;

	const LX = Array.from({ length: K }, (_, i) => LXR/(K - 1)*i + LX0);
	const X = LX.map(Math.exp);

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
		PK,
		LSC,
		HSC,
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
		return { m: Core() };
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
	 *   STANDARD: (n?: number, f_lo?: number, f_hi?: number, gain_lo?: number, gain_hi?: number, q_lo?: number, q_hi?: number) => Config,
	 *   PRECISE: (n?: number, f_lo?: number, f_hi?: number, gain_lo?: number, gain_hi?: number, q_lo?: number, q_hi?: number) => Config,
	 * }}
	 */
	const CONFIGS = {
		STANDARD: (n = MAX_N, f_lo = 20, f_hi = 16_000, gain_lo = -16, gain_hi = 16, q_lo = .4, q_hi = 4) => ({
			specs: [
				{ type: Type.LSC, f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] },
				{ type: Type.HSC, f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] },
				...Array(n - 2).fill(
					{ type: Type.PK, f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] })
			],
			smooth: true,
			demean: true,
		}),
		PRECISE: (n = MAX_N, f_lo = 20, f_hi = 16_000, gain_lo = -16, gain_hi = 16, q_lo = .4, q_hi = 4) => ({
			specs: [
				{ type: Type.LSC, f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] },
				{ type: Type.HSC, f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] },
				...Array(n - 2).fill(
					{ type: Type.PK, f0: [f_lo, f_hi], gain: [gain_lo, gain_hi], q: [q_lo, q_hi] })
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
	function run(s, dst, src, config, smooth = Smooth.NONE, steps = 2000, fs = 48_000) {

		if (dst.length !== K || src.length !== K) {
			console.error(`dst and src must have length ${K}`);
			return null;
		}

		const types = Int32Array.from(config.specs.map((spec) => spec.type));

		const n = types.length;
		if (n <= 0 || n > MAX_N) {
			console.error(`config.specs must have length 1-${MAX_N}`);
			return null;
		}

		const f0 = new Float32Array(n),
			gain = new Float32Array(n),
			q = new Float32Array(n),
			amp = new Float32Array(1),
			r = new Float32Array(K),
			f0_lim = Array(n),
			gain_lim = Array(n),
			q_lim = Array(n);

		config.specs.forEach((spec, i) => {
			f0_lim[i] = { lo: spec.f0[0], hi: spec.f0[1] };
			gain_lim[i] = { lo: spec.gain[0], hi: spec.gain[1] };
			q_lim[i] = { lo: spec.q[0], hi: spec.q[1] };
		});

		let s0 = !config.smooth ? null
			: smooth == Smooth.IE ? s.m.get_ie_smooth()
			: smooth == Smooth.OE ? s.m.get_oe_smooth()
			: null;

		const t0 = performance.now();

		const mean = s.m.preprocess(X, dst, src, r, s0, config.demean);
		const loss = s.m.autoeq(
			steps,
			types,
			f0,
			gain,
			q,
			config.demean ? amp : null,
			f0_lim,
			gain_lim,
			q_lim,
			n,
			X,
			r,
			fs,
		);

		const t1 = performance.now();

		const amp0 = config.demean ? amp[0] : 0;

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

		return {
			filters,
			time: t1 - t0,
			loss,
			amp: mean + amp0,
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
