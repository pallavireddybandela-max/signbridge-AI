// 3D Sign Avatar Animation Registry
// Clearly labeled as procedural demonstration movements for controlled ISL MVP

export const AVATAR_ANIMATIONS = {
  CHEST_PAIN: {
    id: 'CHEST_PAIN',
    label: 'Chest Pain',
    modes: ['hospital'],
    supported: true,
    demoAnimation: true,
    duration: 3.5,
    description: 'Right arm bends up and clutches center chest tightly with throbbing distress pulse and slight torso bow.'
  },
  BREATHING_DIFFICULTY: {
    id: 'BREATHING_DIFFICULTY',
    label: 'Breathing Difficulty',
    modes: ['hospital'],
    supported: true,
    demoAnimation: true,
    duration: 3.0,
    description: 'Both hands clutching neck and throat area with rapid upward motion.'
  },
  SIT_DOWN: {
    id: 'SIT_DOWN',
    label: 'Please Sit Down',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.8,
    description: 'Both arms extend forward and press palms downward gently with a warm inviting bow.'
  },
  HELP: {
    id: 'HELP',
    label: 'I Need Help',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.5,
    description: 'Left hand flat upward base, right fist placed on top with thumb up and lifted together.'
  },
  DOCTOR_HELP: {
    id: 'DOCTOR_HELP',
    label: 'Doctor',
    modes: ['hospital'],
    supported: true,
    demoAnimation: true,
    duration: 2.5,
    description: 'Right index and middle finger tapping left inner wrist pulse point.'
  },
  HEADACHE: {
    id: 'HEADACHE',
    label: 'Headache',
    modes: ['hospital'],
    supported: true,
    demoAnimation: true,
    duration: 2.8,
    description: 'Both hands touching temples with twisting fingertips indicating throbbing pain.'
  },
  THANK_YOU: {
    id: 'THANK_YOU',
    label: 'Thank You',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.2,
    description: 'Flat right hand fingertips touching chin/lips, then moving forward gracefully toward the viewer.'
  },
  HELLO: {
    id: 'HELLO',
    label: 'Hello / Namaste',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.5,
    description: 'Palms joined together at chest level in traditional Indian Namaste greeting with a gentle nod.'
  },
  WATER: {
    id: 'WATER',
    label: 'Drinking Water',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.4,
    description: 'Right hand bringing 3 fingers to mouth twice in drinking gesture.'
  },
  WAIT_MOMENT: {
    id: 'WAIT_MOMENT',
    label: 'Please Wait',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.2,
    description: 'Raised open palm facing forward at shoulder level with gentle stillness.'
  },
  QUESTION_CONFUSED: {
    id: 'QUESTION_CONFUSED',
    label: 'Question / Confused',
    modes: ['college'],
    supported: true,
    demoAnimation: true,
    duration: 3.0,
    description: 'Index finger tapped to forehead, then sweeping outward with open upturned palms.'
  },
  CLASSROOM_LOC: {
    id: 'CLASSROOM_LOC',
    label: 'Classroom Location',
    modes: ['college'],
    supported: true,
    demoAnimation: true,
    duration: 3.0,
    description: 'Two hands forming box outline, then open palms turning side to side (where sign).'
  },
  ATTENDANCE_ISSUE: {
    id: 'ATTENDANCE_ISSUE',
    label: 'Attendance',
    modes: ['college'],
    supported: true,
    demoAnimation: true,
    duration: 2.6,
    description: 'Left palm flat like register, right index finger drawing a checkmark across it.'
  },
  EXAM_SCHEDULE: {
    id: 'EXAM_SCHEDULE',
    label: 'Exam Schedule',
    modes: ['college'],
    supported: true,
    demoAnimation: true,
    duration: 2.8,
    description: 'Writing gesture on open left palm, followed by tapping index finger on wrist watch.'
  },
  LOST_ID: {
    id: 'LOST_ID',
    label: 'Lost ID Card',
    modes: ['public_service'],
    supported: true,
    demoAnimation: true,
    duration: 3.0,
    description: 'Rectangular card outline drawn on chest pocket, then hands dropping open empty showing loss.'
  },
  POLICE_ASSIST: {
    id: 'POLICE_ASSIST',
    label: 'Police Assistance',
    modes: ['public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.8,
    description: 'Right hand touching forehead in salute, then pointing urgently with both hands.'
  },
  YES: {
    id: 'YES',
    label: 'Yes',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 1.8,
    description: 'Closed right fist nodding vertically up and down.'
  },
  NO: {
    id: 'NO',
    label: 'No',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 1.8,
    description: 'Index, middle finger and thumb snapping closed horizontally with head shake.'
  },
  GOOD: {
    id: 'GOOD',
    label: 'Good / Fine',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.0,
    description: 'Right hand thumbs-up extended forward with happy head nod.'
  },
  BAD: {
    id: 'BAD',
    label: 'Bad / Unwell',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.0,
    description: 'Right hand thumbs-down with slight head shake.'
  },
  EAT: {
    id: 'EAT',
    label: 'Food / Eat',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.2,
    description: 'Right hand fingertips clustered tapping lips repeatedly.'
  },
  FOOD: {
    id: 'FOOD',
    label: 'Food / Meals',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.2,
    description: 'Right hand fingertips clustered tapping lips repeatedly.'
  },
  SLEEP: {
    id: 'SLEEP',
    label: 'Sleep / Tired',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.5,
    description: 'Right palm resting against tilted right cheek with closed eyes.'
  },
  MEDICINE: {
    id: 'MEDICINE',
    label: 'Medicine / Tablet',
    modes: ['hospital'],
    supported: true,
    demoAnimation: true,
    duration: 2.4,
    description: 'Right hand taking tablet from open left palm and bringing to mouth.'
  },
  WASHROOM: {
    id: 'WASHROOM',
    label: 'Washroom / Toilet',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.2,
    description: 'Right hand making T sign wagging side to side.'
  },
  PLEASE: {
    id: 'PLEASE',
    label: 'Please / Request',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.2,
    description: 'Flat open right hand rubbing chest circularly.'
  },
  FEVER: {
    id: 'FEVER',
    label: 'Fever / High Temperature',
    modes: ['hospital'],
    supported: true,
    demoAnimation: true,
    duration: 2.4,
    description: 'Back of right wrist/hand placed against forehead.'
  },
  STOMACH_PAIN: {
    id: 'STOMACH_PAIN',
    label: 'Stomach Pain',
    modes: ['hospital'],
    supported: true,
    demoAnimation: true,
    duration: 2.8,
    description: 'Both hands clutching lower abdomen with body bent forward slightly.'
  },
  BLEEDING: {
    id: 'BLEEDING',
    label: 'Bleeding / Wound',
    modes: ['hospital'],
    supported: true,
    demoAnimation: true,
    duration: 2.6,
    description: 'Right hand clutching left forearm with urgent waving motion.'
  },
  CALL: {
    id: 'CALL',
    label: 'Phone Call / Contact',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.2,
    description: 'Thumb and pinky extended to ear in phone call gesture.'
  },
  WRITE: {
    id: 'WRITE',
    label: 'Write / Pen',
    modes: ['college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.4,
    description: 'Right hand miming writing on flat left open palm.'
  },
  BOOK: {
    id: 'BOOK',
    label: 'Book / Study',
    modes: ['college'],
    supported: true,
    demoAnimation: true,
    duration: 2.4,
    description: 'Both palms joined together opening outward like a book.'
  },
  STOP: {
    id: 'STOP',
    label: 'Stop',
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.0,
    description: 'Right open palm facing firmly outward at chest height.'
  }
};

export function getAvatarAnimation(id) {
  if (!id) return null;
  const raw = String(id).trim().toUpperCase();
  const key = raw.replace(/[\s-]+/g, '_');
  
  if (AVATAR_ANIMATIONS[key]) {
    return AVATAR_ANIMATIONS[key];
  }

  // Check substring matches (e.g. "HEADING_CHEST_PAIN" -> CHEST_PAIN, "HELLO_WORLD" -> HELLO)
  for (const [k, meta] of Object.entries(AVATAR_ANIMATIONS)) {
    if (key.includes(k) || k.includes(key)) {
      return meta;
    }
  }

  // If single character (A-Z or 0-9), return dynamic alphabet / numeral animation definition
  if (raw.length === 1) {
    return {
      id: raw,
      label: `ISL Sign '${raw}'`,
      modes: ['hospital', 'college', 'public_service'],
      supported: true,
      demoAnimation: true,
      duration: 2.0,
      description: `Right hand forming Indian Sign Language fingerspelling pose for character '${raw}'.`
    };
  }

  // Fallback for custom recognized concepts
  return {
    id: key,
    label: id,
    modes: ['hospital', 'college', 'public_service'],
    supported: true,
    demoAnimation: true,
    duration: 2.5,
    description: `Avatar performing ISL gesture for "${id}".`
  };
}
