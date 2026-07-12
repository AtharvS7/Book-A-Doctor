// Seed persistent demo accounts through the live API so a mentor can log in
// straight away as each role. Idempotent-ish: re-running just skips accounts
// that already exist (register returns success:false on duplicate email).
//
//   node seed-demo.mjs                        -> seeds against Render
//   BASE=http://localhost:8000 node seed-demo.mjs
//
// ponytail: seeds over HTTP (not direct Mongo) because that's the only path
// that reaches the deployed Atlas DB from anywhere.

const BASE = process.env.BASE || "https://book-a-doctor-mdpp.onrender.com";
const PW = "demo1234";

const post = (path, body, token) =>
  fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  }).then((r) => r.json());

const login = async (email) => (await post("/api/user/login", { email, password: PW })).token;

const run = async () => {
  const patient = { fullName: "Demo Patient", email: "patient@demo.com", password: PW, phone: "1000000000", type: "user" };
  const admin = { fullName: "Demo Admin", email: "admin@demo.com", password: PW, phone: "2000000000", type: "admin" };
  const doctor = { fullName: "Demo Doctor", email: "doctor@demo.com", password: PW, phone: "3000000000", type: "user" };

  for (const u of [patient, admin, doctor]) {
    const r = await post("/api/user/register", u);
    console.log(`register ${u.email}: ${r.success ? "created" : "already exists"}`);
  }

  const aTok = await login(admin.email);
  const dTok = await login(doctor.email);

  // Apply the demo doctor (skip if already an approved/pending doctor)
  const apply = await post("/api/user/registerdoc", {
    fullName: doctor.fullName, email: doctor.email, phone: doctor.phone,
    address: "12 Demo Street", specialization: "General Medicine",
    experience: "8 years", fees: 400, timings: ["09:00 AM", "05:00 PM"],
  }, dTok);

  if (apply.success && apply.data?._id) {
    await post("/api/admin/getapprove",
      { doctorId: apply.data._id, status: "approved", userId: apply.data.userId }, aTok);
    console.log("doctor: applied + approved");
  } else {
    console.log("doctor: application skipped (likely already applied)");
  }

  console.log(`\nDemo accounts (password: ${PW}):`);
  console.log("  patient@demo.com  (User)");
  console.log("  admin@demo.com    (Admin)");
  console.log("  doctor@demo.com   (approved Doctor)");
};

run().catch((e) => { console.error(e); process.exit(1); });
