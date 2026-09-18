import React, { useCallback, useEffect, useMemo, useState } from "react";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Sidebar from "../../Sidebar";
import Header from "../../Header";
import {
  Avatar2,
  calendar,
  empty_wallet,
  imagesend,
  morning_img_01,
  profile_add,
  scissor,
} from "../../imagepath";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { apiRequest, getCurrentUser } from "../../../api/client";
import { useLanguage } from "../../../contexts/LanguageContext";

const Admin_Dashboard = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPets, setRecentPets] = useState([]);
  const [recentVets, setRecentVets] = useState([]);
  const [deliveryPerformance, setDeliveryPerformance] = useState(null);

  const currentUser = useMemo(() => getCurrentUser(), []);

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) {
      setError("");
      setLoading(true);
    }
    try {
      const [dashRes, apptRes, petRes, vetsRes, deliveryRes] = await Promise.all([
        apiRequest("/admin/dashboard"),
        apiRequest("/admin/appointments", { params: { page: 1, limit: 5 } }),
        apiRequest("/admin/pets", { params: { page: 1, limit: 5 } }),
        apiRequest("/users/veterinarians", {
          params: { page: 1, limit: 5, status: "APPROVED" },
        }),
        apiRequest("/orders/delivery-performance"),
      ]);

      setStats(dashRes?.data || null);
      setRecentAppointments(apptRes?.data?.appointments || []);
      setRecentPets(petRes?.data?.pets || []);
      setRecentVets(vetsRes?.data?.veterinarians || []);
      setDeliveryPerformance(deliveryRes?.data || deliveryRes || null);
    } catch (e) {
      if (!silent) {
        setError(e?.message || t("dashboard.loadFailed", "Failed to load dashboard"));
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        loadDashboard(true);
      }
    };

    loadDashboard();
    const intervalId = window.setInterval(refreshWhenVisible, 30000);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadDashboard]);

  const statsAppointments = Number(stats?.totalAppointments || 0);
  const statsPetOwners = Number(stats?.totalPetOwners || 0);
  const statsTotalVets = Number(stats?.totalVeterinarians || 0);
  const statsEarnings = Number(stats?.totalEarnings || 0);
  const pharmacyDeliveryRows = Array.isArray(deliveryPerformance?.pharmacies)
    ? deliveryPerformance.pharmacies
    : [];
  const statusLabel = (value) => {
    const normalized = String(value || "").toLowerCase();
    return normalized ? t(`status.${normalized}`, value) : t("common.unknown");
  };

  return (
    <>
      <Header />
      <Sidebar
        id="menu-item"
        id1="menu-items"
        activeClassName="admin-dashboard"
      />
      <>
        <div className="page-wrapper">
          <div className="content">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="#">{t("dashboard.dashboard")}</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <i className="feather-chevron-right">
                        <FeatherIcon icon="chevron-right" />
                      </i>
                    </li>
                    <li className="breadcrumb-item active">{t("dashboard.title")}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12 col-xl-12">
                <div className="card">
                  <div className="card-header pb-0">
                    <h4 className="card-title d-inline-block">{t("dashboard.recentVeterinarians")}</h4>{" "}
                    <Link to="/users/veterinarians" className="float-end patient-views">
                      {t("dashboard.showAll")}
                    </Link>
                  </div>
                  <div className="card-block table-dash">
                    <div className="table-responsive admin-dashboard-table-wrap">
                      <table className="table mb-0 border-0 datatable custom-table">
                        <thead>
                          <tr>
                            <th>
                              <div className="form-check check-tables">
                                <input className="form-check-input" type="checkbox" />
                              </div>
                            </th>
                            <th>{t("common.id")}</th>
                            <th>{t("common.name")}</th>
                            <th>{t("common.email")}</th>
                            <th>{t("common.status")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentVets.map((vet, idx) => {
                            const id = String(vet?._id || "");
                            const name = vet?.name || "";
                            const email = vet?.email || "";
                            const status = vet?.status || "";

                            return (
                              <tr key={id || idx}>
                                <td>
                                  <div className="form-check check-tables">
                                    <input className="form-check-input" type="checkbox" />
                                  </div>
                                </td>
                                <td>{id ? id.slice(-6) : `#${idx + 1}`}</td>
                                <td className="table-image">
                                  <img
                                    width={28}
                                    height={28}
                                    className="rounded-circle"
                                    src={Avatar2}
                                    alt="#"
                                  />
                                  <h2>{name}</h2>
                                </td>
                                <td>{email}</td>
                                <td>
                                  <button className="custom-badge status-green ">{statusLabel(status)}</button>
                                </td>
                              </tr>
                            );
                          })}
                          {!loading && recentVets.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center">
                                {t("dashboard.noVeterinarians")}
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="good-morning-blk">
              <div className="row">
                <div className="col-md-6">
                  <div className="morning-user">
                    <h2>
                      {t("dashboard.goodMorning")} <span>{currentUser?.name || t("dashboard.admin")}</span>
                    </h2>
                    <p>{t("dashboard.niceDay")}</p>
                  </div>
                </div>
                <div className="col-md-6 position-blk">
                  <div className="morning-img">
                    <img src={morning_img_01}
                     alt="#" />
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-md-12 col-xl-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <h4 className="card-title mb-0">{t("dashboard.deliveryPerformance")}</h4>
                      <small className="text-muted">{t("dashboard.deliveryHint")}</small>
                    </div>
                    <Link to="/orders" className="patient-views">{t("dashboard.viewOrders")}</Link>
                  </div>
                  <div className="card-body p-0 table-dash">
                    <div className="table-responsive admin-dashboard-table-wrap">
                      <table className="table mb-0 border-0 datatable custom-table">
                        <thead>
                          <tr>
                            <th>{t("dashboard.pharmacy")}</th>
                            <th>{t("common.type")}</th>
                            <th>{t("dashboard.totalOrders")}</th>
                            <th>{t("dashboard.onTime")}</th>
                            <th>{t("dashboard.late")}</th>
                            <th>{t("dashboard.awaitingDelivery")}</th>
                            <th>{t("dashboard.averageDeliveryTime")}</th>
                            <th>{t("dashboard.onTimeDelivery")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pharmacyDeliveryRows.map((pharmacy) => (
                            <tr key={pharmacy.petStoreId || pharmacy.pharmacyName}>
                              <td>{pharmacy.pharmacyName}</td>
                              <td>{pharmacy.storeType}</td>
                              <td>{pharmacy.totalOrders}</td>
                              <td><span className="text-success fw-semibold">{pharmacy.onTimeOrders}</span></td>
                              <td><span className={pharmacy.lateOrders ? "text-danger fw-semibold" : "text-muted"}>{pharmacy.lateOrders}</span></td>
                              <td>{pharmacy.awaitingDeliveryOrders}</td>
                              <td>{pharmacy.averageDeliveryTime === null ? "—" : `${pharmacy.averageDeliveryTime} ${t("common.days")}`}</td>
                              <td>{pharmacy.onTimeDeliveryPercentage === null ? "—" : `${pharmacy.onTimeDeliveryPercentage}%`}</td>
                            </tr>
                          ))}
                          {!loading && pharmacyDeliveryRows.length === 0 ? (
                            <tr>
                               <td colSpan={8} className="text-center py-4">{t("dashboard.noDeliveryData")}</td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              {error ? (
                <div className="col-12">
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                </div>
              ) : null}
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="dash-widget">
                  <div className="dash-boxs comman-flex-center">
                    <img src={calendar}  alt="#" />
                  </div>
                  <div className="dash-content dash-count flex-grow-1">
                    <h4>{t("dashboard.appointments")}</h4>
                    <h2>
                      {" "}
                      <CountUp delay={0.1} end={statsAppointments} duration={0.6} />
                    </h2>
                    <p>
                      <span className="passive-view">
                        <i className="feather-arrow-up-right me-1" >
                          <FeatherIcon icon="arrow-up-right"/>
                        </i>
                        40%
                      </span>{" "}
                      {t("dashboard.vsLastMonth")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="dash-widget">
                  <div className="dash-boxs comman-flex-center">
                    <img src={profile_add}  alt="#" />
                  </div>
                  <div className="dash-content dash-count">
                    <h4>{t("dashboard.petOwners")}</h4>
                    <h2>
                      <CountUp delay={0.1} end={statsPetOwners} duration={0.6} />
                    </h2>
                    <p>
                      <span className="passive-view">
                        <i className="feather-arrow-up-right me-1">
                          <FeatherIcon icon="arrow-up-right" />
                          </i>
                        20%
                      </span>{" "}
                      {t("dashboard.vsLastMonth")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="dash-widget">
                  <div className="dash-boxs comman-flex-center">
                    <img src={scissor} alt="#" />
                  </div>
                  <div className="dash-content dash-count">
                    <h4>{t("dashboard.veterinarians")}</h4>
                    <h2>
                      <CountUp delay={0.1} end={statsTotalVets} duration={0.6} />
                    </h2>
                    <p>
                      <span className="negative-view">
                        <i className="feather-arrow-down-right me-1">
                          <FeatherIcon icon="arrow-down-right"/>
                          </i>
                        15%
                      </span>{" "}
                      {t("dashboard.vsLastMonth")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="dash-widget">
                  <div className="dash-boxs comman-flex-center">
                    <img src={empty_wallet} alt="#" />
                  </div>
                  <div className="dash-content dash-count">
                    <h4>{t("dashboard.earnings")}</h4>
                    <h2>
                      $<CountUp delay={0.1} end={statsEarnings} duration={0.6} />
                    </h2>
                    <p>
                      <span className="passive-view">
                        <i className="feather-arrow-up-right me-1">
                          <FeatherIcon icon="arrow-up-right"/>
                          </i>
                        30%
                      </span>{" "}
                      {t("dashboard.vsLastMonth")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-md-12 col-xl-12">
                <div className="card">
                  <div className="card-header">
                    <h4 className="card-title d-inline-block">
                      {t("dashboard.upcomingAppointments")}
                    </h4>{" "}
                    <Link
                      to="/appointments"
                      className="patient-views float-end"
                    >
                       {t("dashboard.showAll")}
                    </Link>
                  </div>
                  <div className="card-body p-0 table-dash">
                    <div className="table-responsive admin-dashboard-table-wrap">
                      <table className="table mb-0 border-0 datatable custom-table">
                        <thead>
                          <tr>
                            <th>
                              <div className="form-check check-tables">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue="something"
                                />
                              </div>
                            </th>
                            <th>{t("dashboard.number")}</th>
                            <th>{t("dashboard.myPetName")}</th>
                            <th>{t("dashboard.doctor")}</th>
                            <th>{t("common.time")}</th>
                            <th>{t("dashboard.disease")}</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {recentAppointments.map((apt, idx) => {
                            const number = apt?.appointmentNumber || String(apt?._id || "");
                            const ownerName = apt?.petOwnerId?.name || "";
                            const vetName = apt?.veterinarianId?.name || "";
                            const dateStr = apt?.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString() : "";
                            const timeStr = apt?.appointmentTime || "";
                            const status = apt?.status || "";

                            return (
                              <tr key={number || idx}>
                                <td>
                                  <div className="form-check check-tables">
                                    <input className="form-check-input" type="checkbox" />
                                  </div>
                                </td>
                                <td>{number || `#${idx + 1}`}</td>
                                <td>{ownerName}</td>
                                <td className="table-image appoint-doctor">
                                  <img
                                    width={28}
                                    height={28}
                                    className="rounded-circle"
                                    src={Avatar2}
                                    alt="#"
                                  />
                                  <h2>{vetName}</h2>
                                </td>
                                <td className="appoint-time">
                                  <span>{dateStr ? `${dateStr} at ` : ""}</span>
                                  {timeStr}
                                </td>
                                <td>
                                  <button className="custom-badge status-green ">
                                    {statusLabel(status)}
                                  </button>
                                </td>
                                <td className="text-end">
                                  <div className="dropdown dropdown-action">
                                    <Link
                                      to="#"
                                      className="action-icon dropdown-toggle"
                                      data-bs-toggle="dropdown"
                                      aria-expanded="false"
                                    >
                                      <i className="fa fa-ellipsis-v" />
                                    </Link>
                                    <div className="dropdown-menu dropdown-menu-end">
                                      <Link className="dropdown-item" to="/appointments">
                                        <i className="fa-solid fa-pen-to-square m-r-5" />{" "}
                                         {t("common.view")}
                                      </Link>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {!loading && recentAppointments.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center">
                                 {t("dashboard.noAppointments")}
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-xl-12">
                <div className="card">
                  <div className="card-header pb-0">
                    <h4 className="card-title d-inline-block">
                       {t("dashboard.recentPets")}{" "}
                    </h4>{" "}
                    <Link
                      to="/pets"
                      className="float-end patient-views"
                    >
                       {t("dashboard.showAll")}
                    </Link>
                  </div>
                  <div className="card-block table-dash">
                    <div className="table-responsive admin-dashboard-table-wrap">
                      <table className="table mb-0 border-0 datatable custom-table">
                        <thead>
                          <tr>
                            <th>
                              <div className="form-check check-tables">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue="something"
                                />
                              </div>
                            </th>
                            <th>{t("dashboard.number")}</th>
                            <th>{t("dashboard.myPetName")}</th>
                            <th>{t("dashboard.age")}</th>
                            <th>{t("dashboard.dateOfBirth")}</th>
                            <th>{t("dashboard.diagnosis")}</th>
                            <th>{t("dashboard.triage")}</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {recentPets.map((pet, idx) => {
                            const id = String(pet?._id || "");
                            const name = pet?.name || "";
                            const age = pet?.age ?? "";
                            const dob = pet?.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : "";
                            const species = pet?.species || "";
                            const breed = pet?.breed || "";

                            return (
                              <tr key={id || idx}>
                                <td>
                                  <div className="form-check check-tables">
                                    <input className="form-check-input" type="checkbox" />
                                  </div>
                                </td>
                                <td>{id ? id.slice(-6) : `#${idx + 1}`}</td>
                                <td className="table-image">
                                  <img
                                    width={28}
                                    height={28}
                                    className="rounded-circle"
                                    src={Avatar2}
                                    alt="#"
                                  />
                                  <h2>{name}</h2>
                                </td>
                                <td>{age}</td>
                                <td>{dob}</td>
                                <td>{[species, breed].filter(Boolean).join(" ")}</td>
                                <td>
                                  <button className="custom-badge status-green ">
                                     {t("dashboard.active")}
                                  </button>
                                </td>
                                <td className="text-end">
                                  <div className="dropdown dropdown-action">
                                    <Link
                                      to="#"
                                      className="action-icon dropdown-toggle"
                                      data-bs-toggle="dropdown"
                                      aria-expanded="false"
                                    >
                                      <i className="fa fa-ellipsis-v" />
                                    </Link>
                                    <div className="dropdown-menu dropdown-menu-end">
                                      <Link className="dropdown-item" to="/pets">
                                        <i className="fa-solid fa-pen-to-square m-r-5" />{" "}
                                         {t("common.view")}
                                      </Link>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {!loading && recentPets.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center">
                                 {t("dashboard.noPets")}
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="delete_patient" className="modal fade delete-modal" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-body text-center">
          <img src={imagesend} alt="#" width={50} height={46} />
          <h3>{t("dashboard.deleteConfirm")}</h3>
          <div className="m-t-20">
            {" "}
            <Link to="#" className="btn btn-white me-2" data-bs-dismiss="modal">
               {t("dashboard.close")}
            </Link>
            <button type="submit" className="btn btn-danger">
               {t("dashboard.delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div id="delete_patient" className="modal fade delete-modal" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-body text-center">
          <img src={imagesend} alt="#" width={50} height={46} />
          <h3>{t("dashboard.deleteConfirm")}</h3>
          <div className="m-t-20">
            {" "}
            <Link to="#" className="btn btn-white me-2" data-bs-dismiss="modal">
               {t("dashboard.close")}
            </Link>
            <button type="submit" className="btn btn-danger">
               {t("dashboard.delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
        </div>
      </>
    </>
  );
};

export default Admin_Dashboard;
