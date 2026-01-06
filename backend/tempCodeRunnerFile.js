import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import patientRoutes from "./routes/patient.js";
import patientProfileRoutes from "./routes/patient_profile.js";
import doctorRoutes from "./routes/doctor.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import loginRoutes from "./routes/login.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// routes
app.use("/patient", patientRoutes);
app.use("/patient", patientProfileRoutes); 
app.use("/doctor", doctorRoutes);
app.use("/admin", adminRoutes);
app.use("/", authRoutes);
app.use("/login",loginRoutes);

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
