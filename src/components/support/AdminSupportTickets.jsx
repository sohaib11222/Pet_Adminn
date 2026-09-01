import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../Header";
import Sidebar from "../Sidebar";
import { apiRequest } from "../../api/client";

const CATEGORIES = ["APPOINTMENT", "RESCHEDULE", "VIDEO_CALL", "PAYMENT", "PHARMACY_ORDER", "PARAPHARMACY_ORDER", "DELIVERY", "REFUND", "PRESCRIPTION", "ACCOUNT_REGISTRATION", "PET_PROFILE", "VETERINARIAN", "TECHNICAL", "OTHER"];
const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_FOR_PATIENT", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const label = (value) => String(value || "—").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value) => value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
const statusClass = (status) => ({ OPEN: "bg-primary", IN_PROGRESS: "bg-info", WAITING_FOR_PATIENT: "bg-warning text-dark", RESOLVED: "bg-success", CLOSED: "bg-secondary" }[String(status || "").toUpperCase()] || "bg-secondary");
const priorityClass = (priority) => ({ LOW: "bg-secondary", MEDIUM: "bg-primary", HIGH: "bg-warning text-dark", URGENT: "bg-danger" }[String(priority || "").toUpperCase()] || "bg-secondary");

const AdminSupportTickets = () => {
  const [filters, setFilters] = useState({ search: "", status: "", category: "", priority: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiRequest("/support-tickets/admin", { params: { ...filters, page: 1, limit: 100 } });
      setTickets(response?.data?.tickets || []);
      setError("");
    } catch (requestError) {
      if (!silent) setError(requestError?.message || "Unable to load support tickets.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadTickets(); }, [loadTickets]);
  useEffect(() => {
    const intervalId = window.setInterval(() => loadTickets(true), 15000);
    return () => window.clearInterval(intervalId);
  }, [loadTickets]);

  const visibleTickets = useMemo(() => tickets, [tickets]);
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return <><Header /><Sidebar /><div className="page-wrapper"><div className="content container-fluid"><div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4"><div><h3 className="mb-1">Support Tickets</h3><p className="text-muted mb-0">Review patient issues, keep responses inside each ticket, and track the full support history.</p></div><button type="button" className="btn btn-outline-primary" onClick={() => loadTickets()} disabled={loading}><i className="fa-solid fa-rotate me-2" />Refresh</button></div><div className="card mb-4"><div className="card-body"><div className="row g-3"><div className="col-lg-4"><input className="form-control" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Search ticket number or subject" /></div><div className="col-sm-4 col-lg-2"><select className="form-select" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}><option value="">All statuses</option>{STATUSES.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></div><div className="col-sm-4 col-lg-3"><select className="form-select" value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}><option value="">All categories</option>{CATEGORIES.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></div><div className="col-sm-4 col-lg-3"><select className="form-select" value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)}><option value="">All priorities</option>{PRIORITIES.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></div></div></div></div>{loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : error ? <div className="alert alert-danger">{error}</div> : visibleTickets.length === 0 ? <div className="card"><div className="card-body text-center py-5"><i className="fa-regular fa-life-ring fa-3x text-muted mb-3" /><h4>No matching support tickets</h4><p className="text-muted mb-0">New patient requests will automatically appear here.</p></div></div> : <div className="card"><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Ticket</th><th>Patient</th><th>Category</th><th>Status</th><th>Priority</th><th>Last updated</th><th className="text-end">Action</th></tr></thead><tbody>{visibleTickets.map((ticket) => <tr key={ticket._id}><td><strong>{ticket.ticketNumber}</strong><div className="small text-muted text-truncate" style={{ maxWidth: 280 }}>{ticket.subject}</div></td><td><div>{ticket.patientId?.fullName || ticket.patientId?.name || "Patient"}</div><small className="text-muted">{ticket.patientId?.email || "—"}</small></td><td>{label(ticket.category)}</td><td><span className={`badge ${statusClass(ticket.status)}`}>{label(ticket.status)}</span>{ticket.unreadForAdmin && <span className="badge bg-danger ms-1">New</span>}</td><td><span className={`badge ${priorityClass(ticket.priority)}`}>{label(ticket.priority)}</span></td><td><small>{formatDate(ticket.lastMessageAt || ticket.updatedAt)}</small></td><td className="text-end"><Link className="btn btn-sm btn-primary" to={`/support-tickets/${ticket._id}`}>Open</Link></td></tr>)}</tbody></table></div></div>}</div></div></>;
};

export default AdminSupportTickets;
