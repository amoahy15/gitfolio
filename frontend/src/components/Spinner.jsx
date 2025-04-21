import React from 'react';
import '../styles/Spinner.css'

const Spinner = ({ size = 'medium', color = '#3498db', text }) => {
  // Determine size class based on prop
  const sizeClass = `spinner-${size}`;
  
  // Create the spinner style with custom color
  const spinnerStyle = {
    borderTopColor: color
  };

  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClass}`} style={spinnerStyle} />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default Spinner;