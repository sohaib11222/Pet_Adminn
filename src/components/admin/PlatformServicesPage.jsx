import React, { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { useLanguage } from "../../contexts/LanguageContext";

const ROLES = ["VETERINARIAN", "PET_SITTER", "PET_STORE", "PARAPHARMACY"];
const EMPTY = { name: "", nameIt: "", slug: "", description: "", descriptionIt: "", icon: "fa-paw", kind: "PROFESSIONAL", allowedRoles: ["VETERINARIAN"], isActive: true, displayOrder: 999 };

const PlatformServicesPage = () => {
  const { t, translateText: ui } = useLanguage();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const roleLabel = (role) => ({
    VETERINARIAN: ui("Veterinarian"), PET_SITTER: ui("Pet Sitter"), PET_STORE: ui("Pharmacy"), PARAPHARMACY: ui("Parapharmacy"),
  }[role] || role);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await apiRequest("/platform-services/admin/all");
      setServices(response?.data || []);
    } catch (err) {
      setError(ui(err?.message || "Unable to load services."));
    } finally { setLoading(false); }
  }, [ui]);

  useEffect(() => { load(); }, [load]);
  const setValue = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const toggleRole = (role) => setForm((current) => ({ ...current, allowedRoles: current.allowedRoles.includes(role) ? current.allowedRoles.filter((item) => item !== role) : [...current.allowedRoles, role] }));
  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, allowedRoles: [...EMPTY.allowedRoles] }); setError(""); };
  const openEdit = (service) => { setEditing(service); setForm({ ...EMPTY, ...service, allowedRoles: service.allowedRoles || [] }); setError(""); };
  const submit = async (event) => {
    event.preventDefault();
    if (!form.allowedRoles.length) { setError(ui("Select at least one provider role.")); return; }
    setSaving(true); setError("");
    try {
      if (editing?._id) await apiRequest(`/platform-services/${editing._id}`, { method: "PUT", body: form });
      else await apiRequest("/platform-services", { method: "POST", body: form });
      openCreate(); await load();
    } catch (err) { setError(ui(err?.message || "Unable to save service.")); }
    finally { setSaving(false); }
  };
  const remove = async (service) => {
    if (!window.confirm(`${t("common.delete")} ${service.name}?`)) return;
    try { await apiRequest(`/platform-services/${service._id}`, { method: "DELETE" }); await load(); }
    catch (err) { setError(ui(err?.message || "Unable to delete service. You can disable it instead.")); }
  };
  const toggleActive = async (service) => {
    try { await apiRequest(`/platform-services/${service._id}`, { method: "PUT", body: { isActive: !service.isActive } }); await load(); }
    catch (err) { setError(ui(err?.message || "Unable to update service status.")); }
  };

  return (
    <>
      <Header /><Sidebar />
      <div className="page-wrapper"><div className="content container-fluid">
        <div className="page-header"><div className="row"><div className="col">
          <h3 className="page-title">{ui("Platform Services")}</h3>
          <p className="text-muted mb-0">{ui("Manage the public service catalogue and the provider roles that may offer each service.")}</p>
        </div><div className="col-auto"><button className="btn btn-primary" onClick={openCreate} type="button"><i className="fa fa-plus me-2" />{ui("Add Service")}</button></div></div></div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row"><div className="col-xl-8"><div className="card"><div className="card-body p-0"><div className="table-responsive"><table className="table table-hover mb-0">
          <thead><tr><th>{ui("Service")}</th><th>{ui("Type")}</th><th>{ui("Provider roles")}</th><th>{t("common.status")}</th><th>{ui("Order")}</th><th className="text-end">{t("common.actions")}</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan="6" className="text-center py-5">{ui("Loading services...")}</td></tr> : services.map((service) => <tr key={service._id}>
            <td><strong>{service.nameIt}</strong><div className="small text-muted">{service.name} · /{service.slug}</div></td>
            <td><span className="badge bg-info">{service.kind === "COMMERCE" ? ui("Commerce") : ui("Professional")}</span></td>
            <td><div className="small">{(service.allowedRoles || []).map(roleLabel).join(", ")}</div></td>
            <td><button className={`btn btn-sm ${service.isActive ? "btn-success" : "btn-outline-secondary"}`} onClick={() => toggleActive(service)} type="button">{service.isActive ? t("common.enabled") : t("common.disabled")}</button></td>
            <td>{service.displayOrder}</td><td className="text-end"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(service)} type="button">{t("common.edit")}</button><button className="btn btn-sm btn-outline-danger" onClick={() => remove(service)} type="button">{t("common.delete")}</button></td>
          </tr>)}{!loading && !services.length && <tr><td colSpan="6" className="text-center py-5 text-muted">{ui("No services configured.")}</td></tr>}</tbody>
        </table></div></div></div></div>
        <div className="col-xl-4"><div className="card"><div className="card-header"><h4 className="card-title mb-0">{editing ? ui("Edit Service") : ui("Add Service")}</h4></div><div className="card-body"><form onSubmit={submit}>
          <div className="mb-3"><label className="form-label">{ui("Italian name")} *</label><input className="form-control" value={form.nameIt} onChange={(event) => setValue("nameIt", event.target.value)} required /></div>
          <div className="mb-3"><label className="form-label">{ui("English name")} *</label><input className="form-control" value={form.name} onChange={(event) => setValue("name", event.target.value)} required /></div>
          <div className="mb-3"><label className="form-label">{ui("Slug")}</label><input className="form-control" placeholder={ui("Auto-generated from English name")} value={form.slug || ""} onChange={(event) => setValue("slug", event.target.value)} /></div>
          <div className="row"><div className="col-7 mb-3"><label className="form-label">{ui("Type")}</label><select className="form-select" value={form.kind} onChange={(event) => setValue("kind", event.target.value)}><option value="PROFESSIONAL">{ui("Professional")}</option><option value="COMMERCE">{ui("Commerce")}</option></select></div><div className="col-5 mb-3"><label className="form-label">{ui("Order")}</label><input type="number" className="form-control" value={form.displayOrder} onChange={(event) => setValue("displayOrder", Number(event.target.value))} /></div></div>
          <div className="mb-3"><label className="form-label">{ui("Font Awesome icon")}</label><input className="form-control" value={form.icon || ""} onChange={(event) => setValue("icon", event.target.value)} placeholder="fa-paw" /></div>
          <div className="mb-3"><label className="form-label">{ui("Italian description")}</label><textarea className="form-control" rows="2" value={form.descriptionIt || ""} onChange={(event) => setValue("descriptionIt", event.target.value)} /></div>
          <div className="mb-3"><label className="form-label">{ui("English description")}</label><textarea className="form-control" rows="2" value={form.description || ""} onChange={(event) => setValue("description", event.target.value)} /></div>
          <div className="mb-3"><label className="form-label d-block">{ui("Allowed provider roles")} *</label>{ROLES.map((role) => <label className="form-check mb-2" key={role}><input className="form-check-input" type="checkbox" checked={form.allowedRoles.includes(role)} onChange={() => toggleRole(role)} /><span className="form-check-label">{roleLabel(role)}</span></label>)}</div>
          <label className="form-check mb-3"><input className="form-check-input" type="checkbox" checked={form.isActive !== false} onChange={(event) => setValue("isActive", event.target.checked)} /><span className="form-check-label">{ui("Enabled publicly")}</span></label>
          <div className="d-flex gap-2"><button className="btn btn-primary" disabled={saving} type="submit">{saving ? ui("Saving...") : editing ? ui("Save Changes") : ui("Create Service")}</button>{editing && <button type="button" className="btn btn-light" onClick={openCreate}>{t("common.cancel")}</button>}</div>
        </form></div></div></div></div>
      </div></div>
    </>
  );
};

export default PlatformServicesPage;
