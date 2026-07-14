import React, { useEffect, useRef } from 'react';
import UgcAuthScreen from './ugc/UgcAuthScreen';
import UgcDashboard from './ugc/UgcDashboard';
import logicContent from './ugc-logic.js?raw';
import './UgcPortalPage.css';

export default function UgcPortalPage() {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;

      const scriptsToLoad = [
        '/legacy_shared/storage-manager.js',
        '/legacy_shared/file-security.js',
        '/legacy_shared/data.js',
        '/legacy_shared/sync.js',
        '/legacy_shared/api.js',
        '/legacy_shared/icons.js',
        '/legacy_shared/helpers.js',
        '/legacy_shared/datepicker.js',
        '/legacy_shared/security.js'
      ];

      let loadedCount = 0;
      
      const runLogic = () => {
        const script = document.createElement('script');
        script.id = 'ugc-logic-script';
        script.innerHTML = logicContent;
        document.body.appendChild(script);
      };

      const loadNext = () => {
        if (loadedCount >= scriptsToLoad.length) {
          runLogic();
          return;
        }
        
        const src = scriptsToLoad[loadedCount];
        // Check if already loaded
        if (document.querySelector(`script[src="${src}"]`)) {
          loadedCount++;
          loadNext();
          return;
        }

        const s = document.createElement('script');
        s.src = src;
        s.onload = () => {
          loadedCount++;
          loadNext();
        };
        document.head.appendChild(s);
      };

      loadNext();

      return () => {
        const script = document.getElementById('ugc-logic-script');
        if (script && document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  return (
    <div className="ugc-portal-root" dir="rtl">
      <UgcAuthScreen />
      <UgcDashboard />
      
      {/* Modal placeholder */}
      <div className="modal-backdrop" id="modal-backdrop">
        <div className="modal" id="modal-content"></div>
      </div>
    </div>
  );
}
