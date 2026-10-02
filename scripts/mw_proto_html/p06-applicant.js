/* ═══ Applicant role — Maria Santos ═══ */
const CAT_ICONS = { 'Caregiver':'heart', 'Domestic Helper':'home', 'Nurse':'stethoscope', 'Factory Worker':'hardhat', 'Hospitality':'chef' };

VIEWS['app/dashboard'] = function () {
  const u = S.user;
  const mine = DB.applications.filter(a => a.appId === u.id);
  const active = mine.filter(a => !TRACKER_NEG.includes(a.status));
  const interviews = mine.filter(a => a.status === 'interview').length;
  const avg = active.length ? Math.round(active.reduce((s, a) => s + a.score, 0) / active.length) : 0;
  const top = DB.jobs.map(j => ({ j, m: simulateMatch(j.id, u.email, j.skills) }))
    .sort((a, b) => b.m.score - a.m.score).slice(0, 3);
  const notifs = DB.notifications.filter(n => n.userId === u.id);

  return `
  <div class="page-h">
    <h1>Welcome back, ${esc(u.name.split(' ')[0])}</h1>
    <p>Your overseas journey at a glance — ${active.length} active applications in the pipeline.</p>
  </div>
  <div class="grid4 mb24">
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Active applications</p><p class="num" data-count="${active.length}">0</p></div><span class="ic ic-blue">${ic('file', 19)}</span></div>
      <p class="tiny muted mt8">Across ${new Set(active.map(a => a.jobId)).size} job orders</p></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Avg AI match</p><p class="num" data-count="${avg}">0</p></div><span class="ic ic-gold">${ic('sparkles', 19)}</span></div>
      <p class="tiny muted mt8">Weighted 40/40/20 model</p></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Profile completeness</p><p class="num" data-count="${u.complete}">0</p></div><span class="ic ic-green">${ic('user', 19)}</span></div>
      <div class="pbar green mt8"><div class="fill" style="width:${u.complete}%"></div></div></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Interviews</p><p class="num" data-count="${interviews}">0</p></div><span class="ic ic-blue">${ic('cal', 19)}</span></div>
      <p class="tiny muted mt8">Next: Oct 9 · AI Amal Clinic</p></div>
  </div>

  <div class="split">
    <div class="col gap16">
      <div class="flex between aic">
        <h3 class="section-t">${ic('sparkles')} Top AI matches for you</h3>
        <button class="btn btn-ghost btn-sm" onclick="MW.go('#/app/jobs')">View all ${ic('right', 13)}</button>
      </div>
      ${top.map(({ j, m }) => `
      <div class="card card-hover job-card" style="cursor:pointer" onclick="MW.go('#/app/jobs/${j.id}')">
        <div class="brand-strip"></div>
        <div class="card-pad" style="padding-top:16px">
          <div class="jc-top">
            <div class="flex aic gap12">
              <span class="cat-ic">${ic(CAT_ICONS[j.cat] || 'briefcase', 19)}</span>
              <div><p class="b font-display" style="font-size:15px">${esc(j.title)}</p>
                <div class="flex wrap gap10 mt4">
                  <span class="job-meta">${ic('building')} ${esc(U(j.empId).company)}</span>
                  <span class="job-meta">${ic('pin')} ${j.city}, ${j.country}</span>
                </div></div>
            </div>
            ${ring(m.score, 64, '')}
          </div>
          <div class="flex between aic mt12">
            <span class="small b mono">${money(j.salaryMin, j.salaryMax, j.cur)}</span>
            <span class="btn btn-outline btn-sm">View job &amp; AI match ${ic('right', 12)}</span>
          </div>
        </div>
      </div>`).join('')}

      <h3 class="section-t mt8">${ic('file')} Active applications</h3>
      ${active.slice(0, 3).map(a => { const j = appJob(a); return `
      <div class="card card-pad">
        <div class="flex between aic mb12">
          <div><p class="b">${esc(j.title)}</p><p class="tiny muted">${esc(U(j.empId).company)} · applied ${a.date}</p></div>
          <div class="flex aic gap8">${goldChip(a.score)}${statusBadge(a.status)}</div>
        </div>
        ${tracker(a.status)}
      </div>`; }).join('')}
    </div>

    <div class="col gap16">
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('bell')} Notifications</h3>
        ${notifs.length ? notifs.map(n => `
        <div class="flex gap10 ${n.id !== notifs[notifs.length - 1].id ? 'pb12 mb12' : ''}" style="${n.id !== notifs[notifs.length - 1].id ? 'border-bottom:1px solid var(--border)' : ''}">
          <span class="ic ${n.type === 'success' ? 'ic-green' : 'ic-blue'}" style="width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center">${ic(n.type === 'success' ? 'check' : 'info', 14)}</span>
          <div class="grow"><p class="small b">${esc(n.title)}</p><p class="tiny muted" style="margin-top:2px">${esc(n.msg)}</p><p class="micro muted mt4">${n.time}</p></div>
        </div>`).join('') : '<p class="small muted">You are all caught up.</p>'}
      </div>
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('award')} Your documents</h3>
        ${u.docs.map(d => `<div class="flex between aic mb8"><span class="small">${d[0]}</span>
          <span class="badge ${d[2] ? 'bg-green' : 'bg-amber'}">${d[2] ? 'Verified' : 'Pending'}</span></div>`).join('')}
        <button class="btn btn-outline btn-sm w100 mt8" onclick="MW.toastInfo('AI Resume Boost','Prototype scope — resume parsing is simulated.')">${ic('sparkles', 13)} Run AI Resume Boost</button>
      </div>
    </div>
  </div>`;
};

VIEWS['app/jobs'] = function () {
  const u = S.user;
  const cats = ['All', ...new Set(DB.jobs.map(j => j.cat))];
  const jobs = DB.jobs.filter(j => S.jobFilter === 'All' || j.cat === S.jobFilter)
    .map(j => ({ j, m: simulateMatch(j.id, u.email, j.skills), applied: DB.applications.some(a => a.appId === u.id && a.jobId === j.id) }))
    .sort((a, b) => b.m.score - a.m.score);
  return `
  <div class="page-h"><h1>Job Board</h1><p>${DB.jobs.length} verified job orders from licensed Moroccan employers · ranked by AI match for you.</p></div>
  <div class="flex wrap gap8 mb16">${cats.map(c => `<button class="chip ${S.jobFilter === c ? 'on' : ''}" onclick="MW.filterJobs('${c}')">${c}</button>`).join('')}</div>
  <div class="grid2">
    ${jobs.map(({ j, m, applied }) => `
    <div class="card card-hover job-card" style="cursor:pointer" onclick="MW.go('#/app/jobs/${j.id}')">
      <div class="brand-strip"></div>
      <div class="card-pad" style="padding-top:16px">
        <div class="jc-top">
          <div class="flex aic gap12">
            <span class="cat-ic">${ic(CAT_ICONS[j.cat] || 'briefcase', 19)}</span>
            <div><p class="b font-display" style="font-size:15px">${esc(j.title)}</p>
              <div class="flex wrap gap10 mt4">
                <span class="job-meta">${ic('building')} ${esc(U(j.empId).company)}</span>
                <span class="job-meta">${ic('pin')} ${j.city}, ${j.country}</span>
              </div></div>
          </div>
          ${ring(m.score, 60, '')}
        </div>
        <div class="flex wrap gap10 mt12">
          <span class="job-meta">${ic('wallet')} <span class="b mono">${money(j.salaryMin, j.salaryMax, j.cur)}</span></span>
          <span class="job-meta">${ic('users')} ${j.slots - j.filled}/${j.slots} slots open</span>
          <span class="job-meta">${ic('cal')} Posted ${j.posted}</span>
        </div>
        <div class="flex between aic mt12">
          <div class="flex wrap gap6">${j.skills.slice(0, 3).map(s => `<span class="skill-chip">${esc(s)}</span>`).join('')}</div>
          ${applied ? '<span class="badge bg-green">Applied</span>' : `<span class="btn btn-outline btn-sm">View ${ic('right', 12)}</span>`}
        </div>
      </div>
    </div>`).join('')}
  </div>`;
};
MW.filterJobs = c => { S.jobFilter = c; render(); };

VIEWS['app/jobs/id'] = function (id) {
  const j = JOB(id);
  if (!j) return `<div class="empty">${ic('search', 40)}<p>Job not found.</p></div>`;
  const u = S.user;
  const m = simulateMatch(j.id, u.email, j.skills);
  const emp = U(j.empId);
  const applied = DB.applications.find(a => a.appId === u.id && a.jobId === j.id);
  return `
  <button class="btn btn-ghost btn-sm mb16" onclick="MW.go('#/app/jobs')">${ic('left', 13)} Back to Job Board</button>
  <div class="split">
    <div class="col gap16">
      <div class="card">
        <div class="brand-strip"></div>
        <div class="card-pad">
          <div class="flex aic gap12">
            <span class="cat-ic">${ic(CAT_ICONS[j.cat] || 'briefcase', 20)}</span>
            <div class="grow"><h1 class="font-display" style="font-size:21px">${esc(j.title)}</h1>
              <div class="flex wrap gap10 mt4">
                <span class="job-meta">${ic('building')} ${esc(emp.company)}</span>
                <span class="job-meta">${ic('pin')} ${j.city}, ${j.country}</span>
                <span class="job-meta">${ic('clock')} ${j.type}</span>
              </div></div>
            ${statusBadge(j.status === 'open' ? 'shortlisted' : 'completed')}
          </div>
          <div class="grid4 mt16" style="gap:10px">
            <div class="card" style="padding:12px;box-shadow:none"><p class="micro muted up b">Salary</p><p class="small b mono mt4">${money(j.salaryMin, j.salaryMax, j.cur)}</p></div>
            <div class="card" style="padding:12px;box-shadow:none"><p class="micro muted up b">Open slots</p><p class="small b mt4">${j.slots - j.filled} of ${j.slots}</p></div>
            <div class="card" style="padding:12px;box-shadow:none"><p class="micro muted up b">Agency</p><p class="small b mt4">${esc(U(j.agencyId).company)}</p></div>
            <div class="card" style="padding:12px;box-shadow:none"><p class="micro muted up b">Posted</p><p class="small b mt4">${j.posted}</p></div>
          </div>
        </div>
      </div>

      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('file')} About this role</h3>
        <p class="small" style="line-height:1.7">${esc(j.desc)}</p>
        <h4 class="b mt16 mb8" style="font-size:13px">Requirements</h4>
        <p class="small muted" style="line-height:1.7">${esc(j.reqs)}</p>
        <h4 class="b mt16 mb8" style="font-size:13px">Benefits</h4>
        <p class="small muted" style="line-height:1.7">${esc(j.benefits)}</p>
        <h4 class="b mt16 mb8" style="font-size:13px">Required skills</h4>
        <div class="flex wrap gap6">${j.skills.map(s => `<span class="skill-chip">${esc(s)}</span>`).join('')}</div>
      </div>

      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('shield')} Employer &amp; agency verification</h3>
        <div class="grid2">
          <div class="flex aic gap10"><span class="ic-green" style="width:34px;height:34px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center">${ic('shieldcheck', 16)}</span>
            <div><p class="small b">${esc(emp.company)}</p><p class="tiny muted">FIRA-verified employer · since ${emp.since}</p></div></div>
          <div class="flex aic gap10"><span class="ic-blue" style="width:34px;height:34px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center">${ic('award', 16)}</span>
            <div><p class="small b">${esc(U(j.agencyId).company)}</p><p class="tiny muted">DMW license ${esc(U(j.agencyId).license || '—')}</p></div></div>
        </div>
      </div>
    </div>

    <div class="col gap16">
      <div class="card">
        <div class="brand-strip"></div>
        <div class="card-pad">
          <div class="tc mb16">${ring(m.score, 110, 'AI Match Score')}</div>
          <p class="tiny muted tc mb16" style="margin-top:-6px">Weighted model · 0.40 semantic + 0.40 skills + 0.20 experience</p>
          <div class="wbar"><div class="row"><span class="b">Semantic fit</span><span class="mono b">${m.semanticPct}%</span></div><div class="track"><div class="fill" style="width:${m.semanticPct}%"></div></div></div>
          <div class="wbar"><div class="row"><span class="b">Skills overlap</span><span class="mono b">${m.skillsPct}%</span></div><div class="track"><div class="fill" style="width:${m.skillsPct}%"></div></div></div>
          <div class="wbar gold"><div class="row"><span class="b">Experience</span><span class="mono b">${m.experiencePct}%</span></div><div class="track"><div class="fill" style="width:${m.experiencePct}%"></div></div></div>
          <div class="mt16">
            <p class="tiny b up muted mb8" style="letter-spacing:.06em">Matched skills</p>
            <div class="flex wrap gap6 mb12">${m.matchedSkills.map(s => `<span class="skill-chip">${ic('check', 11)} ${esc(s)}</span>`).join('')}</div>
            ${m.missingSkills.length ? `<p class="tiny b up muted mb8" style="letter-spacing:.06em">Skill gaps</p>
            <div class="flex wrap gap6 mb12">${m.missingSkills.map(s => `<span class="skill-chip miss">${esc(s)}</span>`).join('')}</div>` : ''}
            <p class="tiny b up muted mb8" style="letter-spacing:.06em">Why this match</p>
            <ul style="list-style:none" class="col gap6">
              ${m.why.map(w => `<li class="flex gap8 small muted" style="line-height:1.55"><span style="color:var(--primary);flex-shrink:0;margin-top:2px">${ic('sparkles', 12)}</span>${esc(w)}</li>`).join('')}
            </ul>
          </div>
          ${applied
            ? `<button class="btn btn-outline btn-lg w100 mt16" disabled>${ic('check', 15)} Applied — tracking ${applied.id.toUpperCase()}</button>`
            : `<button class="btn btn-primary btn-lg w100 mt16" onclick="MW.apply('${j.id}')">${ic('send', 15)} Apply with MatchWise profile</button>`}
          <p class="micro muted tc mt8">Your verified documents attach automatically.</p>
        </div>
      </div>
    </div>
  </div>`;
};
MW.apply = function (jobId) {
  const u = S.user;
  const j = JOB(jobId);
  const m = simulateMatch(jobId, u.email, j.skills);
  const id = 'app' + Date.now();
  DB.applications.unshift({ id, appId: u.id, jobId, status:'applied', score: m.score, date:'Oct 2', stage:0, note:'Application submitted via MatchWise profile.' });
  pushHistory(id, 'System', 'Application submitted via MatchWise profile.');
  toast('Application submitted', `${j.title} — AI match ${m.score}%. Track it in My Applications.`, 'ok');
  render();
};

VIEWS['app/applications'] = function () {
  const u = S.user;
  let mine = DB.applications.filter(a => a.appId === u.id);
  if (S.appFilter !== 'All') mine = mine.filter(a => S.appFilter === 'Active' ? TRACKER_POS.includes(a.status) : S.appFilter === 'Closed' ? TRACKER_NEG.includes(a.status) : true);
  const counts = { All: DB.applications.filter(a => a.appId === u.id).length,
    Active: DB.applications.filter(a => a.appId === u.id && TRACKER_POS.includes(a.status)).length,
    Closed: DB.applications.filter(a => a.appId === u.id && TRACKER_NEG.includes(a.status)).length };
  return `
  <div class="page-h"><h1>My Applications</h1><p>Every application tracked across the 19-state government-compliant pipeline.</p></div>
  <div class="flex wrap gap8 mb16">${['All','Active','Closed'].map(c =>
    `<button class="chip ${S.appFilter === c ? 'on' : ''}" onclick="MW.filterApps('${c}')">${c} · ${counts[c]}</button>`).join('')}</div>
  <div class="col gap16">
    ${mine.length ? mine.map(a => { const j = appJob(a), neg = TRACKER_NEG.includes(a.status); return `
    <div class="card card-hover">
      <div class="brand-strip" style="${neg ? 'background:linear-gradient(90deg,#ef4444,#f87171)' : ''}"></div>
      <div class="card-pad">
        <div class="flex between aic mb12 wrap gap8">
          <div class="flex aic gap12">
            <span class="cat-ic">${ic(CAT_ICONS[j.cat] || 'briefcase', 18)}</span>
            <div><p class="b font-display" style="font-size:15px">${esc(j.title)}</p>
              <div class="flex wrap gap10 mt4">
                <span class="job-meta">${ic('building')} ${esc(U(j.empId).company)}</span>
                <span class="job-meta">${ic('pin')} ${j.city}, ${j.country}</span>
                <span class="job-meta">${ic('cal')} Applied ${a.date}, 2025</span>
              </div></div>
          </div>
          <div class="flex aic gap8">${goldChip(a.score)}${statusBadge(a.status)}</div>
        </div>
        ${tracker(a.status)}
        <div class="flex between aic mt12 wrap gap8">
          <p class="tiny muted ellip" style="max-width:70%">${esc(a.note)}</p>
          <div class="flex gap8">
            <button class="btn btn-ghost btn-sm" onclick="MW.viewApp('${a.id}')">${ic('activity', 13)} History</button>
            ${['applied','screening','shortlisted'].includes(a.status) ? `<button class="btn btn-outline btn-sm" onclick="MW.withdraw('${a.id}')">${ic('x', 13)} Withdraw</button>` : ''}
          </div>
        </div>
      </div>
    </div>`; }).join('') : `<div class="card"><div class="empty">${ic('file', 40)}<p>No applications in this view.</p></div></div>`}
  </div>`;
};
MW.filterApps = c => { S.appFilter = c; render(); };
MW.withdraw = function (id) {
  const a = APP(id);
  openModal(`<div class="card-pad">
    <h3 class="font-display mb8" style="font-size:17px">Withdraw application?</h3>
    <p class="small muted mb16">This stops the ${STATUS_LABEL[a.status]} process for <b>${esc(appJob(a).title)}</b>. You can always re-apply while the job order is open.</p>
    <div class="flex gap8" style="justify-content:flex-end">
      <button class="btn btn-outline" onclick="MW.closeModal()">Keep application</button>
      <button class="btn btn-danger" onclick="MW.withdrawConfirm('${id}')">${ic('x', 13)} Withdraw</button>
    </div></div>`);
};
MW.withdrawConfirm = function (id) {
  const a = APP(id);
  a.status = 'withdrawn';
  pushHistory(id, `Applicant · ${S.user.name}`, 'Withdrew application voluntarily.');
  closeModal(); toast('Application withdrawn', STATUS_LABEL[a.status] + ' recorded in your history.', 'info');
  render();
};
MW.viewApp = function (id) {
  const a = APP(id), j = appJob(a), u = appUser(a);
  openModal(`<div class="card-pad">
    <div class="flex between aic mb16"><h3 class="font-display" style="font-size:17px">Application history</h3>
      <button class="ibtn" onclick="MW.closeModal()">${ic('x', 16)}</button></div>
    <div class="flex aic gap10 mb16"><span class="avatar sm">${initials(u.name)}</span>
      <div class="grow"><p class="small b">${esc(u.name)} → ${esc(j.title)}</p><p class="micro muted">${esc(U(j.empId).company)} · ${goldChip(a.score)}</p></div>
      ${statusBadge(a.status)}</div>
    ${tracker(a.status)}
    <p class="tiny b up muted mb8 mt16" style="letter-spacing:.06em">Audit trail</p>
    ${auditTrail(a.id)}</div>`);
};

VIEWS['app/profile'] = function () {
  const u = S.user;
  return `
  <div class="page-h"><h1>My Profile</h1><p>This profile powers your AI match scores — keep it complete and verified.</p></div>
  <div class="split">
    <div class="col gap16">
      <div class="card card-pad">
        <div class="flex aic gap16">
          <span class="avatar lg">${initials(u.name)}</span>
          <div class="grow"><h2 class="font-display" style="font-size:19px">${esc(u.name)}</h2>
            <div class="flex wrap gap8 mt4">
              <span class="badge bg-blue">${esc(u.type)}</span>
              <span class="badge bg-gray">${esc(u.edu)}</span>
              <span class="badge bg-gray">${u.years} yrs experience</span>
            </div>
            <p class="tiny muted mt8">${esc(u.city)} · ${esc(u.phone || '+63 917 000 0000')} · Prefers ${esc(u.pref)}</p></div>
        </div>
        <div class="mt16">
          <div class="flex between aic mb8"><span class="small b">Profile completeness</span><span class="mono b">${u.complete}%</span></div>
          <div class="pbar green"><div class="fill" style="width:${u.complete}%"></div></div>
          <p class="tiny muted mt8">Verified documents and detailed skills raise your AI match ceiling.</p>
        </div>
      </div>
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('award')} Skills</h3>
        <table class="tbl"><thead><tr><th>Skill</th><th>Level</th><th style="text-align:right">Years</th></tr></thead>
        <tbody>${u.skills.map(s => `<tr><td class="b small">${esc(s[0])}</td><td><span class="badge ${s[1] === 'Advanced' ? 'bg-green' : 'bg-blue'}">${s[1]}</span></td><td class="mono tr small">${s[2]}</td></tr>`).join('')}</tbody></table>
      </div>
      <div class="grid2">
        <div class="card card-pad">
          <h3 class="section-t mb12">${ic('globe')} Languages</h3>
          ${u.langs.map(l => `<div class="flex between aic mb8"><span class="small b">${l[0]}</span><span class="badge bg-gray">${l[1]}</span></div>`).join('')}
        </div>
        <div class="card card-pad">
          <h3 class="section-t mb12">${ic('award')} Certifications</h3>
          ${u.certs.map(c => `<div class="mb12"><p class="small b">${c[0]}</p><p class="micro muted">Issued by ${c[1]}</p></div>`).join('')}
        </div>
      </div>
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('briefcase')} Experience</h3>
        <div class="flex aic gap12"><span class="cat-ic">${ic('briefcase', 18)}</span>
          <div><p class="small b">${esc(u.exp.position)} — ${esc(u.exp.company)}</p>
          <p class="tiny muted">${esc(u.exp.period)} · ${esc(u.exp.country)}</p>
          <p class="small muted mt4" style="line-height:1.6">${esc(u.exp.desc)}</p></div></div>
      </div>
    </div>
    <div class="col gap16">
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('shield')} Documents &amp; verification</h3>
        ${u.docs.map(d => `<div class="flex between aic mb10">
          <div class="flex aic gap8">${ic('file', 14)}<span class="small b">${d[0]}</span></div>
          <div class="flex aic gap8"><span class="micro muted">${d[1]}</span>
            <span class="badge ${d[2] ? 'bg-green' : 'bg-amber'}">${d[2] ? 'Verified' : 'Pending'}</span></div></div>`).join('')}
        <div class="mt12">
          <div class="flex between aic mb8"><span class="small b">Passport</span></div>
          <p class="tiny muted">${esc(u.passport)}</p>
          <div class="flex between aic mt12 mb8"><span class="small b">Medical</span><span class="badge bg-green">${esc(u.medical)}</span></div>
        </div>
      </div>
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('sparkles')} AI Resume Boost</h3>
        <p class="small muted mb12" style="line-height:1.65">Upload your latest resume and the simulated parser extracts skills, certifications, and experience — then suggests keywords for your target roles.</p>
        <button class="btn btn-gold w100" onclick="MW.toastInfo('AI Resume Boost','Prototype scope — resume parsing is simulated.')">${ic('sparkles', 14)} Enhance my resume</button>
      </div>
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('bell')} Job preferences</h3>
        ${[['Preferred country','Morocco'],['Preferred role', u.type],['Salary expectation', u.salary || 'USD 500 – 900'],['Availability', u.avail || 'Nov 2025']].map(r =>
          `<div class="flex between mb8"><span class="tiny muted">${r[0]}</span><span class="small b">${esc(r[1])}</span></div>`).join('')}
        <button class="btn btn-outline btn-sm w100 mt8" onclick="MW.toastInfo('Preferences','Prototype scope — editing is simulated.')">Edit preferences</button>
      </div>
    </div>
  </div>`;
};
