import { saveAs } from 'file-saver';
import React, { useEffect, useRef } from 'react';
import { FaDownload } from "react-icons/fa";
import { IoMdOpen } from "react-icons/io";
import '../styles/PortfolioPreview.css';
import EmptyPreviewState from './EmptyPreviewState';

const PortfolioPreview = ({ hasPortfolio, generatedHtml, isGenerating }) => {
  const iframeRef = useRef(null);
  const contentRef = useRef(null);

    const handleDownload = () => {
        if (generatedHtml) {
            const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
            saveAs(blob, 'portfolio.html');
        }
    };

    const handleOpenNewTab = () => {
        if (generatedHtml) {
            const newWindow = window.open();
            newWindow.document.body.innerHTML = generatedHtml;
        }
    };

  // Ensure iframe refreshes when HTML changes
  useEffect(() => {
    if (generatedHtml && contentRef.current !== generatedHtml) {
      contentRef.current = generatedHtml;
      console.log('HTML content changed, updating iframe');

      if (iframeRef.current) {
          // More reliable way to update iframe content
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
          iframeDoc.open();
          iframeDoc.write(generatedHtml);
          iframeDoc.close();
      }
    }
  }, [generatedHtml, hasPortfolio]);

  return (
    <div className="preview-window">
      <div className="preview-header-container">
        <h2 className="preview-title">Portfolio Preview</h2>
          {hasPortfolio && (
              <div className="button-group">
                  <button className="preview-button download-button" onClick={handleDownload} title="Download Portfolio">
                      <FaDownload /> Download
                  </button>
                  <button className="preview-button open-button" onClick={handleOpenNewTab} title="Open in New Tab">
                      <IoMdOpen /> Open
                  </button>
              </div>
          )}
      </div>

      {hasPortfolio && generatedHtml ? (
        <div className="preview-content"> {/* Use preview-content here */}
          <iframe
            ref={iframeRef}
            title="Portfolio Preview"
            width="100%"
            height="100%"
            frameBorder="0"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      ) : (
        <EmptyPreviewState isGenerating={isGenerating} />
      )}
    </div>
  );
};

export default PortfolioPreview;
