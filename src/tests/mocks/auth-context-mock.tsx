import React from 'react';

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }: any) => {
  return React.createElement(React.Fragment, null, children);
};

export default { AuthContext, AuthProvider };
