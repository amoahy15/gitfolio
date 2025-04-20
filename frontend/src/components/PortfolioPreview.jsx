import React from 'react';
import '../styles/PortfolioPreview.css';
import EmptyPreviewState from './EmptyPreviewState';

const PortfolioPreview = ({ hasInteracted, generatedHtml }) => {
  return (
    <div className="preview-window">
      <div className="preview-header-container">
        <h2 className="preview-title">Portfolio Preview</h2>
      </div>

      {hasInteracted && generatedHtml ? (
        <iframe
          title="Portfolio Preview"
          srcDoc={generatedHtml}
          width="100%"
          height="100%"
          frameBorder="0"
        ></iframe>
      ) : (
        <EmptyPreviewState />
      )}
    </div>
  );
};

export default PortfolioPreview;
