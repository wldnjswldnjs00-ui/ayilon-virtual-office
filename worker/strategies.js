// 9 trading strategies: 3 scalping / 3 short-term / 3 swing
// Each returns { signal:'buy'|'sell'|'hold', confidence:0-1, reason:string, sl:pct, tp:pct }

import { closes, volumes, ema, rsi, macd, bb, stoch } from './indicators.js';
import { getCandles } from './okx.js';

const hold = (reason) => ({ signal: 'hold', confidence: 0.5, reason, sl: 0, tp: 0 });

// ── SCALPING (1m / 5m) ───────────────────────────────────────────────────────

export async function scalp_emaCross(symbol) {
  const c = await getCandles(symbol, '1m', 50);
  const cl = closes(c);
  const e9 = ema(cl, 9), e21 = ema(cl, 21);
  const [p9, c9] = [e9[e9.length - 2], e9[e9.length - 1]];
  const [p21, c21] = [e21[e21.length - 2], e21[e21.length - 1]];
  if (p9 != null && p21 != null) {
    if (p9 <= p21 && c9 > c21) return { signal: 'buy',  confidence: 0.65, reason: 'EMA9↑EMA21 (1m)', sl: 0.003, tp: 0.007 };
    if (p9 >= p21 && c9 < c21) return { signal: 'sell', confidence: 0.65, reason: 'EMA9↓EMA21 (1m)', sl: 0.003, tp: 0.007 };
  }
  return hold('EMA no cross');
}

export async function scalp_rsiBounce(symbol) {
  const c = await getCandles(symbol, '5m', 60);
  const cl = closes(c);
  const rv = rsi(cl, 14);
  const [pr, cr] = [rv[rv.length - 2], rv[rv.length - 1]];
  if (cr == null) return hold('RSI N/A');
  if (pr < 32 && cr > pr) return { signal: 'buy',  confidence: 0.70, reason: `RSI ${cr.toFixed(1)} 과매도 반등`, sl: 0.005, tp: 0.012 };
  if (pr > 68 && cr < pr) return { signal: 'sell', confidence: 0.70, reason: `RSI ${cr.toFixed(1)} 과매수 하락`, sl: 0.005, tp: 0.012 };
  return hold(`RSI ${cr.toFixed(1)}`);
}

export async function scalp_volBreak(symbol) {
  const c = await getCandles(symbol, '1m', 30);
  const vl = volumes(c);
  const cl = closes(c);
  const avgVol = vl.slice(0, -1).reduce((a, b) => a + b, 0) / (vl.length - 1);
  const lastVol = vl[vl.length - 1];
  const chg = (cl[cl.length - 1] - cl[cl.length - 2]) / cl[cl.length - 2];
  const ratio = lastVol / avgVol;
  if (ratio > 2.5 && chg > 0.001) return { signal: 'buy',  confidence: 0.68, reason: `볼륨 ${ratio.toFixed(1)}x 급등`, sl: 0.004, tp: 0.009 };
  if (ratio > 2.5 && chg < -0.001) return { signal: 'sell', confidence: 0.68, reason: `볼륨 ${ratio.toFixed(1)}x 급락`, sl: 0.004, tp: 0.009 };
  return hold(`볼륨 ${ratio.toFixed(1)}x`);
}

// ── SHORT-TERM (15m / 1h) ────────────────────────────────────────────────────

export async function short_macdCross(symbol) {
  const c = await getCandles(symbol, '15m', 100);
  const cl = closes(c);
  const { macdLine: ml, signalLine: sl } = macd(cl);
  const [pm, cm] = [ml[ml.length - 2], ml[ml.length - 1]];
  const [ps, cs] = [sl[sl.length - 2], sl[sl.length - 1]];
  if (pm == null || ps == null) return hold('MACD N/A');
  if (pm <= ps && cm > cs && cm < 0) return { signal: 'buy',  confidence: 0.72, reason: 'MACD 골든크로스 (15m)', sl: 0.015, tp: 0.035 };
  if (pm >= ps && cm < cs && cm > 0) return { signal: 'sell', confidence: 0.72, reason: 'MACD 데드크로스 (15m)', sl: 0.015, tp: 0.035 };
  return hold('MACD 크로스 없음');
}

export async function short_stochEma(symbol) {
  const c = await getCandles(symbol, '1H', 80);
  const cl = closes(c);
  const sv = stoch(c, 14);
  const e50 = ema(cl, 50);
  const price = cl[cl.length - 1];
  const [pS, cS] = [sv[sv.length - 2], sv[sv.length - 1]];
  const e50v = e50[e50.length - 1];
  if (cS == null || e50v == null) return hold('지표 N/A');
  if (pS < 22 && cS > pS && price > e50v) return { signal: 'buy',  confidence: 0.74, reason: `스토캐스틱 ${cS.toFixed(0)} 반등 + EMA50 위`, sl: 0.02, tp: 0.045 };
  if (pS > 78 && cS < pS && price < e50v) return { signal: 'sell', confidence: 0.74, reason: `스토캐스틱 ${cS.toFixed(0)} 하락 + EMA50 아래`, sl: 0.02, tp: 0.045 };
  return hold(`스토캐스틱 ${cS.toFixed(0)}`);
}

export async function short_breakout(symbol) {
  const c = await getCandles(symbol, '4H', 25);
  const cl = closes(c);
  const price = cl[cl.length - 1];
  const prevHi = Math.max(...c.slice(0, -1).map(x => parseFloat(x[2])));
  const prevLo = Math.min(...c.slice(0, -1).map(x => parseFloat(x[3])));
  if (price > prevHi * 1.002) return { signal: 'buy',  confidence: 0.76, reason: `${prevHi.toFixed(0)} 돌파 (4H 20봉 고점)`, sl: 0.025, tp: 0.07 };
  if (price < prevLo * 0.998) return { signal: 'sell', confidence: 0.76, reason: `${prevLo.toFixed(0)} 하향돌파 (4H 20봉 저점)`, sl: 0.025, tp: 0.07 };
  return hold('돌파 없음');
}

// ── SWING (4H / Daily) ────────────────────────────────────────────────────────

export async function swing_emaTrend(symbol) {
  const c = await getCandles(symbol, '4H', 220);
  const cl = closes(c);
  const e50 = ema(cl, 50), e200 = ema(cl, 200);
  const rv = rsi(cl, 14);
  const price = cl[cl.length - 1];
  const [v50, v200, vRsi] = [e50[e50.length - 1], e200[e200.length - 1], rv[rv.length - 1]];
  if (v50 == null || v200 == null) return hold('EMA 데이터 부족');
  if (v50 > v200 && price > v50 && vRsi > 50 && vRsi < 70)
    return { signal: 'buy',  confidence: 0.78, reason: `EMA50>${v200.toFixed(0)} 상승추세 RSI ${vRsi.toFixed(0)}`, sl: 0.05, tp: 0.12 };
  if (v50 < v200 && price < v50 && vRsi < 50 && vRsi > 30)
    return { signal: 'sell', confidence: 0.78, reason: `EMA50<${v200.toFixed(0)} 하락추세 RSI ${vRsi.toFixed(0)}`, sl: 0.05, tp: 0.12 };
  return hold('추세 불명확');
}

export async function swing_bbBounce(symbol) {
  const c = await getCandles(symbol, '4H', 50);
  const cl = closes(c);
  const bbv = bb(cl, 20, 2);
  const curr = bbv[bbv.length - 1];
  const price = cl[cl.length - 1];
  if (!curr) return hold('BB N/A');
  const distL = (price - curr.lower) / curr.lower;
  const distU = (curr.upper - price) / price;
  if (distL < 0.006) return { signal: 'buy',  confidence: 0.73, reason: `BB 하단 터치 ${curr.lower.toFixed(2)}`, sl: 0.03, tp: 0.065 };
  if (distU < 0.006) return { signal: 'sell', confidence: 0.73, reason: `BB 상단 터치 ${curr.upper.toFixed(2)}`, sl: 0.03, tp: 0.065 };
  return hold('BB 중간권');
}

export async function swing_rsiDiv(symbol) {
  const c = await getCandles(symbol, '4H', 60);
  const cl = closes(c);
  const rv = rsi(cl, 14);
  const [price, p10] = [cl[cl.length - 1], cl[cl.length - 10]];
  const [rsiNow, rsi10] = [rv[rv.length - 1], rv[rv.length - 10]];
  if (rsiNow == null || rsi10 == null) return hold('RSI 다이버전스 N/A');
  // 강세 다이버전스: 가격 신저점 but RSI 고점
  if (price < p10 * 0.98 && rsiNow > rsi10 && rsiNow < 45)
    return { signal: 'buy',  confidence: 0.80, reason: `강세 다이버전스 RSI ${rsiNow.toFixed(0)}↑ 가격↓`, sl: 0.04, tp: 0.10 };
  // 약세 다이버전스: 가격 신고점 but RSI 저점
  if (price > p10 * 1.02 && rsiNow < rsi10 && rsiNow > 55)
    return { signal: 'sell', confidence: 0.80, reason: `약세 다이버전스 RSI ${rsiNow.toFixed(0)}↓ 가격↑`, sl: 0.04, tp: 0.10 };
  return hold('다이버전스 없음');
}

export const STRATEGIES = [
  { name: 'scalp_emaCross', fn: scalp_emaCross, type: 'scalping', everyN: 1  },
  { name: 'scalp_rsiBounce', fn: scalp_rsiBounce, type: 'scalping', everyN: 1 },
  { name: 'scalp_volBreak',  fn: scalp_volBreak,  type: 'scalping', everyN: 1 },
  { name: 'short_macdCross', fn: short_macdCross, type: 'short',    everyN: 15 },
  { name: 'short_stochEma',  fn: short_stochEma,  type: 'short',    everyN: 15 },
  { name: 'short_breakout',  fn: short_breakout,  type: 'short',    everyN: 15 },
  { name: 'swing_emaTrend',  fn: swing_emaTrend,  type: 'swing',    everyN: 60 },
  { name: 'swing_bbBounce',  fn: swing_bbBounce,  type: 'swing',    everyN: 60 },
  { name: 'swing_rsiDiv',    fn: swing_rsiDiv,    type: 'swing',    everyN: 60 },
];
