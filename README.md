# Book a Doctor — MERN Healthcare Booking Platform

A full-stack MERN application connecting **Patients**, **Doctors**, and **Admins**. Patients
browse approved doctors, book appointments with document uploads, and track status. Doctors
manage requests. Admins approve doctor applications and oversee the platform.

> ⚠️ **This is a demo project, not production-ready.** It is built for learning and
> portfolio purposes — free-tier hosting, seeded demo accounts, and local file storage
> mean it is not hardened or intended for real-world use.


## 🚀 Live Demo

| | URL |
|---|---|
| **App (frontend)** | https://book-a-doctor-nine.vercel.app/ |
| **API (backend)** | https://book-a-doctor-mdpp.onrender.com/ |

> The backend is on Render's free tier — the **first request after idle may take ~30–50s** to
> wake up. Open the API URL once and wait for `{"success":true,...}` before demoing.

**Demo accounts** (password for all: `demo1234`):

| Role | Email |
|---|---|
| Patient | `patient@demo.com` |
| Admin | `admin@demo.com` |
| Doctor (approved) | `doctor@demo.com` |

*(To create/refresh these on the deployed DB: `cd server && node seed-demo.mjs`.)*

### 60-second demo walkthrough

1. **Patient** — log in as `patient@demo.com`, browse approved doctors, book an appointment
   with `doctor@demo.com` and attach a file. See it appear as *pending*.
2. **Doctor** — log in as `doctor@demo.com`, open appointments, approve the request, download
   the patient's uploaded document.
3. **Patient** — refresh: status is now *approved*, with a notification.
4. **Admin** — log in as `admin@demo.com`, view all users/doctors/appointments, and approve or
   reject a pending doctor application.
5. **Apply flow** (optional) — register a new user, use *Apply as Doctor*, then approve them as
   admin to show the full onboarding path.

> **Verification:** `server/test-e2e.mjs` exercises the entire flow above against a running API
> and all 28 checks pass. Run it with `node test-e2e.mjs` (defaults to localhost; edit `BASE`
> to point at the live URL).

## Tech Stack

**Frontend (`/client`)** — React 19 (Vite), React Router v6, Axios, Bootstrap + React-Bootstrap,
MDB React UI Kit, Ant Design, Moment.js.

**Backend (`/server`)** — Node.js + Express (MVC), MongoDB + Mongoose, JWT auth, bcrypt,
multer (file uploads), cors, dotenv.

## Project Structure

```
SmartBridge/
├── client/                 # React app (Vite)
│   └── src/
│       ├── components/     # DoctorList, Notification, ProtectedRoute, appointment tables
│       ├── pages/          # Home, Login, Register, UserHome, AdminHome, ApplyDoctor
│       ├── config.js       # axios instance (Bearer token injection)
│       ├── auth.js         # localStorage session helpers
│       └── App.jsx         # router + route guards
└── server/
    ├── index.js            # entry + global error handler
    ├── config/connectToDB.js
    ├── models/             # UserModel, DocModel, AppointmentModel
    ├── controllers/        # userController, adminController, doctorController
    ├── routes/             # userRoutes, adminRoutes, doctorRoutes
    ├── middlewares/authMiddleware.js
    ├── uploads/            # multer file storage
    └── .env
```

## Setup & Run

### 1. Backend

```bash
cd server
npm install
# edit .env with your MongoDB connection string
npm run dev          # nodemon → http://localhost:8000
```

`server/.env`:
```
MONGO_URI=<your MongoDB Atlas or local connection string>
JWT_KEY=<already generated in .env>
PORT=8000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev          # Vite → http://localhost:5173
```

`client/.env` sets `VITE_API_URL=http://localhost:8000` (the backend base URL used by axios).

## API Reference

All protected routes require an `Authorization: Bearer <token>` header. Responses follow the
shape `{ success, message?, data?, token? }`.

### User — `/api/user`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | – | Register (hashes password, blocks duplicate email) |
| POST | `/login` | – | Returns JWT + user (no password) |
| GET  | `/getalldoctorsu` | – | List approved doctors |
| POST | `/getuserdata` | ✓ | Current user's data |
| POST | `/registerdoc` | ✓ | Apply as doctor → pending Doctor doc, notifies admins |
| POST | `/getappointment` | ✓ | Book appointment (multipart field `image`) |
| POST | `/getallnotification` | ✓ | Move notifications → seen |
| POST | `/deleteallnotification` | ✓ | Clear notification arrays |
| GET  | `/getuserappointments` | ✓ | Logged-in user's appointments |
| GET  | `/getDocsforuser` | ✓ | Documents linked to the user |

### Admin — `/api/admin` (all protected)
| Method | Path | Purpose |
|---|---|---|
| GET  | `/getallusers` | List all users |
| GET  | `/getalldoctors` | List all doctors (any status) |
| POST | `/getapprove` | Approve doctor → `isdoctor=true`, notify user |
| POST | `/getreject` | Reject doctor, notify user |
| GET  | `/getallAppointmentsAdmin` | All appointments platform-wide |

### Doctor — `/api/doctor` (all protected)
| Method | Path | Purpose |
|---|---|---|
| POST | `/updateprofile` | Update own doctor profile |
| GET  | `/getdoctorappointments` | Appointments assigned to this doctor |
| POST | `/handlestatus` | Approve/reject an appointment, notify patient |
| GET  | `/getdocumentdownload?appointid=<id>` | Download appointment document |

## End-to-End Flow

Register → Login → Apply as doctor → Admin approves → user gains doctor capabilities →
another user books an appointment (with document) → doctor approves → patient sees updated
status + notification.

## Notes & Design Decisions

Where the source brief was ambiguous, the most standard MERN choice was applied consistently:

- **`bcryptjs`** is used instead of native `bcrypt` — same API, no native build toolchain
  required on Windows.
- **`MONGO_URI`** is the single env var name for the DB (the brief mentioned `MONGO_DB` in one
  place; standardized on `MONGO_URI` everywhere).
- **Appointment model** keeps both the denormalized `userInfo`/`doctorInfo` snapshots (per the
  brief) *and* `userId`/`doctorId` references, so per-user and per-doctor queries are clean.
- **Booking upload field** is `image` (multipart form field), matching the brief.
- **Notifications** are stored as objects on the user (`notification` / `seennotification`
  arrays) and generated on: doctor application → admin, approve/reject → user, booking →
  doctor, status change → user.
- **Consistent response shape** `{ success, message, data }`; passwords are never returned and
  stack traces never leak to the client (global error handler).

### Security caveat (intentional, per brief)

The registration page exposes a **User / Admin role toggle**, so anyone can self-register an
admin account. This matches the graded brief but is not production-safe — in a real deployment,
admin accounts should be seeded server-side or created only by an existing admin.
