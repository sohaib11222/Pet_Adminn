/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import { Link, useLocation } from "react-router-dom";
import { dashboard, logout, menuicon04, menuicon06, menuicon08, menuicon09, menuicon11, menuicon12, menuicon14, menuicon15, patients, sidemenu } from './imagepath';
import Scrollbars from "react-custom-scrollbars-2";
import { useAdminNotifications } from "./admin/AdminNotificationsContext";
import { useLanguage } from "../contexts/LanguageContext";


const Sidebar = (props) => {
  const location = useLocation();
  const { indicators, markSectionSeen } = useAdminNotifications();
  const { t } = useLanguage();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const sectionForPath = (path) => {
    const matches = [
      ["/approvals/veterinarians", "veterinarianApprovals"],
      ["/approvals/pet-stores", "petStoreApprovals"],
      ["/users/veterinarians", "veterinarians"],
      ["/users", "users"],
      ["/medical-records", "medicalRecords"],
      ["/vaccines", "vaccines"],
      ["/appointments", "appointments"],
      ["/support-tickets", "supportTickets"],
      ["/contact-queries", "contactQueries"],
      ["/pet-stores", "petStores"],
      ["/products", "products"],
      ["/orders", "orders"],
      ["/transactions", "transactions"],
      ["/withdrawal-requests", "withdrawals"],
      ["/subscription-plans", "subscriptionPlans"],
      ["/announcements", "announcements"],
      ["/reviews", "reviews"],
      ["/insurance-companies", "insuranceCompanies"],
      ["/specializations", "specializations"],
      ["/platform-services", "platformServices"],
      ["/pets", "pets"],
    ];
    return matches.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))?.[1];
  };

  useEffect(() => {
    const section = sectionForPath(location.pathname);
    if (section) markSectionSeen(section);
  }, [location.pathname, markSectionSeen]);

  const renderIndicator = (section) => {
    const indicator = indicators[section];
    if (!indicator?.tone) return null;
    const label =
      indicator.tone === "red"
        ? `${indicator.pendingCount} ${indicator.pendingCount === 1 ? t("sidebar.item") : t("sidebar.items")} ${t("sidebar.needReview")}`
        : t("sidebar.newData");
    return (
      <span
        className={`admin-sidebar-dot admin-sidebar-dot--${indicator.tone}`}
        title={label}
        aria-label={label}
      />
    );
  };

  const expandMenu = () => {
    document.body.classList.remove("expand-menu");
  };
  const expandMenuOpen = () => {
    document.body.classList.add("expand-menu");
  };

  return (
    <>
      <div className="sidebar" id="sidebar">
        <Scrollbars
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          autoHeight
          autoHeightMin={0}
          autoHeightMax="95vh"
          thumbMinSize={30}
          universal={false}
          hideTracksWhenNotNeeded={true}
        >
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu"
              onMouseLeave={expandMenu}
              onMouseOver={expandMenuOpen}
            >
              <ul>
                <li className="menu-title">{t("nav.main")}</li>

                <li>
                  <Link className={isActive('/dashboard') ? 'active' : ''} to="/dashboard">
                    <span className="menu-side">
                      <img src={dashboard} alt="" />
                    </span>{" "}
                    <span>{t("nav.dashboard")}</span>
                  </Link>
                </li>

                <li className="menu-title">{t("nav.approvals")}</li>
                <li>
                  <Link className={isActive('/approvals/veterinarians') ? 'active' : ''} to="/approvals/veterinarians">
                    <span className="menu-side">
                      <img src={menuicon08} alt="" />
                    </span>{" "}
                    <span>{t("nav.veterinarians")}</span>
                    {renderIndicator("veterinarianApprovals")}
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/approvals/pet-stores') ? 'active' : ''} to="/approvals/pet-stores">
                    <span className="menu-side">
                      <img src={menuicon08} alt="" />
                    </span>{" "}
                    <span>{t("nav.petStores")}</span>
                    {renderIndicator("petStoreApprovals")}
                  </Link>
                </li>

                <li className="menu-title">{t("nav.users")}</li>
                <li>
                  <Link className={isActive('/users') ? 'active' : ''} to="/users">
                    <span className="menu-side">
                      <img src={patients} alt="" />
                    </span>{" "}
                    <span>{t("nav.users")}</span>
                    {renderIndicator("users")}
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/users/veterinarians') ? 'active' : ''} to="/users/veterinarians">
                    <span className="menu-side">
                      <img src={patients} alt="" />
                    </span>{" "}
                    <span>{t("nav.veterinarians")}</span>
                    {renderIndicator("veterinarians")}
                  </Link>
                </li>

                <li className="menu-title">{t("nav.petsCare")}</li>
                <li>
                  <Link className={isActive('/platform-services') ? 'active' : ''} to="/platform-services">
                    <span className="menu-side"><i className="fa-solid fa-handshake" /></span>
                    <span>{t("nav.platformServices")}</span>
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/pets') ? 'active' : ''} to="/pets">
                    <span className="menu-side">
                      <img src={menuicon14} alt="" />
                    </span>{" "}
                    <span>{t("nav.pets")}</span>
                    {renderIndicator("pets")}
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/medical-records') ? 'active' : ''} to="/medical-records">
                    <span className="menu-side">
                      <img src={menuicon14} alt="" />
                    </span>{" "}
                    <span>{t("nav.medicalRecords")}</span>
                    {renderIndicator("medicalRecords")}
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/vaccines') ? 'active' : ''} to="/vaccines">
                    <span className="menu-side">
                      <img src={menuicon06} alt="" />
                    </span>{" "}
                    <span>{t("nav.vaccines")}</span>
                    {renderIndicator("vaccines")}
                  </Link>
                </li>

                <li className="menu-title">{t("nav.appointments")}</li>
                <li>
                  <Link className={isActive('/appointments') ? 'active' : ''} to="/appointments">
                    <span className="menu-side">
                      <img src={menuicon04} alt="" />
                    </span>{" "}
                    <span>{t("nav.appointments")}</span>
                    {renderIndicator("appointments")}
                  </Link>
                </li>

                <li className="menu-title">{t("nav.communication")}</li>
                <li>
                  <Link className={isActive('/admin-messages') ? 'active' : ''} to="/admin-messages">
                    <span className="menu-side">
                      <i className="fa-solid fa-message" />
                    </span>{" "}
                    <span>{t("nav.doctorMessages")}</span>
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/pharmacy-parapharmacy-messages') ? 'active' : ''} to="/pharmacy-parapharmacy-messages">
                    <span className="menu-side">
                      <i className="fa-solid fa-store" />
                    </span>{" "}
                    <span>{t("nav.pharmacyMessages")}</span>
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/support-tickets') ? 'active' : ''} to="/support-tickets">
                    <span className="menu-side">
                      <i className="fa-solid fa-headset" />
                    </span>{" "}
                    <span>{t("nav.supportTickets")}</span>
                    {renderIndicator("supportTickets")}
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/contact-queries') ? 'active' : ''} to="/contact-queries">
                    <span className="menu-side">
                      <i className="fa-solid fa-envelope" />
                    </span>{" "}
                    <span>{t("nav.contactQueries")}</span>
                    {renderIndicator("contactQueries")}
                  </Link>
                </li>

                <li className="menu-title">{t("nav.commerce")}</li>
                <li>
                  <Link className={isActive('/pet-stores') ? 'active' : ''} to="/pet-stores">
                    <span className="menu-side">
                      <img src={sidemenu} alt="" />
                    </span>{" "}
                    <span>{t("nav.petStores")}</span>
                    {renderIndicator("petStores")}
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/products') ? 'active' : ''} to="/products">
                    <span className="menu-side">
                      <img src={sidemenu} alt="" />
                    </span>{" "}
                    <span>{t("nav.products")}</span>
                    {renderIndicator("products")}
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/orders') ? 'active' : ''} to="/orders">
                    <span className="menu-side">
                      <img src={sidemenu} alt="" />
                    </span>{" "}
                    <span>{t("nav.orders")}</span>
                    {renderIndicator("orders")}
                  </Link>
                </li>

                <li className="menu-title">{t("nav.finance")}</li>
                <li>
                  <Link className={isActive('/transactions') ? 'active' : ''} to="/transactions">
                    <span className="menu-side">
                      <img src={menuicon09} alt="" />
                    </span>{" "}
                    <span>{t("nav.transactions")}</span>
                    {renderIndicator("transactions")}
                  </Link>
                </li>
                {/* <li>
                  <Link className={isActive('/payments') ? 'active' : ''} to="/payments">
                    <span className="menu-side">
                      <img src={menuicon09} alt="" />
                    </span>{" "}
                    <span>Payments</span>
                  </Link>
                </li> */}
                <li>
                  <Link className={isActive('/withdrawal-requests') ? 'active' : ''} to="/withdrawal-requests">
                    <span className="menu-side">
                      <img src={menuicon09} alt="" />
                    </span>{" "}
                    <span>{t("nav.withdrawalRequests")}</span>
                    {renderIndicator("withdrawals")}
                  </Link>
                </li>

                <li className="menu-title">{t("nav.subscriptions")}</li>
                <li>
                  <Link className={isActive('/subscription-plans') ? 'active' : ''} to="/subscription-plans">
                    <span className="menu-side">
                      <img src={menuicon15} alt="" />
                    </span>{" "}
                    <span>{t("nav.subscriptionPlans")}</span>
                    {renderIndicator("subscriptionPlans")}
                  </Link>
                </li>

                <li className="menu-title">{t("nav.content")}</li>
                <li>
                  <Link className={isActive('/announcements') ? 'active' : ''} to="/announcements">
                    <span className="menu-side">
                      <img src={menuicon12} alt="" />
                    </span>{" "}
                    <span>{t("nav.announcements")}</span>
                    {renderIndicator("announcements")}
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/reviews') ? 'active' : ''} to="/reviews">
                    <span className="menu-side">
                      <img src={menuicon11} alt="" />
                    </span>{" "}
                    <span>{t("nav.reviews")}</span>
                    {renderIndicator("reviews")}
                  </Link>
                </li>

                <li className="menu-title">{t("nav.configuration")}</li>
                <li>
                  <Link className={isActive('/insurance-companies') ? 'active' : ''} to="/insurance-companies">
                    <span className="menu-side">
                      <img src={menuicon06} alt="" />
                    </span>{" "}
                    <span>{t("nav.insuranceCompanies")}</span>
                    {renderIndicator("insuranceCompanies")}
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/specializations') ? 'active' : ''} to="/specializations">
                    <span className="menu-side">
                      <img src={menuicon06} alt="" />
                    </span>{" "}
                    <span>{t("nav.specializations")}</span>
                    {renderIndicator("specializations")}
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/footer-options') ? 'active' : ''} to="/footer-options">
                    <span className="menu-side">
                      <i className="fa-solid fa-list-check" />
                    </span>{" "}
                    <span>{t("nav.footerOptions")}</span>
                  </Link>
                </li>
                {/* <li>
                  <Link className={isActive('/uploads') ? 'active' : ''} to="/uploads">
                    <i className="fa fa-folder-open" /> <span>Uploads</span>
                  </Link>
                </li> */}
                <li>
                  <Link className={isActive('/change-password') ? 'active' : ''} to="/change-password">
                    <i className="fa fa-key" /> <span>{t("nav.changePassword")}</span>
                  </Link>
                </li>
              </ul>
              <div className="logout-btn">
                <Link to="/logout">
                  <span className="menu-side">
                    <img src={logout} alt="" />
                  </span>{" "}
                  <span>{t("nav.logout")}</span>
                </Link>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
    </>
  )
}
export default Sidebar
