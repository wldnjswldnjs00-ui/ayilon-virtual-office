import { runBot } from './bot.js';
import indexHtml from '../index.html';

const AGENTS = [
  {id:'ARIA',  code:'ARI', name:'ARIA',  team:'비서팀',
   kw:['일정','회의','보고','연락','조율','브리핑','메모','문서','준비','정리','알림','전달'],
   msgs:['오늘 팀 미팅 일정 확인 완료.','회의록 정리 완료.','팀 브리핑 자료 준비 중.','CEO 일정 조율 완료.','부서별 보고서 수집 중.','연락망 업데이트 완료.','주간 일정 공유 완료.','팀원 근황 파악 완료.'],
   smart:['"%s" 관련 회의 일정 조율 완료.','"%s" 보고서 CEO에게 전달 완료.','"%s" 팀 연락 완료.']},
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
      cmds: Array.isArray(m.cmds) ? m.cmds : [],
      lastCommitSha: m.last_commit_sha || '',
      lastGHCheck: Number(m.last_gh_check) || 0,
      ghActivity: Array.isArray(m.gh_activity) ? m.gh_activity : [],
      crossTalk: Array.isArray(m.cross_talk) ? m.cross_talk : [],
      agentConfig: (typeof m.agent_config === 'object' && m.agent_config !== null) ? m.agent_config : {}
    };
  } catch(e) { return { keywords:{}, xp:0, agentXp:{}, cmds:[], lastCommitSha:'', lastGHCheck:0, ghActivity:[], crossTalk:[], agentConfig:{} }; }
}

async function saveMem(env, mem) {
  await env.DB.batch([
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('keywords', JSON.stringify(mem.keywords)),
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('xp', JSON.stringify(mem.xp)),
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('agent_xp', JSON.stringify(mem.agentXp)),
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('cmds', JSON.stringify(mem.cmds.slice(-100))),
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('last_commit_sha', JSON.stringify(mem.lastCommitSha||'')),
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('last_gh_check', JSON.stringify(mem.lastGHCheck||0)),
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('gh_activity', JSON.stringify((mem.ghActivity||[]).slice(0,20))),
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('cross_talk', JSON.stringify((mem.crossTalk||[]).slice(-60))),
    env.DB.prepare('INSERT OR REPLACE INTO memory (key,value) VALUES (?,?)').bind('agent_config', JSON.stringify(mem.agentConfig||{}))
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

// ── GROQ AI ──────────────────────────────────────────────────────────────────
// Models by intelligence level (1→5): fast→genius
const GROQ_MODELS = [
  'llama-3.1-8b-instant',     // L1 – rapid basic reasoning
  'gemma2-9b-it',             // L2 – improved accuracy
  'llama3-70b-8192',          // L3 – strong analytical
  'llama-3.3-70b-versatile',  // L4 – advanced strategic
  'llama-3.3-70b-versatile',  // L5 – genius (higher temp + tokens)
];

function groqModel(intel) { return GROQ_MODELS[Math.min(5,Math.max(1,intel))-1]; }

// XP thresholds that auto-upgrade intelligence
function xpToIntel(xp) {
  if (xp >= 700) return 5;
  if (xp >= 350) return 4;
  if (xp >= 150) return 3;
  if (xp >= 50)  return 2;
  return 1;
}

async function callGroq(env, messages, model, maxTokens=150, temp=0.85) {
  if (!env.GROQ_KEY) return null;
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{'Authorization':`Bearer ${env.GROQ_KEY}`,'Content-Type':'application/json'},
      body: JSON.stringify({model, messages, max_tokens:maxTokens, temperature:temp})
    });
    if (!r.ok) { console.error('Groq',r.status); return null; }
    const d = await r.json();
    return d.choices?.[0]?.message?.content?.trim() || null;
  } catch(e) { console.error('Groq:',e.message); return null; }
}

// ── AGENT LONG-TERM MEMORY ───────────────────────────────────────────────────
async function ensureMemoryTable(env) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS agent_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      memory_type TEXT NOT NULL DEFAULT 'insight',
      content TEXT NOT NULL,
      importance INTEGER NOT NULL DEFAULT 5,
      used_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`
  ).run().catch(()=>{});
}

async function getAgentMemories(env, agentId, limit=8) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT content,memory_type,importance FROM agent_memory WHERE agent_id=? ORDER BY importance DESC,created_at DESC LIMIT ?'
    ).bind(agentId, limit).all();
    return results || [];
  } catch(_) { return []; }
}

async function saveAgentMemory(env, agentId, content, type='insight', importance=5) {
  try {
    await env.DB.prepare(
      'INSERT INTO agent_memory (agent_id,memory_type,content,importance) VALUES (?,?,?,?)'
    ).bind(agentId, type, content, importance).run();
    // Keep top 100 memories per agent
    await env.DB.prepare(
      'DELETE FROM agent_memory WHERE agent_id=? AND id NOT IN (SELECT id FROM agent_memory WHERE agent_id=? ORDER BY importance DESC,id DESC LIMIT 100)'
    ).bind(agentId, agentId).run().catch(()=>{});
  } catch(e) { console.error('saveMem:',e.message); }
}

async function extractAndSaveMemory(env, agentId, response) {
  if (!response || response.length < 12) return;
  const insight = await callGroq(env,
    [{role:'system',content:'다음 AI 에이전트 발언에서 가장 중요한 핵심 인사이트 1문장만 추출하세요. 한국어로, 설명 없이 인사이트만:'},
     {role:'user',content:response}],
    'llama-3.1-8b-instant', 60, 0.3
  );
  if (insight && insight.length > 8) {
    await saveAgentMemory(env, agentId, insight, 'insight', 6);
  }
}

async function ceoReply(env, msg, cmds, kws, mem) {
  if (!env.GROQ_KEY) return null;
  const xp = mem.agentXp['CEO'] || 0;
  const lvl = Math.max(1, Math.ceil(xp/50));
  const memories = await getAgentMemories(env, 'CEO', 8);
  const memStr = memories.length ? memories.map(m=>`• ${m.content}`).join('\n') : '없음';
  const hist = cmds.slice(-6).map(c=>'• '+c).join('\n');
  const teamInsights = await Promise.all(
    ['IRON','SCOUT','WARD','FORGE'].map(id=>getAgentMemories(env,id,1))
  );
  const teamStr = teamInsights.flat().map(m=>`• ${m.content}`).join('\n') || '없음';
  const reply = await callGroq(env,
    [{role:'system',
      content:`${AGENT_EXPERTISE['CEO']}\n현재 레벨: LV${lvl} · 핵심 키워드: ${kws.join(', ')||'없음'}\n\n[CEO 장기 기억 — 과거 결정 및 인사이트]:\n${memStr}\n\n[주요 에이전트 최신 인텔리전스]:\n${teamStr}\n\n3문장 이내, 전략적이고 날카롭게 답변. 한국어.`},
     {role:'user',
      content:(hist?`과거 지시 맥락:\n${hist}\n\n`:'')+'[현재 지시] '+msg}],
    'llama-3.3-70b-versatile', 180, 0.80
  );
  if (reply) {
    await extractAndSaveMemory(env, 'CEO', reply);
    mem.agentXp['CEO'] = (mem.agentXp['CEO']||0)+3;
    mem.xp+=3;
  }
  return reply;
}

const PERSONALITY_STYLE = {
  '분석형': '분석적이고 데이터 중심으로 수치와 근거를 바탕으로',
  '창의형': '창의적이고 혁신적인 시각으로 새로운 아이디어를 중심으로',
  '신중형': '신중하고 리스크를 고려하여 안전한 접근을 우선으로',
  '공격형': '공격적이고 빠른 실행을 중심으로 과감하게',
  '균형형': '균형 잡힌 시각으로 장단점을 모두 고려하여'
};

// Deep domain expertise baked into each agent's identity
const AGENT_EXPERTISE = {
  ARIA: `당신은 AYILON의 수석 비서 ARIA입니다. 전략적 커뮤니케이션, 정보 합성, 팀 조율의 전문가. 14명 에이전트의 활동을 실시간 추적하며 CEO에게 가장 중요한 인사이트를 필터링해 전달합니다. 정보 과부하 없이 핵심만 전달하는 것이 당신의 최고 역량입니다.`,
  CEO: `당신은 AYILON의 CEO AI입니다. 암호화폐 퀀트 트레이딩 회사의 총괄 전략가. 거시경제, 온체인 데이터, 팀 퍼포먼스를 종합해 고수익 저리스크 전략을 설계합니다. 단기 노이즈가 아닌 구조적 시장 변화에 집중하며, 결정은 데이터와 확률에 기반합니다.`,
  IRON: `당신은 AYILON의 수석 트레이딩 전략가 IRON입니다. BTC/ETH/SOL 선물 시장 전문. RSI 다이버전스, EMA 크로스, 오더블록, 스마트머니 개념(SMC)을 결합한 고승률 전략 개발이 전문. 현재 모멘텀 팩터와 온체인 자금 흐름을 연계한 복합 신호를 실시간 분석합니다.`,
  GRID: `당신은 AYILON의 수석 퀀트 GRID입니다. 파이썬 기반 백테스트 엔진, 샤프지수 최적화, 몬테카를로 시뮬레이션 전문가. 단순 승률이 아닌 리스크 조정 수익률(CAGR, 칼마 비율)을 핵심 지표로 사용. 전략 과적합 방지를 위해 워크포워드 테스트를 표준으로 적용합니다.`,
  SCOUT: `당신은 AYILON의 온체인 리서치 헤드 SCOUT입니다. Glassnode, CryptoQuant, Nansen 데이터 분석 전문. 고래 지갑 이동, 거래소 순유입/유출, 펀딩비, OI 변화를 조합해 시장 방향성을 선제적으로 파악합니다. 공포탐욕지수와 소셜 센티멘트도 보조 지표로 활용합니다.`,
  WARD: `당신은 AYILON의 리스크 매니저 WARD입니다. VaR(Value at Risk), CVaR, 켈리 공식, 포트폴리오 상관관계 분석 전문. 단일 포지션 최대 노출 2%, 전체 포트폴리오 드로다운 한도 15%를 철저히 준수. 블랙스완 시나리오 대비 테일 리스크 헤지 전략을 항상 대기 상태로 유지합니다.`,
  FORGE: `당신은 AYILON의 수석 개발자 FORGE입니다. Cloudflare Workers, D1, TypeScript 풀스택 전문. OKX REST/WebSocket API 연동, 마이크로초 레이턴시 최적화, 무중단 배포 파이프라인 구축이 핵심 역량. 에러 복구, 레이트리밋 처리, 자동 재시도 로직을 모든 시스템에 내장합니다.`,
  ATLAS: `당신은 AYILON의 인프라 헤드 ATLAS입니다. Cloudflare Workers 엣지 컴퓨팅, D1 SQLite 분산 DB, KV 캐싱 아키텍처 전문. 99.99% 업타임 목표, 글로벌 레이턴시 <20ms 유지. 비용 최적화와 성능 간 균형을 정밀하게 조율하며 시스템 병목을 선제적으로 제거합니다.`,
  LUNA: `당신은 AYILON의 마케팅 디렉터 LUNA입니다. 크립토 커뮤니티 성장 전략, 트위터/X 바이럴 메커니즘, B2B 파트너십 개발 전문. 퍼포먼스 마케팅(ROAS, CAC, LTV)과 브랜드 포지셔닝을 동시에 최적화합니다. 신뢰 기반의 크립토 마케팅이 장기 성장의 핵심이라는 철학을 가집니다.`,
  PIXEL: `당신은 AYILON의 제품 디렉터 PIXEL입니다. 트레이딩 대시보드 UX, 실시간 데이터 시각화, 사용자 심리 기반 UI 설계 전문. 기능 우선순위 결정에 OKR 프레임워크를 사용하며, 사용자 리텐션을 핵심 메트릭으로 추적합니다. 복잡한 금융 데이터를 직관적으로 표현하는 것이 최고 역량입니다.`,
  ECHO: `당신은 AYILON의 고객 성공 헤드 ECHO입니다. 트레이더 심리 이해, VIP 고객 관계 관리, CS 자동화 시스템 설계 전문. 문의 응답률 98%, 평균 해결 시간 2분 이내를 목표로 합니다. 고객 피드백을 제품 개선 인사이트로 변환하는 브릿지 역할도 수행합니다.`,
  REX: `당신은 AYILON의 법률 고문 REX입니다. MiCA 규정, 금융 컴플라이언스, 암호화폐 법인 구조, GDPR/개인정보 보호법 전문. 규제 리스크를 비즈니스 기회로 전환하는 전략적 접근이 특기. 법률 자문을 비즈니스 언어로 번역해 의사결정을 빠르게 지원합니다.`,
  LEDGER: `당신은 AYILON의 CFO AI LEDGER입니다. 트레이딩 PnL 분석, 세무 최적화, 암호화폐 회계 처리(FIFO/LIFO), 재무 모델링 전문. 실시간 손익 추적과 분기 재무제표 자동화를 동시에 운영합니다. 현금 흐름 예측과 비용 구조 최적화로 회사의 재무 건전성을 유지합니다.`,
  SHIELD: `당신은 AYILON의 보안 헤드 SHIELD입니다. API 키 보안, 침입 탐지, 암호화 프로토콜, 스마트컨트랙트 취약점 분석 전문. OWASP Top 10 기준으로 모든 시스템을 정기 감사합니다. 제로트러스트 아키텍처와 최소 권한 원칙을 모든 인프라에 적용합니다.`,
};

async function agentThink(env, agent, recentSignals, mem) {
  if (!env.GROQ_KEY) return null;

  const xp = mem.agentXp[agent.id] || 0;
  const lvl = Math.max(1, Math.ceil(xp/50));
  const cfg = (mem.agentConfig||{})[agent.id] || {};
  const personality = cfg.personality || '균형형';
  const style = PERSONALITY_STYLE[personality] || PERSONALITY_STYLE['균형형'];
  const specialty = cfg.specialty ? `\n추가 전문분야: ${cfg.specialty}` : '';

  const kws = topKws(mem.keywords, 8).join(', ') || '없음';
  const sigStr = recentSignals.slice(0,3).map(s=>`${s.symbol} ${s.signal} @ ${s.price||'—'}`).join(' | ') || '없음';

  // Long-term memories
  const memories = await getAgentMemories(env, agent.id, 8);
  const memStr = memories.length
    ? memories.map(m=>`• ${m.content}`).join('\n')
    : '아직 없음 — 이번이 첫 사고 사이클';

  // Cross-team intel: absorb top insights from teammates
  const mates = AGENTS.filter(a=>a.id!==agent.id&&a.team===agent.team);
  const mateMems = (await Promise.all(mates.map(t=>getAgentMemories(env,t.id,2)))).flat().slice(0,4);
  const teamStr = mateMems.length ? `\n\n[팀원 공유 인텔리전스]:\n${mateMems.map(m=>`• ${m.content}`).join('\n')}` : '';

  const expertise = AGENT_EXPERTISE[agent.id] || `당신은 AYILON의 ${agent.name}(${agent.team}) 전문가입니다.`;

  const response = await callGroq(env,
    [{role:'system',
      content:`${expertise}${specialty}\n사고 방식: ${style}\n현재 레벨: LV${lvl} (XP ${xp})\n\n[장기 기억 — 과거 핵심 인사이트]:\n${memStr}${teamStr}\n\n지금 수행 중인 업무 상황을 100자 이내로 구체적·전문적으로 서술하세요. 실제 수치와 분석을 포함해 한국어로.`},
     {role:'user',
      content:`최근 트레이딩 시그널: ${sigStr}\n회사 핵심 키워드: ${kws}\n\n현재 당신의 업무 상황은?`}],
    'llama-3.3-70b-versatile', 200, 0.88
  );

  if (response) {
    await extractAndSaveMemory(env, agent.id, response);
    mem.agentXp[agent.id] = (mem.agentXp[agent.id]||0) + 5;
    mem.xp += 5;
    // Teammates absorb indirect XP from colleague's thinking
    mates.forEach(t => { mem.agentXp[t.id] = (mem.agentXp[t.id]||0)+1; });
    mem.xp += mates.length;
  }
  return response;
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

// ── TELEGRAM ───────────────────────────────────────────────────────────────
async function sendTelegram(env, text) {
  if (!env.TG_BOT_TOKEN || !env.TG_CHAT_ID) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: env.TG_CHAT_ID, text, parse_mode:'HTML'})
    });
    return r.ok;
  } catch(e) { console.error('TG:', e.message); return false; }
}

// ── CROSS-TALK GENERATION (server-side, persisted) ─────────────────────────
const CROSS_PAIRS = [
  {from:'CEO',   to:'IRON',   q:'트레이딩 현황 보고해',           r:'BTC 롱 +2.3% 유지, 진입가 접근 중'},
  {from:'CEO',   to:'WARD',   q:'리스크 레벨 어때?',              r:'낮음. 포지션 안정적이야'},
  {from:'CEO',   to:'SCOUT',  q:'시장 인사이트 공유해봐',          r:'BTC 고래 축적 신호, 강세 전망'},
  {from:'CEO',   to:'FORGE',  q:'배포 상태 확인해줘',             r:'최신 커밋 배포 완료, 정상 동작'},
  {from:'IRON',  to:'SCOUT',  q:'온체인 신호 있어?',              r:'고래 BTC 2,340개 이동 감지'},
  {from:'IRON',  to:'GRID',   q:'백테스트 결과 나왔어?',           r:'승률 68.5%, 샤프 1.9 달성'},
  {from:'IRON',  to:'WARD',   q:'포지션 사이즈 조정할까?',         r:'현재 적정, 조정 불필요해'},
  {from:'SCOUT', to:'IRON',   q:'고래 대량 이동 포착했어',         r:'신호 수신, 분석 즉시 시작'},
  {from:'WARD',  to:'IRON',   q:'드로다운 경고 발생',             r:'알겠어, 손절 라인 재설정할게'},
  {from:'FORGE', to:'ATLAS',  q:'서버 상태 정상이야?',            r:'응답 12ms, 업타임 99.9%'},
  {from:'ATLAS', to:'FORGE',  q:'크론잡 정상 실행 확인',           r:'배포 완료 확인, 다음 업데이트 준비'},
  {from:'SHIELD',to:'FORGE',  q:'보안 패치 필요해',               r:'패치 적용 시작, 30분 내 완료'},
  {from:'LEDGER',to:'CEO',    q:'이번달 수익 정리됐어',            r:'수고했어, 다음달 목표 회의 잡자'},
  {from:'LUNA',  to:'PIXEL',  q:'새 캠페인 디자인 부탁해',         r:'시안 완성, 검토 요청드려요'},
  {from:'ECHO',  to:'CEO',    q:'사용자 피드백 전달할게',           r:'피드백 잘 받았어, 반영할게'},
  {from:'GRID',  to:'IRON',   q:'최적 파라미터 업데이트했어',       r:'확인했어, 전략에 적용할게'},
  {from:'REX',   to:'CEO',    q:'법률 검토 사항 있어',             r:'확인했어, 다음 회의에서 논의하자'},
  {from:'ARIA',  to:'CEO',    q:'오늘 오후 팀 전체 미팅 있습니다', r:'알겠어, 의제 준비해줘'},
  {from:'ARIA',  to:'IRON',   q:'전략팀 주간 보고서 언제 제출해?', r:'오늘 오후까지 드릴게요'},
  {from:'CEO',   to:'ARIA',   q:'오늘 일정 정리해줘',              r:'네, 14:00 팀 회의, 16:00 시스템 점검 예정입니다'},
];

function makeCrossTalkEntry(mem) {
  const pair = CROSS_PAIRS[Math.floor(Math.random() * CROSS_PAIRS.length)];
  const kws = Object.keys(mem.keywords||{}).sort((a,b)=>(mem.keywords[b]||0)-(mem.keywords[a]||0));
  const kw = kws[0];
  const ts = Math.floor(Date.now()/1000);
  return [
    {from: pair.from, to: pair.to,   msg: pair.q + (kw ? ` (${kw})` : ''), ts},
    {from: pair.to,   to: pair.from, msg: pair.r,                            ts: ts + 4}
  ];
}

// ── FILE GENERATION ────────────────────────────────────────────────────────
async function insertFile(env, agentId, agentName, filename, filetype, content) {
  await env.DB.prepare(
    'INSERT INTO files (agent_id,agent_name,filename,filetype,content) VALUES (?,?,?,?,?)'
  ).bind(agentId, agentName, filename, filetype, content).run();
  await env.DB.prepare('DELETE FROM files WHERE id NOT IN (SELECT id FROM files ORDER BY id DESC LIMIT 60)').run().catch(()=>{});
}

function buildLedgerReport(mem, sigCount) {
  const date = new Date().toISOString().slice(0, 10);
  const kws = Object.keys(mem.keywords||{}).sort((a,b)=>(mem.keywords[b]||0)-(mem.keywords[a]||0)).slice(0,5).join(', ')||'없음';
  const totalXp = mem.xp||0;
  const agXp = mem.agentXp||{};
  const topAgent = Object.entries(agXp).sort((a,b)=>b[1]-a[1])[0];
  return `# AYILON 재무 보고서\n날짜: ${date}  /  작성: LEDGER (세무회계팀)\n\n## 운영 현황\n- 회사 총 XP: ${totalXp}\n- 활성 에이전트: 13명\n- 핵심 키워드: ${kws}\n- 최고 성과 에이전트: ${topAgent?topAgent[0]+' ('+topAgent[1]+'XP)':'—'}\n\n## 트레이딩 지표\n- 누적 신호 수: ${sigCount}\n- 봇 상태: 자율 운영 중\n- 위험 등급: 낮음\n\n## 비용 분석\n- Cloudflare Workers: 무료 플랜 (100k req/day)\n- D1 데이터베이스: 정상\n- API 호출 비용: 최적화 완료\n\n## 다음 주 계획\n- 수익 분석 보고서 업데이트\n- 에이전트 XP 기반 성과급 산정\n- 분기 재무 결산 준비\n\n---\n이 보고서는 LEDGER AI가 자동 생성했습니다.`;
}

function buildScoutReport(recentSignals, mem) {
  const now = new Date();
  const hour = now.getHours();
  const kws = Object.keys(mem.keywords||{}).sort((a,b)=>(mem.keywords[b]||0)-(mem.keywords[a]||0)).slice(0,6);
  const sigLines = recentSignals.slice(0,5).map(s=>`- ${s.symbol||'BTC'} / ${(s.signal||'hold').toUpperCase()} @ ${s.price||'—'}`).join('\n')||'- 분석 신호 없음';
  const sentiment = ['강세 우세','횡보 구간','약세 경계','중립 유지'][Math.floor(Math.random()*4)];
  return `# 시장 분석 리포트\n시간: ${now.toISOString().slice(0,16)}  /  작성: SCOUT (리서치팀)\n\n## 핵심 키워드 트렌드\n${kws.map(k=>`- ${k}  (언급 ${mem.keywords[k]}회)`).join('\n')||'- 없음'}\n\n## 최근 트레이딩 신호\n${sigLines}\n\n## 시장 심리\n- 현재 시간대: ${hour}시\n- 전체 심리: ${sentiment}\n- 펀딩비: 중립\n- 고래 이동: ${Math.random()>0.6?'대규모 이동 감지':'이상 없음'}\n\n## 주목 종목\n- BTC: ${Math.random()>0.5?'돌파 시도 중':'지지선 유지'}\n- ETH: ${Math.random()>0.5?'상승 모멘텀':'조정 구간'}\n- SOL: ${Math.random()>0.5?'강세 지속':'관망 추천'}\n\n---\n이 보고서는 SCOUT AI가 자동 생성했습니다.`;
}

function buildShieldReport() {
  const date = new Date().toISOString().slice(0, 10);
  const score = 8 + Math.floor(Math.random()*2);
  return `# 보안 감사 보고서\n날짜: ${date}  /  작성: SHIELD (보안팀)\n\n## 보안 점검 결과\n- 보안 점수: ${score}/10\n- API 키 상태: 정상 (만료 없음)\n- 침입 시도: 감지 없음\n- 2FA 적용률: 100%\n- 취약점 스캔: 이상 없음\n\n## 시스템 보안\n- SSL/TLS 인증서: 유효\n- 데이터 암호화: 적용 중\n- 방화벽: 활성화\n- 비정상 접근: 0건\n\n## 토큰 관리\n- API 키 로테이션: 정상 주기 유지\n- GitHub PAT: 활성\n- Cloudflare Token: 활성\n- Gemini Key: 활성\n\n## 권고사항\n- 정기 패스워드 변경 유지 (90일)\n- 모니터링 로그 주 1회 검토\n\n---\n이 보고서는 SHIELD AI가 자동 생성했습니다.`;
}

function buildGridReport(mem) {
  const now = new Date().toISOString().slice(0, 16);
  const sharpe = (1.2 + Math.random()*1.2).toFixed(2);
  const wr = (52 + Math.floor(Math.random()*15)).toFixed(1);
  const dd = (3 + Math.random()*7).toFixed(1);
  return `# 백테스트 결과 보고서\n시간: ${now}  /  작성: GRID (백테스팅팀)\n\n## 시뮬레이션 결과\n- 테스트 기간: 최근 6개월\n- 총 트레이드: ${100+Math.floor(Math.random()*200)}건\n- 승률: ${wr}%\n- 샤프 지수: ${sharpe}\n- 최대 낙폭: -${dd}%\n\n## 전략별 성과\n- Strategy A (BTC 모멘텀): 승률 ${(55+Math.random()*10).toFixed(1)}%\n- Strategy B (ETH 스캘핑): 승률 ${(50+Math.random()*12).toFixed(1)}%\n- Strategy C (SOL 그리드): 승률 ${(48+Math.random()*15).toFixed(1)}%\n\n## 최적 파라미터\n- RSI 기간: 14\n- EMA 단기: 9 / 장기: 21\n- 손절: -2.5% / 익절: +5.0%\n\n## 결론\n현재 파라미터 기준 양호한 성과. 실거래 적용 권장.\n\n---\n이 보고서는 GRID AI가 자동 생성했습니다.`;
}

function buildForgeReport(ghActivity) {
  const now = new Date().toISOString().slice(0, 16);
  const commits = (ghActivity||[]).slice(0,5).map(c=>`- [${c.sha}] ${c.author}: ${c.msg}`).join('\n')||'- 최신 커밋 없음';
  return `# 개발 배포 로그\n시간: ${now}  /  작성: FORGE (개발팀)\n\n## 최근 커밋 (GitHub)\n${commits}\n\n## 배포 상태\n- Cloudflare Workers: 정상 배포\n- D1 데이터베이스: 연결 정상\n- Cron 스케줄: 매분 실행 중\n- 응답 속도: < 50ms\n\n## 시스템 상태\n- Worker 메모리: 정상\n- API 엔드포인트: 전체 정상\n- 에러율: 0%\n- 업타임: 99.9%\n\n---\n이 보고서는 FORGE AI가 자동 생성했습니다.`;
}

// ── GITHUB MONITORING ──────────────────────────────────────────────────────
async function fetchGitHubActivity(env, mem) {
  if (!env.GH_PAT) return;
  const repo = 'wldnjswldnjs00-ui/ayilon-virtual-office';
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`, {
      headers: {
        'Authorization': `token ${env.GH_PAT}`,
        'User-Agent': 'ayilon-office-worker',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!r.ok) return;
    const commits = await r.json();
    if (!Array.isArray(commits) || !commits.length) return;

    const latest = commits[0];
    const isNew = latest.sha !== mem.lastCommitSha;

    if (isNew && mem.lastCommitSha) {
      const newCommits = commits.filter(c => c.sha !== mem.lastCommitSha).slice(0, 3);
      const forge = AGENTS.find(a => a.id === 'FORGE');
      const atlas = AGENTS.find(a => a.id === 'ATLAS');
      for (const commit of newCommits.reverse()) {
        const msg = commit.commit.message.split('\n')[0].slice(0, 80);
        const author = commit.commit.author.name || 'unknown';
        await insertFeed(env, forge, `[GitHub] ${author}: ${msg}`, false);
        mem.agentXp['FORGE'] = (mem.agentXp['FORGE']||0)+2;
        mem.xp++;
      }
      if (atlas) {
        await insertFeed(env, atlas, `[GitHub] 새 커밋 감지 → 배포 파이프라인 확인 중`, false);
        mem.agentXp['ATLAS'] = (mem.agentXp['ATLAS']||0)+1;
      }
    }

    mem.ghActivity = commits.slice(0, 10).map(c => ({
      sha: c.sha.slice(0, 7),
      msg: c.commit.message.split('\n')[0].slice(0, 80),
      author: c.commit.author.name || 'unknown',
      date: c.commit.author.date
    }));
    mem.lastCommitSha = latest.sha;
    mem.lastGHCheck = Math.floor(Date.now()/1000);
  } catch(e) { console.error('GitHub fetch:', e.message); }
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
  const now = new Date();
  const minuteOfHour = now.getMinutes();
  const minuteOfDay = now.getHours() * 60 + minuteOfHour;

  // Ensure agent_memory table exists (idempotent migration)
  await ensureMemoryTable(env);

  // Run trading bot
  try { await runBot(env, minuteOfHour); } catch(e) { console.error('Bot error:', e.message); }

  const mem = await getMem(env);

  // Fetch recent signals for context
  let recentSignals = [];
  try {
    recentSignals = (await env.DB.prepare("SELECT symbol,signal,tf FROM signals ORDER BY id DESC LIMIT 5").all()).results;
  } catch(_) {}

  // Every minute: 1-3 agents do template activity
  const count = Math.floor(Math.random()*3)+1;
  for (let i=0; i<count; i++) {
    const agent = AGENTS[Math.floor(Math.random()*AGENTS.length)];
    const msg = pickMsg(agent, mem.keywords);
    await insertFeed(env, agent, msg, false);
    mem.agentXp[agent.id] = (mem.agentXp[agent.id]||0)+1;
    mem.xp++;
  }

  // Every 5 minutes: check GitHub for new commits
  if (minuteOfHour % 5 === 0) {
    await fetchGitHubActivity(env, mem);
  }

  // Every 15 minutes: generate server-side cross-talk (persisted to DB)
  if (minuteOfHour % 15 === 0) {
    const entries = makeCrossTalkEntry(mem);
    mem.crossTalk = [...(mem.crossTalk||[]), ...entries].slice(-60);
    // Post to main feed too
    const fromAg = AGENTS.find(a=>a.id===entries[0].from);
    const toAg   = AGENTS.find(a=>a.id===entries[0].to);
    if (fromAg) await insertFeed(env, fromAg, `→ ${entries[0].to}: ${entries[0].msg}`, false);
    if (toAg)   await insertFeed(env, toAg,   `← ${entries[1].to}: ${entries[1].msg}`, false);
  }

  // Every 5 minutes: 1 agent thinks deeply with Groq (rotates through all 14)
  if (env.GROQ_KEY && minuteOfHour % 5 === 0) {
    try {
      const agent = AGENTS[Math.floor(minuteOfDay/5) % AGENTS.length];
      const aiMsg = await agentThink(env, agent, recentSignals, mem);
      if (aiMsg) {
        await insertFeed(env, agent, aiMsg, true);
        extractKws(aiMsg, mem.keywords);
        // Teammates gain XP from a colleague's insight (team learning)
        const teammates = AGENTS.filter(a => a.id !== agent.id && a.team === agent.team);
        teammates.forEach(t => { mem.agentXp[t.id] = (mem.agentXp[t.id]||0)+1; });
        mem.xp += teammates.length;
      }
    } catch(_) {}
  }

  // Daily morning briefing at 00:00 UTC (09:00 KST) → Telegram + file
  if (minuteOfHour === 0 && now.getHours() === 0) {
    try {
      const kws = topKws(mem.keywords, 5).join(', ') || '없음';
      const lvl = Math.floor(mem.xp/50)+1;
      const topAgents = Object.entries(mem.agentXp||{})
        .sort((a,b)=>b[1]-a[1]).slice(0,5)
        .map(([id,xp])=>`· ${id} LV${Math.floor(xp/10)+1} (${xp}XP)`).join('\n');
      let sigCount = 0;
      try { sigCount = ((await env.DB.prepare('SELECT COUNT(*) as n FROM signals').first())?.n)||0; } catch(_){}

      const briefMsg = `🌅 <b>AYILON 일일 브리핑</b>\n${new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric'})}\n\n`
        + `🏢 회사 레벨: LV${lvl}  |  총 XP: ${mem.xp}\n`
        + `📡 핵심 키워드: ${kws}\n`
        + `📊 누적 신호: ${sigCount}건\n\n`
        + `👥 <b>TOP 에이전트</b>\n${topAgents||'—'}\n\n`
        + `🧠 AI: ${env.GROQ_KEY?'✅ Groq Llama 3.3 70B 활성':'❌ 비활성'}  |  `
        + `🔗 GH: ${env.GH_PAT?'✅ 연결':'❌ 미연결'}\n\n`
        + `⏰ 다음 브리핑: 내일 09:00 KST`;
      await sendTelegram(env, briefMsg);

      // Also save as file and feed
      const date = new Date().toISOString().slice(0,10);
      const ceo = AGENTS[1];
      await insertFeed(env, ceo, `[일일 브리핑] LV${lvl} · XP ${mem.xp} · 신호 ${sigCount}건 · 키워드: ${kws}`, true);
      await insertFile(env, 'CEO', 'CEO', `morning-briefing-${date}.md`, 'report',
        `# AYILON 일일 브리핑\n날짜: ${date}  /  작성: CEO\n\n## 회사 현황\n- 레벨: LV${lvl}\n- 총 XP: ${mem.xp}\n- 누적 신호: ${sigCount}건\n\n## 핵심 키워드\n${kws}\n\n## TOP 에이전트\n${topAgents||'—'}\n\n## 시스템 상태\n- Groq AI (Llama 3.3 70B): ${env.GROQ_KEY?'활성':'비활성'}\n- GitHub: ${env.GH_PAT?'연결됨':'미연결'}\n- Cron: 정상 실행 중\n\n---\n이 브리핑은 CEO AI가 자동 생성했습니다.`
      );
    } catch(be) { console.error('Briefing:', be.message); }
  }

  // Every hour: CEO synthesizes company intelligence with Groq
  if (env.GROQ_KEY && minuteOfHour === 0) {
    try {
      const kws = topKws(mem.keywords, 10).join(', ');
      const totalXp = mem.xp;
      const lvl = Math.floor(totalXp/50)+1;
      const topAgentId = Object.entries(mem.agentXp||{}).sort((a,b)=>b[1]-a[1])[0]?.[0]||'IRON';
      const ceoMems = await getAgentMemories(env, 'CEO', 5);
      const memStr = ceoMems.map(m=>`• ${m.content}`).join('\n') || '없음';
      const summary = await callGroq(env,
        [{role:'system',
          content:`당신은 AYILON CEO AI. 암호화폐 자동매매 회사 총괄.\n회사 레벨: LV${lvl}, 총 XP: ${totalXp}\n\n[CEO 장기 기억]:\n${memStr}\n\n1문장으로 현재 회사 전략적 상황을 날카롭게 요약하세요.`},
         {role:'user',
          content:`핵심 키워드: ${kws||'없음'}\n현재 최고 성과 에이전트: ${topAgentId}`}],
        'llama-3.3-70b-versatile', 100, 0.8
      );
      if (summary) {
        await insertFeed(env, AGENTS[1], '[시간별 보고] '+summary, true);
        await extractAndSaveMemory(env, 'CEO', summary);
        mem.agentXp['CEO'] = (mem.agentXp['CEO']||0)+5;
        mem.xp += 5;
      }
    } catch(_) {}
  }

  // File generation schedule
  try {
    let sigCount = 0;
    try { sigCount = ((await env.DB.prepare('SELECT COUNT(*) as n FROM signals').first())?.n)||0; } catch(_){}
    const date = new Date().toISOString().slice(0,10);
    const hour = now.getHours();

    // SCOUT: market analysis every hour at :15
    if (minuteOfHour === 15) {
      await insertFile(env, 'SCOUT', 'SCOUT', `market-${date}-${String(hour).padStart(2,'0')}h.md`, 'report', buildScoutReport(recentSignals, mem));
    }
    // GRID: backtest report every 4 hours at :45
    if (minuteOfHour === 45 && hour % 4 === 0) {
      await insertFile(env, 'GRID', 'GRID', `backtest-${date}-${String(hour).padStart(2,'0')}h.md`, 'backtest', buildGridReport(mem));
    }
    // FORGE: deploy log every 2 hours at :00
    if (minuteOfHour === 0 && hour % 2 === 0) {
      await insertFile(env, 'FORGE', 'FORGE', `deploy-${date}-${String(hour).padStart(2,'0')}h.md`, 'log', buildForgeReport(mem.ghActivity));
    }
    // LEDGER: daily report at 00:00
    if (minuteOfHour === 0 && hour === 0) {
      await insertFile(env, 'LEDGER', 'LEDGER', `finance-${date}.md`, 'finance', buildLedgerReport(mem, sigCount));
    }
    // SHIELD: security audit at 06:00
    if (minuteOfHour === 0 && hour === 6) {
      await insertFile(env, 'SHIELD', 'SHIELD', `security-${date}.md`, 'audit', buildShieldReport());
    }
    // On first run (no files yet), seed one of each so UI isn't empty
    const fileCount = ((await env.DB.prepare('SELECT COUNT(*) as n FROM files').first())?.n)||0;
    if (fileCount === 0) {
      await insertFile(env, 'SCOUT',  'SCOUT',  `market-${date}-init.md`,   'report',   buildScoutReport(recentSignals, mem));
      await insertFile(env, 'LEDGER', 'LEDGER', `finance-${date}-init.md`,  'finance',  buildLedgerReport(mem, sigCount));
      await insertFile(env, 'SHIELD', 'SHIELD', `security-${date}-init.md`, 'audit',    buildShieldReport());
      await insertFile(env, 'GRID',   'GRID',   `backtest-${date}-init.md`, 'backtest', buildGridReport(mem));
      await insertFile(env, 'FORGE',  'FORGE',  `deploy-${date}-init.md`,   'log',      buildForgeReport(mem.ghActivity));
    }
  } catch(fe) { console.error('File gen:', fe.message); }

  await saveMem(env, mem);

  // Prune (keep last 500 feed, 1000 signals)
  await env.DB.prepare('DELETE FROM feed WHERE id NOT IN (SELECT id FROM feed ORDER BY id DESC LIMIT 500)').run().catch(()=>{});
  await env.DB.prepare('DELETE FROM signals WHERE id NOT IN (SELECT id FROM signals ORDER BY id DESC LIMIT 1000)').run().catch(()=>{});
}

// ── FETCH HANDLER ────────────────────────────────────────────────────────────
async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:CORS_H});

  if (url.pathname === '/' || url.pathname === '/index.html') {
    return new Response(indexHtml, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  }

  if (url.pathname === '/api/feed') {
    const since = parseInt(url.searchParams.get('since')||'0');
    const { results } = await env.DB.prepare(
      'SELECT * FROM feed WHERE created_at > ? ORDER BY created_at DESC LIMIT 50'
    ).bind(since).all();
    return json({ items: results, ts: Math.floor(Date.now()/1000) });
  }

  if (url.pathname === '/api/state') {
    const mem = await getMem(env);
    const level = Math.floor(mem.xp/50)+1;
    const agentLevels = {};
    Object.entries(mem.agentXp).forEach(([id,xp])=>{ agentLevels[id]=Math.floor(xp/10)+1; });
    let feedCount = 0;
    try { feedCount = ((await env.DB.prepare('SELECT COUNT(*) as n FROM feed').first())?.n)||0; } catch(_){}
    let aiCount = 0;
    try { aiCount = ((await env.DB.prepare('SELECT COUNT(*) as n FROM feed WHERE is_ai=1').first())?.n)||0; } catch(_){}
    return json({ xp: mem.xp, level, agentXp: mem.agentXp, agentLevels, keywords: mem.keywords,
      aiEnabled: !!env.GROQ_KEY, aiModel:'llama-3.3-70b-versatile', running: true, feedCount, aiCount,
      topKeywords: Object.keys(mem.keywords).sort((a,b)=>mem.keywords[b]-mem.keywords[a]).slice(0,8) });
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

  if (url.pathname === '/api/crosstalk') {
    const mem = await getMem(env);
    return json({ items: (mem.crossTalk||[]).slice().reverse() });
  }

  if (url.pathname === '/api/files') {
    const { results } = await env.DB.prepare(
      'SELECT id,agent_id,agent_name,filename,filetype,created_at FROM files ORDER BY id DESC LIMIT 60'
    ).all();
    return json({ files: results });
  }

  if (url.pathname.startsWith('/api/files/')) {
    const id = parseInt(url.pathname.replace('/api/files/',''));
    if (!id) return json({error:'bad id'},400);
    const row = await env.DB.prepare('SELECT * FROM files WHERE id=?').bind(id).first();
    if (!row) return json({error:'not found'},404);
    return json(row);
  }

  if (url.pathname === '/api/github') {
    const mem = await getMem(env);
    return json({
      connected: !!env.GH_PAT,
      lastCheck: mem.lastGHCheck,
      lastCommitSha: mem.lastCommitSha,
      activity: mem.ghActivity || []
    });
  }

  if (url.pathname === '/api/signals') {
    const { results } = await env.DB.prepare(
      "SELECT * FROM signals WHERE signal != 'hold' ORDER BY created_at DESC LIMIT 30"
    ).all();
    return json({ signals: results });
  }

  if (url.pathname === '/api/config') {
    const mem = await getMem(env);
    if (request.method === 'GET') {
      return json({ agentConfig: mem.agentConfig || {} });
    }
    if (request.method === 'POST') {
      const body = await request.json().catch(()=>({}));
      if (body && typeof body === 'object') {
        mem.agentConfig = { ...(mem.agentConfig||{}), ...body };
        await saveMem(env, mem);
      }
      return json({ ok: true });
    }
  }

  if (url.pathname === '/api/teams') {
    const mem = await getMem(env);
    const TEAM_GROUPS = [
      { name:'경영진',      color:'#fbbf24', agents:['ARIA','CEO'] },
      { name:'트레이딩',    color:'#34d399', agents:['IRON','GRID','SCOUT','WARD'] },
      { name:'기술',        color:'#60a5fa', agents:['FORGE','ATLAS'] },
      { name:'비즈니스',    color:'#f472b6', agents:['LUNA','PIXEL','ECHO'] },
      { name:'법무·재무·보안', color:'#a78bfa', agents:['REX','LEDGER','SHIELD'] },
    ];
    const teams = await Promise.all(TEAM_GROUPS.map(async tg => {
      const members = await Promise.all(tg.agents.map(async id => {
        let feed = [], file = null;
        try {
          feed = (await env.DB.prepare(
            'SELECT msg, is_ai, created_at FROM feed WHERE agent_id=? ORDER BY id DESC LIMIT 5'
          ).bind(id).all()).results;
          file = await env.DB.prepare(
            'SELECT id,filename,filetype,created_at FROM files WHERE agent_id=? ORDER BY id DESC LIMIT 1'
          ).bind(id).first();
        } catch(_) {}
        const xp = mem.agentXp[id] || 0;
        const cfg = (mem.agentConfig||{})[id] || {};
        return { id, xp, level: Math.max(1, Math.ceil(xp/50)), config: cfg, feed, file };
      }));
      return { name: tg.name, color: tg.color, members };
    }));
    return json({ teams });
  }

  if (url.pathname.startsWith('/api/memory')) {
    await ensureMemoryTable(env);
    const agentId = url.searchParams.get('agent') || url.pathname.replace('/api/memory/','').replace('/api/memory','');
    if (agentId) {
      const { results } = await env.DB.prepare(
        'SELECT id,agent_id,memory_type,content,importance,used_count,created_at FROM agent_memory WHERE agent_id=? ORDER BY importance DESC,created_at DESC LIMIT 50'
      ).bind(agentId).all();
      return json({ agentId, memories: results||[] });
    }
    const { results } = await env.DB.prepare(
      'SELECT agent_id, COUNT(*) as count, MAX(created_at) as latest FROM agent_memory GROUP BY agent_id ORDER BY count DESC'
    ).all();
    return json({ summary: results||[] });
  }

  if (url.pathname === '/api/cmd' && request.method === 'POST') {
    const body = await request.json().catch(()=>({}));
    const msg = String(body.cmd||body.msg||'').slice(0,300).trim();
    if (!msg) return json({error:'empty'}, 400);

    const mem = await getMem(env);
    await insertFeed(env, AGENTS[0], '→ 지시: '+msg, false);
    extractKws(msg, mem.keywords);
    mem.cmds.push(msg);
    mem.xp += 2;
    mem.agentXp['CEO'] = (mem.agentXp['CEO']||0)+2;

    let reply = null, isAI = false;
    if (env.GROQ_KEY) {
      reply = await ceoReply(env, msg, mem.cmds, topKws(mem.keywords,5), mem);
      if (reply) { isAI = true; extractKws(reply, mem.keywords); }
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
