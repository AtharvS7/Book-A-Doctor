import { useState } from "react";
import { App as AntdApp } from "antd";
import api from "../config";

export default function Notification({ user, refresh }) {
  const { message } = AntdApp.useApp();
  const [tab, setTab] = useState("unread");
  const [busy, setBusy] = useState(false);

  const unread = user?.notification || [];
  const read = user?.seennotification || [];
  const list = tab === "unread" ? unread : read;

  const markAll = async () => {
    setBusy(true);
    try {
      await api.post("/api/user/getallnotification", {});
      message.success("Marked all as read");
      refresh();
    } catch {
      message.error("Action failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteAll = async () => {
    setBusy(true);
    try {
      await api.post("/api/user/deleteallnotification", {});
      message.success("Notifications cleared");
      refresh();
    } catch {
      message.error("Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div className="notif-tabs">
          <div className={`notif-tab ${tab === "unread" ? "sel" : ""}`} onClick={() => setTab("unread")}>
            Unread ({unread.length})
          </div>
          <div className={`notif-tab ${tab === "read" ? "sel" : ""}`} onClick={() => setTab("read")}>
            Read ({read.length})
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {tab === "unread" && unread.length > 0 && (
            <button className="btn-ghost btn-sm" onClick={markAll} disabled={busy}>
              Mark all read
            </button>
          )}
          {read.length > 0 && (
            <button className="btn-danger btn-sm" onClick={deleteAll} disabled={busy}>
              Delete all
            </button>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty card-soft">
          {tab === "unread" ? "You're all caught up 🎉" : "No read notifications yet."}
        </div>
      ) : (
        list.map((n, i) => (
          <div key={i} className="notif-item card-soft">
            {tab === "unread" && <span className="notif-dot" />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{n.message}</div>
              {n.type && (
                <small style={{ color: "var(--muted)" }}>
                  {n.type.replace(/-/g, " ")}
                </small>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
