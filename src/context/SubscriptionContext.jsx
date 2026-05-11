import React, { createContext } from 'react';

export const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children, state, dispatch, apiStatus, onApiConnect, onApiDisconnect }) => {
  return (
    <SubscriptionContext.Provider value={{ state, dispatch, apiStatus, onApiConnect, onApiDisconnect }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
