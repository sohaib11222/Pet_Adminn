import React from "react";
// eslint-disable-next-line no-unused-vars

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/pages/login";
import ForgotPassword from "./components/pages/login/ForgotPassword";
import Signup from "./components/pages/login/Signup";
import Register from "./components/pages/login/Register";
import LockScreen from "./components/pages/login/LockScreen";
import ChangePassword from "./components/pages/login/ChangePassword";
import Error from "./components/pages/login/Error";
import ServerError from "./components/pages/login/ServerError";
import Profile from "./components/pages/login/Profile";
import EditProfile from "./components/pages/login/EditProfile";
import BlankPage from "./components/pages/login/BlankPage";
import Admin_Dashboard from "./components/Dashboard/Admin_Dashboard/Admin_Dashboard";
import AdminEntityListPage from "./components/admin/AdminEntityListPage";
import SettingsChangePassword from "./components/settings/SettingsChangePassword";
import RequireAdmin from "./components/auth/RequireAdmin";
import Logout from "./components/auth/Logout";

//Accounts
const Approuter = () => {
  // eslint-disable-next-line no-unused-vars
  // const config = "/react/template"
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/lockscreen" element={<LockScreen />} />
          <Route path="/changepassword" element={<ChangePassword />} />
          <Route path="/error" element={<Error />} />
          <Route path="/server-error" element={<ServerError />} />
          <Route path="/blankpage" element={<BlankPage />} />

          <Route path="/logout" element={<Logout />} />

          <Route
            path="/dashboard"
            element={
              <RequireAdmin>
                <Admin_Dashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/approvals/veterinarians"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="approvalsVets" />
              </RequireAdmin>
            }
          />
          <Route
            path="/approvals/pet-stores"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="approvalsPetStores" />
              </RequireAdmin>
            }
          />
          <Route
            path="/users"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="users" />
              </RequireAdmin>
            }
          />
          <Route
            path="/users/veterinarians"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="veterinarians" />
              </RequireAdmin>
            }
          />
          <Route
            path="/pets"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="pets" />
              </RequireAdmin>
            }
          />
          <Route
            path="/medical-records"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="medicalRecords" />
              </RequireAdmin>
            }
          />
          <Route
            path="/vaccines"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="vaccines" />
              </RequireAdmin>
            }
          />
          <Route
            path="/appointments"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="appointments" />
              </RequireAdmin>
            }
          />
          <Route
            path="/pet-stores"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="petStores" />
              </RequireAdmin>
            }
          />
          <Route
            path="/products"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="products" />
              </RequireAdmin>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="orders" />
              </RequireAdmin>
            }
          />
          <Route
            path="/transactions"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="transactions" />
              </RequireAdmin>
            }
          />
          <Route
            path="/payments"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="payments" />
              </RequireAdmin>
            }
          />
          <Route
            path="/withdrawal-requests"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="withdrawals" />
              </RequireAdmin>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="subscriptions" />
              </RequireAdmin>
            }
          />
          <Route
            path="/subscription-plans"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="subscriptionPlans" />
              </RequireAdmin>
            }
          />
          <Route
            path="/announcements"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="announcements" />
              </RequireAdmin>
            }
          />
          <Route
            path="/reviews"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="reviews" />
              </RequireAdmin>
            }
          />
          <Route
            path="/insurance-companies"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="insuranceCompanies" />
              </RequireAdmin>
            }
          />
          <Route
            path="/specializations"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="specializations" />
              </RequireAdmin>
            }
          />
          <Route
            path="/uploads"
            element={
              <RequireAdmin>
                <AdminEntityListPage entity="uploads" />
              </RequireAdmin>
            }
          />
          <Route
            path="/change-password"
            element={
              <RequireAdmin>
                <SettingsChangePassword />
              </RequireAdmin>
            }
          />
        </Routes>
      </BrowserRouter>
      <div className="sidebar-overlay"></div>
    </>
  );
};

export default Approuter;
