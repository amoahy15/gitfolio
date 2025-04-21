import React from 'react';
import '../styles/Banner.css';

const Banner = ({ onTabChange, activeTab }) => {
  const handleTabClick = (tab) => {
    onTabChange(tab);
  };

  return (
    <div className="banner">
      <div className="banner-container">
        <div className="logo">
          <h1>GitFolio</h1>
        </div>
        <div className="tabs">
          <ul className="tab-list">
            <li 
              className={`tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => handleTabClick('home')}
            >
              Home
            </li>
            <li 
              className={`tab ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => handleTabClick('team')}
            >
              Meet the Team
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Banner;