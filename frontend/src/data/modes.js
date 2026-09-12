// Centralized Mode Configuration for SignBridge AI

export const MODES_CONFIG = {
  hospital: {
    id: 'hospital',
    label: 'Hospital Mode',
    shortLabel: '🏥 Hospital',
    subtitle: 'Patient ↔ Doctor / Nurse Communication & Emergency Triage',
    theme: {
      accentColor: 'cyan',
      glowClass: 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      activeColor: '#06b6d4'
    },
    defaultSignId: 'CHEST_PAIN',
    prioritySigns: ['CHEST_PAIN', 'BREATHING_DIFFICULTY', 'DOCTOR_HELP', 'HEADACHE', 'STOMACH_PAIN', 'BLEEDING', 'MEDICINE_QUERY', 'ALLERGY_ALERT', 'SIT_DOWN', 'WAIT_MOMENT', 'WATER'],
    emergencyTriggers: ['CHEST_PAIN', 'BREATHING_DIFFICULTY', 'BLEEDING', 'EMERGENCY', 'ACCIDENT'],
    defaultSuggestedReplies: [
      'Please sit down immediately. Medical team is coming.',
      'Are you experiencing pain in your left arm or shortness of breath?',
      'Take slow, deep breaths. A doctor is on the way.'
    ],
    terminology: {
      userRole: 'Patient (Signer)',
      responderRole: 'Doctor / Nurse',
      contextName: 'Hospital Triage Desk'
    }
  },
  college: {
    id: 'college',
    label: 'College Mode',
    shortLabel: '🎓 College',
    subtitle: 'Student ↔ Professor / Staff Academic Clarification & Requests',
    theme: {
      accentColor: 'indigo',
      glowClass: 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]',
      badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      activeColor: '#6366f1'
    },
    defaultSignId: 'QUESTION_CONFUSED',
    prioritySigns: ['QUESTION_CONFUSED', 'CLASSROOM_LOC', 'ATTENDANCE_ISSUE', 'EXAM_SCHEDULE', 'LEAVE_PERMISSION', 'LIBRARY_CARD', 'HELP', 'UNDERSTAND', 'NOT_UNDERSTAND'],
    emergencyTriggers: [],
    defaultSuggestedReplies: [
      'Which specific formula or concept would you like me to re-explain?',
      'You can submit your assignment at counter 3.',
      'Classroom 302 is on the third floor next to the elevator.'
    ],
    terminology: {
      userRole: 'Student (Signer)',
      responderRole: 'Professor / Staff',
      contextName: 'Academic Lecture Hall'
    }
  },
  public_service: {
    id: 'public_service',
    label: 'Public Service Mode',
    shortLabel: '🏛️ Public Service',
    subtitle: 'Citizen ↔ Government Staff, Police, & Administrative Counters',
    theme: {
      accentColor: 'amber',
      glowClass: 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      activeColor: '#f59e0b'
    },
    defaultSignId: 'LOST_ID',
    prioritySigns: ['LOST_ID', 'NEED_REPLACEMENT', 'POLICE_ASSIST', 'OFFICE_COUNTER', 'PAYMENT_FEE', 'HELP', 'INFORMATION', 'FORM'],
    emergencyTriggers: ['POLICE_ASSIST'],
    defaultSuggestedReplies: [
      'Please fill out Form B-2 at Counter 4 to apply for duplicate ID.',
      'Do you have a copy of your Aadhaar card or phone number?',
      'Security officers are stationed right outside this desk.'
    ],
    terminology: {
      userRole: 'Citizen (Signer)',
      responderRole: 'Government Officer',
      contextName: 'Citizen Service Center'
    }
  }
};

export function getModeConfig(modeId) {
  return MODES_CONFIG[modeId] || MODES_CONFIG.hospital;
}
