/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react'
import { Link, useLocation } from "react-router-dom";
import { dashboard, logout, menuicon04, menuicon06, menuicon08, menuicon09, menuicon11, menuicon12, menuicon14, menuicon15, patients, sidemenu } from './imagepath';
import Scrollbars from "react-custom-scrollbars-2";


const Sidebar = (props) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

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
                <li className="menu-title">Main</li>

                <li>
                  <Link className={isActive('/dashboard') ? 'active' : ''} to="/dashboard">
                    <span className="menu-side">
                      <img src={dashboard} alt="" />
                    </span>{" "}
                    <span>Dashboard</span>
                  </Link>
                </li>

                <li className="menu-title">Approvals</li>
                <li>
                  <Link className={isActive('/approvals/veterinarians') ? 'active' : ''} to="/approvals/veterinarians">
                    <span className="menu-side">
                      <img src={menuicon08} alt="" />
                    </span>{" "}
                    <span>Veterinarians</span>
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/approvals/pet-stores') ? 'active' : ''} to="/approvals/pet-stores">
                    <span className="menu-side">
                      <img src={menuicon08} alt="" />
                    </span>{" "}
                    <span>Pet Stores</span>
                  </Link>
                </li>

                <li className="menu-title">Users</li>
                <li>
                  <Link className={isActive('/users') ? 'active' : ''} to="/users">
                    <span className="menu-side">
                      <img src={patients} alt="" />
                    </span>{" "}
                    <span>All Users</span>
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/users/veterinarians') ? 'active' : ''} to="/users/veterinarians">
                    <span className="menu-side">
                      <img src={patients} alt="" />
                    </span>{" "}
                    <span>Veterinarians</span>
                  </Link>
                </li>

                <li className="menu-title">Pets & Care</li>
                <li>
                  <Link className={isActive('/pets') ? 'active' : ''} to="/pets">
                    <span className="menu-side">
                      <img src={menuicon14} alt="" />
                    </span>{" "}
                    <span>Pets</span>
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/medical-records') ? 'active' : ''} to="/medical-records">
                    <span className="menu-side">
                      <img src={menuicon14} alt="" />
                    </span>{" "}
                    <span>Medical Records</span>
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/vaccines') ? 'active' : ''} to="/vaccines">
                    <span className="menu-side">
                      <img src={menuicon06} alt="" />
                    </span>{" "}
                    <span>Vaccines</span>
                  </Link>
                </li>

                <li className="menu-title">Appointments</li>
                <li>
                  <Link className={isActive('/appointments') ? 'active' : ''} to="/appointments">
                    <span className="menu-side">
                      <img src={menuicon04} alt="" />
                    </span>{" "}
                    <span>Appointments</span>
                  </Link>
                </li>

                <li className="menu-title">Commerce</li>
                <li>
                  <Link className={isActive('/pet-stores') ? 'active' : ''} to="/pet-stores">
                    <span className="menu-side">
                      <img src={sidemenu} alt="" />
                    </span>{" "}
                    <span>Pet Stores</span>
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/products') ? 'active' : ''} to="/products">
                    <span className="menu-side">
                      <img src={sidemenu} alt="" />
                    </span>{" "}
                    <span>Products</span>
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/orders') ? 'active' : ''} to="/orders">
                    <span className="menu-side">
                      <img src={sidemenu} alt="" />
                    </span>{" "}
                    <span>Orders</span>
                  </Link>
                </li>

                <li className="menu-title">Finance</li>
                <li>
                  <Link className={isActive('/transactions') ? 'active' : ''} to="/transactions">
                    <span className="menu-side">
                      <img src={menuicon09} alt="" />
                    </span>{" "}
                    <span>Transactions</span>
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
                    <span>Withdrawal Requests</span>
                  </Link>
                </li>

                <li className="menu-title">Subscriptions</li>
                {/* <li>
                  <Link className={isActive('/subscriptions') ? 'active' : ''} to="/subscriptions">
                    <span className="menu-side">
                      <img src={menuicon15} alt="" />
                    </span>{" "}
                    <span>Subscriptions</span>
                  </Link>
                </li> */}
                <li>
                  <Link className={isActive('/subscription-plans') ? 'active' : ''} to="/subscription-plans">
                    <span className="menu-side">
                      <img src={menuicon15} alt="" />
                    </span>{" "}
                    <span>Subscription Plans</span>
                  </Link>
                </li>

                <li className="menu-title">Content</li>
                <li>
                  <Link className={isActive('/announcements') ? 'active' : ''} to="/announcements">
                    <span className="menu-side">
                      <img src={menuicon12} alt="" />
                    </span>{" "}
                    <span>Announcements</span>
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/reviews') ? 'active' : ''} to="/reviews">
                    <span className="menu-side">
                      <img src={menuicon11} alt="" />
                    </span>{" "}
                    <span>Reviews</span>
                  </Link>
                </li>

                <li className="menu-title">Configuration</li>
                <li>
                  <Link className={isActive('/insurance-companies') ? 'active' : ''} to="/insurance-companies">
                    <span className="menu-side">
                      <img src={menuicon06} alt="" />
                    </span>{" "}
                    <span>Insurance Companies</span>
                  </Link>
                </li>
                <li>
                  <Link className={isActive('/specializations') ? 'active' : ''} to="/specializations">
                    <span className="menu-side">
                      <img src={menuicon06} alt="" />
                    </span>{" "}
                    <span>Specializations</span>
                  </Link>
                </li>
                {/* <li>
                  <Link className={isActive('/uploads') ? 'active' : ''} to="/uploads">
                    <i className="fa fa-folder-open" /> <span>Uploads</span>
                  </Link>
                </li> */}
                <li>
                  <Link className={isActive('/change-password') ? 'active' : ''} to="/change-password">
                    <i className="fa fa-key" /> <span>Change Password</span>
                  </Link>
                </li>
              </ul>
              <div className="logout-btn">
                <Link to="/logout">
                  <span className="menu-side">
                    <img src={logout} alt="" />
                  </span>{" "}
                  <span>Logout</span>
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
