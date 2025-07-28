// Error.jsx
import React, { useEffect } from "react";
import "./Error.css";

function Error({ message, type = "error", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // hide after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      <p>{message}</p>
    </div>
  );
}

export default Error;
