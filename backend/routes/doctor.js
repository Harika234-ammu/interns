import express from "express";
import db from "../db.js";
import multer from "multer";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendRegistrationMail } from "../utils/mailer.js";

const router = express.Router();

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/* ================= DOCTOR REGISTER ================= */
router.post("/register", async (req, res) => {
  const { fullname, email, password, qualification, specialization, licenseNumber } = req.body;

  if (!fullname || !email || !password || !qualification || !specialization || !licenseNumber) {
    return res.status(400).json({ message: "All fields are mandatory" });
  }

  try {
    const checkSql = "SELECT is_verified FROM doctorsdb WHERE email = ?";
    db.query(checkSql, [email], async (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (rows.length > 0) {
        if (rows[0].is_verified) {
          return res.status(409).json({ message: "Email already registered" });
        }

        const token = crypto.randomBytes(32).toString("hex");
        db.query(
          "UPDATE doctorsdb SET verification_token=? WHERE email=?",
          [token, email],
          async () => {
            const link = `http://localhost:5000/verify-email?token=${token}&role=doctor`;
            await sendRegistrationMail(email, link);
            return res.json({ message: "Verification mail resent" });
          }
        );
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const token = crypto.randomBytes(32).toString("hex");

      const insertSql = `
        INSERT INTO doctorsdb
        (fullname, email, password, qualification, specialization, licenseNumber, status, verification_token)
        VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)
      `;

      db.query(
        insertSql,
        [fullname, email, hashedPassword, qualification, specialization, licenseNumber, token],
        async (err2) => {
          if (err2) return res.status(500).json({ message: "Registration failed" });

          const link = `http://localhost:5000/verify-email?token=${token}&role=doctor`;
          await sendRegistrationMail(email, link);

          res.status(201).json({ message: "Verification mail sent" });
        }
      );
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= FETCH DOCTOR PROFILE ================= */
router.get("/profile/:doctorId", (req, res) => {
  const { doctorId } = req.params;

  const sql = `
    SELECT id,
           fullname,
           specialization,
           qualification,
           hospital,
           contact,
           fee,
           experience_years,
           bio,
           timings,
           rating
    FROM doctorsdb
    WHERE id = ?
  `;

  db.query(sql, [doctorId], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching profile" });
    if (!results.length) return res.status(404).json({ message: "Doctor not found" });

    res.json(results[0]);
  });
});

/* ================= UPDATE DOCTOR PROFILE ================= */
router.put("/profile/:doctorId", (req, res) => {
  const { doctorId } = req.params;
  const { hospital, contact, fee, experience, bio, timings } = req.body;

  if (!hospital || !contact || !fee || !experience || !bio || !timings) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    UPDATE doctorsdb
    SET hospital=?,
        contact=?,
        fee=?,
        experience_years=?,
        bio=?,
        timings=?
    WHERE id=?
  `;

  db.query(
    sql,
    [hospital, contact, fee, experience, bio, timings, doctorId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      if (!result.affectedRows) return res.status(404).json({ message: "Doctor not found" });

      res.json({ message: "Profile updated successfully" });
    }
  );
});

/* ================= FETCH APPROVED DOCTORS ================= */
router.get("/approved/:specialty", (req, res) => {
  const { specialty } = req.params;

  const sql = `
    SELECT id,
           fullname,
           specialization,
           qualification,
           hospital,
           contact,
           fee,
           experience_years,
           bio,
           timings,
           rating
    FROM doctorsdb
    WHERE status='Approved'
      AND LOWER(specialization) LIKE CONCAT('%', LOWER(?), '%')
  `;

  db.query(sql, [specialty], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching doctors" });
    res.json(result);
  });
});

/* ================= APPOINTMENTS ================= */
router.get("/appointments/:doctorId", (req, res) => {
  const sql = `
    SELECT a.id, a.appointment_time, a.status,
           a.patient_symptoms_notes, a.patient_id,
           p.fullname AS patientName,
           pp.age, pp.gender, pp.allergies, a.doctor_notes
    FROM appointments a
    JOIN Patientdb p ON a.patient_id=p.id
    LEFT JOIN patient_profile pp ON pp.patient_id=p.id
    WHERE a.doctor_id=?
    ORDER BY a.appointment_time ASC
  `;

  db.query(sql, [req.params.doctorId], (err, rows) => {
    if (err) return res.status(500).json([]);

    res.json(rows.map(r => ({
      id: r.id,
      patientName: r.patientName,
      age: r.age,
      gender: r.gender,
      allergies: r.allergies,
      date: r.appointment_time,
      status: r.status,
      symptoms: r.patient_symptoms_notes ? JSON.parse(r.patient_symptoms_notes) : [],
      doctorNotes: r.doctor_notes
    })));
  });
});

/* ================= REVIEWS ================= */
router.get("/reviews/:doctorId", (req, res) => {
  const sql = `
    SELECT r.rating, r.comment, p.fullname AS patientName, r.created_at
    FROM reviews r
    JOIN Patientdb p ON r.patient_id=p.id
    WHERE r.doctor_id=?
    ORDER BY r.created_at DESC
  `;
  db.query(sql, [req.params.doctorId], (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
});

/* ================= COMPLETE APPOINTMENT ================= */
router.post("/appointments/:id/complete", upload.single("file"), (req, res) => {
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  db.query(
    "UPDATE appointments SET status='Completed', doctor_notes=? WHERE id=?",
    [req.body.doctorNotes, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });

      db.query(
        "INSERT INTO prescriptions (appointment_id,prescription_details,file_url) VALUES (?,?,?)",
        [req.params.id, req.body.prescriptionDetails, fileUrl],
        () => res.json({ message: "Appointment completed" })
      );
    }
  );
});

/* ================= NOTIFICATIONS ================= */
router.get("/notifications/:doctorId", (req, res) => {
  db.query(
    "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC",
    [req.params.doctorId],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
});

export default router;