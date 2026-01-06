import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import leftDoctorImage from "../../assets/register.jpg";
import "../styles/DoctorRegister.css";

const DoctorRegister = () => {
  const navigate = useNavigate();

  const [formDetails, setFormDetails] = useState({
    fullname: "",
    email: "",
    password: "",
    qualification: "",
    specialization: "",
    licenseNumber: ""
  });

  const specializations = [
    "Cardiologist (Heart)",
    "Pulmonologist (Lungs/Respiratory)",
    "Neurologist (Brain/Nerves)",
    "ENT Specialist (Ear/Nose/Throat)",
    "Gastroenterologist (Stomach/Digestion)",
    "Dermatologist (Skin)",
    "Orthopedic (Bones/Joints)",
    "General Physician",
    "Ophthalmologist (Eyes)",
    "Nephrologist (Kidney)",
    "Psychiatrist (Mental Health)",
    "Gynecologist (Women Health)",
    "Pediatrician (Children)",
    "Endocrinologist (Diabetes/Thyroid)",
    "other"
  ];

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullname, email, password, qualification, specialization, licenseNumber } = formDetails;

    if (!fullname || !email || !password || !qualification || !specialization || !licenseNumber) {
      Swal.fire("Missing Info", "Please fill all required fields!", "warning");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/doctor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDetails)
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Registration Successful",
          text: "Await admin approval before login.",
          icon: "success",
          confirmButtonColor: "#3085d6"
        }).then(() => navigate("/Login"));
      } else {
        Swal.fire("Registration Failed", result.message || "Try again!", "error");
      }
    } catch (err) {
      Swal.fire("Server Error", "Backend not responding. Try again later", "error");
    }
  };

  return (
    <div className="modern-split">
      <div className="modern-img">
        <img src={leftDoctorImage} alt="Doctor" />
      </div>

      <div className="modern-content-bg">
        <form className="vertical-form" onSubmit={handleSubmit}>
          <h2 className="big-login-heading">Doctor Registration</h2>

          <div className="login-block">
            <label className="input-label">Full Name *</label>
            <input
              type="text"
              name="fullname"
              className="modern-input2"
              placeholder="Enter full name"
              value={formDetails.fullname}
              onChange={handleChange}
            />
          </div>

          <div className="login-block">
            <label className="input-label">Email *</label>
            <input
              type="email"
              name="email"
              className="modern-input2"
              placeholder="Enter email"
              value={formDetails.email}
              onChange={handleChange}
            />
          </div>

          <div className="login-block">
            <label className="input-label">Password *</label>
            <input
              type="password"
              name="password"
              className="modern-input2"
              placeholder="Enter password"
              value={formDetails.password}
              onChange={handleChange}
            />
          </div>

          <div className="login-block">
            <label className="input-label">Qualification *</label>
            <select
              name="qualification"
              className="modern-input2"
              value={formDetails.qualification}
              onChange={handleChange}
            >
              <option value="">Select qualification</option>
              <option value="MBBS">MBBS</option>
              <option value="MD">MD</option>
              <option value="MS">MS</option>
              <option value="PhD">PhD</option>
            </select>
          </div>

          <div className="login-block">
            <label className="input-label">Specialization *</label>
            <select
              name="specialization"
              className="modern-input2"
              value={formDetails.specialization}
              onChange={handleChange}
            >
              <option value="">Select specialization</option>
              {specializations.map((spec, idx) => (
                <option key={idx} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="login-block">
            <label className="input-label">Medical License Number *</label>
            <input
              type="text"
              name="licenseNumber"
              className="modern-input2"
              placeholder="Enter license number"
              value={formDetails.licenseNumber}
              onChange={handleChange}
            />
          </div>

          <p className="login-link">
            Already have an account?
            <span onClick={() => navigate("/Login")}> Login</span>
          </p>

          <button type="submit" className="modern-login-btn">Register</button>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegister;
