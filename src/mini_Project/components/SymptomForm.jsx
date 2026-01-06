import React, { useEffect, useState } from "react";
import api from "../../../ai-doctor-intern-main/services/api";

export default function SymptomForm({ onSubmit }) {
  const [bodyParts, setBodyParts] = useState([]);
  const [selectedBody, setSelectedBody] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [selected, setSelected] = useState([]);

  // load body parts
  useEffect(() => {
    api.get("/bodyparts").then((res) => {
      setBodyParts(res.data);
      if (res.data.length > 0) setSelectedBody(res.data[0]);
    });
  }, []);

  // load symptoms for selected body part
  useEffect(() => {
    if (selectedBody) {
      api.get("/symptoms", { params: { body: selectedBody } }).then((res) => {
        setSymptoms(res.data);
        setSelected([]);
      });
    }
  }, [selectedBody]);

  const toggleSymptom = (sym) => {
    const exists = selected.find((s) => s.symptom === sym.name);
    if (exists) {
      setSelected((prev) => prev.filter((s) => s.symptom !== sym.name));
    } else {
      setSelected((prev) => [...prev, { symptom: sym.name, severity: "Mild", duration: 1 }]);
    }
  };

  const updateField = (name, field, value) => {
    setSelected((prev) =>
      prev.map((s) => (s.symptom === name ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected.length === 0) {
      alert("Please select at least one symptom");
      return;
    }
    onSubmit(selected);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>Find a Doctor</h2>

      <label>
        Body Part:&nbsp;
        <select value={selectedBody} onChange={(e) => setSelectedBody(e.target.value)}>
          {bodyParts.map((bp) => (
            <option key={bp} value={bp}>{bp}</option>
          ))}
        </select>
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, marginTop: 12 }}>
        {symptoms.map((sym) => {
          const checked = !!selected.find((s) => s.symptom === sym.name);
          return (
            <div key={sym.id} style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8 }}>
              <label>
                <input type="checkbox" checked={checked} onChange={() => toggleSymptom(sym)} />
                &nbsp;{sym.name}
              </label>

              {checked && (
                <div style={{ marginTop: 8 }}>
                  <div>
                    Severity:&nbsp;
                    <select
                      value={selected.find((s) => s.symptom === sym.name)?.severity}
                      onChange={(e) => updateField(sym.name, "severity", e.target.value)}
                    >
                      <option>Mild</option>
                      <option>Moderate</option>
                      <option>Severe</option>
                    </select>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    Duration (days):&nbsp;
                    <input
                      type="number"
                      min={1}
                      value={selected.find((s) => s.symptom === sym.name)?.duration}
                      onChange={(e) => updateField(sym.name, "duration", Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button type="submit" style={{ marginTop: 16 }}>
        Get Recommendations
      </button>
    </form>
  );
}
