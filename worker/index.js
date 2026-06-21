import { runBot } from './bot.js';

const AGENTS = [
  {id:'CEO',   code:'CEO', name:'CEO',    team:'Executive',
   kw:['전략','방향','팀','회의','승인','지시','전체','현황','점검'],
   msgs:['전체 팀 브리핑 완료.','시장 방향 재검토 지시.','리스크 레벨 조정 승인.','전략 회의 소집.','포지션 현황 확인 중.','팀 성과 점검 완료.'],
   smart:['"%s" 관련 팀 지시 전달 완료.','"%s" 건 검토 후 승인.','팀 전체에 "%s" 이슈 공유 완료.']},
  {id:'IRON',  code:'IRN', name:'IRON',   team:'전략팀',
   kw:['BTC','ETH','SOL','롱','숏','진입','전략','MA','RSI','모멘텀','매수','매도','청산','스캘핑','스윙','MACD'],
   msgs:['롱 포지션 진입 검토.','EMA 크로스 신호 포착.','전략 파라미터 조정 중.','시장 모멘텀 분석 완료.','진입 타이밍 계산 중.','전략 수익률 +4.2% 기록.'],
   smart:['"%s" 신호 포착. 전략 업데이트.','"%s" 기반 진입 전략 수립 완료.','"%s" 분석 결과 강세 신호.']},
  {id:'GRID',  code:'GRD', name:'GRID',   team:'백테스팅팀',
   kw:['백테스트','시뮬레이션','샤프','드로다운','승률','Strategy','검증','최적화'],
   msgs:['백테스트 시뮬레이션 실행 중.','샤프지수 1.9 달성.','드로다운 최적화 완료.','Strategy 7 검증 중.','과거 데이터 분석 완료.','최적 파라미터 도출 완료.'],
   smart:['"%s" 전략 백테스트 완료.','"%s" 기반 시뮬레이션 실행 중.','"%s" 검증 결과 승률 61.4%.']},
  {id:'SCOUT', code:'SCT', name:'SCOUT',  team:'리서치팀',
   kw:['BTC','ETH','온체인','고래','공포','탐욕','펀딩','알트','시장','분석'],
   msgs:['온체인 데이터 급변 감지.','BTC 고래 이동 포착.','공포탐욕지수 하락 중.','ETH 펀딩비 이상 신호.','알트코인 급등 패턴 감지.','거래소 유입량 급증 감지.'],
   smart:['"%s" 온체인 이상 신호 감지.','"%s" 관련 리서치 보고서 완성.','"%s" 시장 심리 분석 완료.']},
  {id:'WARD',  code:'WRD', name:'WARD',   team:'리스크관리팀',
   kw:['리스크','손실','한도','포지션','익스포저','낙폭','경고','위험','헤지'],
   msgs:['손실 한도 50% 경고.','포지션 사이즈 조정 권고.','리스크 지표 정상 범위.','익스포저 재계산 완료.','최대 낙폭 모니터링 중.','리스크 점수 4/10. 양호.'],
   smart:['"%s" 리스크 평가 완료.','"%s" 리스크 노출 수준 낮음.','"%s" 리스크 모니터링 강화.']},
  {id:'FORGE', code:'FRG', name:'FORGE',  team:'프로그래밍팀',
   kw:['API','코드','배포','버그','Cron','OKX','레이턴시','최적화','개발','자동'],
   msgs:['API 레이턴시 최적화.','신규 전략 코드 배포.','버그 수정 완료.','Cron 스케줄 조정.','OKX 연동 안정화.','자동매매 로직 업데이트.'],
   smart:['"%s" 기능 개발 완료.','"%s" 관련 버그 수정 배포.','"%s" 자동화 구현 완료.']},
  {id:'ATLAS', code:'ATL', name:'ATLAS',  team:'인프라팀',
   kw:['서버','인프라','Workers','D1','업타임','스토리지','캐싱','스케일'],
   msgs:['서버 응답 12ms 달성.','D1 쿼리 캐싱 적용.','Workers 오토스케일 완료.','업타임 99.99% 유지.','스토리지 최적화 완료.','CDN 캐시 히트율 98%.'],
   smart:['"%s" 인프라 지원 준비 완료.','"%s" 서버 리소스 할당 완료.','"%s" 인프라 최적화 완료.']},
  {id:'LUNA',  code:'LNA', name:'LUNA',   team:'홍보마케팅팀',
   kw:['마케팅','캠페인','트위터','뉴스레터','파트너십','홍보','콘텐츠','SNS'],
   msgs:['신규 캠페인 런칭.','트위터 인게이지먼트 +24%.','뉴스레터 오픈율 41%.','파트너십 제안 검토 중.','콘텐츠 스케줄 수립 완료.','광고 ROAS 3.2 달성.'],
   smart:['"%s" 마케팅 캠페인 기획 완료.','"%s" 홍보 자료 제작 완료.','"%s" 파트너십 협의 시작.']},
  {id:'PIXEL', code:'PXL', name:'PIXEL',  team:'제품팀',
   kw:['대시보드','UX','기능','스펙','로드맵','제품','피드백','플랜','디자인'],
   msgs:['대시보드 UX 개선 완료.','신기능 스펙 확정.','사용자 피드백 분석 중.','로드맵 업데이트 완료.','A/B 테스트 설계 중.','프로토타입 검토 완료.'],
   smart:['"%s" 기능 스펙 작성 완료.','"%s" 사용자 리서치 분석 중.','"%s" 제품 로드맵 반영 완료.']},
  {id:'ECHO',  code:'ECH', name:'ECHO',   team:'고객서비스팀',
   kw:['고객','CS','문의','FAQ','만족도','VIP','온보딩','응답','지원'],
   msgs:['CS 응답률 98% 유지.','문의 평균 처리 2.1분.','신규 FAQ 추가 완료.','사용자 만족도 4.8/5.','VIP 고객 온보딩 완료.','긍정 리뷰율 92% 달성.'],
   smart:['"%s" 관련 FAQ 업데이트 완료.','"%s" 고객 문의 처리 완료.','"%s" CS 가이드 갱신.']},
  {id:'REX',   code:'REX', name:'REX',    team:'법률팀',
   kw:['규제','법률','MiCA','개인정보','이용약관','컴플라이언스','라이선스'],
   msgs:['MiCA 규정 분석 완료.','이용약관 업데이트 검토.','개인정보처리방침 갱신.','규제 리스크 낮음.','법률 자문 완료.','컴플라이언스 보고서 완성.'],
   smart:['"%s" 법률 검토 완료.','"%s" 규제 리스크 낮음.','"%s" 법적 의견서 작성 완료.']},
  {id:'LEDGER',code:'LDG', name:'LEDGER', team:'세무회계팀',
   kw:['수익','손익','세금','회계','비용','재무','구독','정산','예산'],
   msgs:['월간 손익 집계 완료.','세금 보고 준비 중.','구독 수익 $13,200 기록.','비용 최적화 방안 도출.','재무 보고서 작성 중.','분기 결산 완료.'],
   smart:['"%s" 재무 분석 완료.','"%s" 비용 처리 완료.','"%s" 수익 집계 반영 완료.']},
  {id:'SHIELD',code:'SLD', name:'SHIELD', team:'보안팀',
   kw:['보안','API키','침입','스캔','2FA','취약점','패치','로그','암호화'],
   msgs:['침입 시도 차단 완료.','API 키 로테이션 완료.','보안 스캔 이상 없음.','2FA 적용률 100%.','취약점 패치 배포 완료.','보안 감사 보고서 완성.'],
   smart:['"%s" 보안 감사 완료.','"%s" 취약점 없음 확인.','"%s" 보안 정책 업데이트 완료.']}
];

// ── MEMORY ─────────────────────────────────────────────────────────────────
async function getMem(env) {
  try {
    const rows = (await env.DB.prepare('SELECT key, value FROM memory').all()).results;
    const m = {};
    rows.forEach(r => { try { m[r.key] = JSON.parse(r.value); } catch(e) { m[r.key] = r.value; } });
    return {
      keywords: m.keywords || {},
      xp: Number(m.xp) || 0,
      agentXp: m.agent_xp || {},
      cmds: Array.isArray(m.cmds) ? m.cmds : []
    };
  } catch(e) { return { keywords:{}, xp:0, agentXp:{}, cmds:[] }; }
}

async function saveMem(env, mem) {
  await env.DB.batch([
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('keywords', JSON.stringify(mem.keywords)),
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('xp', JSON.stringify(mem.xp)),
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('agent_xp', JSON.stringify(mem.agentXp)),
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('cmds', JSON.stringify(mem.cmds.slice(-100)))
  ]);
}

function topKws(kw, n) {
  return Object.keys(kw).sort((a,b) => kw[b]-kw[a]).slice(0,n);
}

function extractKws(text, kw) {
  const stop = ['을','를','이','가','은','는','에','의','도','로','으로','와','과','하다','했','합니다'];
  text.replace(/[^\w\s가-힣]/g,' ').split(/\s+/).forEach(w => {
    if (w.length >= 2 && !stop.includes(w)) kw[w] = (kw[w]||0)+1;
  });
}

function pickMsg(agent, keywords) {
  const kws = topKws(keywords, 10);
  const match = kws.find(k => agent.kw.includes(k));
  if (match && agent.smart && Math.random() < 0.35) {
    const t = agent.smart[Math.floor(Math.random()*agent.smart.length)];
    return t.replace('%s', match);
  }
  return agent.msgs[Math.floor(Math.random()*agent.msgs.length)];
}

async function insertFeed(env, agent, msg, isAI) {
  await env.DB.prepare(
    'INSERT INTO feed (agent_id,agent_code,agent_name,agent_team,msg,is_ai) VALUES (?,?,?,?,?,?)'
  ).bind(agent.id, agent.code, agent.name, agent.team, msg, isAI?1:0).run();
}

async function callGemini(msg, key, cmds, kws) {
  const hist = cmds.slice(-5).map(c=>'[지시] '+c).join(' / ');
  const kwStr = kws.join(', ') || '없음';
  const prompt = `당신은 AYILON 가상 오피스의 CEO AI입니다. 암호화폐 자동매매 회사를 운영합니다. 2문장 이내로 전문적이고 간결하게 답하세요.\n${hist?'과거 지시: '+hist+'\n':''}주요 키워드: ${kwStr}\n\n사용자 지시: ${msg}`;
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({contents:[{parts:[{text:prompt}]}], generationConfig:{maxOutputTokens:80,temperature:0.7}}) }
    );
    if (!r.ok) return null;
    const d = await r.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch(e) { return null; }
}

function localReplyMsg(cmds) {
  const replies = [
    '지시 수신. 즉시 처리하겠습니다.',
    '확인했습니다. 팀에 전달하겠습니다.',
    '검토 후 실행하겠습니다.',
    '전략팀과 협의 후 보고드리겠습니다.',
    '이해했습니다. 관련 팀에 브리핑하겠습니다.'
  ];
  if (cmds.length >= 3 && Math.random() < 0.4) {
    const prev = cmds[Math.floor(Math.random()*Math.min(cmds.length,5))];
    replies.push('이전 지시 "' + prev.slice(0,12) + '…" 건과 함께 처리하겠습니다.');
  }
  return replies[Math.floor(Math.random()*replies.length)];
}

const CORS_H = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

function json(data, status) {
  return new Response(JSON.stringify(data), { status: status||200, headers: CORS_H });
}

// ── CRON ────────────────────────────────────────────────────────────────────
async function handleCron(env) {
  const minuteOfHour = new Date().getMinutes();

  // Run trading bot
  try {
    await runBot(env, minuteOfHour);
  } catch(e) {
    console.error('Bot error:', e.message);
  }

  // Agent activity
  const mem = await getMem(env);
  const count = Math.floor(Math.random()*3)+1;
  for (let i=0; i<count; i++) {
    const agent = AGENTS[Math.floor(Math.random()*AGENTS.length)];
    const msg = pickMsg(agent, mem.keywords);
    await insertFeed(env, agent, msg, false);
    mem.agentXp[agent.id] = (mem.agentXp[agent.id]||0)+1;
    mem.xp++;
  }
  await saveMem(env, mem);

  // Prune old feed rows (keep last 500)
  await env.DB.prepare('DELETE FROM feed WHERE id NOT IN (SELECT id FROM feed ORDER BY id DESC LIMIT 500)').run();
  // Prune old signals (keep last 1000)
  await env.DB.prepare('DELETE FROM signals WHERE id NOT IN (SELECT id FROM signals ORDER BY id DESC LIMIT 1000)').run();
}

// ── FETCH HANDLER ────────────────────────────────────────────────────────────
async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:CORS_H});

  if (url.pathname === '/api/feed') {
    const since = parseInt(url.searchParams.get('since')||'0');
    const { results } = await env.DB.prepare(
      'SELECT * FROM feed WHERE created_at > ? ORDER BY created_at DESC LIMIT 50'
    ).bind(since).all();
    return json({ items: results, ts: Math.floor(Date.now()/1000) });
  }

  if (url.pathname === '/api/state') {
    const mem = await getMem(env);
    return json({ xp: mem.xp, agentXp: mem.agentXp, keywords: mem.keywords, aiEnabled: !!env.GEMINI_KEY });
  }

  if (url.pathname === '/api/trades') {
    const status = url.searchParams.get('status') || 'open';
    const { results } = await env.DB.prepare(
      'SELECT * FROM trades WHERE status=? ORDER BY created_at DESC LIMIT 50'
    ).bind(status).all();
    return json({ trades: results });
  }

  if (url.pathname === '/api/performance') {
    const stats = await env.DB.prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END) as closed,
        SUM(CASE WHEN status='open' THEN 1 ELSE 0 END) as open_count,
        SUM(CASE WHEN pnl_usdt > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN pnl_usdt < 0 THEN 1 ELSE 0 END) as losses,
        ROUND(SUM(COALESCE(pnl_usdt,0)),2) as total_pnl,
        ROUND(AVG(CASE WHEN pnl_usdt IS NOT NULL THEN pnl_usdt END),2) as avg_pnl
       FROM trades`
    ).first();
    return json(stats);
  }

  if (url.pathname === '/api/signals') {
    const { results } = await env.DB.prepare(
      "SELECT * FROM signals WHERE signal != 'hold' ORDER BY created_at DESC LIMIT 30"
    ).all();
    return json({ signals: results });
  }

  if (url.pathname === '/api/cmd' && request.method === 'POST') {
    const body = await request.json().catch(()=>({}));
    const msg = String(body.msg||'').slice(0,300).trim();
    if (!msg) return json({error:'empty'}, 400);

    const mem = await getMem(env);
    await insertFeed(env, AGENTS[0], '→ 지시: '+msg, false);
    extractKws(msg, mem.keywords);
    mem.cmds.push(msg);
    mem.xp += 2;
    mem.agentXp['CEO'] = (mem.agentXp['CEO']||0)+2;

    let reply = null, isAI = false;
    if (env.GEMINI_KEY) {
      reply = await callGemini(msg, env.GEMINI_KEY, mem.cmds, topKws(mem.keywords,5));
      if (reply) isAI = true;
    }
    if (!reply) reply = localReplyMsg(mem.cmds);

    await insertFeed(env, AGENTS[0], reply, isAI);
    mem.xp += isAI ? 3 : 1;
    mem.agentXp['CEO'] = (mem.agentXp['CEO']||0)+(isAI?3:1);

    const lower = msg.toLowerCase();
    const relevant = AGENTS.filter(a => a.id !== 'CEO' && a.kw.some(k => lower.includes(k.toLowerCase()))).slice(0,2);
    for (const agent of relevant) {
      const agMsg = pickMsg(agent, mem.keywords);
      await insertFeed(env, agent, agMsg, false);
      mem.agentXp[agent.id] = (mem.agentXp[agent.id]||0)+2;
      mem.xp++;
    }

    await saveMem(env, mem);
    return json({ reply, isAI, xp: mem.xp });
  }

  return new Response('Not found', {status:404});
}

export default {
  async fetch(request, env) { return handleRequest(request, env); },
  async scheduled(event, env) { return handleCron(env); }
};
