import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import leftImage from "../../assets/login.jpg";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  const handleLogin = (e) => {
    const { name, value } = e.target;
    setLoginDetails({ ...loginDetails, [name]: value });
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginDetails),
      });

      const result = await response.json();

      if (!response.ok) {
         const icon =
         response.status === 403 ? "warning" : "error";

          Swal.fire({
          title: "Login Failed",
          text: result.message || "Error",
          icon: icon
         });
         return;
         }


      //  SAVE EVERYTHING NEEDED
      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.role);
      localStorage.setItem("fullname", result.fullname); // ⭐ IMPORTANT

      Swal.fire({
        title: "Login Successful",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      if (result.mustChangePassword) {
        navigate("/change-password");
      }else if (result.role === "doctor") {
        navigate("/DocDashboard");
      }else if (result.role === "patient") {
        navigate("/PatientDash");
      }

    } catch (error) {
      console.error("Login error:", error);
      Swal.fire("Server Error", "Backend not responding", "error");
    }
  };

  return (
    <div className="modern-split">
      <div className="modern-img">
        <img src={leftImage} alt="Care" />
      </div>

      <div className="modern-content-bg">
        <form className="vertical-form" onSubmit={handleLogSubmit}>
          <h2 className="big-login-heading">Sign in to your account</h2>

          <div className="login-block">
            <label className="input-label">Email</label>
            <input
              type="email"
              name="email"
              className="modern-input2"
              value={loginDetails.email}
              onChange={handleLogin}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="login-block">
            <label className="input-label">Password</label>
            <div className="pass-input-row">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="modern-input2"
                value={loginDetails.password}
                onChange={handleLogin}
                required
                placeholder="Enter your password"
              />
              <span
                className="field-icon eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          <p className="link">
            Forgot Password??
            <span className= "forgot-link" onClick={() => navigate("/forgot-password")}> Reset Password</span>
          </p>
          <button type="submit" className="modern-login-btn">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
