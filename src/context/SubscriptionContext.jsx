import React, { createContext } from 'react';

export const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children, state, dispatch, onApiConnect, apiReady }) => {
  return (
    <SubscriptionContext.Provider value={{ state, dispatch, onApiConnect, apiReady }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
