Demo.active = null;
Demo.formData = null;
Demo.savingTimer = null;
Demo.isAbsent = data => ['Student absent', 'Not conducted'].includes(data.completion);
Demo.isUnobserved = data => data.completion === 'Partially completed' && data.observation === 'No';
Demo.skipLearning = data => Demo.isAbsent(data) || Demo.isUnobserved(data);
Demo.options = (name, values, selected, multiple = false) => `<div class="choices ${multiple ? 'multi-choices' : ''}">${values.map(value => `<label class="choice"><input type="${multiple ? 'checkbox' : 'radio'}" name="${name}" value="${Demo.escape(value)}" ${multiple ? selected?.includes(value) ? 'checked' : '' : selected === value ? 'checked' : ''}><span>${Demo.escape(value)}</span></label>`).join('')}</div>`;
Demo.field = (label, content, options = {}) => `<fieldset class="field" data-field="${options.name || ''}"><legend>${label}${options.optional ? '<span class="optional">Optional</span>' : '<span class="required">*</span>'}</legend>${options.hint ? `<p class="field-hint">${options.hint}</p>` : ''}${content}</fieldset>`;
Demo.section = (number, title, description, body) => `<section class="form-section"><div class="section-heading"><span class="step-number">${number}</span><div><h2>${title}</h2><p>${description}</p></div></div>${body}</section>`;
Demo.selectMaterial = () => {
  const data = Demo.formData;
  return `<div class="material-grid">${Demo.field('Material grade', `<select name="grade" aria-label="Material grade"><option value="">Select actual grade</option>${Demo.grades.map(grade => `<option ${data.grade === grade ? 'selected' : ''}>${grade}</option>`).join('')}</select>`, { name: 'grade' })}${Demo.field('Material used', `<select name="material" aria-label="Material used" ${!data.grade ? 'disabled' : ''}><option value="">Select actual material</option>${Demo.materials(Demo.active.subject, data.grade).map(material => `<option value="${material.id}" ${data.material === material.id ? 'selected' : ''}>${Demo.escape(material.name)}</option>`).join('')}</select>`, { name: 'material' })}</div><p class="field-hint">Choose what you actually taught. The grade is never preselected from the student profile.</p>`;
};
Demo.courseSection = () => {
  const data = Demo.formData;
  let body = Demo.field('Lesson completion', Demo.options('completion', Demo.completion, data.completion), { name: 'completion' });
  if (data.completion && data.completion !== 'Completed') body += Demo.field('Reason / relevant context', `<textarea name="reason" rows="2" placeholder="Briefly explain what happened.">${Demo.escape(data.reason)}</textarea>`, { name: 'reason' });
  if (data.completion === 'Partially completed') body += Demo.field('Was there enough teaching to observe learning?', Demo.options('observation', ['Yes', 'No'], data.observation), { name: 'observation' });
  if (!Demo.isAbsent(data)) body += Demo.selectMaterial();
  if (!Demo.isAbsent(data)) body += Demo.field('Technical & interactive experience', Demo.options('technical', Demo.technical, data.technical), { name: 'technical' });
  if (!Demo.isAbsent(data) && data.technical === 'Issues occurred') {
    body += Demo.field('Issues observed', Demo.options('issueTypes', Demo.issueTypes, data.issueTypes, true), { name: 'issueTypes', hint: 'Select all that apply. No selection limit.' });
    body += Demo.field('Issue details', `<textarea name="issueNotes" rows="2" placeholder="Which stage was affected, and how? Include details for Other.">${Demo.escape(data.issueNotes)}</textarea>`, { name: 'issueNotes' });
  }
  return Demo.section('01', 'Lesson & materials', 'A few details about the lesson you delivered.', body);
};
Demo.learningSection = () => {
  const data = Demo.formData;
  const questions = Demo.questionSection();
  if (Demo.skipLearning(data)) return `${questions}<div class="notice"><strong>No learning evaluation required</strong><p>${Demo.isAbsent(data) ? 'Only the lesson outcome and reason will be submitted.' : 'Parent conversation and lesson details will be recorded without learning conclusions.'} No parent report will be generated.</p></div>`;
  return questions;
};
Demo.openFeedback = id => {
  Demo.active = Demo.courses.find(course => course.id === id);
  const record = Demo.record(id);
  Demo.formData = Demo.normalizeFeedback(record.versions.length ? Demo.latest(id).data : record.draft || Demo.blank(Demo.active));
  Demo.editing = !record.versions.length;
  Demo.renderEditor();
  window.scrollTo(0, 0);
};
Demo.renderEditor = () => {
  const course = Demo.active;
  const submitted = Demo.latest(course.id);
  document.querySelector('#breadcrumb').textContent = `${course.name} / Post-lesson feedback`;
  document.querySelector('#app').innerHTML = `<div class="editor-heading">${Demo.editing && submitted ? `<button class="text-button back-button" data-action="view-submitted">${Demo.icon('back')} Back to submitted feedback</button>` : ''}<div class="editor-title"><div><div class="eyebrow">${course.subject.toUpperCase()} · TRIAL LESSON</div><h1>${Demo.editing ? submitted ? 'Revise feedback' : 'Post-lesson feedback' : 'Completed feedback'}<span class="heading-dot">.</span></h1><p>${Demo.editing ? 'Record the lesson, parent conversation and student learning in one place.' : `Version ${submitted.version} · Submitted ${Demo.timeLabel(submitted.savedAt)}`}</p></div>${Demo.badge(Demo.status(course.id))}</div></div><div class="editor-layout"><div>${!Demo.editing ? Demo.completedNotice(submitted) : ''}<div class="internal-banner">${Demo.icon('lock')}<span><strong>One complete lesson record</strong> All sections share one draft and one submission.</span></div>${Demo.editing ? Demo.editorForm() : Demo.summary(Demo.formData)}${submitted ? Demo.history() : ''}</div>${Demo.courseContext(course)}</div>`;
  Demo.syncPreviewControls();
  if (Demo.editing) Demo.bindForm();
};
Demo.completedNotice = submitted => `<section class="completion-notice"><span class="completion-icon">${Demo.icon('check')}</span><div><h2>Feedback submitted</h2><p>Your feedback has been saved. Review the submitted record below, or start a revision if a correction is needed.</p><small>Submitted by Sarah Chen · ${Demo.timeLabel(submitted.savedAt)}</small></div></section>`;
Demo.editorForm = () => `<form id="feedback-form" novalidate><div id="form-errors" role="alert"></div>${Demo.courseSection()}${Demo.learningSection()}${Demo.latest(Demo.active.id) ? Demo.section('03', 'Revision record', 'The previous submission stays available until this revision is confirmed.', Demo.field('Reason for revision', `<textarea name="revisionReason" rows="2" placeholder="What changed and why?">${Demo.escape(Demo.formData.revisionReason)}</textarea>`, { name: 'revisionReason' })) : ''}<div class="form-footer"><span id="save-status" role="status">${Demo.record(Demo.active.id).draft ? 'Saved draft available' : 'Not saved yet'}</span><div><button type="button" class="button" data-action="save">Save Draft</button><button type="submit" class="button primary">Review & Submit ${Demo.icon('arrow')}</button></div></div></form>`;
Demo.bindForm = () => {
  const form = document.querySelector('#feedback-form');
  form.addEventListener('input', Demo.onFormInput);
  form.addEventListener('change', Demo.onFormChange);
  form.addEventListener('submit', event => { event.preventDefault(); Demo.review(); });
};
Demo.readForm = () => {
  const form = document.querySelector('#feedback-form');
  const data = new FormData(form);
  for (const name of ['reason', 'issueNotes', 'revisionReason', 'advisorNotes']) {
    if (form.querySelector(`[name="${name}"]`)) Demo.formData[name] = data.get(name) || '';
  }
};
Demo.onFormInput = event => {
  if (!['TEXTAREA', 'INPUT'].includes(event.target.tagName) || event.target.type !== 'text' && event.target.tagName !== 'TEXTAREA') return;
  Demo.readForm();
  Demo.scheduleSave();
};
Demo.onFormChange = event => {
  const { name, value, type, checked } = event.target;
  Demo.readForm();
  if (event.target.tagName === 'TEXTAREA') { Demo.scheduleSave(); return; }
  if (type === 'checkbox') {
    Demo.formData[name] = Demo.toggleSelection(Demo.formData[name], value, { name, checked });
  } else Demo.formData[name] = value;
  if (name === 'grade') Demo.formData.material = '';
  Demo.renderEditor();
  Demo.scheduleSave();
};
Demo.scheduleSave = () => {
  clearTimeout(Demo.savingTimer);
  const status = document.querySelector('#save-status');
  if (status) status.textContent = 'Unsaved changes…';
  Demo.savingTimer = setTimeout(() => Demo.flushDraft(), 3000);
};
Demo.flushDraft = () => {
  clearTimeout(Demo.savingTimer);
  if (!Demo.active || !Demo.editing) return true;
  Demo.readForm();
  const saved = Demo.saveDraft(Demo.active, Demo.formData);
  const status = document.querySelector('#save-status');
  if (status) status.textContent = saved ? `Saved on this device · ${Demo.timeLabel(new Date())}` : 'Not saved · Try Save Draft again';
  return saved;
};
Demo.validate = () => {
  const data = Demo.formData;
  const errors = [];
  const requireField = (condition, field, message) => { if (condition) errors.push({ field, message }); };
  requireField(!data.completion, 'completion', 'Select how the lesson was completed.');
  requireField(data.completion && data.completion !== 'Completed' && !data.reason.trim(), 'reason', 'Add a reason for the lesson outcome.');
  requireField(data.completion === 'Partially completed' && !data.observation, 'observation', 'Confirm whether learning could be observed.');
  if (!Demo.isAbsent(data)) Demo.validateLesson(errors);
  Demo.validateQuestions(errors);
  requireField(Demo.latest(Demo.active.id) && !data.revisionReason.trim(), 'revisionReason', 'Add a reason for this revision.');
  return errors;
};
Demo.validateLesson = errors => {
  const data = Demo.formData;
  if (!Demo.grades.includes(data.grade)) errors.push({ field: 'grade', message: 'Select the actual material grade.' });
  if (!Demo.materials(Demo.active.subject, data.grade).some(material => material.id === data.material)) errors.push({ field: 'material', message: 'Select the actual material used.' });
  if (!data.technical) errors.push({ field: 'technical', message: 'Select the technical experience.' });
  if (data.technical === 'Issues occurred' && !data.issueTypes.length) errors.push({ field: 'issueTypes', message: 'Select the technical issues observed.' });
  if (data.technical === 'Issues occurred' && !data.issueNotes.trim()) errors.push({ field: 'issueNotes', message: 'Describe the technical issue and its impact.' });
};
Demo.summaryRows = data => {
  const material = Demo.materials(Demo.active.subject, data.grade).find(item => item.id === data.material);
  const rows = [['Lesson completion', data.completion], ['Reason', data.reason]];
  if (!Demo.isAbsent(data)) rows.push(['Material grade', data.grade], ['Material', material?.name], ['Technical experience', data.technical]);
  if (!Demo.isAbsent(data) && data.technical === 'Issues occurred') rows.push(['Issues', data.issueTypes.join(', ')], ['Issue details', data.issueNotes]);
  rows.push(...Demo.questionRows(data));
  if (!Demo.isAbsent(data)) rows.push(['Important notes for Learning Advisor', data.advisorNotes || 'Not provided']);
  return rows.filter(([, value]) => value).map(([label, value]) => `<div class="summary-row"><dt>${label}</dt><dd>${Demo.escape(value)}</dd></div>`).join('');
};
Demo.summary = data => `<section class="summary-card"><div class="summary-heading"><h2>Submitted lesson record</h2><button class="button outline" data-action="revise">${Demo.record(Demo.active.id).draft ? 'Continue revision' : 'Revise feedback'}</button></div><dl>${Demo.summaryRows(data)}</dl><div class="notice small">${Demo.icon('lock')} All sections are saved together. Parent-report status is supplied by the system.</div></section>`;
Demo.history = () => `<section class="history"><h3>Version history</h3>${Demo.record(Demo.active.id).versions.slice().reverse().map(version => `<div class="history-entry"><span class="history-dot"></span><div><strong>Version ${version.version} <small>· Sarah Chen</small></strong><p>${Demo.escape(version.reason)}</p><small>${Demo.timeLabel(version.savedAt)}</small></div><button class="text-button" data-version="${version.version}">View record</button></div>`).join('')}</section>`;
Demo.review = () => {
  Demo.readForm();
  const errors = Demo.validate();
  const box = document.querySelector('#form-errors');
  document.querySelectorAll('.field.invalid').forEach(field => field.classList.remove('invalid'));
  if (errors.length) {
    box.innerHTML = `<div class="validation-box"><strong>Please complete ${errors.length} required ${errors.length === 1 ? 'field' : 'fields'}.</strong><ul>${errors.map(error => `<li>${error.message}</li>`).join('')}</ul></div>`;
    errors.forEach(error => document.querySelector(`[data-field="${error.field}"]`)?.classList.add('invalid'));
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.querySelector(`[data-field="${errors[0].field}"] input, [data-field="${errors[0].field}"] select, [data-field="${errors[0].field}"] textarea`)?.focus({ preventScroll: true });
    return;
  }
  box.innerHTML = '';
  Demo.flushDraft();
  const reportNote = Demo.latest(Demo.active.id) ? 'This revision updates the complete lesson record. It does not resend the parent report.' : Demo.skipLearning(Demo.formData) ? 'This saves the lesson record without a learning report.' : 'This submits the complete lesson record. The grade-matched parent report is queued after submission.';
  Demo.openModal(`${Demo.modalHeader('Review your feedback', 'ONE LAST LOOK')}<p class="modal-intro">${Demo.escape(Demo.active.name)} · ${Demo.active.subject} · ${Demo.lessonDate(Demo.active)}</p><div class="notice small">${reportNote} Delivery is simulated in this prototype.</div><dl class="review-summary">${Demo.summaryRows(Demo.formData)}</dl><div class="modal-actions"><button class="button" data-action="close-modal">Back to edit</button><button class="button primary" data-action="confirm-submit">Confirm Submission ${Demo.icon('check')}</button></div>`);
};
Demo.confirmSubmit = () => {
  const button = document.querySelector('[data-action="confirm-submit"]');
  if (button.disabled) return;
  button.disabled = true;
  const clean = Demo.copy(Demo.formData);
  delete clean.notes;
  delete clean.suggestion;
  if (Demo.isAbsent(clean)) {
    for (const name of ['grade', 'material', 'technical', 'issueNotes']) clean[name] = '';
    clean.issueTypes = [];
    for (const field of Demo.questionFields) clean[field.name] = field.multiple ? [] : '';
    clean.advisorNotes = '';
  }
  if (Demo.skipLearning(clean)) {
    for (const name of ['engagement', 'independence']) clean[name] = '';
    clean.strengths = [];
    clean.improvements = [];
  }
  if (clean.technical !== 'Issues occurred') { clean.issueTypes = []; clean.issueNotes = ''; }
  if (!Demo.submit(Demo.active, clean)) { button.disabled = false; return; }
  clearTimeout(Demo.savingTimer);
  Demo.closeModal();
  Demo.formData = clean;
  Demo.editing = false;
  Demo.renderEditor();
  Demo.toast('Complete lesson record saved. Report status is shown in the sidebar.');
  window.scrollTo(0, 0);
};
Demo.showVersion = number => {
  const version = Demo.record(Demo.active.id).versions.find(item => item.version === Number(number));
  Demo.openModal(`${Demo.modalHeader(`Version ${version.version}`, 'READ-ONLY HISTORY')}<p class="modal-intro">Submitted by Sarah Chen · ${Demo.timeLabel(version.savedAt)}</p><div class="notice small">${Demo.escape(version.reason)}</div><dl class="review-summary">${Demo.summaryRows(version.data)}</dl><div class="modal-actions"><button class="button" data-action="close-modal">Close record</button></div>`);
};
