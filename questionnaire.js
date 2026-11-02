Demo.questionFields = [
  { name: 'participation', label: 'Parent participation', options: ['Observed the lesson', 'Joined the final feedback only', 'Participated briefly', 'Not present'] },
  { name: 'goal', label: 'Learning goals', multiple: true, options: ['Improve school grades', 'Catch up with grade-level expectations', 'Strengthen foundational skills', 'Get ahead of the school curriculum', 'Build learning confidence', 'Prepare for an upcoming test', 'Enrichment and personal interest', 'Not discussed'] },
  { name: 'concern', label: 'Parent concerns', multiple: true, options: ['Academic progress', 'Learning habits', 'Confidence or motivation', 'Pricing or affordability', 'Scheduling and availability', 'Teaching effectiveness', 'No concern expressed', 'Other'] },
  { name: 'urgency', label: 'Learning urgency', options: ['Wants to start soon', 'Planning for the coming months', 'Exploring available options', 'Not discussed'] },
  { name: 'response', label: 'Parent response after trial', multiple: true, exclusiveGroups: [['Wants to continue', 'Interested but needs time to consider', 'Not interested at this time']], options: ['Wants to continue', 'Interested but needs time to consider', 'Raised questions or concerns', 'Not interested at this time', 'No clear response'] },
  { name: 'engagement', label: 'Student engagement', options: Demo.engagement },
  { name: 'independence', label: 'Learning independence', options: Demo.independence },
  { name: 'strengths', label: 'Observed strengths', options: [], multiple: true },
  { name: 'improvements', label: 'Areas for improvement', options: [], multiple: true },
  { name: 'signals', label: 'Subscription signals', multiple: true, options: ['Asked about pricing', 'Asked about discounts', 'Asked how to subscribe', 'Plans to review the website', 'Expressed interest in continuing lessons', 'Interested in both Math and ELA', 'Requested Learning Advisor assistance', 'No clear signal'] },
  { name: 'barrier', label: 'Subscription barriers', multiple: true, options: ['Pricing or affordability', 'Scheduling or availability', 'Needs to discuss with family', 'Needs more information about learning outcomes', 'Website or payment difficulty', 'No barrier expressed', 'Unknown'] }
];
Demo.questionGroups = [
  { title: 'Parent conversation', description: 'Record what the parent shared. Use a neutral option when it was not discussed.', names: ['participation', 'goal', 'concern', 'urgency', 'response'] },
  { title: 'Student learning', description: 'Select only what you observed during this lesson.', names: ['engagement', 'independence', 'strengths', 'improvements'] },
  { title: 'Follow-up context', description: 'Record expressed interest and any questions for the Learning Advisor.', names: ['signals', 'barrier'] }
];
Demo.questionOptions = field => {
  if (field.name === 'strengths') return [...Demo.subjectSkills[Demo.active.subject], 'Positive learning attitude', 'No clear strength observed'];
  if (field.name === 'improvements') return [...Demo.subjectSkills[Demo.active.subject], 'No clear learning gap observed', 'Unable to assess'];
  return field.options;
};
Demo.visibleQuestionFields = data => Demo.isAbsent(data) ? [] : Demo.questionFields.filter(field => !Demo.isUnobserved(data) || !Demo.questionGroups[1].names.includes(field.name));
Demo.normalizeFeedback = data => {
  const normalized = Demo.copy(data);
  for (const field of Demo.questionFields.filter(item => item.multiple)) {
    const value = normalized[field.name];
    normalized[field.name] = Array.isArray(value) ? value : value ? [value] : [];
  }
  return normalized;
};
Demo.toggleSelection = (selected, value, context) => {
  const current = Array.isArray(selected) ? selected : selected ? [selected] : [];
  if (!context.checked) return current.filter(item => item !== value);
  if (Demo.exclusive.includes(value)) return [value];
  const groups = Demo.questionFields.find(field => field.name === context.name)?.exclusiveGroups || [];
  const conflicts = groups.filter(group => group.includes(value)).flat();
  return [...current.filter(item => item !== value && !Demo.exclusive.includes(item) && !conflicts.includes(item)), value];
};
Demo.validMultiple = (field, value) => {
  if (!Array.isArray(value) || !value.length || !value.every(item => Demo.questionOptions(field).includes(item))) return false;
  if (value.length > 1 && value.some(item => Demo.exclusive.includes(item))) return false;
  return !(field.exclusiveGroups || []).some(group => value.filter(item => group.includes(item)).length > 1);
};
Demo.questionGroup = group => {
  if (group.title === 'Student learning' && Demo.skipLearning(Demo.formData)) return '';
  const fields = group.names.map(name => {
    const field = Demo.questionFields.find(item => item.name === name);
    const hint = field.multiple ? 'Select all that apply. No selection limit. Choose a neutral option on its own.' : '';
    const responseHint = name === 'response' ? ' Choose one interest status; questions or concerns may also be selected.' : '';
    return Demo.field(field.label, Demo.options(name, Demo.questionOptions(field), Demo.formData[name], field.multiple), { name, hint: hint + responseHint });
  }).join('');
  const notes = group.title === 'Follow-up context' ? Demo.field('Important notes for Learning Advisor', `<textarea name="advisorNotes" rows="3" placeholder="Specific questions or context for the advisor.">${Demo.escape(Demo.formData.advisorNotes)}</textarea>`, { name: 'advisorNotes', optional: true }) : '';
  return `<div class="question-group"><div class="question-group-heading"><h3>${group.title}</h3><p>${group.description}</p></div>${fields}${notes}</div>`;
};
Demo.questionSection = () => {
  if (Demo.isAbsent(Demo.formData)) return '';
  return Demo.section('02', 'Parent & student feedback', 'Complete the sections below as part of this lesson record.', Demo.questionGroups.map(Demo.questionGroup).join(''));
};
Demo.validateQuestions = errors => {
  for (const field of Demo.visibleQuestionFields(Demo.formData)) {
    const value = Demo.formData[field.name];
    const valid = field.multiple ? Demo.validMultiple(field, value) : Demo.questionOptions(field).includes(value);
    if (!valid) errors.push({ field: field.name, message: `Complete ${field.label.toLowerCase()}.` });
  }
};
Demo.questionRows = data => Demo.visibleQuestionFields(data).map(field => [field.label, Array.isArray(data[field.name]) ? data[field.name].join(', ') : data[field.name]]);
