import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/* ================= FETCH PATIENT APPOINTMENTS ================= */
router.get("/appointments", verifyToken, (req, res) => {
  const patientId = req.userId;

  const sql = `
    SELECT 
      a.appointment_time AS date,
      d.fullname AS doctor,
      a.status
    FROM appointments a
    JOIN doctorsdb d ON a.doctor_id = d.id
    WHERE a.patient_id = ?
    ORDER BY a.appointment_time ASC
  `;

  db.query(sql, [patientId], (err, results) => {
    if (err) {
      console.error("DB Error fetching patient appointments:", err);
      return res.status(500).json([]);
    }

    res.json(results);
  });
});

export default router;
