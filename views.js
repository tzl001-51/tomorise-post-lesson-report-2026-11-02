Demo.icon = name => {
  const paths = { search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>', arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>', note: '<path d="M8 3H5v18h14V3h-3M8 3v4h8V3H8Zm0 9h8m-8 4h5"/>', check: '<path d="m5 12 4 4L19 6"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', down: '<path d="m7 10 5 5 5-5"/>', back: '<path d="m14 6-6 6 6 6"/>', lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>' };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.note}</svg>`;
};
Demo.badge = (text, kind = text.toLowerCase()) => `<span class="badge ${kind}"><i></i>${Demo.escape(text)}</span>`;
Demo.person = course => `<div class="person"><span class="avatar ${course.color}">${course.initials}</span><div><strong>${Demo.escape(course.name)}</strong><small>${course.grade} <span>·</span> Trial lesson</small></div></div>`;
Demo.reportContext = course => {
  if (!Demo.latest(course.id)) return '';
  const report = Demo.state.reports[course.id];
  if (!report) return '';
  const description = report.status === 'Sent' ? 'Sent after feedback was completed.' : report.status === 'Queued' ? 'Feedback completed. Waiting for automatic delivery.' : 'Insufficient learning observations. No report generated.';
  return `<div class="context-card report-card"><div class="card-icon">${Demo.icon('note')}</div><h3>Parent report</h3>${Demo.badge(report.status, report.status === 'Sent' ? 'submitted' : 'neutral')}<dl><dt>Matched student grade</dt><dd>${Demo.escape(report.grade)}</dd><dt>Updated</dt><dd>${Demo.timeLabel(report.updatedAt)}</dd></dl><p>${description}</p><small>Mock system status · No actual delivery</small></div>`;
};
Demo.courseContext = course => `<aside class="context-panel"><div class="context-card"><div class="eyebrow">LESSON DETAILS</div>${Demo.person(course)}<dl><dt>Subject</dt><dd>${course.subject}</dd><dt>Student grade</dt><dd>${course.grade}</dd><dt>User time zone</dt><dd data-user-timezone>${Demo.escape(Demo.userProfile.timeZone)}</dd><dt>Lesson date</dt><dd data-lesson-date>${Demo.lessonDate(course)}</dd><dt>Time</dt><dd data-lesson-time>${Demo.lessonTime(course)}</dd><dt>Course ID</dt><dd class="mono">${course.id}</dd><dt>Student ID</dt><dd class="mono">${course.studentId}</dd><dt>Teacher</dt><dd>Sarah Chen</dd></dl><div class="auto-link">${Demo.icon('lock')} Automatically linked by course ID</div></div>${Demo.reportContext(course)}<p class="mock-context">Demo only. Materials, course records and report statuses are fictional.</p></aside>`;
Demo.modalHeader = (title, eyebrow = 'INTERNAL RECORD') => `<div class="modal-header"><div><div class="eyebrow">${eyebrow}</div><h2 id="modal-title">${title}</h2></div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">×</button></div>`;
