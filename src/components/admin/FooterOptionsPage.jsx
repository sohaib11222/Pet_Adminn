import React, { useEffect, useRef, useState } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { apiRequest } from "../../api/client";

const DEFAULT_VALUES = {
  address: "",
  supportEmail: "",
  phoneNumber: "",
  socialLinks: [],
};

const FooterOptionsPage = () => {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const socialLinkCounter = useRef(0);

  const withStableKey = (link = {}) => ({
    platform: link.platform || "",
    url: link.url || "",
    isActive: link.isActive !== false,
    _clientKey: link._clientKey || link._id || `social-link-${Date.now()}-${socialLinkCounter.current++}`,
  });

  const loadOptions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/footer-options");
      const data = response?.data || response || {};
      setValues({
        address: data.address || "",
        supportEmail: data.supportEmail || "",
        phoneNumber: data.phoneNumber || "",
        socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks.map(withStableKey) : [],
      });
    } catch (e) {
      setError(e?.message || "Failed to load footer options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSuccess("");
  };

  const updateSocialLink = (index, field, value) => {
    setValues((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link
      ),
    }));
    setSuccess("");
  };

  const addSocialLink = () => {
    setValues((current) => ({
      ...current,
      socialLinks: [...current.socialLinks, withStableKey()],
    }));
  };

  const removeSocialLink = (index) => {
    setValues((current) => ({
      ...current,
      socialLinks: current.socialLinks.filter((_, linkIndex) => linkIndex !== index),
    }));
  };

  const saveOptions = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiRequest("/footer-options", {
        method: "PUT",
        body: {
          ...values,
          socialLinks: values.socialLinks.map(({ platform, url, isActive }) => ({ platform, url, isActive })),
        },
      });
      setSuccess("Footer options saved successfully.");
      window.dispatchEvent(new Event("pa-admin-data-changed"));
    } catch (e) {
      setError(e?.message || "Failed to save footer options");
    } finally {
      setSaving(false);
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
                  <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item"><i className="feather-chevron-right" /></li>
                  <li className="breadcrumb-item active">Footer Options</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8 col-xl-7">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title mb-0">Footer Options</h4>
                  <p className="text-muted mb-0 mt-1">These values appear in the public website footer and Contact Us page.</p>
                </div>
                <div className="card-body">
                  {error ? <div className="alert alert-danger">{error}</div> : null}
                  {success ? <div className="alert alert-success">{success}</div> : null}

                  {loading ? (
                    <div className="text-center py-5">Loading footer options...</div>
                  ) : (
                    <form onSubmit={saveOptions}>
                      <div className="mb-3">
                        <label className="form-label">Address / Location</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={values.address}
                          onChange={(event) => updateValue("address", event.target.value)}
                          maxLength={300}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Support Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={values.supportEmail}
                          onChange={(event) => updateValue("supportEmail", event.target.value)}
                          maxLength={160}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={values.phoneNumber}
                          onChange={(event) => updateValue("phoneNumber", event.target.value)}
                          maxLength={60}
                          required
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h5 className="mb-1">Social Media Links</h5>
                          <p className="text-muted mb-0">Only active links are shown in the website footer.</p>
                        </div>
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={addSocialLink}>
                          Add Link
                        </button>
                      </div>

                      {values.socialLinks.length === 0 ? (
                        <div className="text-muted border rounded p-3 mb-4">No social links configured.</div>
                      ) : null}

                      {values.socialLinks.map((link, index) => (
                        <div className="border rounded p-3 mb-3" key={link._clientKey}>
                          <div className="row g-2 align-items-end">
                            <div className="col-md-3">
                              <label className="form-label">Platform</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Facebook"
                                value={link.platform || ""}
                                onChange={(event) => updateSocialLink(index, "platform", event.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-5">
                              <label className="form-label">URL</label>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="https://..."
                                value={link.url || ""}
                                onChange={(event) => updateSocialLink(index, "url", event.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-check mb-2 mb-md-0">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={link.isActive !== false}
                                  onChange={(event) => updateSocialLink(index, "isActive", event.target.checked)}
                                />
                                <span className="form-check-label">Active</span>
                              </label>
                            </div>
                            <div className="col-md-2 d-grid">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeSocialLink(index)}
                              >
                                <i className="fa-solid fa-trash-can me-1" aria-hidden="true" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save Footer Options"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FooterOptionsPage;
