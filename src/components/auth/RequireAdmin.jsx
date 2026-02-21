import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken, getCurrentUser } from "../../api/client";
import PropTypes from "prop-types";

const RequireAdmin = ({ children }) => {
  const token = getAuthToken();
  const user = getCurrentUser();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAdmin;

RequireAdmin.propTypes = {
  children: PropTypes.node.isRequired,
};
