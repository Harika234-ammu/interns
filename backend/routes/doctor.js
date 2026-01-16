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
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    db.query(
      `
      INSERT INTO doctorsdb
      (fullname,email,password,qualification,specialization,licenseNumber,status,verification_token)
      VALUES (?,?,?,?,?,?,'Pending',?)
      `,
      [fullname, email, hashedPassword, qualification, specialization, licenseNumber, token],
      async (err) => {
        if (err) return res.status(500).json({ message: "Registration failed" });

        const link = `http://localhost:5000/verify-email?token=${token}&role=doctor`;
        await sendRegistrationMail(email, link);

        res.status(201).json({ message: "Verification mail sent" });
      }
    );
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= FETCH DOCTOR PROFILE ================= */
router.get("/profile/:doctorId", (req, res) => {
  const sql = `
    SELECT 
      d.id,
      d.fullname,
      d.specialization,
      d.qualification,
      d.hospital,
      d.fee,
      d.contact,
      d.experience_years,
      d.bio,
      d.start_time,
      d.end_time,
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
  const { hospital, contact, fee, experience, bio, start_time, end_time } = req.body;

  if (!hospital || !fee || !experience || !bio || !start_time || !end_time) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    `
    UPDATE doctorsdb
    SET hospital=?, contact=?, fee=?, experience_years=?, bio=?, start_time=?, end_time=?
    WHERE id=?
    `,
    [hospital, contact, fee, experience, bio, start_time, end_time, req.params.doctorId],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Profile updated successfully" });
    }
  );
});

/* ================= FETCH APPROVED DOCTORS ================= */
router.get("/approved/:specialty", (req, res) => {
  const sql = `
    SELECT 
      d.id,
      d.fullname,
      d.specialization,
      d.qualification,
      d.hospital,
      d.fee,
      d.contact,
      d.experience_years,
      d.bio,
      d.start_time,
      d.end_time,
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
  const safeParse = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  db.query(
    `
    SELECT 
      a.id,
      a.appointment_time,
      a.status,
      a.patient_symptoms_notes,
      p.fullname AS patientName,
      pp.age,
      pp.gender,
      pp.allergies
    FROM appointments a
    JOIN Patientdb p ON a.patient_id = p.id
    LEFT JOIN patient_profile pp ON pp.patient_id = p.id
    WHERE a.doctor_id = ?
    ORDER BY a.appointment_time ASC
    `,
    [req.params.doctorId],
    (err, rows) => {
      if (err) return res.status(500).json([]);

      res.json(
        rows.map((r) => ({
          id: r.id,
          patientName: r.patientName,
          age: r.age,
          gender: r.gender,
          allergies: r.allergies,
          date: r.appointment_time,
          status: r.status,
          symptoms: r.patient_symptoms_notes
            ? safeParse(r.patient_symptoms_notes)
            : [],
        }))
      );
    }
  );
});

/* ================= COMPLETE APPOINTMENT ================= */
router.post("/appointments/:id/complete", upload.single("file"), (req, res) => {
  const appointmentId = req.params.id;
  const { doctorNotes, prescriptionDetails } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  db.query(
    "SELECT appointment_time, patient_id FROM appointments WHERE id=?",
    [appointmentId],
    (err, rows) => {
      if (err || !rows.length) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (new Date(rows[0].appointment_time) > new Date()) {
        return res.status(400).json({ message: "Cannot complete appointment early" });
      }

      const patientId = rows[0].patient_id;

      db.query(
        `
        UPDATE appointments
        SET status='Completed', doctor_notes=?
        WHERE id=?
        `,
        [doctorNotes, appointmentId],
        (err) => {
          if (err) return res.status(500).json({ message: "Failed to update" });

          db.query(
            `
            INSERT INTO prescriptions
            (appointment_id, prescription_details, file_url)
            VALUES (?,?,?)
            `,
            [appointmentId, prescriptionDetails, fileUrl],
            () => {
              db.query(
                `
                INSERT INTO notifications (user_id, message, type)
                VALUES (?, 'Your prescription is available', 'PRESCRIPTION')
                `,
                [patientId],
                () => res.json({ message: "Appointment completed successfully" })
              );
            }
          );
        }
      );
    }
  );
});

/* ================= DOCTOR NOTIFICATIONS ================= */
router.get("/notifications/:doctorId", (req, res) => {
  db.query(
    `
    SELECT id, message, is_read, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [req.params.doctorId],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
});

/* ================= MARK NOTIFICATION AS READ ================= */
router.put("/notifications/read/:id", (req, res) => {
  db.query(
    "UPDATE notifications SET is_read=true WHERE id=?",
    [req.params.id],
    () => res.json({ message: "Marked as read" })
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
