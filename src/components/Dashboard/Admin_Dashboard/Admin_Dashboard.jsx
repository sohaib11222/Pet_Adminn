import React, { useEffect, useMemo, useState } from "react";
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

const Admin_Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPets, setRecentPets] = useState([]);
  const [recentVets, setRecentVets] = useState([]);

  const currentUser = useMemo(() => getCurrentUser(), []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setError("");
      setLoading(true);
      try {
        const [dashRes, apptRes, petRes, vetsRes] = await Promise.all([
          apiRequest("/admin/dashboard"),
          apiRequest("/admin/appointments", { params: { page: 1, limit: 5 } }),
          apiRequest("/admin/pets", { params: { page: 1, limit: 5 } }),
          apiRequest("/users/veterinarians", {
            params: { page: 1, limit: 5, status: "APPROVED" },
          }),
        ]);

        if (!mounted) return;
        setStats(dashRes?.data || null);
        setRecentAppointments(apptRes?.data?.appointments || []);
        setRecentPets(petRes?.data?.pets || []);
        setRecentVets(vetsRes?.data?.veterinarians || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load dashboard");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const statsAppointments = Number(stats?.totalAppointments || 0);
  const statsPetOwners = Number(stats?.totalPetOwners || 0);
  const statsTotalVets = Number(stats?.totalVeterinarians || 0);
  const statsEarnings = Number(stats?.totalEarnings || 0);

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
                      <Link to="#">Dashboard </Link>
                    </li>
                    <li className="breadcrumb-item">
                      <i className="feather-chevron-right">
                        <FeatherIcon icon="chevron-right" />
                      </i>
                    </li>
                    <li className="breadcrumb-item active">Admin Dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12 col-xl-12">
                <div className="card">
                  <div className="card-header pb-0">
                    <h4 className="card-title d-inline-block">Recent Veterinarians</h4>{" "}
                    <Link to="/users/veterinarians" className="float-end patient-views">
                      Show all
                    </Link>
                  </div>
                  <div className="card-block table-dash">
                    <div className="table-responsive">
                      <table className="table mb-0 border-0 datatable custom-table">
                        <thead>
                          <tr>
                            <th>
                              <div className="form-check check-tables">
                                <input className="form-check-input" type="checkbox" />
                              </div>
                            </th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
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
                                  <button className="custom-badge status-green ">{status}</button>
                                </td>
                              </tr>
                            );
                          })}
                          {!loading && recentVets.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center">
                                No veterinarians
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
                      Good Morning, <span>{currentUser?.name || "Admin"}</span>
                    </h2>
                    <p>Have a nice day at work</p>
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
                    <h4>Appointments</h4>
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
                      vs last month
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
                    <h4>Pet Owners</h4>
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
                      vs last month
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
                    <h4>Veterinarians</h4>
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
                      vs last month
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
                    <h4>Earnings</h4>
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
                      vs last month
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
                      Upcoming Appointments
                    </h4>{" "}
                    <Link
                      to="/appointments"
                      className="patient-views float-end"
                    >
                      Show all
                    </Link>
                  </div>
                  <div className="card-body p-0 table-dash">
                    <div className="table-responsive">
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
                            <th>No</th>
                            <th>Patient name</th>
                            <th>Doctor</th>
                            <th>Time</th>
                            <th>Disease</th>
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
                                    {status}
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
                                        View
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
                                No appointments
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
                      Recent Patients{" "}
                    </h4>{" "}
                    <Link
                      to="/pets"
                      className="float-end patient-views"
                    >
                      Show all
                    </Link>
                  </div>
                  <div className="card-block table-dash">
                    <div className="table-responsive">
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
                            <th>No</th>
                            <th>Patient name</th>
                            <th>Age</th>
                            <th>Date of Birth</th>
                            <th>Diagnosis</th>
                            <th>Triage</th>
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
                                    Active
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
                                        View
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
                                No pets
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
          <h3>Are you sure want to delete this ?</h3>
          <div className="m-t-20">
            {" "}
            <Link to="#" className="btn btn-white me-2" data-bs-dismiss="modal">
              Close
            </Link>
            <button type="submit" className="btn btn-danger">
              Delete
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
          <h3>Are you sure want to delete this ?</h3>
          <div className="m-t-20">
            {" "}
            <Link to="#" className="btn btn-white me-2" data-bs-dismiss="modal">
              Close
            </Link>
            <button type="submit" className="btn btn-danger">
              Delete
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
