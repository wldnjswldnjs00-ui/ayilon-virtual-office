// OKX API client for Cloudflare Workers
// Public endpoints need no auth; private endpoints sign with HMAC-SHA256

const BASE = 'https://www.okx.com';

async function sign(secret, msg) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const buf = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function priv(env, method, path, body = null) {
  const ts = new Date().toISOString();
  const bStr = body ? JSON.stringify(body) : '';
  const sig = await sign(env.OKX_SECRET_KEY, ts + method + path + bStr);
  const headers = {
    'Content-Type': 'application/json',
    'OK-ACCESS-KEY': env.OKX_API_KEY,
    'OK-ACCESS-SIGN': sig,
    'OK-ACCESS-TIMESTAMP': ts,
    'OK-ACCESS-PASSPHRASE': env.OKX_PASSPHRASE,
  };
  if (env.OKX_SIM === '1') headers['x-simulated-trading'] = '1';
  const r = await fetch(BASE + path, { method, headers, body: bStr || undefined });
  return r.json();
}

// Public: fetch candles, oldest→newest
export async function getCandles(symbol, bar, limit = 100) {
  const r = await fetch(`${BASE}/api/v5/market/candles?instId=${symbol}&bar=${bar}&limit=${limit}`);
  const d = await r.json();
  return (d.data || []).reverse();
}

export async function getTicker(symbol) {
  const r = await fetch(`${BASE}/api/v5/market/ticker?instId=${symbol}`);
  const d = await r.json();
  return d.data?.[0] || null;
}

// Private: account
export async function getBalance(env) {
  const d = await priv(env, 'GET', '/api/v5/account/balance');
  const details = d.data?.[0]?.details || [];
  const usdt = details.find(x => x.ccy === 'USDT');
  return usdt ? parseFloat(usdt.availBal) : 0;
}

export async function getPositions(env) {
  const d = await priv(env, 'GET', '/api/v5/account/positions');
  return d.data || [];
}

// Place a spot market order
// For buy: sz is USDT amount (quote currency)
// For sell: sz is base currency amount (BTC/ETH/SOL)
export async function placeOrder(env, symbol, side, sz) {
  const body = {
    instId: symbol,
    tdMode: 'cash',
    side,
    ordType: 'market',
    sz: String(sz),
  };
  // For market buy, OKX needs tgtCcy to specify quote
  if (side === 'buy') body.tgtCcy = 'quote_ccy';
  return priv(env, 'POST', '/api/v5/trade/order', body);
}
