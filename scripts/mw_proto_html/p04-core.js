/* ═══ MatchWise core — icons, helpers, router, shell ═══ */

/* ── Icons (inline SVG, lucide-style) ── */
const IC = {
  search:'<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.3 11.3 1.4 1.4M2 12h2m16 0h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  briefcase:'<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  shieldcheck:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  send:'<path d="M14.54 3.54 20.5 9.5a2 2 0 0 1 0 2.83L13.06 19.77a2 2 0 0 1-2.83 0L3.5 13.06V6.5A3 3 0 0 1 6.5 3.5h6.21a2 2 0 0 1 1.83.04Z"/><path d="m22 22-5-5"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  building:'<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  arrow:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
  right:'<path d="m9 18 6-6-6-6"/>',
  left:'<path d="m15 18-6-6 6-6"/>',
  sparkles:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  plus:'<path d="M5 12h14M12 5v14"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  cal:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  award:'<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
  mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
  activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  chart:'<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  wallet:'<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M16 12h.01"/>',
  logout2:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  filter:'<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  trend:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert:'<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  stethoscope:'<path d="M4.8 2.3A.3.3 0 1 0 5 2.9a.3.3 0 0 0-.2-.6M2 3.1a.3.3 0 1 0 .6 0 .3.3 0 0 0-.6 0M5 5v1.5A3.5 3.5 0 0 0 8.5 10h.02A3.5 3.5 0 0 0 12 6.5V5"/><path d="M12 6.5a4 4 0 1 0 8 0V5a1 1 0 0 0-1-1"/>',
  chef:'<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><path d="M6 17h12"/>',
  hardhat:'<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1Z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5M4 15v-3a6 6 0 0 1 6-6M20 15v-3a6 6 0 0 0-6-6"/>',
  home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
};
function ic(name, size = 16, cls = '') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}">${IC[name] || ''}</svg>`;
}

/* ── Logo ── */
function mwMark(size = 34) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" style="flex-shrink:0">
    <rect x="1" y="1" width="38" height="38" rx="10" fill="url(#g-royal)"/>
    <rect x="1" y="1" width="38" height="38" rx="10" stroke="rgba(255,255,255,.18)"/>
    <path d="M9.5 27.5V13.5L14.5 22 19.5 13.5V27.5" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M23 27.5V13.5L27 21.5 31 13.5V27.5" stroke="#F6C615" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function mwWordmark(light = false, size = 34) {
  return `<span class="flex aic gap10"><span style="color:${light ? '#fff' : 'var(--fg)'};font-size:${Math.round(size * .53)}px;font-weight:700" class="font-display nowrap">Match<span style="color:var(--gold)">Wise</span></span>${mwMark(size)}</span>`;
}

/* ── State ── */
const S = { user: null, route: '', param: '', jobFilter: 'All', appFilter: 'All', noteDraft: {} };
const ROLE_HOME = { applicant:'#/app/dashboard', employer:'#/emp/dashboard', agency:'#/agency/dashboard', staff:'#/fira/dashboard', admin:'#/fira/dashboard' };
const ROLE_TAG  = { applicant:'Applicant', employer:'Employer', agency:'Agency Partner', staff:'FIRA Staff', admin:'Super Admin' };

/* ── Generic helpers ── */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const initials = n => n.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const money = (min, max, cur) => `${cur} ${min.toLocaleString()} – ${max.toLocaleString()} / mo`;
function toast(title, msg = '', type = 'ok') {
  const box = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icon = type === 'ok' ? 'check' : type === 'err' ? 'alert' : 'info';
  el.innerHTML = `<span class="ti">${ic(icon, 20)}</span><span><span class="tt">${esc(title)}</span>${msg ? `<div class="tm">${esc(msg)}</div>` : ''}</span>`;
  box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, 3400);
}
function openModal(html) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="mback" onclick="if(event.target===this)MW.closeModal()"><div class="mbox">${html}</div></div>`;
}
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

/* ── Theme ── */
function applyTheme(t) {
  document.documentElement.classList.toggle('dark', t === 'dark');
  try { localStorage.setItem('mw_theme', t); } catch (e) {}
}
function getTheme() { try { return localStorage.getItem('mw_theme') || 'light'; } catch (e) { return 'light'; } }
function toggleTheme() { applyTheme(getTheme() === 'dark' ? 'light' : 'dark'); render(); }

/* ── Simulated AI match engine (deterministic — mirrors match-sim.ts) ── */
function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}
function simulateMatch(jobId, userSeed, requiredSkills = []) {
  const semantic = 55 + Math.round(hash01(`${userSeed}::${jobId}`) * 42);
  const skills = 52 + Math.round(hash01(`${jobId}::${userSeed}::s`) * 45);
  const experience = 58 + Math.round(hash01(`exp::${userSeed}::${jobId}`) * 40);
  const score = Math.min(99, Math.round(semantic * 0.4 + skills * 0.4 + experience * 0.2));
  const req = requiredSkills.length > 0 ? requiredSkills : ['Household management', 'Cooking', 'Child care', 'Elderly care'];
  const matchedCount = Math.max(1, Math.round((skills / 100) * req.length));
  const matchedSkills = req.slice(0, matchedCount);
  const missingSkills = req.slice(matchedCount);
  const why = [
    `${matchedSkills.length}/${req.length} required skills present on your profile.`,
    semantic >= 80 ? 'Strong semantic alignment between your resume and this job description.'
      : semantic >= 65 ? 'Good overall alignment with the role description.'
      : 'Partial alignment — consider tailoring your resume keywords.',
    experience >= 80 ? 'Your years of experience exceed the typical requirement.'
      : 'Your experience level is in the expected range for this role.',
  ];
  if (missingSkills.length > 0) why.push(`Missing: ${missingSkills.slice(0, 2).join(', ')} — AI Resume Boost can help.`);
  return { score, semanticPct: semantic, skillsPct: skills, experiencePct: experience, matchedSkills, missingSkills, why };
}

/* ── Match ring gauge ── */
function ring(score, size = 76, label = 'AI Match') {
  const r = (size - 9) / 2, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return `<div class="col aic" style="gap:5px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--muted)" stroke-width="7.5"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="url(#g-royal)" stroke-width="7.5" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" class="ring-txt" font-size="${Math.round(size*.26)}">${score}</text>
    <text x="50%" y="72%" text-anchor="middle" class="ring-lbl" font-size="${Math.round(size*.13)}">%</text></svg>
    ${label ? `<span class="tiny b up muted">${label}</span>` : ''}</div>`;
}
function goldChip(score) { return `<span class="gold-chip">${ic('sparkles', 11)}${score}% match</span>`; }

/* ── 19-state application tracker (mirrors status-timeline.tsx) ── */
const TRACKER_POS = ['applied','screening','shortlisted','interview','assessment','under_review','pending_fira_review','fira_approved','pending_employer_review','employer_accepted','processing','offered','hired','deployed','completed'];
const TRACKER_NEG = ['rejected','withdrawn','fira_rejected','employer_declined'];
const MILESTONES = [['Applied',0,0],['Screening',1,2],['Interview',3,5],['FIRA Review',6,7],['Employer',8,9],['Processing',10,12],['Deployed',13,13],['Completed',14,14]];
const STATUS_LABEL = { applied:'Applied', screening:'Screening', shortlisted:'Shortlisted', interview:'Interview', assessment:'Assessment', under_review:'Under Review', pending_fira_review:'Pending FIRA Review', fira_approved:'FIRA Approved', pending_employer_review:'Pending Employer Review', employer_accepted:'Employer Accepted', processing:'Processing', offered:'Offered', hired:'Hired', deployed:'Deployed', completed:'Completed', rejected:'Rejected', withdrawn:'Withdrawn', fira_rejected:'FIRA Rejected', employer_declined:'Employer Declined' };
function statusTone(st) {
  if (TRACKER_NEG.includes(st)) return 'bg-red';
  if (['offered','hired','deployed','completed','employer_accepted','fira_approved'].includes(st)) return 'bg-green';
  if (['pending_fira_review','pending_employer_review'].includes(st)) return 'bg-amber';
  return 'bg-blue';
}
function tracker(status, compact = false) {
  const negIdx = TRACKER_NEG.indexOf(status);
  const posIdx = TRACKER_POS.indexOf(status);
  const isNeg = negIdx >= 0;
  const current = isNeg ? 6 : posIdx;
  const msRow = compact ? '' : MILESTONES.map(([lb, from, to]) =>
    `<span class="ms ${current >= from && current <= to ? 'active' : current > to ? 'done' : ''}">${lb}</span>`).join('');
  const segs = TRACKER_POS.map((s, i) => {
    const done = i < current, active = i === current && !isNeg, branch = isNeg && i === current;
    return `<div class="seg ${done ? 'done' : ''} ${active ? 'active' : ''} ${branch ? 'branch' : ''}" title="${s.replace(/_/g, ' ')}"></div>`;
  }).join('');
  const foot = isNeg
    ? `<span class="st neg">Stopped — ${STATUS_LABEL[status]}</span><span class="nx">branch: ${status.replace(/_/g, ' ')}</span>`
    : `<span class="st">Step ${posIdx + 1} of 19 · ${STATUS_LABEL[status]}</span>${posIdx < TRACKER_POS.length - 1 ? `<span class="nx">next: ${TRACKER_POS[posIdx + 1].replace(/_/g, ' ')}</span>` : ''}`;
  return `<div class="tracker"><div class="ms-row">${msRow}</div><div class="track">${segs}</div><div class="foot">${foot}</div></div>`;
}
function statusBadge(st) { return `<span class="badge ${statusTone(st)}">${STATUS_LABEL[st] || st}</span>`; }

/* ── Endorsement 2-step flow ── */
const END_CFG = {
  pending_fira_review:     { tone:'bg-amber', label:'Pending FIRA Review', icon:'clock' },
  fira_approved:           { tone:'bg-green', label:'FIRA Approved', icon:'shieldcheck' },
  fira_rejected:           { tone:'bg-red', label:'FIRA Rejected', icon:'x' },
  pending_employer_review: { tone:'bg-blue', label:'Pending Employer', icon:'clock' },
  employer_accepted:       { tone:'bg-green', label:'Accepted by Employer', icon:'check' },
  employer_declined:       { tone:'bg-red', label:'Declined by Employer', icon:'x' },
};
function flowStep(st) {
  if (st === 'pending_fira_review') return 0;
  if (st === 'fira_approved' || st === 'pending_employer_review') return 1;
  if (st === 'employer_accepted') return 2;
  return -1;
}
function flow2Track(end) {
  const st = end.status, step = flowStep(st), neg = st === 'fira_rejected' || st === 'employer_declined';
  const s1 = st === 'pending_fira_review' ? 'Awaiting verification' : step >= 1 ? (st === 'fira_rejected' ? 'Rejected by FIRA' : 'Verified by FIRA') : '—';
  const s2 = step >= 2 ? (st === 'employer_declined' ? 'Declined by employer' : 'Accepted by employer')
    : st === 'pending_employer_review' ? 'Awaiting decision'
    : (st === 'pending_fira_review' || st === 'fira_approved') ? 'Pending FIRA' : '—';
  const cls = i => `n ${step > i || (i === 1 && step === 2) ? 'fill' : ''} ${neg && ((i === 0 && st === 'fira_rejected') || (i === 1 && st === 'employer_declined')) ? 'neg' : ''}`;
  return `<div class="flow2">
    <div class="stp ${step < 0 ? '' : ''}"><div class="${cls(0)}">1</div><div><p class="tiny b">Agency → FIRA</p><p class="micro muted">${s1}</p></div></div>
    <span class="arrow">${ic('arrow', 15)}</span>
    <div class="stp"><div class="${cls(1)}">2</div><div><p class="tiny b">Employer</p><p class="micro muted">${s2}</p></div></div></div>`;
}
function endBadge(st) { const c = END_CFG[st] || END_CFG.pending_fira_review; return `<span class="badge ${c.tone}">${ic(c.icon, 12)}${c.label}</span>`; }
function auditTrail(appId) {
  const h = DB.histories[appId] || [];
  return `<div class="audit">${h.map(x => `<div class="ai"><div class="d">${esc(x.d)} · ${esc(x.by)}</div><p class="small" style="margin-top:2px">${esc(x.n)}</p></div>`).join('')}</div>`;
}
function pushHistory(appId, by, n) {
  if (!DB.histories[appId]) DB.histories[appId] = [];
  DB.histories[appId].unshift({ d:'Oct 2, 2025', by, n });
}

/* ── Animated counter ── */
function animateCounters(scope) {
  const els = (scope || document).querySelectorAll('[data-count]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  els.forEach(el => {
    const target = +el.dataset.count;
    if (reduce) { el.textContent = target.toLocaleString(); return; }
    const t0 = performance.now(), dur = 850;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ── Auth ── */
function login(email, pw) {
  const u = DB.users.find(x => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u || u.pw !== pw) { toast('Sign-in failed', 'Invalid email or password. Try a demo account below.', 'err'); return false; }
  S.user = u;
  try { sessionStorage.setItem('mw_user', u.id); } catch (e) {}
  toast(`Welcome, ${u.name.split(' ')[0]}!`, `Signed in as ${ROLE_TAG[u.role]}.`, 'ok');
  location.hash = ROLE_HOME[u.role];
  render();
  return true;
}
function logout() {
  S.user = null;
  try { sessionStorage.removeItem('mw_user'); } catch (e) {}
  location.hash = '#/login';
  render();
}
function restoreSession() {
  try {
    const id = sessionStorage.getItem('mw_user');
    if (id) { const u = U(id); if (u) S.user = u; }
  } catch (e) {}
}

/* ── Nav config per role ── */
const NAVS = {
  applicant: [
    ['#/app/dashboard', 'Dashboard', 'home'],
    ['#/app/jobs', 'Job Board', 'briefcase'],
    ['#/app/applications', 'My Applications', 'file'],
    ['#/app/profile', 'My Profile', 'user'],
  ],
  employer: [
    ['#/emp/dashboard', 'Dashboard', 'home'],
    ['#/emp/jobs', 'Job Orders', 'briefcase'],
    ['#/emp/candidates', 'Candidates', 'users'],
    ['#/emp/endorsements', 'Endorsements', 'send'],
  ],
  agency: [
    ['#/agency/dashboard', 'Dashboard', 'home'],
    ['#/agency/candidates', 'Candidates', 'users'],
    ['#/agency/jobs', 'Job Orders', 'briefcase'],
    ['#/agency/endorsements', 'Endorsements', 'send'],
  ],
  fira: [
    ['#/fira/dashboard', 'Command Center', 'activity'],
    ['#/fira/applications', 'Applications', 'file'],
    ['#/fira/endorsements', 'Endorsements', 'shieldcheck'],
  ],
};

/* ── Shell (sidebar + topbar + content) ── */
const PAGE_TITLES = {
  '/app/dashboard':'Applicant Dashboard', '/app/jobs':'Job Board', '/app/jobs/id':'Job Details', '/app/applications':'My Applications', '/app/profile':'My Profile',
  '/emp/dashboard':'Employer Dashboard', '/emp/jobs':'Job Orders', '/emp/candidates':'Candidates', '/emp/endorsements':'Endorsements',
  '/agency/dashboard':'Agency Dashboard', '/agency/candidates':'Candidate Pool', '/agency/jobs':'Job Orders', '/agency/endorsements':'Endorsements',
  '/fira/dashboard':'FIRA Command Center', '/fira/applications':'Application Oversight', '/fira/endorsements':'Endorsement Verification',
};
function shell(content, activePath, titleOverride) {
  const u = S.user;
  const nav = NAVS[u.role === 'admin' ? 'fira' : u.role] || [];
  const navHtml = nav.map(([href, label, icon]) =>
    `<button class="side-item ${activePath === href ? 'on' : ''}" onclick="MW.go('${href}')">${ic(icon, 17)}<span class="side-txt">${label}</span></button>`).join('');
  const notifs = DB.notifications.filter(n => n.userId === u.id);
  const unread = notifs.filter(n => !n.read).length;
  const title = titleOverride || PAGE_TITLES[activePath.replace('#', '')] || 'MatchWise';
  return `<div class="shell">
    <aside class="sidebar">
      <div class="flex aic gap10" style="padding:4px 10px 16px">${mwWordmark(false, 32)}</div>
      <div style="padding:0 10px 6px"><span class="role-tag">${ROLE_TAG[u.role]}</span></div>
      <div class="side-label">Menu</div>
      ${navHtml}
      <div style="flex:1"></div>
      <div class="user-box card" style="padding:12px;margin:10px 4px 4px">
        <div class="flex aic gap10">
          <span class="avatar sm">${initials(u.name)}</span>
          <div class="grow ellip"><p class="small b ellip">${esc(u.name)}</p><p class="micro muted ellip">${esc(u.email)}</p></div>
        </div>
        <button class="btn btn-outline btn-sm w100" style="margin-top:10px" onclick="MW.logout()">${ic('out', 13)} Sign out</button>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <div class="grow"><h2 class="font-display" style="font-size:17px">${title}</h2></div>
        <div class="rel" style="width:min(300px,30vw)">
          <span class="rel" style="position:absolute;left:11px;top:9px;color:var(--muted-fg)">${ic('search', 15)}</span>
          <input class="input" style="padding-left:34px" placeholder="Search jobs, people…" onkeydown="if(event.key==='Enter')MW.toastInfo('Search','Prototype scope — search is simulated.')"/>
        </div>
        <button class="ibtn ${getTheme() === 'dark' ? 'on' : ''}" title="Toggle theme" onclick="MW.toggleTheme()">${ic(getTheme() === 'dark' ? 'sun' : 'moon', 17)}</button>
        ${u.role === 'applicant' ? `<div class="rel"><button class="ibtn" title="Notifications" onclick="MW.toggleNotif()">${ic('bell', 17)}${unread ? '<span class="dot-n"></span>' : ''}</button><div id="notif-dd"></div></div>` : ''}
        <button class="avatar" title="${esc(u.name)}" onclick="MW.toastInfo('Account','${esc(u.name)} · ${ROLE_TAG[u.role]}')">${initials(u.name)}</button>
      </header>
      <div class="content">${content}</div>
    </div></div>`;
}
function toggleNotif() {
  const dd = document.getElementById('notif-dd');
  if (!dd) return;
  if (dd.innerHTML) { dd.innerHTML = ''; return; }
  const notifs = DB.notifications.filter(n => n.userId === S.user.id);
  dd.innerHTML = `<div class="dd" style="min-width:340px">
    <div class="dd-h">Notifications ${notifs.filter(n => !n.read).length ? `<button class="btn btn-ghost btn-sm" onclick="MW.markAllRead()">Mark all read</button>` : ''}</div>
    ${notifs.length ? notifs.map(n => `<div class="dd-i" onclick="MW.readNotif('${n.id}')">
      ${!n.read ? '<span class="notif-dot"></span>' : '<span style="width:8px"></span>'}
      <span class="grow"><span class="small b">${esc(n.title)}</span><p class="tiny muted" style="margin-top:2px">${esc(n.msg)}</p><p class="micro muted" style="margin-top:3px">${n.time}</p></span>
      <span style="color:var(--muted-fg)">${ic(n.type === 'success' ? 'check' : 'info', 15)}</span></div>`).join('')
      : '<div class="empty" style="padding:26px">No notifications yet.</div>'}</div>`;
}
function readNotif(id) { const n = DB.notifications.find(x => x.id === id); if (n) n.read = true; toggleNotif(); toggleNotif(); render(); }
function markAllRead() { DB.notifications.forEach(n => { if (n.userId === S.user.id) n.read = true; }); toggleNotif(); toggleNotif(); render(); }
function toastInfo(t, m) { toast(t, m, 'info'); }

/* ── Router ── */
const VIEWS = {};
function render() {
  applyTheme(getTheme());
  const h = location.hash || '#/login';
  if (!S.user && h !== '#/login') { location.hash = '#/login'; return; }
  if (S.user && h === '#/login') { location.hash = ROLE_HOME[S.user.role]; return; }
  const parts = h.replace('#/', '').split('/');
  const area = parts[0], route = parts[1] || 'dashboard', param = parts[2] || '';
  S.route = area + '/' + route; S.param = param;
  const app = document.getElementById('app');
  if (h === '#/login') { app.innerHTML = VIEWS.login(); document.title = 'MatchWise — Clickable Prototype · FIRA Overseas Recruitment Platform'; return; }
  const key = area + '/' + route;
  const detailKey = key + '/id';
  const fn = (param && VIEWS[detailKey]) ? VIEWS[detailKey] : VIEWS[key];
  const activePath = '#/' + key;
  const dTitle = (param && VIEWS[detailKey]) ? PAGE_TITLES['/' + detailKey] : null;
  app.innerHTML = fn ? shell(fn(param), activePath, dTitle) : shell(`<div class="empty">${ic('search', 40)}<p>Screen not found in prototype.</p></div>`, activePath, dTitle);
  animateCounters(app);
  const titleKey = (param && VIEWS[detailKey]) ? detailKey : key;
  document.title = (PAGE_TITLES['/' + titleKey] || PAGE_TITLES['/' + key] || 'MatchWise') + ' · MatchWise Prototype';
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);

/* ── Public action API (inline handlers) ── */
const MW = { go: h => { location.hash = h; }, toggleTheme, toggleNotif, readNotif, markAllRead, login, logout, closeModal, toastInfo };
