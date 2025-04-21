import React, { useState } from 'react';
import './App.css';
import Background from './components/Background';
import Banner from './components/Banner';
import ChatPortfolio from './components/ChatPortfolio';
import TeamPage from './components/TeamPage';

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
        return <ChatPortfolio />;
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