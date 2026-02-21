import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../api/client";
import PropTypes from "prop-types";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    clearAuthSession();
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
};

export default Logout;

Logout.propTypes = {
  children: PropTypes.node,
};
