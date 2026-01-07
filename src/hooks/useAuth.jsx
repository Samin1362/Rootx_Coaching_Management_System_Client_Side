import React, { use } from "react";
import AuthContext from "../contexts/auth/AuthContext";

const useAuth = () => {
  const authInfo = use(AuthContext);
  return authInfo;
};

export default useAuth;
