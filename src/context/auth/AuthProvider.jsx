import React, { useState } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const { user, setUser } = useState(null);

  const login = (userData) => {
    setUser(userData);
  }

  const authValue = {
    user,
    login
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
