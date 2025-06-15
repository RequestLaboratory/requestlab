import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './homePage/Header';
import Hero from './homePage/Hero';
import Features from './homePage/Features';
import Stats from './homePage/Stats';
import Footer from './homePage/Footer';
import SignInModal from './homePage/SignInModal';

function HomePage() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignInClick = () => {
    setIsSignInModalOpen(true);
  };

  const handleCloseSignInModal = () => {
    setIsSignInModalOpen(false);
  };

  const handleGetStartedClick = () => {
    navigate('/api-testing');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header onSignInClick={handleSignInClick} />
      <Hero onGetStartedClick={handleGetStartedClick} />
      <Stats />
      <Features />
      <Footer />
      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={handleCloseSignInModal} 
      />
    </div>
  );
}

export default HomePage;