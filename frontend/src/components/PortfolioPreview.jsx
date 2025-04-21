import React from 'react';
import '../styles/PortfolioPreview.css';
import EmptyPreviewState from './EmptyPreviewState';
import Spinner from './Spinner';

const PortfolioPreview = ({ hasPortfolio, generatedHtml, isGenerating }) => {
  return (
    <div className="preview-window">
      <div className="preview-header-container">
        <h2 className="preview-title">Portfolio Preview</h2>
      </div>

      {isGenerating ? (
        <div className="preview-generating">
          <Spinner size="large" color="#00ffcc" />
          <p className="generating-text">Building your portfolio...</p>
        </div>
      ) : hasPortfolio && generatedHtml ? (
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