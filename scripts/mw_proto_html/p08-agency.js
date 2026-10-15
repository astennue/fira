/* ═══ Agency role — Manila Recruitment Corp ═══ */
const agencyCandidates = () => DB.users.filter(u => u.role === 'applicant');

VIEWS['agency/dashboard'] = function () {
  const u = S.user;
  const cands = agencyCandidates();
  const ends = DB.endorsements.filter(e => e.status === 'pending_fira_review' || e.status === 'pending_employer_review');
  const placements = DB.applications.filter(a => ['hired','deployed','completed','employer_accepted'].includes(a.status)).length;
  const funnel = [
    ['Candidates', cands.length, 'var(--muted-fg)'],
    ['Endorsed to FIRA', DB.endorsements.length, '#1f3fa6'],
    ['FIRA approved', DB.endorsements.filter(e => ['fira_approved','pending_employer_review','employer_accepted'].includes(e.status)).length, '#3d6be0'],
    ['Employer accepted', DB.endorsements.filter(e => e.status === 'employer_accepted').length, '#16a34a'],
  ];
  const top = DB.applications.filter(a => TRACKER_POS.includes(a.status)).sort((a, b) => b.score - a.score).slice(0, 5);
  return `
  <div class="page-h"><h1>${esc(u.company)}</h1><p>DMW license ${u.license} · ${u.city} · deployment partner for Moroccan employers.</p></div>
  <div class="grid4 mb24">
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Candidate pool</p><p class="num" data-count="${cands.length}">0</p></div><span class="ic ic-blue">${ic('users', 19)}</span></div>
      <p class="tiny muted mt8">${cands.filter(c => c.complete >= 80).length} deployment-ready</p></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Endorsements active</p><p class="num" data-count="${ends.length}">0</p></div><span class="ic ic-gold">${ic('send', 19)}</span></div>
      <p class="tiny muted mt8">In the 2-step flow</p></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Job orders</p><p class="num" data-count="${DB.jobs.length}">0</p></div><span class="ic ic-blue">${ic('briefcase', 19)}</span></div>
      <p class="tiny muted mt8">${DB.jobs.reduce((s, j) => s + (j.slots - j.filled), 0)} open slots</p></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Placements</p><p class="num" data-count="${placements}">0</p></div><span class="ic ic-green">${ic('check', 19)}</span></div>
      <p class="tiny muted mt8">Hired / deployed lifetime</p></div>
  </div>

  <div class="split">
    <div class="col gap16">
      <div class="card card-pad">
        <h3 class="section-t mb16">${ic('trend')} Endorsement funnel</h3>
        <div class="col gap10">
        ${funnel.map(([lb, v, c], i) => `
          <div class="cbar" style="grid-template-columns:150px 1fr 34px">
            <span class="lb">${lb}</span>
            <div class="tr" style="height:20px"><div class="fl" style="width:${Math.round(v / funnel[0][1] * 100)}%;opacity:${1 - i * .12}"></div></div>
            <span class="vl">${v}</span></div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="flex between aic" style="padding:18px 20px 0"><h3 class="section-t">${ic('sparkles')} Highest-scoring active candidates</h3>
          <button class="btn btn-ghost btn-sm" onclick="MW.go('#/agency/candidates')">Candidate pool ${ic('right', 13)}</button></div>
        <div style="padding:10px 20px 18px">
        <table class="tbl"><thead><tr><th>Candidate</th><th>Job order</th><th>Match</th><th>Status</th><th></th></tr></thead>
        <tbody>${top.map(a => { const ap = appUser(a), j = appJob(a); return `
          <tr><td><div class="flex aic gap8"><span class="avatar sm">${initials(ap.name)}</span><span class="b small">${esc(ap.name)}</span></div></td>
            <td class="small ellip" style="max-width:210px">${esc(j.title)}</td>
            <td>${goldChip(a.score)}</td><td>${statusBadge(a.status)}</td>
            <td>${!DB.endorsements.some(e => e.appId === a.id) && ['shortlisted','interview','assessment'].includes(a.status)
              ? `<button class="btn btn-gold btn-sm" onclick="MW.endorseModal('${ap.id}')">${ic('send', 12)} Endorse</button>` : ''}</td></tr>`; }).join('')}</tbody></table>
        </div>
      </div>
    </div>
    <div class="col gap16">
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('send')} Quick actions</h3>
        <div class="col gap8">
          <button class="btn btn-primary w100" onclick="MW.endorseModal()">${ic('send', 14)} Endorse candidate to FIRA</button>
          <button class="btn btn-outline w100" onclick="MW.go('#/agency/jobs')">${ic('briefcase', 14)} Browse job orders</button>
          <button class="btn btn-outline w100" onclick="MW.toastInfo('DMW reporting','Prototype scope — government reporting is simulated.')">${ic('chart', 14)} Submit DMW report</button>
        </div>
      </div>
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('clock')} Flow status</h3>
        ${Object.entries({ 'Awaiting FIRA (step 1)': DB.endorsements.filter(e => e.status === 'pending_fira_review').length,
          'Awaiting employer (step 2)': DB.endorsements.filter(e => e.status === 'pending_employer_review').length,
          'Accepted': DB.endorsements.filter(e => e.status === 'employer_accepted').length,
          'Declined / rejected': DB.endorsements.filter(e => ['employer_declined','fira_rejected'].includes(e.status)).length }).map(([k, v]) =>
          `<div class="flex between aic mb8"><span class="small muted">${k}</span><span class="mono b">${v}</span></div>`).join('')}
      </div>
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('shield')} Agency compliance</h3>
        ${[['DMW license','bg-green','Active'],['POEA bond','bg-green','Renewed 2025'],['Field audits','bg-green','Passed Mar 2025'],['Placement fee cap','bg-green','Compliant']].map(r =>
          `<div class="flex between aic mb8"><span class="small">${r[0]}</span><span class="badge ${r[1]}">${r[2]}</span></div>`).join('')}
      </div>
    </div>
  </div>`;
};

VIEWS['agency/candidates'] = function () {
  const cands = agencyCandidates();
  return `
  <div class="page-h"><h1>Candidate Pool</h1><p>${cands.length} registered applicants · AI-scored against all open job orders.</p></div>
  <div class="grid3">
    ${cands.map(c => {
      const best = DB.jobs.map(j => ({ j, m: simulateMatch(j.id, c.email, j.skills) })).sort((a, b) => b.m.score - a.m.score)[0];
      const active = DB.applications.filter(a => a.appId === c.id && TRACKER_POS.includes(a.status)).length;
      const endorsed = DB.endorsements.some(e => e.appId && endApp(e).appId === c.id && e.status === 'pending_fira_review');
      return `
      <div class="card card-hover">
        <div class="card-pad">
          <div class="flex between aic mb12">
            <div class="flex aic gap10"><span class="avatar">${initials(c.name)}</span>
              <div><p class="small b">${esc(c.name)}</p><p class="micro muted">${esc(c.type)} · ${esc(c.city)}</p></div></div>
            ${ring(best.m.score, 52, '')}
          </div>
          <p class="tiny muted mb4">Best match</p><p class="small b mb8 ellip">${esc(best.j.title)}</p>
          <div class="flex wrap gap6 mb12">${(c.skills || []).slice(0, 3).map(s => `<span class="skill-chip">${esc(s[0])}</span>`).join('')}</div>
          <div class="flex between aic mb12">
            <span class="badge ${c.complete >= 80 ? 'bg-green' : 'bg-amber'}">Profile ${c.complete}%</span>
            <span class="tiny muted">${active} active app${active === 1 ? '' : 's'}</span>
          </div>
          <button class="btn ${endorsed ? 'btn-outline' : 'btn-gold'} btn-sm w100" ${endorsed ? 'disabled' : ''}
            onclick="MW.endorseModal('${c.id}')">${endorsed ? 'Endorsed — awaiting FIRA' : `${ic('send', 13)} Endorse to FIRA`}</button>
        </div>
      </div>`; }).join('')}
  </div>`;
};
MW.endorseModal = function (candId) {
  const cands = agencyCandidates().filter(c => c.complete >= 55);
  const sel = candId || cands[0].id;
  openModal(`<div class="card-pad">
    <div class="flex between aic mb16"><h3 class="font-display" style="font-size:17px">Endorse candidate to FIRA</h3>
      <button class="ibtn" onclick="MW.closeModal()">${ic('x', 16)}</button></div>
    <form onsubmit="event.preventDefault();MW.endorseSubmit(this)">
      <div class="field"><label class="label">Candidate</label>
        <select class="input" name="cand">${cands.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.name)} — ${esc(c.type)} (${c.complete}% profile)</option>`).join('')}</select></div>
      <div class="field"><label class="label">Job order</label>
        <select class="input" name="job">${DB.jobs.map(j => `<option value="${j.id}">${esc(j.title)} — ${esc(U(j.empId).company)}</option>`).join('')}</select></div>
      <div class="field"><label class="label">Agency endorsement note</label>
        <textarea class="input" name="note" placeholder="Why this candidate is ready for FIRA verification…">Verified documents, passed medical, and strong interview feedback. Recommend FIRA approval.</textarea></div>
      <button class="btn btn-primary btn-lg w100" type="submit">${ic('send', 14)} Submit endorsement — step 1</button>
      <p class="micro muted tc mt8">FIRA verifies documents first, then the employer makes the final decision.</p>
    </form></div>`);
};
MW.endorseSubmit = function (form) {
  const f = new FormData(form);
  const cand = U(f.get('cand')), job = JOB(f.get('job'));
  let app = DB.applications.find(a => a.appId === cand.id && a.jobId === job.id);
  if (!app) {
    const m = simulateMatch(job.id, cand.email, job.skills);
    app = { id:'app' + Date.now(), appId: cand.id, jobId: job.id, status:'applied', score: m.score, date:'Oct 2', stage:0, note:'Submitted by agency.' };
    DB.applications.unshift(app);
  }
  app.status = 'pending_fira_review';
  const eid = 'E-' + Math.floor(1050 + Math.random() * 900);
  DB.endorsements.unshift({ id: eid, appId: app.id, employerId: job.empId, status:'pending_fira_review', created:'Oct 2, 2025',
    agencyNote: f.get('note'), firaNote:'', employerNote:'' });
  pushHistory(app.id, `Agency · ${S.user.company}`, `Endorsed to FIRA — endorsement ${eid} created (step 1).`);
  DB.audits.unshift({ d:'Oct 2, 2025 · now', by:`Agency · ${S.user.company}`, a:`Created endorsement ${eid} (${cand.name} → ${job.title})` });
  closeModal(); toast('Endorsement submitted', `${cand.name} → ${job.title} is now awaiting FIRA review.`, 'ok');
  render();
};

VIEWS['agency/jobs'] = function () {
  return `
  <div class="page-h"><h1>Job Orders</h1><p>All job orders assigned to your agency, across employer accounts.</p></div>
  <div class="card">
    <table class="tbl"><thead><tr><th>Job order</th><th>Employer</th><th>Location</th><th>Salary (MAD)</th><th>Slots</th><th>Candidates</th><th>Status</th></tr></thead>
    <tbody>${DB.jobs.map(j => {
      const c = DB.applications.filter(a => a.jobId === j.id).length; return `
      <tr><td><p class="b small">${esc(j.title)}</p><p class="micro muted">Posted ${j.posted}</p></td>
        <td class="small">${esc(U(j.empId).company)}</td>
        <td class="small">${j.city}</td>
        <td class="mono small">${j.salaryMin.toLocaleString()} – ${j.salaryMax.toLocaleString()}</td>
        <td class="mono small">${j.filled}/${j.slots}</td>
        <td class="mono small">${c}</td>
        <td><span class="badge bg-green">Open</span></td></tr>`; }).join('')}</tbody></table>
  </div>`;
};

VIEWS['agency/endorsements'] = function () {
  const rank = s => (s === 'pending_fira_review' ? 0 : s === 'pending_employer_review' ? 1 : 2);
  const ends = [...DB.endorsements].sort((a, b) => rank(a.status) - rank(b.status));
  return `
  <div class="page-h"><h1>Endorsements</h1><p>Two-step flow: Agency → FIRA (step 1) → Employer (step 2) · live status per candidate.</p></div>
  <div class="col gap16">
    ${ends.map(e => { const a = endApp(e), ap = appUser(a), j = appJob(a); return `
    <div class="card card-hover">
      <div class="brand-strip" style="${['employer_declined','fira_rejected'].includes(e.status) ? 'background:linear-gradient(90deg,#ef4444,#f87171)' : ''}"></div>
      <div class="card-pad">
        <div class="flex between aic mb12 wrap gap8">
          <div><div class="flex aic gap8 mb4 wrap"><p class="b font-display" style="font-size:15px">${esc(ap.name)}</p>
            ${ic('right', 13)}<span class="small muted">${esc(j.title)}</span>${goldChip(a.score)}</div>
            <p class="tiny muted">${ic('building', 12)} ${esc(U(e.employerId).company)} · created ${e.created}</p></div>
          ${endBadge(e.status)}
        </div>
        ${flow2Track(e)}
        <div class="grid3 mt16" style="gap:12px">
          <div class="card" style="padding:12px;box-shadow:none"><p class="micro muted up b mb4">Agency note</p><p class="tiny" style="line-height:1.6">${esc(e.agencyNote)}</p></div>
          <div class="card" style="padding:12px;box-shadow:none"><p class="micro muted up b mb4">FIRA note</p><p class="tiny" style="line-height:1.6">${esc(e.firaNote || '—')}</p></div>
          <div class="card" style="padding:12px;box-shadow:none"><p class="micro muted up b mb4">Employer note</p><p class="tiny" style="line-height:1.6">${esc(e.employerNote || '—')}</p></div>
        </div>
        <div class="flex between aic mt16">
          <span class="micro muted">Endorsement ${e.id}</span>
          <button class="btn btn-ghost btn-sm" onclick="MW.viewApp('${a.id}')">${ic('activity', 13)} Application audit trail</button>
        </div>
      </div>
    </div>`; }).join('')}
  </div>`;
};
