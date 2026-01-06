// src/ruleEngine.js

// Symptom -> array of related specialties (one or more)
export const symptomToSpecialties = {
  // Head
  "Headache": ["Neurologist", "General Physician"],
  "Dizziness": ["Neurologist", "ENT", "Cardiologist"],
  "Blurred vision": ["Ophthalmologist", "Neurologist"],
  "Migraine": ["Neurologist"],
  "Loss of balance": ["Neurologist", "ENT"],
  "Confusion": ["Neurologist", "General Physician"],
  "Fainting": ["Cardiologist", "Neurologist"],
  "Memory loss": ["Neurologist"],

  // Nose
  "Runny nose": ["ENT", "General Physician"],
  "Nasal congestion": ["ENT", "Allergist"],
  "Sneezing": ["ENT", "Allergist"],
  "Nosebleed": ["ENT", "General Physician"],
  "Loss of smell": ["ENT", "Neurologist"],
  "Post-nasal drip": ["ENT"],

  // Ear
  "Ear pain": ["ENT"],
  "Hearing loss": ["ENT", "Audiologist"],
  "Ringing in ear": ["ENT"],
  "Ear discharge": ["ENT"],
  "Fullness in ear": ["ENT"],

  // Eye
  "Redness": ["Ophthalmologist"],
  "Itching": ["Ophthalmologist", "Allergist"],
  "Eye pain": ["Ophthalmologist"],
  "Double vision": ["Ophthalmologist", "Neurologist"],
  "Dry eyes": ["Ophthalmologist"],
  "Watery eyes": ["Ophthalmologist", "Allergist"],

  // Mouth
  "Mouth ulcers": ["Dentist", "ENT"],
  "Tooth pain": ["Dentist"],
  "Bleeding gums": ["Dentist", "Periodontist"],
  "Bad breath": ["Dentist", "ENT"],
  "Dry mouth": ["Dentist", "ENT"],
  "Swollen gums": ["Dentist"],
  "Difficulty chewing": ["Dentist", "Maxillofacial Surgeon"],

  // Throat
  "Sore throat": ["ENT", "General Physician"],
  "Difficulty swallowing": ["ENT", "Gastroenterologist"],
  "Hoarseness": ["ENT"],
  "Throat swelling": ["ENT", "Allergist"],
  "Dry throat": ["ENT"],

  // Chest (general)
  "Cough": ["Pulmonologist", "General Physician"],
  "Shortness of breath": ["Pulmonologist", "Cardiologist"],
  "Chest pain": ["Cardiologist", "Pulmonologist", "General Physician"],
  "Palpitations": ["Cardiologist"],
  "Wheezing": ["Pulmonologist"],
  "Tightness in chest": ["Cardiologist", "Pulmonologist"],

  // Lungs (overlap)
  "Persistent cough": ["Pulmonologist"],
  "Difficulty breathing": ["Pulmonologist", "Cardiologist"],
  "Coughing blood": ["Pulmonologist"],
  "Chest tightness": ["Pulmonologist", "Cardiologist"],
  "Rapid breathing": ["Pulmonologist"],

  // Heart
  "Swelling in legs": ["Cardiologist"],
  "Fatigue": ["General Physician", "Cardiologist"],
  // fainting already mapped above

  // Stomach / GI
  "Abdominal pain": ["Gastroenterologist"],
  "Nausea": ["Gastroenterologist"],
  "Vomiting": ["Gastroenterologist"],
  "Diarrhea": ["Gastroenterologist"],
  "Constipation": ["Gastroenterologist"],
  "Bloating": ["Gastroenterologist"],
  "Heartburn": ["Gastroenterologist"],

  // Back / Musculoskeletal
  "Pain": ["Orthopedist", "Physiotherapist"],
  "Stiffness": ["Orthopedist", "Physiotherapist"],
  "Muscle spasm": ["Physiotherapist", "Orthopedist"],
  "Numbness": ["Neurologist", "Orthopedist"],
  "Burning sensation": ["Neurologist", "Orthopedist"],

  // Arm
  // (reuse "Pain", "Numbness", etc. above)

  // Leg
  "Cramps": ["General Physician", "Neurologist"],
  "Tingling": ["Neurologist"],
  // many "Pain", "Swelling", "Numbness" reuse above mappings

  // Skin
  "Rash": ["Dermatologist"],
  "Itching": ["Dermatologist", "Allergist"],
  "Redness": ["Dermatologist"],
  "Dry skin": ["Dermatologist"],
  "Swelling": ["Dermatologist", "Allergist"],
  "Bruising": ["Dermatologist", "Hematologist"],

  // General / systemic
  "Fever": ["General Physician", "Infectious Disease"],
  "Fatigue": ["General Physician"],
  "Weight loss": ["General Physician", "Endocrinologist"],
  "Loss of appetite": ["General Physician"],
  "Night sweats": ["General Physician", "Infectious Disease"]
};

// Simple aggregator: input = array of symptom names (strings)
// returns array [{specialty, score}] sorted desc by score
export function mapSymptomsToSpecialties(symptomNames = []) {
  const score = {};
  symptomNames.forEach((s) => {
    const specs = symptomToSpecialties[s] || ["General Physician"];
    specs.forEach((sp) => { score[sp] = (score[sp] || 0) + 1; });
  });
  return Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .map(([specialty, sc]) => ({ specialty, score: sc }));
}

// Weighted aggregator: input = selectedSymptoms object
// where keys are composite keys and values = { symptom, bodyPart, severity, duration }
// uses severity and duration to weight scores
export function mapSymptomsToSpecialtiesWeighted(selectedSymptoms = {}) {
  const severityWeight = { Mild: 1, Moderate: 2, Severe: 3 };
  const score = {};

  Object.values(selectedSymptoms).forEach((item) => {
    const { symptom, severity = "Mild", duration = "" } = item;
    const dur = Number(duration) || 0;
    const durFactor = 1 + Math.min(dur / 7, 2); // small boost for longer durations
    const sWeight = (severityWeight[severity] || 1) * durFactor;

    const specs = symptomToSpecialties[symptom] || ["General Physician"];
    specs.forEach((sp) => {
      score[sp] = (score[sp] || 0) + sWeight;
    });
  });

  return Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .map(([specialty, sc]) => ({ specialty, score: Number(sc.toFixed(2)) }));
}
