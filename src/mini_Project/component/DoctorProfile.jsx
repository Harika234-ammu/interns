import React, { useEffect, useState } from "react";
import axios from "axios";

const DoctorProfile = ({ doctorId, token }) => {
  const [doctor, setDoctor] = useState(null);
  const [formData, setFormData] = useState({
    hospital: "",
    contact: "",     // ADDED
    fee: "",
    experience: "",
    bio: "",
    start_time: "",
    end_time: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!doctorId) return;

    axios
      .get(`http://localhost:5000/doctor/profile/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setDoctor(res.data);
        setFormData({
          hospital: res.data.hospital || "",
          contact: res.data.contact || "",     // ✅ ADDED
          fee: res.data.fee || "",
          experience: res.data.experience_years || "",
          bio: res.data.bio || "",
          start_time: res.data.start_time?.slice(0, 5) || "",
          end_time: res.data.end_time?.slice(0, 5) || ""
        });
      })
      .finally(() => setLoading(false));
  }, [doctorId, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `http://localhost:5000/doctor/profile/${doctorId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile updated successfully");
    } catch (err) {
       console.error(err.response?.data || err.message);
        alert(err.response?.data?.message || "Update failed");
     }setSaving(false);
  };

  if (loading) return <p>Loading...</p>;

  if (!doctor) {
    return <p>Unable to load doctor profile.</p>;
  }


  return (
    <div className="doctor-profile">
      <h3>{doctor.fullname}</h3>

      <label>
        Hospital
        <input name="hospital" value={formData.hospital} onChange={handleChange} />
      </label>

      <label>
        Contact   {/* ✅ ADDED */}
        <input
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          placeholder="Phone number"
        />
      </label>

      <label>
        Fee
        <input type="number" name="fee" value={formData.fee} onChange={handleChange} />
      </label>

      <label>
        Experience
        <input type="number" name="experience" value={formData.experience} onChange={handleChange} />
      </label>

      <label>
        Bio
        <textarea name="bio" value={formData.bio} onChange={handleChange} />
      </label>

      <label>
        Start Time
        <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} />
      </label>

      <label>
        End Time
        <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} />
      </label>

      <button  className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default DoctorProfile;
