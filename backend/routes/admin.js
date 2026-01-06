import express from "express";
import db from "../db.js";
const router = express.Router();


router.get("/pending-doctors", (req, res) => {
  const sql = "SELECT * FROM doctorsdb WHERE status = 'Pending'";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching doctors" });
    res.json(result);
  });
});


router.post("/verify-doctor", (req, res) => {
  const { doctorId, status } = req.body;
  const sql = "UPDATE doctorsdb SET status = ? WHERE id = ?";
  db.query(sql, [status, doctorId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error updating status" });
    res.json({ message: `Doctor ${status}` });
  });
});

export default router;
