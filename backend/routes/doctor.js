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

      db.query(
        `
        INSERT INTO doctorsdb
        (fullname,email,password,qualification,specialization,licenseNumber,status,verification_token)
        VALUES (?,?,?,?,?,?,'Pending',?)
        `,
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

/* ================= FETCH DOCTOR PROFILE (RATING FIXED) ================= */
router.get("/profile/:doctorId", (req, res) => {
  const sql = `
    SELECT 
      d.id,
      d.fullname,
      d.specialization,
      d.qualification,
      d.hospital,
      d.contact,
      d.fee,
      d.experience_years,
      d.bio,
      d.timings,
      IFNULL(ROUND(AVG(r.rating),1),0) AS rating
    FROM doctorsdb d
    LEFT JOIN reviews r ON d.id = r.doctor_id
    WHERE d.id=?
    GROUP BY d.id
  `;

  db.query(sql, [req.params.doctorId], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error fetching profile" });
    if (!rows.length) return res.status(404).json({ message: "Doctor not found" });
    res.json(rows[0]);
  });
});

/* ================= UPDATE DOCTOR PROFILE ================= */
router.put("/profile/:doctorId", (req, res) => {
  const { hospital, contact, fee, experience, bio, timings } = req.body;

  if (!hospital || !contact || !fee || !experience || !bio || !timings) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    `
    UPDATE doctorsdb
    SET hospital=?, contact=?, fee=?, experience_years=?, bio=?, timings=?
    WHERE id=?
    `,
    [hospital, contact, fee, experience, bio, timings, req.params.doctorId],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Profile updated successfully" });
    }
  );
});

/* ================= FETCH APPROVED DOCTORS (RATING FIXED) ================= */
router.get("/approved/:specialty", (req, res) => {
  const sql = `
    SELECT 
      d.id,
      d.fullname,
      d.specialization,
      d.qualification,
      d.hospital,
      d.contact,
      d.fee,
      d.experience_years,
      d.bio,
      d.timings,
      IFNULL(ROUND(AVG(r.rating),1),0) AS rating
    FROM doctorsdb d
    LEFT JOIN reviews r ON d.id = r.doctor_id
    WHERE d.status='Approved'
      AND LOWER(d.specialization) LIKE CONCAT('%', LOWER(?), '%')
    GROUP BY d.id
  `;

  db.query(sql, [req.params.specialty], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error fetching doctors" });
    res.json(rows);
  });
});

/* ================= DOCTOR APPOINTMENTS ================= */
router.get("/appointments/:doctorId", (req, res) => {
  db.query(
    `
    SELECT a.id, a.appointment_time, a.status,
           p.fullname AS patientName,
           a.patient_symptoms_notes, a.doctor_notes
    FROM appointments a
    JOIN Patientdb p ON a.patient_id=p.id
    WHERE a.doctor_id=?
    ORDER BY a.appointment_time ASC
    `,
    [req.params.doctorId],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
});

/* ================= DOCTOR REVIEWS ================= */
router.get("/reviews/:doctorId", (req, res) => {
  db.query(
    `
    SELECT r.rating, r.comment, p.fullname AS patientName, r.created_at
    FROM reviews r
    JOIN Patientdb p ON r.patient_id=p.id
    WHERE r.doctor_id=?
    ORDER BY r.created_at DESC
    `,
    [req.params.doctorId],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
});

export default router;
