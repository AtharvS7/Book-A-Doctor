# How to Test — Book-A-Doctor

A quick guide to testing every feature of this MERN healthcare booking platform.

## Live links

| | URL |
|---|---|
| **App** | https://book-a-doctor-nine.vercel.app/ |
| **API** | https://book-a-doctor-mdpp.onrender.com/ |

> ⚠️ **First load is slow.** The backend runs on Render's free tier and sleeps after
> ~15 min idle. **Open the API URL once** and wait until you see
> `{"success":true,"message":"Book a Doctor API"}` before using the app — the first
> login can take 30–50s while the server wakes up. After that it's fast.

## Demo accounts

Password for **all** accounts: `demo1234`

| Role | Email | What they can do |
|---|---|---|
| Patient | `patient@demo.com` | Browse doctors, book appointments, upload documents |
| Doctor (approved) | `doctor@demo.com` | Approve/reject booking requests, download patient documents |
| Admin | `admin@demo.com` | Approve/reject doctor applications, view all users & appointments |

---

## Feature checklist

Work through these in order — later steps use data created in earlier ones.

### 1. Authentication & access control
- [ ] **Register** — click *Get Started*, create an account (e.g. `Jane / jane@test.com / test1234`).
- [ ] **Duplicate email** — register the same email again → blocked with an error.
- [ ] **Wrong password** — try logging in with a wrong password → "Invalid credentials".
- [ ] **Login** — log in correctly → lands on your dashboard.
- [ ] **Route protection** — while logged out, the app keeps you out of the dashboard; a
      patient cannot open the admin page.
- [ ] **Logout** — top-left *Logout* clears the session.

### 2. Patient — browse & book (`patient@demo.com`)
- [ ] **Find Doctors** — see the list of approved doctors.
- [ ] **Search** — type a name/specialty in the search box → list filters live.
- [ ] **Specialty filter** — use the dropdown → list narrows to that specialty.
- [ ] **Book** — click *Book Now* on a doctor, pick a date & time.
- [ ] **Upload a document** — click *📎 Select file*, attach a small PDF/JPG (**under 5 MB**),
      confirm the booking. You should see "Appointment booked".
- [ ] **My Appointments** — the new booking appears with status **pending**.

### 3. Doctor — handle requests (`doctor@demo.com`)
Log out, log in as the doctor.
- [ ] **Notifications** 🔔 — a "new appointment request" notification is waiting.
- [ ] **Appointment Requests** (🩺 tab) — the patient's booking is listed here.
      *(Note: "My Bookings" is a separate, empty tab — that's for appointments the doctor
      books as a patient, not requests from patients.)*
- [ ] **Download document** — click *View / ⬇* on the request to download the patient's file.
- [ ] **Approve** the request → status changes to approved.
- [ ] **Mark all seen** / **Delete all** notifications work.

### 4. Patient sees the update
Log back in as `patient@demo.com`.
- [ ] **My Appointments** — the booking is now **approved**.
- [ ] **Notifications** 🔔 — an "appointment approved" notification is present.

### 5. Apply-as-Doctor + Admin approval (full onboarding)
- [ ] As a **normal patient** (e.g. your `jane@test.com`), open **Apply as Doctor**,
      fill in specialization / experience / fees / timings, submit.
- [ ] Log in as **`admin@demo.com`**.
- [ ] **Notifications** — a "new doctor application" notification appears.
- [ ] **Doctors** — the applicant shows as **pending**.
- [ ] **Approve** the applicant.
- [ ] Log back in as that user → they now appear in the public doctor list and have the
      doctor dashboard.

### 6. Admin oversight (`admin@demo.com`)
- [ ] **All Users** — every registered user is listed.
- [ ] **All Doctors** — approved + pending doctors with their status.
- [ ] **All Appointments** — every booking across the platform.
- [ ] **Reject** a pending doctor application → applicant stays a normal user and is notified.

---

## Known limitation (free-tier hosting)

Uploaded documents are stored on Render's local disk, which is **wiped on every restart**
(redeploy or wake-from-sleep). So a document uploaded in one session may show
"File missing on server" after the backend restarts. This is expected on the free tier;
production would use cloud storage (S3/Cloudinary).

---

## Running it locally (optional)

```bash
# backend  → http://localhost:8000
cd server && npm install && npm run dev

# frontend → http://localhost:5173
cd client && npm install && npm run dev
```

Automated end-to-end check (28 assertions across the whole flow):
```bash
cd server && BASE=http://localhost:8000 node test-e2e.mjs
```
