import React, { useEffect } from "react";
import "./alert.css"; 

interface CustomAlertProps {
  message: string;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="custom-alert">
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
      {message}
    </div>
  );
};

export default CustomAlert;
