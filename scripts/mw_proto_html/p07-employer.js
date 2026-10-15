/* ═══ Employer role — Al Baraka Holding (plus AI Amal Clinic, Resorts) ═══ */
const myJobs = () => DB.jobs.filter(j => j.empId === S.user.id);
const myApps = () => DB.applications.filter(a => myJobs().some(j => j.id === a.jobId));

VIEWS['emp/dashboard'] = function () {
  const u = S.user, jobs = myJobs(), apps = myApps();
  const pending = DB.endorsements.filter(e => e.status === 'pending_employer_review' && e.employerId === u.id);
  const hired = apps.filter(a => ['hired','deployed','completed','employer_accepted'].includes(a.status));
  const buckets = [
    ['Applied / Screening', apps.filter(a => ['applied','screening','shortlisted'].includes(a.status)).length, '2859d5'],
    ['Interview / Assessment', apps.filter(a => ['interview','assessment','under_review'].includes(a.status)).length, '3d6be0'],
    ['FIRA / Endorsement', apps.filter(a => ['pending_fira_review','fira_approved','pending_employer_review'].includes(a.status)).length, '6d93ea'],
    ['Offer / Hired', apps.filter(a => ['offered','hired','employer_accepted'].includes(a.status)).length, 'f6c615'],
    ['Deployed / Completed', apps.filter(a => ['processing','deployed','completed'].includes(a.status)).length, '16a34a'],
  ];
  const maxB = Math.max(...buckets.map(b => b[1]), 1);
  const recent = [...apps].sort((a, b) => b.score - a.score).slice(0, 6);
  return `
  <div class="page-h"><h1>${esc(u.company)}</h1><p>Recruitment operations in ${esc(u.city)}, ${esc(u.country)} · FIRA-verified employer since ${u.since}.</p></div>
  <div class="grid4 mb24">
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Active job orders</p><p class="num" data-count="${jobs.length}">0</p></div><span class="ic ic-blue">${ic('briefcase', 19)}</span></div>
      <p class="tiny muted mt8">${jobs.reduce((s, j) => s + (j.slots - j.filled), 0)} open slots</p></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Candidates in pipeline</p><p class="num" data-count="${apps.length}">0</p></div><span class="ic ic-gold">${ic('users', 19)}</span></div>
      <p class="tiny muted mt8">Avg match ${Math.round(apps.reduce((s, a) => s + a.score, 0) / Math.max(apps.length, 1))}%</p></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Awaiting your decision</p><p class="num" data-count="${pending.length}">0</p></div><span class="ic ic-red">${ic('clock', 19)}</span></div>
      <p class="tiny muted mt8">Step-2 endorsements</p></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Hired / deployed</p><p class="num" data-count="${hired.length}">0</p></div><span class="ic ic-green">${ic('check', 19)}</span></div>
      <p class="tiny muted mt8">Lifetime placements</p></div>
  </div>

  <div class="split">
    <div class="col gap16">
      <div class="card card-pad">
        <h3 class="section-t mb16">${ic('chart')} Pipeline overview</h3>
        ${buckets.map(([lb, v, c]) => `
        <div class="cbar" style="grid-template-columns:170px 1fr 34px">
          <span class="lb">${lb}</span>
          <div class="tr"><div class="fl" style="width:${Math.round(v / maxB * 100)}%;background:${c}"></div></div>
          <span class="vl">${v}</span></div>`).join('')}
      </div>
      <div class="card">
        <div class="flex between aic" style="padding:18px 20px 0"><h3 class="section-t">${ic('users')} Top candidates for your jobs</h3>
          <button class="btn btn-ghost btn-sm" onclick="MW.go('#/emp/candidates')">All candidates ${ic('right', 13)}</button></div>
        <div style="padding:10px 20px 18px">
        <table class="tbl"><thead><tr><th>Candidate</th><th>Job order</th><th>AI match</th><th>Status</th></tr></thead>
        <tbody>${recent.map(a => { const ap = appUser(a), j = appJob(a); return `
          <tr class="rowlink" onclick="MW.viewApp('${a.id}')"><td>
            <div class="flex aic gap8"><span class="avatar sm">${initials(ap.name)}</span><span class="b small">${esc(ap.name)}</span></div></td>
            <td class="small ellip" style="max-width:220px">${esc(j.title)}</td>
            <td>${goldChip(a.score)}</td><td>${statusBadge(a.status)}</td></tr>`; }).join('')}</tbody></table>
        </div>
      </div>
    </div>
    <div class="col gap16">
      ${pending.length ? pending.map(e => { const a = endApp(e), ap = appUser(a), j = appJob(a); return `
      <div class="card">
        <div class="brand-strip"></div>
        <div class="card-pad">
          <p class="tiny b up muted mb8" style="letter-spacing:.07em">Endorsement needs your decision</p>
          <div class="flex aic gap10 mb12"><span class="avatar">${initials(ap.name)}</span>
            <div class="grow"><p class="small b">${esc(ap.name)}</p><p class="tiny muted">${esc(j.title)} · ${goldChip(a.score)}</p></div></div>
          ${flow2Track(e)}
          <div class="flex gap8 mt16">
            <button class="btn btn-green grow" onclick="MW.empDecide('${e.id}','accept')">${ic('check', 14)} Accept</button>
            <button class="btn btn-outline grow" onclick="MW.empDecide('${e.id}','decline')">${ic('x', 14)} Decline</button>
          </div>
        </div>
      </div>`; }).join('') : `
      <div class="card"><div class="empty">${ic('check', 40)}<p>No endorsements awaiting your decision.</p><p class="tiny mt8">FIRA-approved endorsements will appear here.</p></div></div>`}
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('briefcase')} Quick actions</h3>
        <div class="col gap8">
          <button class="btn btn-primary w100" onclick="MW.postJobModal()">${ic('plus', 14)} Post new job order</button>
          <button class="btn btn-outline w100" onclick="MW.go('#/emp/endorsements')">${ic('send', 14)} Review endorsements</button>
          <button class="btn btn-outline w100" onclick="MW.toastInfo('Reports','Prototype scope — exporting is simulated.')">${ic('chart', 14)} Export hiring report</button>
        </div>
      </div>
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('shield')} Compliance snapshot</h3>
        ${[['Company verification','bg-green','Verified'],['DMW job approvals','bg-green','4 / 4 approved'],['Contract templates','bg-green','PH-MOR 2025 v2'],['CNSS registrations','bg-amber','1 pending']].map(r =>
          `<div class="flex between aic mb8"><span class="small">${r[0]}</span><span class="badge ${r[1]}">${r[2]}</span></div>`).join('')}
      </div>
    </div>
  </div>`;
};

VIEWS['emp/jobs'] = function () {
  const jobs = myJobs();
  return `
  <div class="page-h">
    <div class="flex between aic wrap gap12">
      <div><h1>Job Orders</h1><p>${jobs.length} job orders · managed with your licensed agency partner.</p></div>
      <button class="btn btn-primary" onclick="MW.postJobModal()">${ic('plus', 14)} Post new job</button>
    </div>
  </div>
  <div class="card">
    <table class="tbl"><thead><tr><th>Job order</th><th>Location</th><th>Salary (MAD)</th><th>Slots</th><th>Candidates</th><th>Status</th></tr></thead>
    <tbody>${jobs.map(j => {
      const c = DB.applications.filter(a => a.jobId === j.id).length; return `
      <tr><td><p class="b small">${esc(j.title)}</p><p class="micro muted">${esc(U(j.agencyId).company)} · posted ${j.posted}</p></td>
        <td class="small">${j.city}, ${j.country}</td>
        <td class="mono small">${j.salaryMin.toLocaleString()} – ${j.salaryMax.toLocaleString()}</td>
        <td class="mono small">${j.filled}/${j.slots}</td>
        <td class="mono small">${c}</td>
        <td><span class="badge bg-green">Open</span></td></tr>`; }).join('')}</tbody></table>
  </div>`;
};
MW.postJobModal = function () {
  openModal(`<div class="card-pad">
    <div class="flex between aic mb16"><h3 class="font-display" style="font-size:17px">Post new job order</h3>
      <button class="ibtn" onclick="MW.closeModal()">${ic('x', 16)}</button></div>
    <form onsubmit="event.preventDefault();MW.postJob(this)">
      <div class="field"><label class="label">Job title</label><input class="input" name="title" required placeholder="e.g. Caregiver - Rabat"/></div>
      <div class="grid2" style="gap:12px">
        <div class="field"><label class="label">Category</label><select class="input" name="cat">${['Caregiver','Domestic Helper','Nurse','Factory Worker','Hospitality'].map(c => `<option>${c}</option>`).join('')}</select></div>
        <div class="field"><label class="label">City</label><select class="input" name="city">${['Casablanca','Rabat','Marrakech','Tangier','Fes'].map(c => `<option>${c}</option>`).join('')}</select></div>
        <div class="field"><label class="label">Salary min (MAD)</label><input class="input" name="smin" type="number" value="4500" required/></div>
        <div class="field"><label class="label">Salary max (MAD)</label><input class="input" name="smax" type="number" value="5200" required/></div>
        <div class="field"><label class="label">Slots</label><input class="input" name="slots" type="number" value="2" required/></div>
        <div class="field"><label class="label">Contract</label><select class="input" name="type"><option>Full-time · 2 years</option><option>Full-time · 3 years</option></select></div>
      </div>
      <div class="field"><label class="label">Description</label><textarea class="input" name="desc" placeholder="Role summary, household or facility details…"></textarea></div>
      <div class="field"><label class="label">Required skills (comma-separated)</label><input class="input" name="skills" placeholder="Elderly care, First aid, Cooking"/></div>
      <button class="btn btn-primary btn-lg w100" type="submit">${ic('send', 14)} Submit for DMW approval</button>
      <p class="micro muted tc mt8">Job orders route to your agency partner for deployment.</p>
    </form></div>`);
};
MW.postJob = function (form) {
  const f = new FormData(form);
  const id = 'j' + Date.now();
  DB.jobs.push({ id, title: f.get('title'), empId: S.user.id, agencyId:'g1', city: f.get('city'), country:'Morocco',
    cat: f.get('cat'), type: f.get('type'), salaryMin:+f.get('smin'), salaryMax:+f.get('smax'), cur:'MAD',
    slots:+f.get('slots'), filled:0, posted:'Oct 2, 2025', status:'open',
    desc: f.get('desc') || 'Newly posted role pending full description.', reqs:'As per employer requirements.',
    benefits:'Standard employer package.', skills:(f.get('skills') || 'Teamwork').split(',').map(s => s.trim()).filter(Boolean) });
  DB.audits.unshift({ d:'Oct 2, 2025 · now', by:`Employer · ${S.user.company}`, a:`Posted new job order: ${f.get('title')}` });
  closeModal(); toast('Job order posted', `${f.get('title')} is now open for candidates.`, 'ok');
  render();
};

VIEWS['emp/candidates'] = function () {
  const apps = [...myApps()].sort((a, b) => b.score - a.score);
  return `
  <div class="page-h"><h1>Candidates</h1><p>${apps.length} applications across your job orders — ranked by simulated AI match.</p></div>
  <div class="grid3">
    ${apps.map(a => { const ap = appUser(a), j = appJob(a); return `
    <div class="card card-hover">
      <div class="card-pad">
        <div class="flex between aic mb12">
          <div class="flex aic gap10"><span class="avatar">${initials(ap.name)}</span>
            <div><p class="small b">${esc(ap.name)}</p><p class="micro muted">${esc(ap.city || '')} · ${ap.years || '—'} yrs exp</p></div></div>
          ${ring(a.score, 52, '')}
        </div>
        <p class="tiny muted mb8">Applied for</p><p class="small b mb12 ellip">${esc(j.title)}</p>
        <div class="flex wrap gap6 mb12">${(ap.skills || []).slice(0, 3).map(s => `<span class="skill-chip">${esc(s[0])}</span>`).join('')}</div>
        <div class="flex between aic">
          ${statusBadge(a.status)}
          <div class="flex gap6">
            <button class="btn btn-ghost btn-sm" onclick="MW.viewApp('${a.id}')">${ic('activity', 13)}</button>
            <button class="btn btn-outline btn-sm" onclick="MW.candidateCV('${ap.id}')">CV</button>
          </div></div>
      </div>
    </div>`; }).join('')}
  </div>`;
};
MW.candidateCV = function (uid) {
  const u = U(uid);
  openModal(`<div class="card-pad">
    <div class="flex between aic mb16"><h3 class="font-display" style="font-size:17px">${esc(u.name)} — profile</h3>
      <button class="ibtn" onclick="MW.closeModal()">${ic('x', 16)}</button></div>
    <div class="flex wrap gap8 mb16">
      <span class="badge bg-blue">${esc(u.type || '')}</span><span class="badge bg-gray">${esc(u.city || '')}</span>
      <span class="badge bg-gray">${u.years || '—'} yrs experience</span><span class="badge ${u.medical === 'Passed' ? 'bg-green' : 'bg-amber'}">Medical ${esc(u.medical || '—')}</span></div>
    <p class="tiny b up muted mb8" style="letter-spacing:.06em">Skills</p>
    <div class="flex wrap gap6 mb16">${(u.skills || []).map(s => `<span class="skill-chip">${esc(s[0])} · ${s[1]}</span>`).join('')}</div>
    <p class="tiny b up muted mb8" style="letter-spacing:.06em">Certifications</p>
    ${(u.certs || []).map(c => `<p class="small mb4">${ic('award', 13)} ${esc(c[0])} <span class="muted">— ${esc(c[1])}</span></p>`).join('')}
    <p class="tiny b up muted mb8 mt16" style="letter-spacing:.06em">Documents</p>
    ${(u.docs || []).map(d => `<div class="flex between aic mb8"><span class="small">${d[0]}</span><span class="badge ${d[2] ? 'bg-green' : 'bg-amber'}">${d[2] ? 'Verified' : 'Pending'}</span></div>`).join('')}
  </div>`);
};

VIEWS['emp/endorsements'] = function () {
  const u = S.user;
  const ends = DB.endorsements.filter(e => e.employerId === u.id);
  return `
  <div class="page-h"><h1>Endorsements</h1><p>Two-step flow: Agency → FIRA (step 1) → Employer (step 2). You act only after FIRA approval.</p></div>
  <div class="col gap16">
    ${ends.length ? ends.map(e => { const a = endApp(e), ap = appUser(a), j = appJob(a); return `
    <div class="card card-hover">
      <div class="brand-strip" style="${e.status === 'employer_declined' ? 'background:linear-gradient(90deg,#ef4444,#f87171)' : ''}"></div>
      <div class="card-pad">
        <div class="flex between aic mb12 wrap gap8">
          <div><div class="flex aic gap8 mb4"><p class="b font-display" style="font-size:15px">${esc(ap.name)}</p>
            ${ic('right', 13)}<span class="small muted ellip">${esc(j.title)}</span>${goldChip(a.score)}</div>
            <p class="tiny muted">${ic('building', 12)} ${esc(U(e.employerId).company)} · endorsed ${e.created}</p></div>
          ${endBadge(e.status)}
        </div>
        ${flow2Track(e)}
        <div class="grid2 mt16" style="gap:12px">
          <div class="card" style="padding:12px;box-shadow:none"><p class="micro muted up b mb4">Agency note</p><p class="tiny" style="line-height:1.6">${esc(e.agencyNote)}</p></div>
          <div class="card" style="padding:12px;box-shadow:none"><p class="micro muted up b mb4">FIRA verification</p><p class="tiny" style="line-height:1.6">${esc(e.firaNote || 'Awaiting FIRA review (step 1).')}</p></div>
        </div>
        ${e.employerNote ? `<div class="card mt12" style="padding:12px;box-shadow:none"><p class="micro muted up b mb4">Employer decision</p><p class="tiny" style="line-height:1.6">${esc(e.employerNote)}</p></div>` : ''}
        ${e.status === 'pending_employer_review' ? `
        <div class="flex gap8 mt16 aic">
          <input class="input grow" placeholder="Optional note to the agency…" oninput="MW.draft(this.value)"/>
          <button class="btn btn-green" onclick="MW.empDecide('${e.id}','accept')">${ic('check', 14)} Accept</button>
          <button class="btn btn-danger" onclick="MW.empDecide('${e.id}','decline')">${ic('x', 14)} Decline</button>
        </div>` : ''}
      </div>
    </div>`; }).join('') : `<div class="card"><div class="empty">${ic('send', 40)}<p>No endorsements for your company yet.</p></div></div>`}
  </div>`;
};
MW.draft = function (v) { S.noteDraft.emp = v; };
MW.empDecide = function (endId, action) {
  const e = DB.endorsements.find(x => x.id === endId);
  const a = endApp(e), ap = appUser(a), j = appJob(a);
  const note = (S.noteDraft.emp || '').trim();
  if (action === 'accept') {
    e.status = 'employer_accepted'; e.empAt = 'Oct 2, 2025';
    e.employerNote = note || 'Accepted — please proceed with contract scheduling.';
    a.status = 'employer_accepted';
    pushHistory(a.id, `Employer · ${S.user.company}`, 'Employer accepted FIRA-endorsed candidate (step 2 complete).');
    toast('Candidate accepted', `${ap.name} moves to contract processing for ${j.title}.`, 'ok');
  } else {
    e.status = 'employer_declined'; e.empAt = 'Oct 2, 2025';
    e.employerNote = note || 'Declined by employer.';
    a.status = 'employer_declined';
    pushHistory(a.id, `Employer · ${S.user.company}`, 'Employer declined endorsement.');
    toast('Decision recorded', `${ap.name} was declined — agency notified.`, 'info');
  }
  DB.audits.unshift({ d:'Oct 2, 2025 · now', by:`Employer · ${S.user.company}`, a:`${action === 'accept' ? 'Accepted' : 'Declined'} endorsement ${e.id} (${ap.name} → ${j.title})` });
  S.noteDraft.emp = '';
  closeModal(); render();
};
