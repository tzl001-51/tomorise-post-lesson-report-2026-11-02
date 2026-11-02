Demo.syncPreviewControls = () => {
  const preview = Demo.state.preview;
  document.querySelector('#preview-subject').value = preview.subject;
  document.querySelectorAll('[data-scene]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.scene === preview.scene));
  });
};
Demo.previewCourse = () => Demo.courses.find(course => course.subject === Demo.state.preview.subject);
Demo.switchPreview = changes => {
  if (Demo.active && Demo.editing && !Demo.flushDraft()) { Demo.syncPreviewControls(); return; }
  const previous = { ...Demo.state.preview };
  Demo.state.preview = { ...previous, ...changes };
  if (!Demo.persist()) { Demo.state.preview = previous; Demo.syncPreviewControls(); return; }
  clearTimeout(Demo.savingTimer);
  Demo.openFeedback(Demo.previewCourse().id);
};
Demo.actions = {
  save: () => { if (Demo.flushDraft()) Demo.toast('Draft saved on this device.'); },
  'close-modal': () => Demo.requestCloseModal(),
  'confirm-submit': Demo.confirmSubmit,
  'view-submitted': () => {
    if (!Demo.flushDraft()) return;
    Demo.openFeedback(Demo.active.id);
  },
  revise: () => {
    Demo.formData = Demo.normalizeFeedback(Demo.record(Demo.active.id).draft || Demo.latest(Demo.active.id).data);
    if (!Demo.record(Demo.active.id).draft) Demo.formData.revisionReason = '';
    Demo.editing = true;
    Demo.renderEditor();
    window.scrollTo(0, 0);
  },
  reset: () => Demo.openModal(`${Demo.modalHeader('Reset prototype data?', 'MOCK WORKSPACE')}<p class="modal-intro">This restores the empty Pending forms and example Completed records for Math and ELA. Only this prototype’s local data is reset.</p><div class="modal-actions"><button class="button" data-action="close-modal">Keep my changes</button><button class="button primary" data-action="confirm-reset">Reset prototype data</button></div>`),
  'confirm-reset': () => {
    const previous = Demo.state;
    Demo.state = Demo.seedState();
    if (!Demo.persist()) { Demo.state = previous; return; }
    clearTimeout(Demo.savingTimer);
    Demo.closeModal();
    Demo.openFeedback(Demo.previewCourse().id);
    Demo.toast('Prototype data restored.');
  }
};
Demo.requestCloseModal = () => {
  Demo.closeModal();
};
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.action) Demo.actions[button.dataset.action]?.();
  if (button.dataset.scene) Demo.switchPreview({ scene: button.dataset.scene });
  if (button.dataset.version) Demo.showVersion(button.dataset.version);
});
document.addEventListener('change', event => {
  if (event.target.id === 'preview-subject') Demo.switchPreview({ subject: event.target.value });
});
document.querySelector('#modal').addEventListener('cancel', event => { event.preventDefault(); Demo.requestCloseModal(); });
window.addEventListener('beforeunload', event => {
  if (Demo.active && Demo.editing && !Demo.flushDraft()) { event.preventDefault(); event.returnValue = ''; }
});
Demo.openFeedback(Demo.previewCourse().id);
