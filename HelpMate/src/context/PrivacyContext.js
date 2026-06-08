import React, { createContext, useContext, useState } from 'react';

const PrivacyContext = createContext(null);

export function PrivacyProvider({ children }) {
  const [messagePrivacy, setMessagePrivacy] = useState('everyone'); // 'everyone' | 'friends_only'
  const [locationSettings, setLocationSettings] = useState({
    useLocationForMap: true,
    hideFromNearby: false,
  });

  const updateLocationSetting = (key, value) => {
    setLocationSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <PrivacyContext.Provider
      value={{
        messagePrivacy,
        setMessagePrivacy,
        locationSettings,
        updateLocationSetting,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
