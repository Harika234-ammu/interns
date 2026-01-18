import { useState } from "react";
import { useNavigate } from "react-router-dom";
import leftImage from "../../assets/registerlogin.jpg";
import CommonFields from "./CommonFields";
import "../styles/PatientRegister.css";

const PatientRegister = () => {
  const navigate = useNavigate();

  const [formDetails, setFormDetails] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullname, email, password } = formDetails;

    //  Frontend validation
    if (!fullname || !email || !password) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/patient/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDetails),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Patient Registered Successfully");
        navigate("/Login");
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="modern-split">
      {/* LEFT IMAGE */}
      <div className="modern-img">
        <img src={leftImage} alt="Register" />
      </div>

      {/* RIGHT FORM */}
      <div className="modern-content-bg">
        <form className="vertical-form" onSubmit={handleSubmit}>
          <h2 className="big-login-heading">Patient Registration</h2>

          <CommonFields
            formDetails={formDetails}
            handleChange={handleChange}
          />

          {error && <p className="error-text">{error}</p>}

          <p className="login-link">
            Already have an account?
            <span onClick={() => navigate("/Login")}> Login</span>
          </p>

          <button type="submit" className="modern-login-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientRegister;
