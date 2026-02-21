/* eslint-disable no-unused-vars */
import React  from 'react';
import { Link } from 'react-router-dom';

export function itemRender(current, type, originalElement) {
    if (type === "prev") {
      return <Link to="#">Previous</Link>;
    }
    if (type === "next") {
      return <Link to="#">Next</Link>;
    }
    return originalElement;
  }
  
  export function onShowSizeChange(current, pageSize) {
    // console.log(current, pageSize);
  }