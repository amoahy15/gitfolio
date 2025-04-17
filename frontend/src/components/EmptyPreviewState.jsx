import React from 'react';
import '../styles/EmptyPreviewState.css';

const EmptyPreviewState = () => {
  return (
    <div className="empty-preview-state">
      <div className="empty-preview-content">
        <div className="preview-header">
          <div className="title-underline"></div>
        </div>
        
        <svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="75" cy="75" r="70" stroke="#0EA5E9" strokeWidth="2" fill="none" />
          <path d="M35,95 C45,115 55,125 75,125 C105,125 125,105 125,75 C125,45 105,25 75,25" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
          <circle cx="75" cy="75" r="15" fill="rgba(14, 165, 233, 0.2)" />
          <circle cx="75" cy="75" r="5" fill="#0EA5E9" />
        </svg>
        
        <div className="empty-preview-message">
          <h3>No Preview Available Yet</h3>
          <p>Start chatting with GitFolio to generate your portfolio code preview.</p>
          <p>Simply describe what you're looking for, and we'll create customized code for you.</p>
        </div>
      </div>
    </div>
  );
};

export default EmptyPreviewState;