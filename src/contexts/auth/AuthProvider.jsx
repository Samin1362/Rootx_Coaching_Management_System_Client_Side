import React, { useState, useEffect, useCallback } from "react";
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
import axios from "axios";

// Base URL for API calls
const API_BASE_URL = "https://rootx-coaching-management-server-si.vercel.app";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null); // MongoDB user data
  const [loader, setLoader] = useState(true);
  const [dbUserLoading, setDbUserLoading] = useState(false);

  // Fetch user data from MongoDB
  const fetchDbUser = useCallback(async (email) => {
    if (!email) {
      setDbUser(null);
      return null;
    }

    try {
      setDbUserLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { "x-user-email": email },
      });

      if (response.data?.success && response.data?.data) {
        setDbUser(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching user data:", err);
      // Don't set error - user might not exist in DB yet (new signup)
      setDbUser(null);
      return null;
    } finally {
      setDbUserLoading(false);
    }
  }, []);

  // Register user with email and password
  const registerUser = (email, password) => {
    setLoader(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign in user with email and password
  const signInUser = async (email, password) => {
    setLoader(true);
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Fetch MongoDB user data after Firebase login
    const userData = await fetchDbUser(email);
    return { ...result, dbUser: userData };
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoader(true);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Fetch MongoDB user data after Google login
    if (result.user?.email) {
      const userData = await fetchDbUser(result.user.email);
      return { ...result, dbUser: userData };
    }
    return result;
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

  // Refresh DB user data
  const refreshDbUser = async () => {
    if (user?.email) {
      return await fetchDbUser(user.email);
    }
    return null;
  };

  // Logout user
  const logoutUser = () => {
    setLoader(true);
    setDbUser(null);
    return signOut(auth);
  };

  // Observer for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser?.email) {
        // Fetch MongoDB user data when auth state changes
        await fetchDbUser(currentUser.email);
      } else {
        setDbUser(null);
      }

      setLoader(false);
    });

    return () => unsubscribe();
  }, [fetchDbUser]);

  const authValue = {
    user,
    dbUser, // MongoDB user with role, isSuperAdmin, organizationId
    loader,
    dbUserLoading,
    registerUser,
    signInUser,
    signInWithGoogle,
    logoutUser,
    updateUserProfile,
    updateUser,
    refreshDbUser,
    // Helper properties for easy access
    isSuperAdmin: dbUser?.isSuperAdmin || dbUser?.role === "super_admin" || dbUser?.role === "super-admin",
    userRole: dbUser?.role,
    organizationId: dbUser?.organizationId,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
