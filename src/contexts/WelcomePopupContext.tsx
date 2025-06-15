import React, { createContext, useContext, useState } from 'react';

interface WelcomePopupContextType {
  showWelcomePopup: boolean;
  setShowWelcomePopup: (show: boolean) => void;
}

const WelcomePopupContext = createContext<WelcomePopupContextType | undefined>(undefined);

export function WelcomePopupProvider({ children }: { children: React.ReactNode }) {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  return (
    <WelcomePopupContext.Provider value={{ showWelcomePopup, setShowWelcomePopup }}>
      {children}
    </WelcomePopupContext.Provider>
  );
}

export function useWelcomePopup() {
  const context = useContext(WelcomePopupContext);
  if (context === undefined) {
    throw new Error('useWelcomePopup must be used within a WelcomePopupProvider');
  }
  return context;
} 