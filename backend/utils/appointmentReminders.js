import cron from "node-cron";
import db from "../db.js";

/*
  Runs every minute
*/
cron.schedule("* * * * *", () => {
  console.log("⏰ Checking appointment reminders...");

  // 1️⃣ 1-day reminder
  const oneDaySql = `
    SELECT a.id, a.doctor_id, a.appointment_time, p.fullname
    FROM appointments a
    JOIN patientdb p ON a.patient_id = p.id
    WHERE a.status='Scheduled'
      AND TIMESTAMPDIFF(HOUR, NOW(), a.appointment_time) BETWEEN 23 AND 24
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.user_id = a.doctor_id
          AND n.message LIKE CONCAT('%', a.id, '%1day')
      )
  `;

  db.query(oneDaySql, (err, rows) => {
    if (rows?.length) {
      rows.forEach(r => {
        const msg = `Reminder (1 day): Appointment with ${r.fullname} tomorrow at ${new Date(r.appointment_time).toLocaleTimeString()} | ${r.id}-1day`;
        db.query(
          "INSERT INTO notifications (user_id, message) VALUES (?,?)",
          [r.doctor_id, msg]
        );
      });
    }
  });

  // 2️⃣ 30-min reminder
  const thirtyMinSql = `
    SELECT a.id, a.doctor_id, a.appointment_time, p.fullname
    FROM appointments a
    JOIN patientdb p ON a.patient_id = p.id
    WHERE a.status='Scheduled'
      AND TIMESTAMPDIFF(MINUTE, NOW(), a.appointment_time) BETWEEN 29 AND 30
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.user_id = a.doctor_id
          AND n.message LIKE CONCAT('%', a.id, '%30min')
      )
  `;

  db.query(thirtyMinSql, (err, rows) => {
    if (rows?.length) {
      rows.forEach(r => {
        const msg = `Reminder (30 min): Appointment with ${r.fullname} at ${new Date(r.appointment_time).toLocaleTimeString()} | ${r.id}-30min`;
        db.query(
          "INSERT INTO notifications (user_id, message) VALUES (?,?)",
          [r.doctor_id, msg]
        );
      });
    }
  });
});
