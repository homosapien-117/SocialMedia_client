import React from "react";
import "./error.css"; 

const NotFound: React.FC = () => {
  return (
    <div className="error-container">
      <h1 className="error-title">404</h1>
      <p className="error-text">
        Oops! Something wrong happened...{" "}
        <span className="animate-blink">????</span>
      </p>
    </div>
  );
};

export default NotFound;
