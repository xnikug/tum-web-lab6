import React, { createContext } from 'react';

export const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children, state, dispatch }) => {
  return (
    <SubscriptionContext.Provider value={{ state, dispatch }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
