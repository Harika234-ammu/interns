import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/verify-email", (req, res) => {
  const { token, role } = req.query;

  if (!token || !role) {
    return res.status(400).send("Invalid verification link");
  }

  const table = role === "doctor" ? "doctorsdb" : "patientdb";

  const sql = `
    UPDATE ${table}
    SET is_verified = true, verification_token = NULL
    WHERE verification_token = ?
  `;

  db.query(sql, [token], (err, result) => {
    if (err) {
      console.error("Verification error:", err);
      return res.status(500).send("Verification failed");
    }

    if (result.affectedRows === 0) {
      return res.send("Link already used or invalid");
    }

    res.send(`
      <h2>Email verified successfully ✅</h2>
      <p>You can now login.</p>
      <a href="http://localhost:3000/login">Go to Login</a>
    `);
  });
});

export default router;
