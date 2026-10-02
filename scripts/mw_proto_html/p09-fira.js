/* ═══ FIRA Staff — Command Center, Applications, Endorsements ═══ */

VIEWS['fira/dashboard'] = function () {
  const apps = DB.applications;
  const pendingFira = DB.endorsements.filter(e => e.status === 'pending_fira_review').length;
  const avg = Math.round(apps.reduce((s, a) => s + a.score, 0) / apps.length);
  const byStatus = {};
  apps.forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
  const statusRows = Object.entries(byStatus).sort((a, b) => b[1] - a[1]);
  const maxS = Math.max(...statusRows.map(r => r[1]), 1);
  const byCity = {};
  DB.jobs.forEach(j => { byCity[j.city] = (byCity[j.city] || 0) + 1; });
  const maxC = Math.max(...Object.values(byCity), 1);
  const neg = apps.filter(a => TRACKER_NEG.includes(a.status)).length;
  return `
  <div class="page-h"><h1>FIRA Command Center</h1><p>Government oversight of the overseas recruitment pipeline — simulated regulatory console.</p></div>
  <div class="grid4 mb24">
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Total applications</p><p class="num" data-count="${apps.length}">0</p></div><span class="ic ic-blue">${ic('file', 19)}</span></div>
      <p class="tiny muted mt8">${neg} closed (negative)</p></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Pending FIRA review</p><p class="num" data-count="${pendingFira}">0</p></div><span class="ic ic-gold">${ic('shieldcheck', 19)}</span></div>
      <p class="tiny muted mt8">Step-1 endorsements</p></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Verified employers</p><p class="num" data-count="${DB.users.filter(u => u.role === 'employer').length}">0</p></div><span class="ic ic-green">${ic('building', 19)}</span></div>
      <p class="tiny muted mt8">${DB.users.filter(u => u.role === 'agency').length} licensed agencies</p></div>
    <div class="stat"><div class="flex between aic"><div><p class="lbl">Avg AI match</p><p class="num" data-count="${avg}">0</p></div><span class="ic ic-blue">${ic('sparkles', 19)}</span></div>
      <p class="tiny muted mt8">Across all applications</p></div>
  </div>

  <div class="grid2 mb24">
    <div class="card card-pad">
      <h3 class="section-t mb16">${ic('chart')} Applications by pipeline state</h3>
      ${statusRows.map(([st, v]) => `
      <div class="cbar"><span class="lb">${STATUS_LABEL[st] || st}</span>
        <div class="tr"><div class="fl" style="width:${Math.round(v / maxS * 100)}%"></div></div>
        <span class="vl">${v}</span></div>`).join('')}
    </div>
    <div class="col gap16">
      <div class="card card-pad">
        <h3 class="section-t mb16">${ic('pin')} Job orders by destination</h3>
        ${Object.entries(byCity).map(([c, v]) => `
        <div class="cbar"><span class="lb">${c}</span>
          <div class="tr"><div class="fl" style="width:${Math.round(v / maxC * 100)}%;background:linear-gradient(90deg,#d4a900,#f6c615)"></div></div>
          <span class="vl">${v}</span></div>`).join('')}
      </div>
      <div class="card card-pad">
        <h3 class="section-t mb12">${ic('alert')} Verification queue</h3>
        ${DB.verifications.length ? DB.verifications.slice(0, 4).map(v => `
        <div class="flex between aic mb10">
          <div><p class="small b">${esc(v.applicant)}</p><p class="micro muted">${v.doc} · ${v.file}</p></div>
          <button class="btn btn-green btn-sm" onclick="MW.verifyDoc('${v.id}')">${ic('check', 12)} Verify</button>
        </div>`).join('') : '<p class="small muted">Queue clear — all documents verified.</p>'}
      </div>
    </div>
  </div>

  <div class="card card-pad">
    <h3 class="section-t mb16">${ic('activity')} Regulatory audit trail</h3>
    <div class="audit">${DB.audits.slice(0, 7).map(x => `<div class="ai"><div class="d">${esc(x.d)} · ${esc(x.by)}</div><p class="small" style="margin-top:2px">${esc(x.a)}</p></div>`).join('')}</div>
  </div>`;
};
MW.verifyDoc = function (id) {
  const v = DB.verifications.find(x => x.id === id);
  DB.verifications = DB.verifications.filter(x => x.id !== id);
  const u = U(v.appId);
  if (u) u.docs.forEach(d => { if (d[0] === v.doc) d[2] = true; });
  DB.audits.unshift({ d:'Oct 2, 2025 · now', by:'FIRA Staff · Adrian Flores', a:`Verified ${v.doc} for ${v.applicant}` });
  toast('Document verified', `${v.doc} for ${v.applicant} marked as verified.`, 'ok');
  render();
};

VIEWS['fira/applications'] = function () {
  const opts = ['All', 'Pending FIRA', 'Active', 'Closed'];
  let apps = [...DB.applications];
  if (S.appFilter === 'Pending FIRA') apps = apps.filter(a => a.status === 'pending_fira_review');
  else if (S.appFilter === 'Active') apps = apps.filter(a => TRACKER_POS.includes(a.status));
  else if (S.appFilter === 'Closed') apps = apps.filter(a => TRACKER_NEG.includes(a.status));
  return `
  <div class="page-h"><h1>Application Oversight</h1><p>${DB.applications.length} applications across ${DB.jobs.length} job orders · full pipeline visibility.</p></div>
  <div class="flex wrap gap8 mb16">${opts.map(o => `<button class="chip ${S.appFilter === o ? 'on' : ''}" onclick="MW.filterFiraApps('${o}')">${o}</button>`).join('')}</div>
  <div class="card">
    <div style="overflow-x:auto">
    <table class="tbl"><thead><tr><th>Applicant</th><th>Job order</th><th>Employer</th><th>Match</th><th>Status</th><th></th></tr></thead>
    <tbody>${apps.map(a => { const ap = appUser(a), j = appJob(a); return `
      <tr><td><div class="flex aic gap8"><span class="avatar sm">${initials(ap.name)}</span>
        <span><span class="b small">${esc(ap.name)}</span><br/><span class="micro muted">${esc(ap.city || '')}</span></span></div></td>
        <td class="small ellip" style="max-width:220px">${esc(j.title)}</td>
        <td class="small">${esc(U(j.empId).company)}</td>
        <td>${goldChip(a.score)}</td>
        <td>${statusBadge(a.status)}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="MW.firaViewApp('${a.id}')">${ic('activity', 13)} Review</button></td></tr>`; }).join('')}</tbody></table>
    </div>
  </div>`;
};
MW.filterFiraApps = c => { S.appFilter = c; render(); };
MW.firaViewApp = function (id) {
  const a = APP(id), ap = appUser(a), j = appJob(a);
  openModal(`<div class="card-pad">
    <div class="flex between aic mb16"><h3 class="font-display" style="font-size:17px">Application review</h3>
      <button class="ibtn" onclick="MW.closeModal()">${ic('x', 16)}</button></div>
    <div class="flex aic gap10 mb16"><span class="avatar">${initials(ap.name)}</span>
      <div class="grow"><p class="small b">${esc(ap.name)} → ${esc(j.title)}</p>
        <p class="micro muted">${esc(U(j.empId).company)} · ${esc(U(j.agencyId || 'g1').company)}</p></div>
      <div class="flex aic gap8">${goldChip(a.score)}${statusBadge(a.status)}</div></div>
    ${tracker(a.status)}
    <div class="mt16 mb16">${auditTrail(a.id)}</div>
    <p class="micro muted">Simulated regulatory view — documents, stage history, and AI analysis are attached to each application in the full schema.</p>
  </div>`);
};

VIEWS['fira/endorsements'] = function () {
  const rank = s => (s === 'pending_fira_review' ? 0 : s === 'pending_employer_review' ? 1 : 2);
  const ends = [...DB.endorsements].sort((a, b) => rank(a.status) - rank(b.status));
  return `
  <div class="page-h"><h1>Endorsement Verification</h1><p>Step 1 of the two-step flow: verify credentials before the employer decision.</p></div>
  <div class="col gap16">
    ${ends.map(e => { const a = endApp(e), ap = appUser(a), j = appJob(a); const canAct = e.status === 'pending_fira_review'; return `
    <div class="card card-hover">
      <div class="brand-strip" style="${['employer_declined','fira_rejected'].includes(e.status) ? 'background:linear-gradient(90deg,#ef4444,#f87171)' : ''}"></div>
      <div class="card-pad">
        <div class="flex between aic mb12 wrap gap8">
          <div><div class="flex aic gap8 mb4 wrap"><p class="b font-display" style="font-size:15px">${esc(ap.name)}</p>
            ${ic('right', 13)}<span class="small muted">${esc(j.title)}</span>${goldChip(a.score)}</div>
            <p class="tiny muted">${ic('building', 12)} ${esc(U(e.employerId).company)} · endorsed ${e.created}</p></div>
          ${endBadge(e.status)}
        </div>
        ${flow2Track(e)}
        <div class="grid2 mt16" style="gap:12px">
          <div class="card" style="padding:12px;box-shadow:none"><p class="micro muted up b mb4">Agency note</p><p class="tiny" style="line-height:1.6">${esc(e.agencyNote)}</p></div>
          <div class="card" style="padding:12px;box-shadow:none"><p class="micro muted up b mb4">Candidate documents</p>
            <div class="flex wrap gap6">${(ap.docs || []).map(d => `<span class="badge ${d[2] ? 'bg-green' : 'bg-amber'}">${esc(d[0])}</span>`).join('')}</div></div>
        </div>
        ${e.firaNote ? `<div class="card mt12" style="padding:12px;box-shadow:none"><p class="micro muted up b mb4">FIRA verification</p><p class="tiny" style="line-height:1.6">${esc(e.firaNote)}</p></div>` : ''}
        ${canAct ? `
        <div class="mt16">
          <textarea class="input mb8" placeholder="FIRA verification note (attached to audit trail)…" oninput="MW.draftFira(this.value)">Verified: passport valid, medical passed, DMW records clear.</textarea>
          <div class="flex gap8" style="justify-content:flex-end">
            <button class="btn btn-danger" onclick="MW.firaDecide('${e.id}','reject')">${ic('x', 14)} Reject</button>
            <button class="btn btn-green" onclick="MW.firaDecide('${e.id}','approve')">${ic('shieldcheck', 14)} Approve — forward to employer</button>
          </div>
        </div>` : ''}
      </div>
    </div>`; }).join('')}
  </div>`;
};
MW.draftFira = function (v) { S.noteDraft.fira = v; };
MW.firaDecide = function (endId, action) {
  const e = DB.endorsements.find(x => x.id === endId);
  const a = endApp(e), ap = appUser(a), j = appJob(a);
  const note = (S.noteDraft.fira || '').trim() || (action === 'approve' ? 'Verified: passport valid, medical passed, DMW records clear.' : 'Verification failed.');
  if (action === 'approve') {
    e.status = 'pending_employer_review'; e.firaAt = 'Oct 2, 2025'; e.firaNote = note;
    a.status = 'pending_employer_review';
    pushHistory(a.id, `FIRA Staff · ${S.user.name}`, 'FIRA approval granted — forwarded to employer (step 2).');
    DB.audits.unshift({ d:'Oct 2, 2025 · now', by:`FIRA Staff · ${S.user.name}`, a:`Approved endorsement ${e.id} (${ap.name} → ${j.title})` });
    toast('Endorsement approved', `${ap.name} moves to employer decision for ${j.title}.`, 'ok');
  } else {
    e.status = 'fira_rejected'; e.firaAt = 'Oct 2, 2025'; e.firaNote = note;
    a.status = 'fira_rejected';
    pushHistory(a.id, `FIRA Staff · ${S.user.name}`, 'FIRA rejected endorsement after verification.');
    DB.audits.unshift({ d:'Oct 2, 2025 · now', by:`FIRA Staff · ${S.user.name}`, a:`Rejected endorsement ${e.id} (${ap.name} → ${j.title})` });
    toast('Endorsement rejected', 'The agency has been notified with your note.', 'info');
  }
  S.noteDraft.fira = '';
  closeModal(); render();
};
