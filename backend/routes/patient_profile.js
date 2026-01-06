import express from "express";
import auth from "../routes/auth.js"; 

const router = express.Router();

// Temporary storage
let profileData = {};

// GET profile
router.get("/profile", auth, (req, res) => {
  res.json(profileData);
});

// SAVE or UPDATE profile
router.post("/profile", auth, (req, res) => {
  profileData = req.body;
  res.json({ message: "Profile saved successfully" });
});

export default router; 