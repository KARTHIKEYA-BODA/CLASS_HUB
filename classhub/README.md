# 🎓 ClassHub – Smart Classroom Management System

A production-ready, full-stack classroom management system built for colleges. ClassHub connects **Students**, **Class Representatives (CR)**, and **Admins** on one secure, role-based platform — covering attendance, notes, assignments, projects, semester rankings, notices, and feedback.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Folder Structure](#-folder-structure)
4. [Prerequisites](#-prerequisites)
5. [Installation & Setup](#-installation--setup)
6. [Default Login Credentials](#-default-login-credentials)
7. [API Overview](#-api-overview)
8. [Database Schema](#-database-schema)
9. [Role-Based Access Summary](#-role-based-access-summary)
10. [Troubleshooting](#-troubleshooting)
11. [License](#-license)

---

## ✨ Features

### 👨‍🎓 Student
- Register with Name, Roll Number, Email, Phone, Password
- Login using **Roll Number + Password**
- Dashboard: Welcome message, Today's Schedule, Attendance %, Notes, Assignments, Projects, Semester Ranking, Notices, Feedback, Contact, About, Profile
- Edit own profile (Roll Number is locked)
- **Read-only** access to attendance, rankings, notes, assignments, notices

### 🧑‍💼 Class Representative (CR)
- Secure login via Roll Number
- Take attendance **twice daily** (10:00 AM & 2:00 PM), Present/Absent per student
- Edit previously marked attendance
- Edit class strength
- Upload Notes (PDF/Image), Assignments, Projects, Notices
- **Cannot** edit attendance percentages, semester rankings, or manage users

### 🛡️ Admin
- Full system access
- Manage Student & CR accounts (create, edit, deactivate, delete)
- Upload Attendance Percentage per student
- Upload Semester Rankings (Rank, SGPA, CGPA)
- Manage Notices, view all Feedback (student feedback is Admin-only)
- Manage public Contact Information

### 🎨 UI/UX
- Fully responsive Bootstrap 5 layout (mobile, tablet, desktop)
- Light/Dark mode toggle with persisted preference
- Sidebar navigation dashboards with icons (Bootstrap Icons)
- Animated cards, progress rings, toast notifications
- Clean public site: Home, About, Contact, Login, Register

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript, Bootstrap 5 |
| Backend | Node.js, Express.js |
| Database | MySQL 8 (via `mysql2/promise`) |
| Auth | JWT (jsonwebtoken) + bcryptjs password hashing |
| File Uploads | Multer (PDF/Image for Notes, Assignments, Projects, Profile Pics) |
| Validation | express-validator |
| Security | Helmet, CORS, role-based middleware |

---

## 📁 Folder Structure

```
classhub/
├── backend/
│   ├── config/            # DB pool + JWT config
│   ├── controllers/       # Business logic (13 controllers)
│   ├── middleware/        # auth.js, upload.js, errorHandler.js
│   ├── routes/            # 13 route files (mounted under /api)
│   ├── uploads/           # notes/ assignments/ projects/ profile/
│   ├── utils/seed.js      # Hashes sample passwords after schema import
│   ├── .env.example       # Copy to .env and fill in your values
│   ├── package.json
│   └── server.js          # Express app entry point
│
├── frontend/
│   ├── css/                style.css (public site + theme), dashboard.css (sidebar layouts)
│   ├── js/
│   │   ├── config.js        API base URL
│   │   ├── api.js           fetch() wrapper with JWT auto-attach
│   │   ├── auth.js          session storage + route guarding
│   │   ├── theme.js         light/dark mode
│   │   ├── utils.js         toasts, formatters, helpers
│   │   ├── layout.js        public navbar/footer injector
│   │   ├── shell.js         dashboard sidebar/topbar builder
│   │   └── modules/         shared render logic: schedule, notes, assignments, projects, ranking, notices
│   ├── student/dashboard.html
│   ├── cr/dashboard.html
│   ├── admin/dashboard.html
│   ├── index.html, login.html, register.html, about.html, contact.html
│
├── database/
│   └── schema.sql          # Full schema + sample seed data (13 tables)
│
└── README.md
```

---

## ✅ Prerequisites

- **Node.js** v18 or higher
- **MySQL** 8.x (or MariaDB 10.5+)
- A modern browser
- (Optional) VS Code + "Live Server" extension to serve the frontend

---

## 🚀 Installation & Setup

### 1. Set up the database

```bash
mysql -u root -p < database/schema.sql
```

This creates the `classhub_db` database, all 13 tables, and inserts sample data (5 students, 1 CR, weekly schedule, sample assignments/projects/notices/rankings). Passwords in this raw SQL are **placeholders** — the seed script (next step) replaces them with real bcrypt hashes.

### 2. Configure & start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=classhub_db
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://127.0.0.1:5500
```

Now hash the sample passwords and start the server:

```bash
npm run seed     # prints working credentials to the console
npm run dev      # starts on http://localhost:5000 (nodemon)
# or: npm start  # production mode
```

You should see:
```
✅ MySQL Database connected successfully
🎓 ClassHub API Server — Running on: http://localhost:5000
```

### 3. Serve the frontend

The frontend is static HTML/CSS/JS — no build step required. Serve it with any static server so `fetch()` calls work correctly (opening via `file://` directly will hit CORS issues):

**Option A — VS Code Live Server (easiest)**
Right-click `frontend/index.html` → "Open with Live Server".

**Option B — Node's `http-server`**
```bash
cd frontend
npx http-server -p 5500
```

**Option C — Python**
```bash
cd frontend
python3 -m http.server 5500
```

Then open **http://localhost:5500** (or **http://127.0.0.1:5500**) in your browser.

> If your frontend runs on a different port, update `CLIENT_URL` in `backend/.env` to match (for CORS), and update `API_BASE_URL` in `frontend/js/config.js` if your backend runs somewhere other than `localhost:5000`.

---

## 🔑 Default Login Credentials

After running `npm run seed`, use these to log in (also printed in your terminal):

| Role | Roll Number / Email | Password |
|---|---|---|
| **Admin** | `admin@classhub.edu` | `Admin@12345` |
| **CR** | `CSE21CR01` | `Cr@12345` |
| **Student** | `CSE21001` | `Student@123` |
| **Student** | `CSE21002` | `Student@123` |
| **Student** | `CSE21003` – `CSE21005` | `Student@123` |

Admin logs in with **Email**; Student & CR log in with **Roll Number**. You can also register a brand-new student account via the **Register** page.

---

## 🔌 API Overview

All endpoints are prefixed with `/api`. JWT must be sent as `Authorization: Bearer <token>` for protected routes.

| Module | Base Route | Notes |
|---|---|---|
| Auth | `/api/auth` | `/student/register`, `/student/login`, `/cr/login`, `/admin/login`, `/me` |
| Students | `/api/students` | Own profile (student); full CRUD (admin) |
| CR | `/api/cr` | Own profile + class strength (CR); full CRUD (admin) |
| Attendance | `/api/attendance` | `/mark`, `/session` (CR); `/my-percentage` (student); `/percentage` (admin) |
| Schedule | `/api/schedule` | `/today` (public), `/weekly`, CRUD (CR/admin) |
| Notes | `/api/notes` | View (all), upload/delete (CR) |
| Assignments | `/api/assignments` | View (all), CRUD (CR, own records) |
| Projects | `/api/projects` | View (all), CRUD (CR, own records) |
| Ranking | `/api/ranking` | View (all), upsert/delete (admin only) |
| Notices | `/api/notices` | View (public), post (admin/CR) |
| Feedback | `/api/feedback` | Submit (student), view all (admin only) |
| Contact | `/api/contact` | View (public), edit (admin) |
| Dashboard | `/api/dashboard` | `/admin-stats`, `/cr-stats` |

Health check: `GET /api/health`

---

## 🗄 Database Schema

13 tables with foreign-key relationships:

`admin` · `students` · `cr` · `attendance` · `attendance_percentage` · `schedule` · `notes` · `assignments` · `projects` · `semester_ranking` · `notices` · `feedback` · `contact`

Key design notes:
- `attendance` has a unique constraint on `(student_id, attendance_date, session)` — CR "editing" attendance is an upsert (`ON DUPLICATE KEY UPDATE`) against this key.
- `attendance_percentage` is fully separate from raw `attendance` records — it's Admin-entered data only, exactly as specified.
- `semester_ranking` is unique per `(student_id, semester)`.
- All file-bearing tables (`notes`, `assignments`, `projects`) store a relative `/uploads/...` path served statically by Express.

See [`database/schema.sql`](database/schema.sql) for full DDL + seed data.

---

## 🔐 Role-Based Access Summary

| Action | Student | CR | Admin |
|---|:---:|:---:|:---:|
| View schedule, notes, assignments, projects, ranking, notices | ✅ | ✅ | ✅ |
| Edit own profile (not Roll Number) | ✅ | ✅ | — |
| Take/edit attendance (10 AM & 2 PM) | ❌ | ✅ | ❌ |
| View own attendance % | ✅ | — | — |
| Upload attendance % | ❌ | ❌ | ✅ |
| Edit class strength | ❌ | ✅ (own) | — |
| Upload notes/assignments/projects | ❌ | ✅ | ❌ |
| Upload semester ranking | ❌ | ❌ | ✅ |
| Post notices | ❌ | ✅ | ✅ |
| Submit feedback | ✅ | — | — |
| View feedback | ❌ | ❌ | ✅ |
| Manage student/CR accounts | ❌ | ❌ | ✅ |
| Manage contact info | ❌ | ❌ | ✅ |

Every rule above is enforced server-side via `verifyToken` + `authorize(...roles)` middleware — not just hidden in the UI.

---

## 🩺 Troubleshooting

**"Cannot connect to server" toast in the browser**
Backend isn't running, or `API_BASE_URL` in `frontend/js/config.js` doesn't match where it's running.

**CORS errors in the browser console**
Make sure `CLIENT_URL` in `backend/.env` exactly matches the origin (protocol + host + port) you're loading the frontend from.

**Login fails with correct-looking credentials**
Run `npm run seed` — raw SQL inserts use placeholder password hashes; the seed script replaces them with real bcrypt hashes.

**"ER_ACCESS_DENIED" on server start**
Double-check `DB_USER` / `DB_PASSWORD` in `.env` against your local MySQL setup.

**Uploaded files 404**
Confirm the backend is serving `/uploads` (it does, via `express.static`) and that `FILE_BASE_URL` in `frontend/js/config.js` points to your backend's origin.

---

## 📄 License

MIT License — free to use and modify for academic or personal projects.

---

**ClassHub v1.0.0** — Built for smarter classrooms.
