Demo.storageKey = 'tomorise-feedback-unified-v3';
Demo.seedState = () => {
  const submitted = { data: { ...Demo.seedFeedback, grade: 'Grade 4', material: 'Math-G4-01' }, version: 1, savedAt: '2026-11-02T16:08:00.000Z', reason: 'Initial submission' };
  const ela = { data: { ...Demo.seedFeedback, grade: 'Grade 3', material: 'ELA-G3-01', strengths: ['Reading fluency'], improvements: ['Vocabulary'] }, version: 1, savedAt: '2026-11-02T15:10:00.000Z', reason: 'Initial submission' };
  return { feedback: {
    'completed:TR-1102-0841': { versions: [submitted] },
    'completed:TR-1102-0842': { versions: [ela] }
  }, reports: {
    'TR-1102-0841': { status: 'Sent', grade: 'Grade 4', updatedAt: '2026-11-02T16:09:00.000Z' },
    'TR-1102-0842': { status: 'Sent', grade: 'Grade 3', updatedAt: '2026-11-02T15:11:00.000Z' }
  }, preview: { scene: 'pending', subject: 'Math' } };
};
Demo.loadState = () => {
  try {
    const raw = localStorage.getItem(Demo.storageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.feedback && parsed?.reports && ['pending', 'completed'].includes(parsed?.preview?.scene) && ['Math', 'ELA'].includes(parsed?.preview?.subject) ? parsed : Demo.seedState();
  } catch { return Demo.seedState(); }
};
Demo.state = Demo.loadState();
Demo.persist = () => {
  try { localStorage.setItem(Demo.storageKey, JSON.stringify(Demo.state)); return true; }
  catch { Demo.toast('Storage unavailable. Keep this page open and try again.', true); return false; }
};
Demo.recordKey = id => `${Demo.state.preview.scene}:${id}`;
Demo.record = id => Demo.state.feedback[Demo.recordKey(id)] || { versions: [] };
Demo.status = id => Demo.record(id).versions.length ? 'Submitted' : Demo.record(id).draft ? 'Draft' : 'Pending';
Demo.latest = id => Demo.record(id).versions.at(-1);
Demo.copy = value => JSON.parse(JSON.stringify(value));
Demo.escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
Demo.toast = (message, error = false) => {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.className = `visible ${error ? 'error-toast' : ''}`;
  clearTimeout(Demo.toastTimer);
  Demo.toastTimer = setTimeout(() => toast.className = '', 4500);
};
Demo.userDateTime = (value, options) => new Intl.DateTimeFormat('en-US', { timeZone: Demo.userProfile.timeZone, ...options }).format(new Date(value));
Demo.timeLabel = value => Demo.userDateTime(value, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
Demo.lessonDate = course => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const startDate = Demo.userDateTime(course.startsAt, options);
  const endDate = Demo.userDateTime(course.endsAt, options);
  return startDate === endDate ? startDate : `${startDate} – ${endDate}`;
};
Demo.lessonTime = course => {
  const options = { hour: 'numeric', minute: '2-digit' };
  return `${Demo.userDateTime(course.startsAt, options)} – ${Demo.userDateTime(course.endsAt, options)}`;
};
Demo.saveDraft = (course, data) => {
  const key = Demo.recordKey(course.id);
  const previous = Demo.copy(Demo.record(course.id));
  Demo.state.feedback[key] = { ...previous, draft: Demo.copy(data), savedAt: new Date().toISOString() };
  if (Demo.persist()) return true;
  Demo.state.feedback[key] = previous;
  return false;
};
Demo.submit = (course, data) => {
  const snapshot = Demo.copy(Demo.state);
  const previous = Demo.copy(Demo.record(course.id));
  const entry = { data: Demo.copy(data), version: previous.versions.length + 1, savedAt: new Date().toISOString(), reason: previous.versions.length ? data.revisionReason.trim() : 'Initial submission' };
  Demo.state.feedback[`completed:${course.id}`] = { versions: [...previous.versions, entry] };
  if (!previous.versions.length) Demo.state.reports[course.id] = {
    status: Demo.skipLearning(data) ? 'Not generated' : 'Queued',
    grade: course.grade, updatedAt: entry.savedAt
  };
  delete Demo.state.feedback[`pending:${course.id}`];
  Demo.state.preview.scene = 'completed';
  if (Demo.persist()) return true;
  Demo.state = snapshot;
  return false;
};
Demo.closeModal = () => {
  document.querySelector('#modal').close();
  document.querySelector('#modal-content').innerHTML = '';
};
Demo.openModal = html => {
  document.querySelector('#modal-content').innerHTML = html;
  document.querySelector('#modal').showModal();
};
