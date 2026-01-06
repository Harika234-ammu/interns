import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // PATIENT LOGIN
  const patientQuery = "SELECT * FROM patientdb WHERE email = ?";
  db.query(patientQuery, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (result.length > 0) {
      const patient = result[0];

      if (!patient.is_verified) {
        return res.status(403).json({ message: "Please verify your email" });
      }

      const match = await bcrypt.compare(password, patient.password);
      if (!match) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: patient.id, role: "patient" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        token,
        role: "patient",
        fullname: patient.fullname   // ✅ VERY IMPORTANT
      });
    }

    // DOCTOR LOGIN
    const doctorQuery = "SELECT * FROM doctorsdb WHERE email = ?";
    db.query(doctorQuery, [email], async (err2, result2) => {
      if (err2) return res.status(500).json({ message: "DB error" });

      if (result2.length > 0) {
        const doctor = result2[0];

        if (!doctor.is_verified) {
          return res.status(403).json({ message: "Please verify your email" });
        }
        if (doctor.status === "Pending") {
          return res.status(403).json({ message: "Pending admin approval" });
        }
        if (doctor.status === "Rejected") {
          return res.status(403).json({ message: "Application rejected" });
        }

        const match = await bcrypt.compare(password, doctor.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
          { id: doctor.id, role: "doctor" },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.json({
          token,
          role: "doctor",
          fullname: doctor.fullname   // ✅
        });
      }

      // ADMIN
      if (email === "admin@system.com" && password === "admin123") {
        const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET);
        return res.json({ token, role: "admin", fullname: "Admin" });
      }

      return res.status(401).json({ message: "Invalid credentials" });
    });
  });
});


router.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password required" });
  }

  try {
    const patientQuery = "SELECT * FROM Patientdb WHERE email = ?";
    db.query(patientQuery, [email], async (err, patientResult) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (patientResult.length > 0) {
        const hashed = await bcrypt.hash(newPassword, 10);
        const updateQuery = "UPDATE Patientdb SET password = ? WHERE email = ?";
        db.query(updateQuery, [hashed, email], () => {
          return res.json({ message: "Password updated successfully" });
        });
        return;
      }

      const doctorQuery = "SELECT * FROM doctorsdb WHERE email = ?";
      db.query(doctorQuery, [email], async (err2, doctorResult) => {
        if (err2) return res.status(500).json({ message: "DB error" });

        if (doctorResult.length > 0) {
          const hashed = await bcrypt.hash(newPassword, 10);
          const updateQuery = "UPDATE doctorsdb SET password = ? WHERE email = ?";
          db.query(updateQuery, [hashed, email], () => {
            return res.json({ message: "Password updated successfully" });
          });
          return;
        }

        return res.status(404).json({ message: "User not found" });
      });
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});


export default router;