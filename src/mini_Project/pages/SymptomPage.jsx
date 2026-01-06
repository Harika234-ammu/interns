import React, { useState } from "react";
import "./SymptomPage.css";
import axios from "axios";
import { mapSymptomsToSpecialtiesWeighted } from "../ruleEngine/SymptomToSpeciality";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";   // <-- SweetAlert2

const bodyParts = {
  Head: ["Headache","Dizziness","Blurred vision","Migraine","Loss of balance","Confusion","Fainting","Memory loss"],
  Nose: ["Runny nose","Nasal congestion","Sneezing","Nosebleed","Loss of smell","Post-nasal drip"],
  Ear: ["Ear pain","Hearing loss","Ringing in ear","Ear discharge","Dizziness","Fullness in ear"],
  Eye: ["Redness","Itching","Blurred vision","Eye pain","Double vision","Dry eyes","Watery eyes"],
  Mouth: ["Mouth ulcers","Tooth pain","Bleeding gums","Bad breath","Dry mouth","Swollen gums","Difficulty chewing"],
  Throat: ["Sore throat","Difficulty swallowing","Hoarseness","Throat swelling","Dry throat"],
  Chest: ["Cough","Shortness of breath","Chest pain","Palpitations","Wheezing","Tightness in chest"],
  Lungs: ["Persistent cough","Difficulty breathing","Wheezing","Coughing blood","Chest tightness","Rapid breathing"],
  Heart: ["Chest pain","Palpitations","Shortness of breath","Swelling in legs","Fatigue","Fainting"],
  Stomach: ["Abdominal pain","Nausea","Vomiting","Diarrhea","Constipation","Bloating","Heartburn"],
  Back: ["Pain","Stiffness","Muscle spasm","Numbness","Burning sensation"],
  Arm: ["Pain","Numbness","Tingling","Weakness","Swelling"],
  Leg: ["Pain","Swelling","Numbness","Weakness","Cramps","Tingling"],
  Skin: ["Rash","Itching","Redness","Dry skin","Swelling","Bruising"],
  General: ["Fever","Fatigue","Weight loss","Loss of appetite","Night sweats"]
};

export default function SymptomPage() {
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [suggestedSpecialties, setSuggestedSpecialties] = useState([]);
  const navigate = useNavigate();

  const getKey = (bodyPart, symptom) => `${bodyPart}__${symptom}`;

  const handleSymptomChange = (symptom) => {
    if (!selectedBodyPart) return;

    const key = getKey(selectedBodyPart, symptom);
    setSelectedSymptoms(prev => {
      if (prev[key]) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return {
        ...prev,
        [key]: { symptom, bodyPart: selectedBodyPart, severity: "Mild", duration: "" }
      };
    });
  };

  const handleDetailChange = (key, field, value) => {
    setSelectedSymptoms(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const handleSubmit = () => {
    for (let key in selectedSymptoms) {
      if (!selectedSymptoms[key].duration) {
        Swal.fire({
          title: "Missing Information",
          text: `Please enter how long you've had: ${selectedSymptoms[key].symptom}`,
          icon: "warning",
          confirmButtonColor: "#3085d6"
        });
        return;
      }
    }

    setSuggestedSpecialties(mapSymptomsToSpecialtiesWeighted(selectedSymptoms));

    Swal.fire({
      title: "Symptoms Recorded",
      text: "We have identified the suitable specialists for your condition.",
      icon: "success",
      confirmButtonText: "Okay",
      confirmButtonColor: "#0a84ff"
    });
  };

  const handleFindDoctors = async () => {
    if (!suggestedSpecialties.length) return;
    
    const specialty = suggestedSpecialties[0].specialty;
    const res = await axios.get(`http://localhost:5000/doctor/approved/${encodeURIComponent(specialty)}`);

    Swal.fire({
      title: "Specialist Found",
      text: `Showing doctors for: ${specialty}`,
      icon: "info",
      confirmButtonText: "View Doctors",
      confirmButtonColor: "#28a745"
    }).then(() => {
      navigate("/doctors", { state: { doctors: res.data, specialty } });
    });
  };

  return (
    <div className="page-center">
      <div className="symptom-page">
        <h2>Guided Symptom Checker</h2>
        <p className="instruction-text">Select your symptoms and enter how long you've been experiencing them.</p>

        <div className="select-box">
          <select value={selectedBodyPart} onChange={e => setSelectedBodyPart(e.target.value)}>
            <option value="">-- Choose a body part --</option>
            {Object.keys(bodyParts).map(part => (
              <option key={part} value={part}>{part}</option>
            ))}
          </select>
        </div>

        {selectedBodyPart && (
          <>
            <h3>Symptoms for {selectedBodyPart}</h3>

            {bodyParts[selectedBodyPart].map(symptom => {
              const key = getKey(selectedBodyPart, symptom);
              return (
                <div className="symptom-card" key={key}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={!!selectedSymptoms[key]}
                      onChange={() => handleSymptomChange(symptom)}
                    />
                    <span>{symptom}</span>
                  </label>

                  {selectedSymptoms[key] && (
                    <div className="extra-fields">
                      <label>
                        Severity
                        <select value={selectedSymptoms[key].severity} onChange={e => handleDetailChange(key, "severity", e.target.value)}>
                          <option>Mild</option>
                          <option>Moderate</option>
                          <option>Severe</option>
                        </select>
                      </label>

                      <label>
                        Days suffering
                        <input
                          type="number"
                          min="1"
                          placeholder="How many days?"
                          value={selectedSymptoms[key].duration}
                          onChange={e => handleDetailChange(key, "duration", e.target.value)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {Object.keys(selectedSymptoms).length > 0 && (
          <button className="submit-btn" onClick={handleSubmit}>Submit</button>
        )}

        {suggestedSpecialties.length > 0 && (
          <div className="recommended">
            <h3>Suggested Specialties</h3>
            <ul>
              {suggestedSpecialties.map(s => (
                <li key={s.specialty}>{s.specialty}</li>
              ))}
            </ul>

            <button className="find-doctors-btn" onClick={handleFindDoctors}>Find Doctors</button>
          </div>
        )}
      </div>
    </div>
  );
}
