import React, { useEffect, useState } from "react";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of doctor being processed

  useEffect(() => {
    fetch("http://localhost:5000/admin/pending-doctors")
      .then((res) => res.json())
      .then((data) => setPendingDoctors(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (doctorId, status) => {
    const confirmText =
      status === "Approved"
        ? "Approve this doctor?"
        : "Reject this doctor? This action can be changed later.";
    if (!window.confirm(confirmText)) return;

    try {
      setActionLoading(doctorId);
      const response = await fetch("http://localhost:5000/admin/verify-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, status }),
      });

      const result = await response.json();
      alert(result.message || "Done");

      setPendingDoctors((prev) => prev.filter((doc) => doc.id !== doctorId));
    } catch (error) {
      console.error("Verification error:", error);
      alert("Something went wrong. Try again.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="admin-wrap">
      <header className="admin-header">
        <h1 className="title">Admin Dashboard</h1>
        <p className="subtitle">Pending doctor approvals</p>
      </header>

      <section className="content">
        {loading ? (
          <div className="empty">Loading pending doctors…</div>
        ) : pendingDoctors.length === 0 ? (
          <div className="empty">No pending doctors</div>
        ) : (
          <ul className="cards">
            {pendingDoctors.map((doc) => (
              <li key={doc.id} className="card" role="article" aria-label={`${doc.fullname} card`}>
                <div className="card-left">
                  <div className="avatar" aria-hidden>
                    {doc.fullname?.charAt(0) || "D"}
                  </div>
                </div>

                <div className="card-middle">
                  <h2 className="doc-name">{doc.fullname}</h2>
                  <div className="meta">
                    <span className="pill">{doc.specialization || "—"}</span>
                    <span className="muted">Lic: {doc.licenseNumber || "—"}</span>
                  </div>
                  <p className="bio">{doc.bio || "No bio provided."}</p>
                </div>

                <div className="card-right">
                  <div className="fee">₹{doc.fee ?? "0.00"}</div>

                  <div className="actions">
                    <button
                      className="btn btn-approve"
                      onClick={() => handleVerify(doc.id, "Approved")}
                      disabled={actionLoading === doc.id}
                      aria-disabled={actionLoading === doc.id}
                    >
                      {actionLoading === doc.id ? "Processing…" : "Approve ✅"}
                    </button>

                    <button
                      className="btn btn-reject"
                      onClick={() => handleVerify(doc.id, "Rejected")}
                      disabled={actionLoading === doc.id}
                      aria-disabled={actionLoading === doc.id}
                    >
                      Reject ❌
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default AdminDashboard;
