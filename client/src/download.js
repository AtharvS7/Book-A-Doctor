import api from "./config";

// Downloads a protected appointment document via the doctor route (auth header injected).
export async function downloadDocument(appointmentId, filename, message) {
  try {
    const res = await api.get("/api/doctor/getdocumentdownload", {
      params: { appointid: appointmentId },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "document");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch {
    message?.error("Could not download document");
  }
}
