import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const router = express.Router();

router.post("/", (req, res) => {
  console.log("✅ Login API hit:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  /* =======================
      PATIENT LOGIN
  ======================= */
  const patientQuery = "SELECT * FROM Patientdb WHERE email = ?";

  db.query(patientQuery, [email], async (err, patientResult) => {
    if (err) {
      console.error("❌ DB error (patient login):", err);
      return res.status(500).json({ message: "Database error (patient)" });
    }

    if (patientResult.length > 0) {
      const patient = patientResult[0];

      // If patient passwords are hashed, use bcrypt
      const isMatch = await bcrypt.compare(password, patient.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: patient.id, role: "patient" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        token,
        role: "patient",
        fullname: patient.fullname
      });
    }

    /* =======================
       DOCTOR LOGIN
    ======================= */
    const doctorQuery = "SELECT * FROM doctorsdb WHERE email = ?";

    db.query(doctorQuery, [email], async (err2, doctorResult) => {
      if (err2) {
        console.error("❌ DB error (doctor login):", err2);
        return res.status(500).json({ message: "Database error (doctor)" });
      }

      if (doctorResult.length > 0) {
        const doctor = doctorResult[0];

        //  Password check (HASHED)
        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        //  Email verification check
        if (!doctor.is_verified) {
          return res
            .status(403)
            .json({ message: "Please verify your email before login" });
        }

        // Admin approval check
        if (doctor.status === "Pending") {
          return res
            .status(403)
            .json({ message: "Awaiting admin approval" });
        }

        if (doctor.status === "Rejected") {
          return res
            .status(403)
            .json({ message: "Application rejected" });
        }

        const token = jwt.sign(
          { id: doctor.id, role: "doctor" },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.json({
          token,
          role: "doctor",
          fullname: doctor.fullname
        });
      }

      /* =======================
         ADMIN LOGIN (STATIC)
      ======================= */
      if (email === "admin@system.com" && password === "admin123") {
        const token = jwt.sign(
          { role: "admin", email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.json({
          token,
          role: "admin"
        });
      }

      // NO USER FOUND
      return res.status(401).json({ message: "Invalid credentials" });
    });
  });
});

export default router;
