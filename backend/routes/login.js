import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", (req, res) => {
  console.log("✅ Login API hit:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  // 1️⃣ PATIENT LOGIN
  const patientQuery =
    "SELECT * FROM Patientdb WHERE email = ? AND password = ?";

  db.query(patientQuery, [email, password], (err, patientResult) => {
    if (err) {
      console.error("❌ DB error (patient login):", err);
      return res.status(500).json({ message: "Database error (patient)" });
    }

    if (patientResult.length > 0) {
      const patient = patientResult[0];

      const token = jwt.sign(
        { id: patient.id, role: "patient" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        token,
        role: "patient"
      });
    }

    // 2️⃣ DOCTOR LOGIN
    const doctorQuery =
      "SELECT * FROM doctorsdb WHERE email = ? AND password = ?";

    db.query(doctorQuery, [email, password], (err2, doctorResult) => {
      if (err2) {
        console.error("❌ DB error (doctor login):", err2);
        return res.status(500).json({ message: "Database error (doctor)" });
      }

      if (doctorResult.length > 0) {
        const doctor = doctorResult[0];

        if (doctor.status === "Pending") {
          return res
            .status(403)
            .json({ message: "Pending admin approval" });
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
          role: "doctor"
        });
      }

      // 3️⃣ ADMIN LOGIN (STATIC)
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

      // ❌ NO MATCH FOUND
      return res.status(401).json({ message: "Invalid credentials" });
    });
  });
});

export default router;
