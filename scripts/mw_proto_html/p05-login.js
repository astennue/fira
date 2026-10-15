/* ═══ Login / Landing ═══ */
VIEWS.login = function () {
  const demo = [
    ['applicant@fira.com.ph', 'Applicant · Maria Santos', 'user'],
    ['employer@fira.com.ph', 'Employer · Al Baraka Holding', 'building'],
    ['amal@fira.com.ph', 'Employer · AI Amal Clinic', 'heart'],
    ['agency@fira.com.ph', 'Agency · Manila Recruitment Corp', 'briefcase'],
    ['staff@fira.com.ph', 'FIRA Staff · Verification', 'shieldcheck'],
    ['admin@fira.com.ph', 'Super Admin · Executive', 'activity'],
  ];
  const demoRows = demo.map(([em, lbl, icon]) =>
    `<div class="demo-row" onclick="MW.demoLogin('${em}')">
      <span class="ic-blue" style="width:32px;height:32px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;color:var(--secondary-fg)">${ic(icon, 15)}</span>
      <span class="grow"><span class="small b">${lbl}</span><br/><span class="em">${em} · ${em.split('@')[0]}2025!</span></span>
      ${ic('right', 14)}</div>`).join('');

  return `
  <div class="topnav">
    <div class="flex aic gap10">${mwWordmark(false, 34)}</div>
    <div class="flex aic gap12">
      <button class="ibtn ${getTheme() === 'dark' ? 'on' : ''}" onclick="MW.toggleTheme()" title="Toggle light / dark">${ic(getTheme() === 'dark' ? 'sun' : 'moon', 17)}</button>
      <a class="btn btn-primary btn-sm" href="#/login">Sign in</a>
    </div>
  </div>
  <div class="login-wrap" style="min-height:calc(100vh - 61px)">
    <section class="login-hero">
      <div style="position:relative;z-index:2;max-width:560px">
        <span class="hero-chip">${ic('sparkles', 13)} AI-powered overseas recruitment</span>
        <h1 class="font-display" style="font-size:clamp(30px,4vw,44px);line-height:1.12;margin-top:22px;letter-spacing:-.02em">
          One Platform.<br/>Smarter Matching.<br/><span style="color:var(--gold)">Better Hiring.</span></h1>
        <p style="color:#c3cfe8;margin-top:16px;font-size:15px;max-width:480px">
          MatchWise connects verified Filipino workers with licensed Moroccan employers —
          with simulated AI matching, a 19-state government-compliant pipeline, and a two-step
          FIRA endorsement flow that protects every party.</p>
        <div class="flex wrap gap8" style="margin-top:20px">
          <span class="hero-chip">${ic('user', 12)} Applicants</span>
          <span class="hero-chip">${ic('building', 12)} Employers</span>
          <span class="hero-chip">${ic('briefcase', 12)} Licensed Agencies</span>
          <span class="hero-chip">${ic('shieldcheck', 12)} FIRA Staff</span>
        </div>
        <div class="grid3" style="margin-top:30px;gap:12px">
          <div class="hero-stat"><div class="n mono">19</div><div class="l">Pipeline states</div></div>
          <div class="hero-stat"><div class="n mono">2-Step</div><div class="l">Endorsement flow</div></div>
          <div class="hero-stat"><div class="n mono">40/40/20</div><div class="l">AI match weights</div></div>
        </div>
      </div>
      <div style="position:relative;z-index:2;margin-top:auto;padding-top:34px;max-width:430px">
        <div class="mock-card">
          <div class="flex between aic mb12">
            <span class="flex aic gap8">${mwMark(24)}<span class="small b">MatchWise Console</span></span>
            <span class="badge bg-blue">LIVE DEMO</span>
          </div>
          <div class="flex aic gap12 mb8"><span class="avatar sm">MS</span>
            <div class="grow"><p class="tiny b">Maria Santos · Caregiver</p><p class="micro muted">92% AI match · Interview Oct 9</p></div>
            <span class="badge bg-green">Interview</span></div>
          ${tracker('interview', true)}
          <div class="flex gap8" style="margin-top:12px">
            <span class="skill-chip">Elderly care</span><span class="skill-chip">First aid</span>
            <span class="skill-chip">Patient care</span><span class="skill-chip miss">+3</span>
          </div>
        </div>
        <p class="micro" style="color:#8b9ac2;margin-top:14px">High-fidelity clickable prototype · MatchWise × FIRA · Oct 2025</p>
      </div>
    </section>

    <section class="login-panel">
      <div class="login-card">
        <h2 class="font-display" style="font-size:24px">Welcome back</h2>
        <p class="muted small" style="margin:6px 0 22px">Sign in to your MatchWise workspace — or jump in with a demo account.</p>
        <form onsubmit="event.preventDefault();MW.login(this.email.value,this.pw.value)">
          <div class="field"><label class="label">Email address</label>
            <input class="input" name="email" type="email" placeholder="you@fira.com.ph" required autocomplete="off"/></div>
          <div class="field"><label class="label">Password</label>
            <input class="input" name="pw" type="password" placeholder="••••••••••" required autocomplete="off"/></div>
          <button class="btn btn-primary btn-lg w100" type="submit">${ic('out', 15)} Sign in to MatchWise</button>
        </form>
        <div class="flex aic gap12" style="margin:20px 0"><span class="grow" style="height:1px;background:var(--border)"></span>
          <span class="micro muted up b">Demo accounts</span><span class="grow" style="height:1px;background:var(--border)"></span></div>
        <div class="col gap8">${demoRows}</div>
        <p class="micro muted tc" style="margin-top:18px">Prototype only — no real data is transmitted. Passwords are pre-filled demo values.</p>
      </div>
    </section>
  </div>`;
};

/* demo quick login */
MW.demoLogin = function (email) { login(email, DB.users.find(u => u.email === email).pw); };
