import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "../Header";
import Sidebar from "../Sidebar";
import { apiRequest, getApiBaseUrl, getAuthToken } from "../../api/client";
import { useLanguage } from "../../contexts/LanguageContext";

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_FOR_PATIENT", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const statusClass = (status) => ({ OPEN: "bg-primary", IN_PROGRESS: "bg-info", WAITING_FOR_PATIENT: "bg-warning text-dark", RESOLVED: "bg-success", CLOSED: "bg-secondary" }[String(status || "").toUpperCase()] || "bg-secondary");
const priorityClass = (priority) => ({ LOW: "bg-secondary", MEDIUM: "bg-primary", HIGH: "bg-warning text-dark", URGENT: "bg-danger" }[String(priority || "").toUpperCase()] || "bg-secondary");
const relatedRecordPath = (relatedRecord) => {
  const recordId = relatedRecord?.recordId;
  if (!recordId) return null;
  const routes = { APPOINTMENT: "/appointments", ORDER: "/orders", TRANSACTION: "/transactions" };
  const base = routes[String(relatedRecord?.type || "").toUpperCase()];
  return base ? `${base}?search=${encodeURIComponent(recordId)}` : null;
};

const AdminSupportTicketDetail = () => {
  const { t, translateText: ui } = useLanguage();
  const { ticketId } = useParams();
  const fileInputRef = useRef(null);
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const label = (value) => ui(String(value || "—").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()));
  const dateTime = (value) => value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

  const loadTicket = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiRequest(`/support-tickets/admin/${ticketId}`);
      setTicket(response?.data || null); setError("");
    } catch (requestError) {
      if (!silent) setError(ui(requestError?.message || "Unable to load this support ticket."));
    } finally { if (!silent) setLoading(false); }
  }, [ticketId, ui]);
  useEffect(() => { loadTicket(); }, [loadTicket]);
  useEffect(() => { const intervalId = window.setInterval(() => loadTicket(true), 10000); return () => window.clearInterval(intervalId); }, [loadTicket]);

  const saveTicket = async (changes) => {
    if (!ticket) return;
    setSaving(true);
    try {
      const response = await apiRequest(`/support-tickets/admin/${ticket._id}`, { method: "PATCH", body: changes });
      setTicket(response?.data || ticket); window.dispatchEvent(new Event("pa-admin-data-changed"));
    } catch (requestError) { setError(ui(requestError?.message || "Unable to update this ticket.")); }
    finally { setSaving(false); }
  };
  const chooseFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length > 5) return setError(ui("You can attach up to 5 files."));
    if (selected.some((file) => file.size > 25 * 1024 * 1024)) return setError(ui("Each attachment must be 25 MB or smaller."));
    setFiles(selected); setError("");
  };
  const sendReply = async (event) => {
    event.preventDefault();
    if (!reply.trim() && !files.length) return;
    setSaving(true);
    try {
      let attachments = [];
      if (files.length) {
        const formData = new FormData();
        files.forEach((file) => formData.append("supportTicket", file, file.name));
        const upload = await apiRequest("/support-tickets/attachments", { method: "POST", body: formData, timeoutMs: 120000 });
        attachments = (upload?.data?.attachments || []).map((attachment) => attachment._id);
      }
      await apiRequest(`/support-tickets/admin/${ticket._id}/messages`, { method: "POST", body: { body: reply.trim(), attachments } });
      setReply(""); setFiles([]); if (fileInputRef.current) fileInputRef.current.value = "";
      await loadTicket(true); window.dispatchEvent(new Event("pa-admin-data-changed"));
    } catch (requestError) { setError(ui(requestError?.message || "Unable to send the reply.")); }
    finally { setSaving(false); }
  };
  const download = async (attachment) => {
    try {
      const response = await fetch(`${apiBaseUrl}${attachment.downloadUrl}`, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
      if (!response.ok) throw new Error(ui("Unable to download the attachment."));
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = attachment.name || "support-attachment"; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    } catch (requestError) { setError(ui(requestError?.message || "Unable to download the attachment.")); }
  };

  if (loading) return <><Header /><Sidebar /><div className="page-wrapper"><div className="content container-fluid text-center py-5"><div className="spinner-border text-primary" /></div></div></>;
  if (error && !ticket) return <><Header /><Sidebar /><div className="page-wrapper"><div className="content container-fluid"><div className="alert alert-danger">{error}</div><Link to="/support-tickets" className="btn btn-outline-primary">{ui("Back to support tickets")}</Link></div></div></>;
  if (!ticket) return null;
  const repliesDisabled = ["RESOLVED", "CLOSED"].includes(String(ticket.status || "").toUpperCase());
  const linkedRecordPath = relatedRecordPath(ticket.relatedRecord);

  return (
    <>
      <Header /><Sidebar />
      <div className="page-wrapper"><div className="content container-fluid">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4"><div className="d-flex gap-3"><Link to="/support-tickets" className="btn btn-outline-secondary align-self-start" aria-label={ui("Back to support tickets")}><i className="fa-solid fa-arrow-left" /></Link><div><div className="d-flex flex-wrap gap-2 align-items-center"><h3 className="mb-0">{ticket.ticketNumber}</h3><span className={`badge ${statusClass(ticket.status)}`}>{label(ticket.status)}</span><span className={`badge ${priorityClass(ticket.priority)}`}>{label(ticket.priority)}</span></div><p className="mb-0 text-muted">{ticket.subject}</p></div></div></div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row g-4"><div className="col-xl-8"><div className="card mb-4"><div className="card-body"><h5 className="mb-3">{ui("Ticket conversation")}</h5><div className="d-flex flex-column gap-3">{(ticket.messages || []).map((message) => { const adminMessage = message.senderRole === "ADMIN"; return <div className={`d-flex ${adminMessage ? "justify-content-end" : "justify-content-start"}`} key={message._id}><div className={`rounded-3 p-3 ${adminMessage ? "bg-primary text-white" : "bg-light border"}`} style={{ maxWidth: "82%" }}><div className={`small fw-semibold mb-1 ${adminMessage ? "text-white-50" : "text-muted"}`}>{adminMessage ? ui("Admin") : ticket.patientId?.fullName || ticket.patientId?.name || ui("Patient")} · {dateTime(message.createdAt)}</div>{message.body && <div style={{ whiteSpace: "pre-wrap" }}>{message.body}</div>}{message.attachments?.length > 0 && <div className="d-flex flex-wrap gap-2 mt-2">{message.attachments.map((attachment) => <button className={`btn btn-sm ${adminMessage ? "btn-outline-light" : "btn-outline-secondary"}`} type="button" onClick={() => download(attachment)} key={attachment._id}><i className="fa-solid fa-paperclip me-1" />{attachment.name}</button>)}</div>}</div></div>; })}</div></div></div>
          <div className="card"><div className="card-body">{repliesDisabled ? <div className="alert alert-secondary mb-0">{ui("Change this ticket back to Open or In Progress before replying.")}</div> : <form onSubmit={sendReply}><label className="form-label fw-semibold">{ui("Reply to patient")}</label><textarea className="form-control mb-3" rows={4} value={reply} onChange={(event) => setReply(event.target.value)} placeholder={ui("Write a clear update or ask for the information you need...")} /><input ref={fileInputRef} className="form-control mb-2" type="file" multiple onChange={chooseFiles} accept="image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />{files.length > 0 && <div className="d-flex flex-wrap gap-2 mb-3">{files.map((file) => <span className="badge bg-light text-dark border" key={`${file.name}-${file.lastModified}`}>{file.name}</span>)}</div>}<div className="text-end"><button className="btn btn-primary" type="submit" disabled={saving || (!reply.trim() && !files.length)}>{saving ? ui("Sending...") : ui("Send reply")} <i className="fa-solid fa-paper-plane ms-2" /></button></div></form>}</div></div>
        </div><div className="col-xl-4"><div className="card mb-4"><div className="card-body"><h5>{ui("Manage ticket")}</h5><label className="form-label small text-muted">{t("common.status")}</label><select className="form-select mb-3" value={ticket.status} disabled={saving} onChange={(event) => saveTicket({ status: event.target.value })}>{STATUSES.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select><label className="form-label small text-muted">{ui("Priority")}</label><select className="form-select" value={ticket.priority} disabled={saving} onChange={(event) => saveTicket({ priority: event.target.value })}>{PRIORITIES.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></div></div>
          <div className="card mb-4"><div className="card-body"><h5>{ui("Patient & request")}</h5><dl className="row small mb-0"><dt className="col-5 text-muted">{ui("Patient")}</dt><dd className="col-7">{ticket.patientId?.fullName || ticket.patientId?.name || "—"}<br /><span className="text-muted">{ticket.patientId?.email || ""}</span></dd><dt className="col-5 text-muted">{t("common.category")}</dt><dd className="col-7">{label(ticket.category)}</dd><dt className="col-5 text-muted">{t("common.created")}</dt><dd className="col-7">{dateTime(ticket.createdAt)}</dd><dt className="col-5 text-muted">{ui("Record")}</dt><dd className="col-7">{ticket.relatedRecord?.type ? <>{label(ticket.relatedRecord.type)} · {linkedRecordPath ? <Link to={linkedRecordPath}>{ui("View record")}</Link> : ticket.relatedRecord.recordId || "—"}</> : "—"}</dd></dl><hr /><div className="small text-muted" style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</div></div></div>
          <div className="card"><div className="card-body"><h5>{ui("Activity timeline")}</h5><div className="d-flex flex-column gap-3">{(ticket.activities || []).map((activity) => <div className="d-flex gap-2" key={activity._id}><i className="fa-solid fa-circle-check text-primary mt-1" /><div><div className="small">{activity.summary}</div><small className="text-muted">{dateTime(activity.createdAt)}</small></div></div>)}</div></div></div>
        </div></div>
      </div></div>
    </>
  );
};

export default AdminSupportTicketDetail;
