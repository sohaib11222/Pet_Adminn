import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { apiRequest } from "../../api/client";
import { useLanguage } from "../../contexts/LanguageContext";

const STATUS_OPTIONS = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const MANAGE_STATUS_OPTIONS = ["NEW", "IN_PROGRESS", "CLOSED"];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const statusClass = (status) => {
  if (status === "NEW") return "status-orange";
  if (status === "IN_PROGRESS") return "status-blue";
  if (status === "RESOLVED") return "status-green";
  return "status-gray";
};

const ContactQueriesPage = () => {
  const { t, translateText: ui } = useLanguage();
  const [queries, setQueries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("NEW");
  const [adminNotes, setAdminNotes] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadQueries = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/contact-queries", {
        params: { page, limit: 10, search, status },
      });
      const data = response?.data || response || {};
      setQueries(Array.isArray(data.queries) ? data.queries : []);
      setPagination(data.pagination || { page, limit: 10, total: 0, pages: 0 });
    } catch (e) {
      setError(ui(e?.message || "Failed to load Contact Us queries"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, [page, status]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    loadQueries();
  };

  const openQuery = (query) => {
    setSelected(query);
    setSelectedStatus(query.status || "NEW");
    setAdminNotes(query.adminNotes || "");
    setResponseMessage(query.resolutionMessage || "");
    setModalError("");
  };

  const saveQuery = async () => {
    if (!selected?._id) return;
    setSaving(true);
    setModalError("");
    try {
      await apiRequest(`/contact-queries/${selected._id}`, {
        method: "PATCH",
        body: { status: selectedStatus, adminNotes },
      });
      setSelected(null);
      await loadQueries();
      window.dispatchEvent(new Event("pa-admin-data-changed"));
    } catch (e) {
      const message = ui(e?.message || "Failed to update Contact Us query");
      setError(message);
      setModalError(message);
    } finally {
      setSaving(false);
    }
  };

  const resolveQuery = async () => {
    if (!selected?._id) return;
    if (!responseMessage.trim()) {
      setModalError(ui("Write a response email before resolving this query."));
      return;
    }

    setSaving(true);
    setError("");
    setModalError("");
    try {
      await apiRequest(`/contact-queries/${selected._id}/resolve`, {
        method: "POST",
        body: { responseMessage: responseMessage.trim(), adminNotes },
      });
      setSelected(null);
      await loadQueries();
      window.dispatchEvent(new Event("pa-admin-data-changed"));
    } catch (e) {
      const message = ui(e?.message || "Failed to send the response email and resolve this query");
      setError(message);
      setModalError(message);
    } finally {
      setSaving(false);
    }
  };

  const removeQuery = async (query) => {
    if (!query?._id || !window.confirm(ui("Delete this Contact Us query?"))) return;
    setLoading(true);
    try {
      await apiRequest(`/contact-queries/${query._id}`, { method: "DELETE" });
      await loadQueries();
    } catch (e) {
      setError(ui(e?.message || "Failed to delete Contact Us query"));
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/dashboard">{t("nav.dashboard")}</a></li>
                  <li className="breadcrumb-item"><i className="feather-chevron-right" /></li>
                  <li className="breadcrumb-item active">{ui("Contact Us Queries")}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card card-table show-entire">
            <div className="card-body">
              <div className="page-table-header mb-3">
                <div className="row align-items-center">
                  <div className="col-sm-8">
                    <h4 className="card-title mb-1">{ui("Contact Us Queries")}</h4>
                    <p className="text-muted mb-0">{ui("Review and manage messages submitted from the public website.")}</p>
                  </div>
                  <div className="col-sm-4 text-sm-end mt-3 mt-sm-0">
                    <span className="text-muted">{pagination.total || 0} {ui("total")}</span>
                  </div>
                </div>
              </div>

              {error ? <div className="alert alert-danger">{error}</div> : null}

              <form className="row g-2 mb-3" onSubmit={submitSearch}>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder={ui("Search name, email, phone, service or message")}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                    <option value="">{ui("All statuses")}</option>
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{ui(option.replace("_", " "))}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <button type="submit" className="btn btn-primary w-100">{t("common.searchHere")}</button>
                </div>
              </form>

              <div className="table-responsive">
                <table className="table mb-0 border-0 custom-table">
                  <thead>
                    <tr>
                      <th>{ui("Submitted")}</th><th>{t("common.name")}</th><th>{ui("Contact")}</th><th>{ui("Service")}</th><th>{ui("Message")}</th><th>{t("common.status")}</th><th className="text-end">{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-5">{t("common.loading")}</td></tr>
                    ) : queries.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-5">{ui("No Contact Us queries found.")}</td></tr>
                    ) : queries.map((query) => (
                      <tr key={query._id}>
                        <td>{formatDate(query.createdAt)}</td>
                        <td>{query.name}</td>
                        <td>
                          <div>{query.email}</div>
                          <small className="text-muted">{query.phone}</small>
                        </td>
                        <td>{query.services}</td>
                        <td style={{ maxWidth: 260 }}>
                          <span title={query.message}>{query.message.length > 90 ? `${query.message.slice(0, 90)}...` : query.message}</span>
                        </td>
                        <td><span className={`custom-badge ${statusClass(query.status)}`}>{ui(String(query.status || "NEW").replace("_", " "))}</span></td>
                        <td className="text-end">
                          <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={() => openQuery(query)}>{ui("Manage")}</button>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeQuery(query)}>{t("common.delete")}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-muted">{ui("Page")} {pagination.page || page} {ui("of")} {pagination.pages || 1}</span>
                <div>
                  <button type="button" className="btn btn-sm btn-outline-secondary me-2" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>{ui("Previous")}</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || page >= (pagination.pages || 1)} onClick={() => setPage((current) => current + 1)}>{ui("Next")}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(selected)}
        title={ui("Manage Contact Us Query")}
        onCancel={() => setSelected(null)}
        footer={[
          <button key="cancel" type="button" className="btn btn-light" onClick={() => setSelected(null)} disabled={saving}>{t("common.cancel")}</button>,
          <button key="save" type="button" className="btn btn-outline-primary" onClick={saveQuery} disabled={saving}>{ui("Save Changes")}</button>,
          <button
            key="resolve"
            type="button"
            className="btn btn-success"
            onClick={resolveQuery}
            disabled={saving || selected?.status === "RESOLVED"}
          >
            {saving ? ui("Sending...") : ui("Send Response & Resolve")}
          </button>,
        ]}
      >
        {selected ? (
          <div>
            <p><strong>{selected.name}</strong> · {selected.email} · {selected.phone}</p>
            <p><strong>{ui("Service")}:</strong> {selected.services}</p>
            <div className="bg-light rounded p-3 mb-3" style={{ whiteSpace: "pre-wrap" }}>{selected.message}</div>
            {modalError ? <div className="alert alert-danger py-2">{modalError}</div> : null}
            <label className="form-label">{t("common.status")}</label>
            <select className="form-select mb-3" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} disabled={selected.status === "RESOLVED"}>
              {[...MANAGE_STATUS_OPTIONS, ...(selected.status === "RESOLVED" ? ["RESOLVED"] : [])].map((option) => <option key={option} value={option}>{ui(option.replace("_", " "))}</option>)}
            </select>
            <label className="form-label">{ui("Response Email")} <span className="text-danger">*</span></label>
            <textarea
              className="form-control mb-3"
              rows="6"
              value={responseMessage}
              onChange={(event) => setResponseMessage(event.target.value)}
              maxLength={5000}
              placeholder={ui("Write the response that will be emailed to the customer...")}
              disabled={selected.status === "RESOLVED"}
            />
            {selected.responseSentAt ? <small className="d-block text-success mb-3">{ui("Response sent on")} {formatDate(selected.responseSentAt)}</small> : null}
            <label className="form-label">{ui("Private Admin Notes")}</label>
            <textarea className="form-control" rows="5" value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} maxLength={5000} />
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default ContactQueriesPage;
