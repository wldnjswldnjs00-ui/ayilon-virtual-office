// Trading bot orchestrator — runs in Cloudflare Workers cron
import { STRATEGIES } from './strategies.js';
import { getBalance, getTicker, placeOrder } from './okx.js';

const SYMBOLS = ['BTC-USDT', 'ETH-USDT', 'SOL-USDT'];
const RISK_PCT = 0.01;          // 1% portfolio risk per trade
const MAX_ALLOC = 0.30;         // max 30% of balance per trade
const MAX_OPEN  = 3;            // max concurrent open trades

async function openTradeCount(env) {
  const r = await env.DB.prepare('SELECT COUNT(*) as n FROM trades WHERE status=?').bind('open').first();
  return r?.n || 0;
}

async function saveTrade(env, strat, sym, side, usdtSz, entryPrice, baseQty, sl, tp) {
  const slP = side === 'buy' ? entryPrice * (1 - sl) : entryPrice * (1 + sl);
  const tpP = side === 'buy' ? entryPrice * (1 + tp) : entryPrice * (1 - tp);
  await env.DB.prepare(
    `INSERT INTO trades (strategy,symbol,side,usdt_size,base_qty,entry_price,sl_price,tp_price,status)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).bind(strat, sym, side, usdtSz, baseQty, entryPrice, slP, tpP, 'open').run();
}

async function saveSignal(env, strat, sym, sig, price) {
  await env.DB.prepare(
    `INSERT INTO signals (strategy,symbol,signal,price,confidence,reason) VALUES (?,?,?,?,?,?)`
  ).bind(strat, sym, sig.signal, price, sig.confidence, sig.reason).run();
}

// Check open trades against current price for SL/TP
async function checkPositions(env) {
  const { results: open } = await env.DB.prepare(
    'SELECT * FROM trades WHERE status=?'
  ).bind('open').all();

  for (const t of open) {
    const ticker = await getTicker(t.symbol);
    if (!ticker) continue;
    const price = parseFloat(ticker.last);

    let hit = false;
    if (t.side === 'buy'  && (price <= t.sl_price || price >= t.tp_price)) hit = true;
    if (t.side === 'sell' && (price >= t.sl_price || price <= t.tp_price)) hit = true;

    if (!hit) continue;

    const pnlPct = t.side === 'buy'
      ? (price - t.entry_price) / t.entry_price
      : (t.entry_price - price) / t.entry_price;
    const pnlUsdt = t.usdt_size * pnlPct;

    if (env.OKX_API_KEY) {
      const closeSide = t.side === 'buy' ? 'sell' : 'buy';
      const closeSz = t.side === 'buy' ? t.base_qty : t.usdt_size;
      await placeOrder(env, t.symbol, closeSide, closeSz).catch(() => {});
    }

    await env.DB.prepare(
      `UPDATE trades SET status='closed',exit_price=?,pnl_usdt=?,closed_at=unixepoch() WHERE id=?`
    ).bind(price, pnlUsdt, t.id).run();

    await env.DB.prepare(
      `INSERT INTO feed (agent_id,agent_code,agent_name,agent_team,msg,is_ai)
       VALUES ('IRON','IRN','IRON','전략팀',?,0)`
    ).bind(
      `[봇] ${t.symbol} ${t.side.toUpperCase()} 청산 ${pnlPct >= 0 ? '✅' : '❌'} ${pnlPct >= 0 ? '+' : ''}${(pnlPct*100).toFixed(2)}% (${pnlUsdt >= 0 ? '+' : ''}$${pnlUsdt.toFixed(2)})`
    ).run();
  }
}

export async function runBot(env, minuteOfHour) {
  if (!env.OKX_API_KEY) {
    // Simulation mode: still run signals but no real orders
  }

  await checkPositions(env);

  const open = await openTradeCount(env);
  if (open >= MAX_OPEN) return { skip: `포지션 최대 (${open}/${MAX_OPEN})` };

  const balance = env.OKX_API_KEY ? await getBalance(env) : 1000; // sim: $1000
  if (balance < 5) return { skip: '잔고 부족' };

  const results = [];

  for (const sym of SYMBOLS) {
    if ((await openTradeCount(env)) >= MAX_OPEN) break;

    for (const s of STRATEGIES) {
      // Respect everyN: skip if this minute doesn't match
      if (minuteOfHour % s.everyN !== 0) continue;

      let sig;
      try { sig = await s.fn(sym); }
      catch (e) { continue; }

      const ticker = await getTicker(sym);
      const price = parseFloat(ticker?.last || 0);
      await saveSignal(env, s.name, sym, sig, price);

      if (sig.signal === 'hold' || sig.confidence < 0.65) continue;
      if ((await openTradeCount(env)) >= MAX_OPEN) break;

      const riskAmt  = balance * RISK_PCT;
      const fromRisk = riskAmt / sig.sl;          // USDT size by risk
      const fromCap  = balance * MAX_ALLOC;        // USDT size by cap
      const usdtSz   = Math.min(fromRisk, fromCap);

      if (usdtSz < 1) continue;

      const side = sig.signal;
      const baseQty = (usdtSz / price).toFixed(6);

      let placed = true;
      if (env.OKX_API_KEY) {
        const r = await placeOrder(env, sym, side, usdtSz).catch(() => null);
        if (!r || r.code !== '0') placed = false;
      }

      if (placed) {
        await saveTrade(env, s.name, sym, side, usdtSz, price, parseFloat(baseQty), sig.sl, sig.tp);

        const label = env.OKX_API_KEY ? '[봇]' : '[시뮬]';
        await env.DB.prepare(
          `INSERT INTO feed (agent_id,agent_code,agent_name,agent_team,msg,is_ai)
           VALUES ('IRON','IRN','IRON','전략팀',?,0)`
        ).bind(
          `${label} ${sym} ${side.toUpperCase()} $${usdtSz.toFixed(0)} | ${s.name} | ${sig.reason}`
        ).run();

        results.push({ strategy: s.name, sym, side, usdtSz, price, reason: sig.reason });
      }
    }
  }

  return { executed: results.length, trades: results, balance };
}
