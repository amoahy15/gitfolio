import React, { useState } from 'react';
import Background from './components/Background';
import Banner from './components/Banner';
import TeamPage from './components/TeamPage';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('home');

  // Function to handle tab changes from Banner
  const handlePageChange = (page) => {
    setActivePage(page);
  };

  // Function to render the appropriate content based on activePage
  const renderContent = () => {
    switch (activePage) {
      case 'team':
        return <TeamPage />;
      case 'home':
        return <div className="home-content"></div>;
      case 'demo':
        return <div className="demo-content"></div>;
      case 'login':
        return <div className="login-content"></div>;
      default:
        return <div className="home-content"></div>;
    }
  };

  return (
    <div className="app">
      <Background />
      <Banner onTabChange={handlePageChange} activeTab={activePage} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;