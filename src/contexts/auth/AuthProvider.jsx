import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import auth from "../../firebase/firebase_config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loader, setLoader] = useState(true);

  // Register user with email and password
  const registerUser = (email, password) => {
    setLoader(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign in user with email and password
  const signInUser = (email, password) => {
    setLoader(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = () => {
    setLoader(true);
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Update user profile
  const updateUserProfile = (profile) => {
    return updateProfile(auth.currentUser, profile);
  };

  // Update user (name and/or photo)
  const updateUser = (displayName, photoURL) => {
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (photoURL !== undefined) updates.photoURL = photoURL;
    return updateProfile(auth.currentUser, updates);
  };

  // Logout user
  const logoutUser = () => {
    setLoader(true);
    return signOut(auth);
  };

  // Observer for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoader(false);
    });

    return () => unsubscribe();
  }, []);

  const authValue = {
    user,
    loader,
    registerUser,
    signInUser,
    signInWithGoogle,
    logoutUser,
    updateUserProfile,
    updateUser,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
