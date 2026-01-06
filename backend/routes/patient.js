import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/verifyToken.js";
import bcrypt from "bcrypt";
import { sendRegistrationMail } from "../utils/mailer.js";
import crypto from "crypto";

const router = express.Router();

/* ================= PATIENT REGISTRATION ================= */
router.post("/register", async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ message: "All fields are mandatory" });
  }

  const checkSql = "SELECT is_verified FROM patientdb WHERE email = ?";

  db.query(checkSql, [email], async (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });

    const token = crypto.randomBytes(32).toString("hex");
    const link = `http://localhost:5000/verify-email?token=${token}&role=patient`;

    if (rows.length > 0 && rows[0].is_verified) {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (rows.length > 0 && !rows[0].is_verified) {
      db.query(
        "UPDATE patientdb SET verification_token=? WHERE email=?",
        [token, email],
        async () => {
          try {
            await sendRegistrationMail(email, link);
          } catch {}
          return res.json({ message: "Verification email resent." });
        }
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO patientdb (fullname,email,password,verification_token,is_verified) VALUES (?,?,?,?,false)",
      [fullname, email, hashedPassword, token],
      async (err2) => {
        if (err2) return res.status(500).json({ message: "Registration failed" });

        try {
          await sendRegistrationMail(email, link);
        } catch {}

        res.status(201).json({
          message: "Registered successfully. Please verify your email."
        });
      }
    );
  });
});

/* ================= PATIENT LOGIN ================= */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM patientdb WHERE email=?", [email], async (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const patient = rows[0];

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

    res.json({ token, fullname: patient.fullname });
  });
});

/* ================= PATIENT PROFILE ================= */
router.get("/profile", verifyToken, (req, res) => {
  db.query(
    `SELECT 
      fullname AS name,
      age,
      gender,
      medical_history,
      allergies,
      ongoing_medications,
      photo 
     FROM patientdb 
     WHERE id=?`,
    [req.userId],
    (err, rows) => {
      if (err || rows.length === 0) return res.json({});
      res.json(rows[0]);
    }
  );
});

router.post("/profile", verifyToken, (req, res) => {
  const {
    name,
    age,
    gender,
    medical_history,
    allergies,
    ongoing_medications,
    photo
  } = req.body;

  db.query(
    `UPDATE patientdb 
     SET fullname=?, age=?, gender=?, medical_history=?, allergies=?, ongoing_medications=?, photo=? 
     WHERE id=?`,
    [
      name,
      age,
      gender,
      medical_history,
      allergies,
      ongoing_medications,
      photo,
      req.userId
    ],
    () => res.json({ message: "Profile saved" })
  );
});

/* ================= GET BOOKED SLOTS ================= */
/**
 * Returns booked times like:
 * ["10:00:00","10:30:00"]
 */
router.get("/doctor-slots/:doctorId/:date", (req, res) => {
  const { doctorId, date } = req.params;

  const sql = `
    SELECT TIME(appointment_time) AS time
    FROM appointments
    WHERE doctor_id = ?
      AND DATE(appointment_time) = ?
  `;

  db.query(sql, [doctorId, date], (err, results) => {
    if (err) {
      console.error("Slot fetch error:", err);
      return res.status(500).json([]);
    }

    res.json(results.map(r => r.time));
  });
});

/* ================= BOOK APPOINTMENT ================= */
router.post("/book", verifyToken, (req, res) => {
  const { doctor_id, appointment_time, symptoms } = req.body;
  const patient_id = req.userId;

  if (!doctor_id || !appointment_time) {
    return res.status(400).json({ message: "Missing data" });
  }

  // ❌ Prevent double booking
  const checkSql = `
    SELECT id FROM appointments
    WHERE doctor_id = ?
      AND appointment_time = ?
  `;

  db.query(checkSql, [doctor_id, appointment_time], (err, rows) => {
    if (rows.length > 0) {
      return res.status(409).json({
        message: "This slot is already booked"
      });
    }

    // ✅ Insert appointment
    const insertSql = `
      INSERT INTO appointments
      (patient_id, doctor_id, appointment_time, patient_symptoms_notes, status)
      VALUES (?, ?, ?, ?, 'Scheduled')
    `;

    db.query(
      insertSql,
      [
        patient_id,
        doctor_id,
        appointment_time,
        JSON.stringify(symptoms || [])
      ],
      (err2) => {
        if (err2) {
          console.error("Booking error:", err2);
          return res.status(500).json({ message: "Booking failed" });
        }

        res.status(201).json({
          message: "Appointment booked successfully"
        });
      }
    );
  });
});

export default router;