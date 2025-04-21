import React, { useEffect, useRef } from 'react';
import '../styles/PortfolioPreview.css';
import EmptyPreviewState from './EmptyPreviewState';

const PortfolioPreview = ({ hasPortfolio, generatedHtml, isGenerating }) => {
  const iframeRef = useRef(null);
  const contentRef = useRef(null);

  // Ensure iframe refreshes when HTML changes
  useEffect(() => {
    // If the content is different from what we last stored, update the iframe
    if (generatedHtml && contentRef.current !== generatedHtml) {
      contentRef.current = generatedHtml;
      console.log('HTML content changed, updating iframe');
      
      if (iframeRef.current) {
        // Try a more direct approach to update the iframe
        try {
          const iframe = iframeRef.current;
          
          // Method 1: Set srcdoc directly
          iframe.srcdoc = generatedHtml;
          
          // Method 2: For some browsers, also try to access the document and write to it
          // This can sometimes work when srcdoc updates aren't reflected
          setTimeout(() => {
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
              iframeDoc.open();
              iframeDoc.write(generatedHtml);
              iframeDoc.close();
              console.log('Successfully updated iframe content via document.write');
            } catch (e) {
              console.log('Could not access iframe document, relying on srcdoc update');
            }
          }, 100);
        } catch (err) {
          console.error('Error updating iframe:', err);
        }
      }
    }
  }, [generatedHtml, hasPortfolio]);

  return (
    <div className="preview-window">
      <div className="preview-header-container">
        <h2 className="preview-title">Portfolio Preview</h2>
      </div>

      {hasPortfolio && generatedHtml ? (
        <div className="iframe-container" style={{ width: '100%', height: '100%' }}>
          <iframe
            ref={iframeRef}
            title="Portfolio Preview"
            srcDoc={generatedHtml}
            width="100%"
            height="100%"
            sandbox="allow-same-origin allow-scripts"
            frameBorder="0"
          ></iframe>
        </div>
      ) : (
        <EmptyPreviewState isGenerating={isGenerating} />
      )}
    </div>
  );
};

export default PortfolioPreview;