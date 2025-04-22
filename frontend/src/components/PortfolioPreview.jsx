import { saveAs } from 'file-saver';
import React, { useEffect, useRef } from 'react';
import { FaDownload } from "react-icons/fa";
import { IoMdOpen } from "react-icons/io";
import '../styles/PortfolioPreview.css';
import EmptyPreviewState from './EmptyPreviewState';

const PortfolioPreview = ({ hasPortfolio, generatedHtml, isGenerating, error }) => {
  const iframeRef = useRef(null);

  const handleDownload = () => {
    if (generatedHtml) {
      try {
        const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
        saveAs(blob, 'portfolio.html');
      } catch (err) {
        console.error('Error downloading portfolio:', err);
        alert('Failed to download portfolio. Please try again.');
      }
    }
  };

  const handleOpenNewTab = () => {
    if (generatedHtml) {
      try {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(generatedHtml);
          newWindow.document.close();
        } else {
          alert('Please allow pop-ups to open the portfolio in a new tab.');
        }
      } catch (err) {
        console.error('Error opening portfolio in new tab:', err);
        alert('Failed to open portfolio in new tab. Please try downloading instead.');
      }
    }
  };

  // Set iframe content when HTML changes
  useEffect(() => {
    if (generatedHtml && iframeRef.current && !isGenerating) {
      console.log('Updating iframe with new HTML content, length:', generatedHtml.length);
      
      try {
        // Method 1: Using contentDocument
        const iframeDoc = iframeRef.current.contentDocument || 
                         (iframeRef.current.contentWindow && iframeRef.current.contentWindow.document);
                         
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(generatedHtml);
          iframeDoc.close();
          console.log('Successfully updated iframe content');
        } else {
          throw new Error('Could not access iframe document');
        }
      } catch (err) {
        console.error('Error updating iframe with contentDocument:', err);
        
        try {
          // Method 2: Using srcdoc attribute
          iframeRef.current.srcdoc = generatedHtml;
          console.log('Used srcdoc fallback method');
        } catch (fallbackErr) {
          console.error('Both iframe update methods failed:', fallbackErr);
        }
      }
    }
  }, [generatedHtml, isGenerating]);

  return (
    <div className="preview-window">
      <div className="preview-header-container">
        <h2 className="preview-title">Portfolio Preview</h2>
        {hasPortfolio && !error && !isGenerating && (
          <div className="button-group">
            <button 
              className="preview-button download-button" 
              onClick={handleDownload} 
              title="Download Portfolio"
            >
              <FaDownload /> Download
            </button>
            <button 
              className="preview-button open-button" 
              onClick={handleOpenNewTab} 
              title="Open in New Tab"
            >
              <IoMdOpen /> Open
            </button>
          </div>
        )}
      </div>

      {error ? (
        <div className="preview-error">
          <p>{error}</p>
        </div>
      ) : isGenerating ? (
        <EmptyPreviewState isGenerating={isGenerating} />
      ) : hasPortfolio && generatedHtml ? (
        <div className="preview-content">
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