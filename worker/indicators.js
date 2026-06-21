// Technical indicators — pure functions, candle format: [ts, open, high, low, close, vol, ...]
export const closes  = c => c.map(x => parseFloat(x[4]));
export const highs   = c => c.map(x => parseFloat(x[2]));
export const lows    = c => c.map(x => parseFloat(x[3]));
export const volumes = c => c.map(x => parseFloat(x[5]));

export function ema(prices, period) {
  if (prices.length < period) return [];
  const k = 2 / (period + 1);
  let val = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const out = new Array(period - 1).fill(null);
  out.push(val);
  for (let i = period; i < prices.length; i++) {
    val = prices[i] * k + val * (1 - k);
    out.push(val);
  }
  return out;
}

export function rsi(prices, period = 14) {
  if (prices.length < period + 1) return [];
  const out = new Array(period).fill(null);
  let g = 0, l = 0;
  for (let i = 1; i <= period; i++) {
    const d = prices[i] - prices[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  let ag = g / period, al = l / period;
  for (let i = period; i < prices.length; i++) {
    if (i > period) {
      const d = prices[i] - prices[i - 1];
      ag = (ag * (period - 1) + Math.max(d, 0)) / period;
      al = (al * (period - 1) + Math.max(-d, 0)) / period;
    }
    out.push(al === 0 ? 100 : 100 - 100 / (1 + ag / al));
  }
  return out;
}

export function macd(prices, fast = 12, slow = 26, sig = 9) {
  const fe = ema(prices, fast);
  const se = ema(prices, slow);
  const ml = prices.map((_, i) => fe[i] != null && se[i] != null ? fe[i] - se[i] : null);
  const valid = ml.filter(v => v != null);
  const se2 = ema(valid, sig);
  let vi = 0;
  const sl = ml.map(v => {
    if (v == null) return null;
    return se2[vi++] ?? null;
  });
  return { macdLine: ml, signalLine: sl };
}

export function bb(prices, period = 20, mult = 2) {
  const out = new Array(period - 1).fill(null);
  for (let i = period - 1; i < prices.length; i++) {
    const sl = prices.slice(i - period + 1, i + 1);
    const mean = sl.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(sl.reduce((s, p) => s + (p - mean) ** 2, 0) / period);
    out.push({ upper: mean + mult * std, mid: mean, lower: mean - mult * std });
  }
  return out;
}

export function stoch(candles, period = 14) {
  const out = new Array(period - 1).fill(null);
  for (let i = period - 1; i < candles.length; i++) {
    const sl = candles.slice(i - period + 1, i + 1);
    const hi = Math.max(...sl.map(c => parseFloat(c[2])));
    const lo = Math.min(...sl.map(c => parseFloat(c[3])));
    const cl = parseFloat(sl[sl.length - 1][4]);
    out.push(hi === lo ? 50 : ((cl - lo) / (hi - lo)) * 100);
  }
  return out;
}
