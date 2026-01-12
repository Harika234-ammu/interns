import React, { useEffect, useState } from "react";
import axios from "axios";

const DoctorProfile = ({ doctorId, token }) => {
  const [doctor, setDoctor] = useState(null);
  const [formData, setFormData] = useState({
    hospital: "",
    fee: "",
    experience: "",
    bio: "",
    timings: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!doctorId) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/doctor/profile/${doctorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDoctor(res.data);

        setFormData({
          hospital: res.data.hospital || "",
          fee: res.data.fee || "",
          experience: res.data.experience_years || "",
          bio: res.data.bio || "",
          timings: res.data.timings || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [doctorId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const { hospital, fee, experience, bio, timings } = formData;

    if (!hospital || !fee || !experience || !bio || !timings) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      await axios.put(
        `http://localhost:5000/doctor/profile/${doctorId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile updated successfully");
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <>
      <h3>👨‍⚕️ Profile</h3>

      <div className="doctor-profile">
        <h4>{doctor?.fullname}</h4>

        <p><strong>Specialization:</strong> {doctor?.specialization}</p>
        <p><strong>Qualification:</strong> {doctor?.qualification}</p>

        <label>
          <strong>Hospital / Clinic *</strong>
          <input
            className="input"
            name="hospital"
            placeholder="Enter hospital / clinic name"
            value={formData.hospital}
            onChange={handleChange}
          />
        </label>


        <label>
          <strong>Consultation Fee (₹) *</strong>
          <input
            className="input"
            type="number"
            name="fee"
            placeholder="Enter fee"
            value={formData.fee}
            onChange={handleChange}
          />
        </label>

        <label>
          <strong>Experience (years) *</strong>
          <input
            className="input"
            type="number"
            name="experience"
            placeholder="Years of experience"
            value={formData.experience}
            onChange={handleChange}
          />
        </label>

        <label>
          <strong>Bio *</strong>
          <textarea
            className="input"
            name="bio"
            rows="4"
            placeholder="Brief description about yourself"
            value={formData.bio}
            onChange={handleChange}
          />
        </label>

        <label>
          <strong>Timings *</strong>
          <input
            className="input"
            name="timings"
            placeholder="e.g. Mon-Sat 10:00 AM - 3:00 PM"
            value={formData.timings}
            onChange={handleChange}
          />
        </label>

        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  );
};

export default DoctorProfile;
