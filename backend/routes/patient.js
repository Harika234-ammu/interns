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

  db.query(
    "SELECT is_verified FROM patientdb WHERE email=?",
    [email],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error" });

      const token = crypto.randomBytes(32).toString("hex");
      const link = `http://localhost:5000/verify-email?token=${token}&role=patient`;

      if (rows.length && rows[0].is_verified) {
        return res.status(409).json({ message: "Email already registered" });
      }

      if (rows.length && !rows[0].is_verified) {
        db.query(
          "UPDATE patientdb SET verification_token=? WHERE email=?",
          [token, email],
          async () => {
            try { await sendRegistrationMail(email, link); } catch {}
            res.json({ message: "Verification email resent." });
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
          try { await sendRegistrationMail(email, link); } catch {}
          res.status(201).json({ message: "Registered successfully. Please verify your email." });
        }
      );
    }
  );
});

/* ================= PATIENT LOGIN ================= */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM patientdb WHERE email=?", [email], async (err, rows) => {
    if (err || !rows.length) {
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
    `SELECT fullname AS name, age, gender, medical_history, allergies, ongoing_medications, photo
     FROM patientdb WHERE id=?`,
    [req.userId],
    (err, rows) => {
      if (err || !rows.length) return res.json({});
      res.json(rows[0]);
    }
  );
});

router.post("/profile", verifyToken, (req, res) => {
  const { name, age, gender, medical_history, allergies, ongoing_medications, photo } = req.body;

  db.query(
    `UPDATE patientdb
     SET fullname=?, age=?, gender=?, medical_history=?, allergies=?, ongoing_medications=?, photo=?
     WHERE id=?`,
    [name, age, gender, medical_history, allergies, ongoing_medications, photo, req.userId],
    () => res.json({ message: "Profile saved" })
  );
});

/* ================= PATIENT APPOINTMENTS ================= */
router.get("/appointments", verifyToken, (req, res) => {
  db.query(
    `
    SELECT a.id AS appointment_id,
           a.doctor_id,
           a.appointment_time,
           a.status,
           d.fullname AS doctor_name
    FROM appointments a
    JOIN doctorsdb d ON a.doctor_id=d.id
    WHERE a.patient_id=?
    ORDER BY a.appointment_time DESC
    `,
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
});

/* ================= BOOK APPOINTMENT ================= */
router.post("/book", verifyToken, (req, res) => {
  const { doctor_id, appointment_time, symptoms } = req.body;

  if (!doctor_id || !appointment_time) {
    return res.status(400).json({ message: "Missing data" });
  }

  if (new Date(appointment_time) < new Date()) {
    return res.status(400).json({ message: "Cannot book past appointments" });
  }

  db.query(
    "SELECT id FROM appointments WHERE doctor_id=? AND appointment_time=?",
    [doctor_id, appointment_time],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (rows.length) {
        return res.status(409).json({ message: "Slot already booked" });
      }

      db.query(
        `
        INSERT INTO appointments
        (patient_id, doctor_id, appointment_time, patient_symptoms_notes, status)
        VALUES (?, ?, ?, ?, 'Scheduled')
        `,
        [req.userId, doctor_id, appointment_time, JSON.stringify(symptoms || [])],
        (err2) => {
          if (err2) return res.status(500).json({ message: "Booking failed" });

          // 🔔 Notify doctor
          db.query(
            `
            INSERT INTO notifications (user_id, message, type)
            VALUES (
              ?,
              CONCAT(
                'You have an appointment with ',
                (SELECT fullname FROM patientdb WHERE id=?),
                ' on ',
                DATE_FORMAT(?, '%d %b %Y %h:%i %p')
              ),
              'APPOINTMENT'
            )
            `,
            [doctor_id, req.userId, appointment_time],
            () => res.status(201).json({ message: "Appointment booked" })
          );
        }
      );
    }
  );
});

/* ================= PATIENT PRESCRIPTIONS ================= */
router.get("/prescriptions", verifyToken, (req, res) => {
  db.query(
    `
    SELECT pr.id, pr.prescription_details, pr.file_url, pr.created_at,
           d.fullname AS doctorName
    FROM prescriptions pr
    JOIN appointments a ON pr.appointment_id=a.id
    JOIN doctorsdb d ON a.doctor_id=d.id
    WHERE a.patient_id=?
    ORDER BY pr.created_at DESC
    `,
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
});

// ================= CANCEL APPOINTMENT =================
router.put("/appointments/cancel/:id", verifyToken, (req, res) => {
  const { reason } = req.body;
  const appointmentId = req.params.id;

  if (!reason) {
    return res.status(400).json({ message: "Cancel reason required" });
  }

  db.query(
    `
    UPDATE appointments
    SET status='Cancelled', cancel_reason=?
    WHERE id=? AND patient_id=?
    `,
    [reason, appointmentId, req.userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Cancel failed" });
      res.json({ message: "Appointment cancelled" });
    }
  );
});

/* ================= PATIENT REVIEWS ================= */
router.get("/reviews", verifyToken, (req, res) => {
  db.query(
    `
    SELECT r.id, r.rating, r.comment, r.created_at,
           d.fullname AS doctorName
    FROM reviews r
    JOIN doctorsdb d ON r.doctor_id=d.id
    WHERE r.patient_id=?
    ORDER BY r.created_at DESC
    `,
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
});

router.delete("/reviews/:id", verifyToken, (req, res) => {
  db.query(
    "DELETE FROM reviews WHERE id=? AND patient_id=?",
    [req.params.id, req.userId],
    () => res.json({ message: "Review deleted" })
  );
});

/* ================= GET BOOKED SLOTS ================= */
router.get("/doctor-slots/:doctorId/:date", verifyToken, (req, res) => {
  const { doctorId, date } = req.params;

  db.query(
    `SELECT TIME(appointment_time) AS time
     FROM appointments
     WHERE doctor_id=? AND DATE(appointment_time)=?`,
    [doctorId, date],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows.map(r => r.time));
    }
  );
});

export default router;
