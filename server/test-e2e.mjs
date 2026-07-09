// Throwaway end-to-end API test. Run with: node test-e2e.mjs
import fs from "fs";

const BASE = "http://localhost:8000";
const stamp = Date.now();
const ok = (label, cond, extra = "") =>
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? "  -> " + extra : ""}`);

const j = async (res) => {
  const text = await res.text();
  try {
    return { status: res.status, body: JSON.parse(text) };
  } catch {
    return { status: res.status, body: text };
  }
};
const post = (path, body, token) =>
  fetch(BASE + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  }).then(j);
const get = (path, token) =>
  fetch(BASE + path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then(j);

const run = async () => {
  const patient = { fullName: "john patient", email: `patient${stamp}@t.com`, password: "secret123", phone: "111", type: "user" };
  const admin = { fullName: "amy admin", email: `admin${stamp}@t.com`, password: "secret123", type: "admin" };
  const docApplicant = { fullName: "greg house", email: `doc${stamp}@t.com`, password: "secret123", phone: "222", type: "user" };

  // 1. Registrations
  ok("register patient", (await post("/api/user/register", patient)).status === 201);
  ok("register admin", (await post("/api/user/register", admin)).status === 201);
  ok("register doc-applicant", (await post("/api/user/register", docApplicant)).status === 201);

  // duplicate email rejected
  ok("duplicate email blocked", (await post("/api/user/register", patient)).body.success === false);

  // 2. Logins
  const pLogin = await post("/api/user/login", { email: patient.email, password: patient.password });
  ok("patient login returns token", Boolean(pLogin.body.token) && pLogin.body.data.password === undefined, "no password leaked");
  const pTok = pLogin.body.token;

  const aLogin = await post("/api/user/login", { email: admin.email, password: admin.password });
  ok("admin login", aLogin.body.data.type === "admin");
  const aTok = aLogin.body.token;

  const dLogin = await post("/api/user/login", { email: docApplicant.email, password: docApplicant.password });
  const dTok = dLogin.body.token;

  // bad password rejected
  ok("wrong password 401", (await post("/api/user/login", { email: patient.email, password: "nope" })).status === 401);

  // capitalize setter
  ok("name capitalized by setter", pLogin.body.data.fullName === "John Patient", pLogin.body.data.fullName);

  // protected route without token
  ok("protected route needs token", (await post("/api/user/getuserdata", {})).status === 401);

  // 3. Apply as doctor
  const apply = await post("/api/user/registerdoc", {
    fullName: docApplicant.fullName, email: docApplicant.email, phone: "222",
    address: "221B Baker St", specialization: "Cardiology", experience: "10 years",
    fees: 500, timings: ["09:00 AM", "05:00 PM"],
  }, dTok);
  ok("doctor application created", apply.status === 201 && apply.body.data.status === "pending");
  const doctorId = apply.body.data._id;
  const doctorUserId = apply.body.data.userId;

  // admin got a notification
  const adminData = await post("/api/user/getuserdata", {}, aTok);
  ok("admin notified of application", adminData.body.data.notification.length > 0);

  // 4. Admin lists + approves
  const allDocs = await get("/api/admin/getalldoctors", aTok);
  ok("admin sees all doctors", allDocs.body.data.some((d) => d._id === doctorId));

  const approve = await post("/api/admin/getapprove", { doctorId, status: "approved", userId: doctorUserId }, aTok);
  ok("admin approves doctor", approve.body.data.status === "approved");

  // approved doctor now shows isdoctor + appears in public approved list
  const dData = await post("/api/user/getuserdata", {}, dTok);
  ok("doctor account isdoctor=true", dData.body.data.isdoctor === true);
  ok("doctor notified of approval", dData.body.data.notification.length > 0);

  const approved = await get("/api/user/getalldoctorsu");
  ok("approved doctor in public list", approved.body.data.some((d) => d._id === doctorId));

  // 5. Patient books appointment WITH document upload (multipart)
  const tmp = "test-doc.txt";
  fs.writeFileSync(tmp, "patient medical history sample");
  const fd = new FormData();
  fd.append("doctorId", doctorId);
  fd.append("date", new Date().toISOString());
  fd.append("image", new Blob([fs.readFileSync(tmp)], { type: "text/plain" }), "history.txt");
  const booking = await fetch(BASE + "/api/user/getappointment", {
    method: "POST", headers: { Authorization: `Bearer ${pTok}` }, body: fd,
  }).then(j);
  ok("appointment booked with upload", booking.status === 201 && Boolean(booking.body.data.document));
  const appointmentId = booking.body.data._id;

  // doctor's user account got a booking notification
  const dData2 = await post("/api/user/getuserdata", {}, dTok);
  ok("doctor notified of booking", dData2.body.data.notification.length >= 2);

  // 6. Doctor sees + approves appointment
  const docAppts = await get("/api/doctor/getdoctorappointments", dTok);
  ok("doctor sees appointment", docAppts.body.data.some((a) => a._id === appointmentId));

  const handle = await post("/api/doctor/handlestatus", { appointmentId, status: "approved" }, dTok);
  ok("doctor approves appointment", handle.body.data.status === "approved");

  // 7. Patient sees updated status + notification
  const pAppts = await get("/api/user/getuserappointments", pTok);
  ok("patient sees approved status", pAppts.body.data.find((a) => a._id === appointmentId)?.status === "approved");

  const pData = await post("/api/user/getuserdata", {}, pTok);
  ok("patient notified of status change", pData.body.data.notification.length > 0);

  // 8. Document download (as the assigned doctor)
  const dl = await fetch(BASE + `/api/doctor/getdocumentdownload?appointid=${appointmentId}`, {
    headers: { Authorization: `Bearer ${dTok}` },
  });
  const dlText = await dl.text();
  ok("doctor downloads document", dl.status === 200 && dlText.includes("medical history"));

  // 9. Notifications: mark all seen, then delete all
  const seen = await post("/api/user/getallnotification", {}, pTok);
  ok("mark all seen", seen.body.data.notification.length === 0 && seen.body.data.seennotification.length > 0);
  const del = await post("/api/user/deleteallnotification", {}, pTok);
  ok("delete all notifications", del.body.data.notification.length === 0 && del.body.data.seennotification.length === 0);

  // 10. getDocsforuser
  const docs = await get("/api/user/getDocsforuser", pTok);
  ok("getDocsforuser returns uploaded doc", docs.body.data.length >= 1);

  // 11. Admin all-appointments
  const allAppts = await get("/api/admin/getallAppointmentsAdmin", aTok);
  ok("admin sees all appointments", allAppts.body.data.some((a) => a._id === appointmentId));

  // reject path
  const rejApply = await post("/api/user/registerdoc", {
    fullName: "rejected doc", email: `rej${stamp}@t.com`, phone: "9", address: "x",
    specialization: "X", experience: "1", fees: 1, timings: ["09:00 AM", "10:00 AM"],
  }, pTok); // patient applies as a second doctor to test reject
  const reject = await post("/api/admin/getreject", { doctorId: rejApply.body.data._id }, aTok);
  ok("admin rejects doctor", reject.body.data.status === "rejected");

  fs.unlinkSync(tmp);
  console.log("\nDone.");
};

run().catch((e) => {
  console.error("TEST ERROR", e);
  process.exit(1);
});
