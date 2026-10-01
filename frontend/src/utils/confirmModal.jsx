import React from 'react';
import { createRoot } from 'react-dom/client';

export const customConfirm = (message) => {
  return new Promise((resolve) => {
    // Create a host element for the modal
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const handleClose = (result) => {
      // Unmount the component and remove container from DOM
      root.unmount();
      container.remove();
      resolve(result);
    };

    root.render(
      <div className="custom-confirm-overlay">
        <div className="custom-confirm-modal">
          <p className="custom-confirm-message">{message}</p>
          <div className="custom-confirm-actions">
            <button className="custom-confirm-btn cancel" onClick={() => handleClose(false)}>
              Cancel
            </button>
            <button className="custom-confirm-btn ok" onClick={() => handleClose(true)}>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  });
};
