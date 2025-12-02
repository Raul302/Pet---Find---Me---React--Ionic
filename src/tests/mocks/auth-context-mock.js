const React = require('react');

exports.AuthContext = React.createContext({});
exports.AuthProvider = function AuthProvider({ children }) { return React.createElement(React.Fragment, null, children); };

module.exports = {
  AuthContext: exports.AuthContext,
  AuthProvider: exports.AuthProvider
};
