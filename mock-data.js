window.Demo = {};
Demo.userProfile = { timeZone: 'America/New_York' };
Demo.grades = Array.from({ length: 9 }, (_, index) => `Grade ${index + 1}`);
Demo.subjectSkills = {
  Math: ['Number sense', 'Calculation fluency', 'Problem-solving', 'Word problems', 'Mathematical reasoning', 'Fractions and decimals', 'Geometry and measurement', 'Algebraic thinking'],
  ELA: ['Phonics and decoding', 'Reading fluency', 'Reading comprehension', 'Vocabulary', 'Speaking and oral expression', 'Grammar', 'Writing', 'Evidence-based responses']
};
Demo.engagement = ['Highly engaged', 'Engaged', 'Limited engagement', 'Disengaged', 'Unable to observe'];
Demo.independence = ['Works independently', 'Needs occasional prompts', 'Needs frequent guidance', 'Unable to assess'];
Demo.completion = ['Completed', 'Partially completed', 'Student absent', 'Not conducted'];
Demo.technical = ['No significant issues', 'Issues occurred', 'Unable to assess'];
Demo.issueTypes = ['Audio', 'Video', 'Network', 'Material loading or display', 'Interactive functions', 'Other'];
Demo.exclusive = ['No clear strength observed', 'No clear learning gap observed', 'Unable to assess', 'No clear signal', 'Not discussed', 'No concern expressed', 'No clear response', 'No barrier expressed', 'Unknown'];
Demo.materialThemes = {
  Math: ['Counting & number patterns', 'Addition & subtraction', 'Multiplication & division', 'Factors & multiples', 'Fractions & decimals', 'Ratios & expressions', 'Proportions & equations', 'Linear relationships', 'Algebra foundations'],
  ELA: ['Sounds & early reading', 'Building reading fluency', 'Stories & main ideas', 'Reading with evidence', 'Vocabulary in context', 'Text structure & inference', 'Argument & evidence', 'Analyzing perspectives', 'Literary analysis']
};
Demo.materials = (subject, grade) => {
  const number = Demo.grades.indexOf(grade) + 1;
  if (!number) return [];
  const theme = Demo.materialThemes[subject][number - 1];
  return [
    { id: `${subject}-G${number}-01`, name: `${theme} · Core lesson` },
    { id: `${subject}-G${number}-02`, name: `${theme} · Guided practice` }
  ];
};
Demo.courses = [
  { id: 'TR-1102-0841', studentId: 'ST-1001', name: 'Oliver Wilson', initials: 'OW', grade: 'Grade 4', subject: 'Math', startsAt: '2026-11-02T15:00:00.000Z', endsAt: '2026-11-02T15:45:00.000Z', attendance: 'Attended', color: 'peach', report: 'Sent' },
  { id: 'TR-1102-0842', studentId: 'ST-1002', name: 'Emma Thompson', initials: 'ET', grade: 'Grade 3', subject: 'ELA', startsAt: '2026-11-02T14:00:00.000Z', endsAt: '2026-11-02T14:45:00.000Z', attendance: 'Attended', color: 'lavender', report: 'Sent' },
  { id: 'TR-1101-0833', studentId: 'ST-1003', name: 'Noah Martinez', initials: 'NM', grade: 'Grade 6', subject: 'Math', startsAt: '2026-11-01T20:00:00.000Z', endsAt: '2026-11-01T20:45:00.000Z', attendance: 'Attended', color: 'mint', report: 'Sent' },
  { id: 'TR-1101-0834', studentId: 'ST-1004', name: 'Sophia Davis', initials: 'SD', grade: 'Grade 2', subject: 'ELA', startsAt: '2026-11-01T19:00:00.000Z', endsAt: '2026-11-01T19:45:00.000Z', attendance: 'Attended', color: 'pink', report: 'Sent' },
  { id: 'TR-1031-0821', studentId: 'ST-1005', name: 'Liam Anderson', initials: 'LA', grade: 'Grade 5', subject: 'Math', startsAt: '2026-10-31T15:00:00.000Z', endsAt: '2026-10-31T15:45:00.000Z', attendance: 'Attended', color: 'blue', report: 'Sent' },
  { id: 'TR-1031-0822', studentId: 'ST-1006', name: 'Ava Robinson', initials: 'AR', grade: 'Grade 7', subject: 'ELA', startsAt: '2026-10-31T14:00:00.000Z', endsAt: '2026-10-31T14:45:00.000Z', attendance: 'Attended', color: 'peach', report: 'Sent' },
  { id: 'TR-1030-0811', studentId: 'ST-1007', name: 'Ethan Lee', initials: 'EL', grade: 'Grade 9', subject: 'Math', startsAt: '2026-10-30T20:00:00.000Z', endsAt: '2026-10-30T20:45:00.000Z', attendance: 'Student absent', color: 'lavender', report: 'Not sent' },
  { id: 'TR-1030-0812', studentId: 'ST-1008', name: 'Isabella Brown', initials: 'IB', grade: 'Grade 1', subject: 'ELA', startsAt: '2026-10-30T19:00:00.000Z', endsAt: '2026-10-30T19:45:00.000Z', attendance: 'Attended', color: 'mint', report: 'Sent' }
];
Demo.seedFeedback = {
  completion: 'Completed', technical: 'No significant issues', issueTypes: [], reason: '', issueNotes: '',
  grade: 'Grade 6', material: 'Math-G6-01', engagement: 'Engaged', independence: 'Needs occasional prompts',
  strengths: ['Number sense', 'Mathematical reasoning'], improvements: ['Word problems'],
  revisionReason: '',
  participation: 'Joined the final feedback only', goal: ['Strengthen foundational skills', 'Build learning confidence'],
  concern: ['Academic progress', 'Learning habits'], urgency: 'Wants to start soon', response: ['Wants to continue', 'Raised questions or concerns'],
  signals: ['Asked about pricing', 'Expressed interest in continuing lessons'],
  barrier: ['No barrier expressed'], advisorNotes: 'Parent asked which lesson package would support foundational skills.'
};
Demo.blank = course => ({ completion: course.attendance === 'Student absent' ? 'Student absent' : '', technical: '', issueTypes: [], reason: '', issueNotes: '', grade: '', material: '', engagement: '', independence: '', strengths: [], improvements: [], revisionReason: '', participation: '', goal: [], concern: [], urgency: '', response: [], signals: [], barrier: [], advisorNotes: '' });
