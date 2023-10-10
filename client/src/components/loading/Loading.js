import React from 'react';
import './Loading.css';

function Loading({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className="loading-container">
      <div className="loading-icon">🔄</div>
    </div>
  );
}

export default Loading;
