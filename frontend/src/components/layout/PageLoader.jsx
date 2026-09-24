import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PageLoader.css';

export default function PageLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // 500ms loader duration

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div className="wm-global-page-loader">
      <div className="wm-loader-spinner"></div>
    </div>
  );
}
