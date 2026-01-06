CREATE DATABASE hospitalDB;
USE hospitalDB;

CREATE TABLE Patientdb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE patientdb
ADD age INT,
ADD gender VARCHAR(10),
ADD medical_history TEXT,
ADD allergies TEXT,
ADD ongoing_medications TEXT,
ADD photo TEXT;


CREATE TABLE doctorsdb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  qualification VARCHAR(100),
  specialization VARCHAR(100),
  licenseNumber VARCHAR(100),
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending'
);


ALTER TABLE doctorsdb
  ADD COLUMN fee DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN hospital VARCHAR(255) DEFAULT '',
  ADD COLUMN rating DECIMAL(2,1) DEFAULT 0,
  ADD COLUMN experience_years INT DEFAULT 0,
  ADD COLUMN bio TEXT,
  ADD COLUMN timings VARCHAR(255) DEFAULT '';

SHOW TABLES;
DESCRIBE patientdb;
DESCRIBE doctorsdb;
SELECT * FROM patientdb;
SELECT * FROM doctorsdb;

CREATE TABLE patient_profile (
  patient_id INT PRIMARY KEY,
  age VARCHAR(10),
  gender VARCHAR(10),
  medical_history TEXT,
  allergies VARCHAR(255),
  ongoing_medications VARCHAR(255),
  FOREIGN KEY (patient_id) REFERENCES Patientdb(id)
);
-- ============= APPOINTMENTS ============
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_time TIMESTAMP NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',

    patient_symptoms_notes JSON,

    doctor_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES Patientdb(id),
    FOREIGN KEY (doctor_id) REFERENCES doctorsdb(id)
);

-- ============= PRESCRIPTIONS ============
CREATE TABLE prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL UNIQUE,
    prescription_details TEXT NOT NULL,
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- ============= REVIEWS ============
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL UNIQUE,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (doctor_id) REFERENCES doctorsdb(id),
    FOREIGN KEY (patient_id) REFERENCES Patientdb(id)
);

-- ============= NOTIFICATIONS ============
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, 
    message VARCHAR(255) NOT NULL,
    link_url VARCHAR(255), 
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE patientdb
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_token VARCHAR(255);

ALTER TABLE doctorsdb
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_token VARCHAR(255);