import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

const router = express.Router();

router.get("/verify-email", async (req, res) => {
  const { token, role } = req.query;

  if (!token || !role) {
    return res.status(400).send("Invalid verification link");
  }

  // ⚠️ IMPORTANT: match DB table names exactly
  const table = role === "doctor" ? "doctorsdb" : "Patientdb";

  try {
    // Generate temp password
    const tempPassword = crypto.randomBytes(4).toString("hex"); // 8 chars
    const hashedTemp = await bcrypt.hash(tempPassword, 10);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    //  Update user
    const sql = `
      UPDATE ${table}
      SET
        is_verified = true,
        password = ?,
        is_temp_password = true,
        temp_password_expiry = ?,
        verification_token = NULL
      WHERE verification_token = ?
    `;

    db.query(sql, [hashedTemp, expiry, token], (err, result) => {
      if (err) {
        console.error("Verification error:", err);
        return res.status(500).send("Verification failed");
      }

      if (result.affectedRows === 0) {
        return res.send("Link already used or invalid");
      }

      //  Show temp password ONCE
      res.send(`
        <h2>Email verified successfully ✅</h2>
        <p><b>Your temporary password:</b></p>
        <h3 style="color:red">${tempPassword}</h3>
        <p>This password is valid for <b>10 minutes</b>.</p>
        <p>Please login and change your password immediately.</p>
        <a href="http://localhost:3000/login">Go to Login</a>
      `);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
