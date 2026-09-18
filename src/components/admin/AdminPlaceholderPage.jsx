/* eslint-disable react/prop-types */
import React from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import PropTypes from "prop-types";
import { useLanguage } from "../../contexts/LanguageContext";

const AdminPlaceholderPage = (props) => {
  const { translateText: ui } = useLanguage();

  return (
    <>
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">{ui(props.title)}</h3>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <p className="mb-0">{ui("This page is ready for API integration.")}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
AdminPlaceholderPage.propTypes = {
  title: PropTypes.string.isRequired,
};

export default AdminPlaceholderPage;
