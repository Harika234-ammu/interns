// routes/doctor.js
import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ================= Doctor Registration =================
router.post("/register", (req, res) => {
  const { fullname, email, password, qualification, specialization, licenseNumber } = req.body;
  const sql = `
    INSERT INTO doctorsdb (fullname, email, password, qualification, specialization, licenseNumber, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [fullname, email, password, qualification, specialization, licenseNumber, "Pending"], (err) => {
    if (err) {
      console.error("DB Error Registering Doctor:", err);
      return res.status(500).json({ message: "Error registering doctor" });
    }
    res.json({ message: "Successfully registered, awaiting admin approval" });
  });
});

// ================= Fetch Doctor Appointments =================
router.get("/appointments/:doctorId", (req, res) => {
  const { doctorId } = req.params;
  const sql = `
    SELECT a.id, a.appointment_time, a.status, a.patient_symptoms_notes, a.patient_id, p.fullname AS patientName,
           pp.age, pp.gender, pp.allergies, a.doctor_notes
    FROM appointments a
    JOIN Patientdb p ON a.patient_id = p.id
    LEFT JOIN patient_profile pp ON pp.patient_id = p.id
    WHERE a.doctor_id = ?
    ORDER BY a.appointment_time ASC
  `;

  db.query(sql, [doctorId], (err, results) => {
    if (err) {
      console.error("DB Error fetching appointments:", err);
      return res.status(500).json([]);
    }

    const appointments = results.map(row => {
      let symptoms = [];
      if (row.patient_symptoms_notes) {
        try {
          symptoms = JSON.parse(row.patient_symptoms_notes);
        } catch {
          symptoms = [String(row.patient_symptoms_notes)];
        }
      }
      return {
        id: row.id,
        patientId: row.patient_id,
        patientName: row.patientName,
        age: row.age,
        gender: row.gender,
        allergies: row.allergies,
        date: row.appointment_time,
        status: row.status,
        symptoms,
        doctorNotes: row.doctor_notes
      };
    });

    res.json(appointments);
  });
});

router.get("/profile/:doctorId",(req,res)=>{
  const {doctorId}= req.params;
  const sql = `SELECT id, fullname, email,qualification, specialization, licenseNumber,
           fee, hospital, rating, experience_years AS experience, bio, timings, status
    FROM doctorsdb
    WHERE id = ?
  `;

  db.query(sql,[doctorId],(err,results) =>{
    if(err){
      console.error("DB Error fetching doctor profile:", err);
      return res.status(500).json({message:"Error fetching the profile"});
    }
    if(results.length===0) return res.status(404).json({message:"Doctor not found"});
    res.json(results[0]);
  });
});

// ================= Fetch Approved Doctors (optionally by specialty) =================
// /doctor/approved?specialty=Cardiologist
router.get("/approved/:specialty", (req, res) => {
  const { specialty } = req.params;
  const sql = `
    SELECT id, fullname, specialization, qualification, fee, hospital, rating, experience_years AS experience, bio, timings
    FROM doctorsdb
    WHERE status = 'Approved'
      AND LOWER(specialization) LIKE CONCAT('%', LOWER(?), '%')
  `;
  db.query(sql, [specialty], (err, result) => {
    if (err) {
      console.error("DB Error fetching approved doctors:", err);
      return res.status(500).json({ message: "Error fetching doctors" });
    }
    res.json(result);
  });
});


// ================= Doctor Reviews =================
router.get("/reviews/:doctorId", (req, res) => {
  const { doctorId } = req.params;
  const sql = `
    SELECT r.rating, r.comment, p.fullname AS patientName, r.created_at
    FROM reviews r
    JOIN Patientdb p ON r.patient_id = p.id
    WHERE r.doctor_id = ?
    ORDER BY r.created_at DESC
  `;
  db.query(sql, [doctorId], (err, results) => {
    if (err) {
      console.error("DB Error fetching reviews:", err);
      return res.status(500).json({ message: "Error fetching reviews" });
    }
    res.json(results);
  });
});




// ================= Complete Appointment (with prescription) =================
router.post("/appointments/:id/complete", upload.single("file"), (req, res) => {
  const { id } = req.params;
  const { doctorNotes, prescriptionDetails } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // 1️⃣ Update appointment status and doctor notes
  const updateSql = `
    UPDATE appointments
    SET status = 'Completed', doctor_notes = ?
    WHERE id = ?
  `;
  db.query(updateSql, [doctorNotes, id], (err) => {
    if (err) {
      console.error("DB Error updating appointment:", err);
      return res.status(500).json({ message: "Error updating appointment" });
    }

    // 2️⃣ Insert prescription
    const prescriptionSql = `
      INSERT INTO prescriptions (appointment_id, prescription_details, file_url)
      VALUES (?, ?, ?)
    `;
    db.query(prescriptionSql, [id, prescriptionDetails, fileUrl], (err2) => {
      if (err2) {
        console.error("DB Error saving prescription:", err2);
        return res.status(500).json({ message: "Error saving prescription" });
      }

      // 3️⃣ Send notifications sequentially with proper error handling
      const notifySql = `
        INSERT INTO notifications (user_id, message, link_url)
        SELECT patient_id, ?, ? FROM appointments WHERE id = ?
      `;

      db.query(
        notifySql,
        ["Your prescription is ready", `/patient/prescriptions/${id}`, id],
        (err3) => {
          if (err3) console.error("DB Error sending prescription notification:", err3);

          db.query(
            notifySql,
            ["How was your appointment? Leave a review", `/patient/reviews/${id}`, id],
            (err4) => {
              if (err4) console.error("DB Error sending review notification:", err4);

              // 4️⃣ Send final response
              res.json({
                message: "Appointment completed, prescription saved, notifications sent",
              });
            }
          );
        }
      );
    });
  });
});

// ================= Doctor Notifications =================
router.get("/notifications/:doctorId", (req, res) => {
  const { doctorId } = req.params;
  const sql = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
  db.query(sql, [doctorId], (err, results) => {
    if (err) {
      console.error("DB Error fetching notifications:", err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});

export default router;
