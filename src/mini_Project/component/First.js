import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/First.css";
import doctorImg from "../../assets/doctorss.png"; // Make sure this file exists

const First = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-left">
        <h1>
          Book <span>Doctor</span> Appointments <br/>
          Online Anytime, Anywhere — <span>24×7</span>
        </h1>

        <p>
          Find the right doctor, schedule appointments instantly, and get trusted
          healthcare support anywhere from experienced professionals.
        </p>

        <div className="buttons">
          <button className="patient-btn" onClick={() => navigate("/patientReg")}>
            I'm a Patient
          </button>

          <button className="doctor-btn" onClick={() => navigate("/DocRegister")}>
            I'm a Doctor
          </button>
        </div>
      </div>

      <div className="hero-image">
        <img src={doctorImg} alt="Doctor" />
      </div>
    </section>
  );
};

export default First;
