# Hospital Management System

This is a full-stack Hospital Management System built with **React** (frontend) and **Node.js/Express** (backend) with a **MySQL** database. The project allows patients and doctors to register, login, book appointments, manage profiles, submit reviews, and more.

---

## Table of Contents

- [Prerequisites](#prerequisites)  
- [Setup](#setup)  
- [Environment Variables](#environment-variables)  
- [Database](#database)  
- [Running the Project](#running-the-project)  
- [Usage](#usage)  
- [Notes](#notes)

---

## Project Structure

---

## 📝 Prerequisites

- Node.js installed ([Download here](https://nodejs.org/))  
- MySQL installed and running ([Download here](https://dev.mysql.com/downloads/))  
- Optional: MySQL Workbench for easier database management  

---

## ⚡ Setup Instructions

### 1. Clone the repository
```bash
git clone <YOUR_REPO_URL>
cd my-app
   2. Install dependencies
   npm install


---

Copy .env.example to .env and fill in your credentials.

DB_HOST=your_host_here
DB_USER=your_user_here
DB_PASSWORD=your_password_here
DB_NAME=your_database_name_here
JWT_SECRET=secret123


---

Run the Project

 # Start backend
node backend/server.js

# Start frontend
npm start
---
Usage

Login credentials
Admin: admin@system.com / admin123

---

Notes

Other users can register themselves.
Do not push .env to GitHub — it contains sensitive credentials.
.env.example is provided for reference and can be filled by the reviewer.
All backend tables are in backend/<hospitaldb>.sql.
Passwords are hashed with bcrypt; old plaintext passwords won’t work after enabling bcrypt.
JWT secret is secret123 (can be changed in .env).