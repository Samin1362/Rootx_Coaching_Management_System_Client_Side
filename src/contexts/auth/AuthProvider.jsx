import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { API_BASE_URL } from "../../config/api";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null); // MongoDB user data
  const [loader, setLoader] = useState(true);
  const [dbUserLoading, setDbUserLoading] = useState(false);

  // Ref to track current dbUser for use in onAuthStateChanged callback
  const dbUserRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    dbUserRef.current = dbUser;
  }, [dbUser]);

  // Fetch user data from MongoDB
  const fetchDbUser = useCallback(async (email) => {
    if (!email) {
      setDbUser(null);
      setDbUserLoading(false);
      return null;
    }

    try {
      setDbUserLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { "x-user-email": email },
        timeout: 10000, // 10 second timeout to prevent hanging
      });

      if (response.data?.success && response.data?.data) {
        setDbUser(response.data.data);
        return response.data.data;
      }
      setDbUser(null);
      return null;
    } catch (err) {
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
    setDbUserLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user data immediately after successful login
      await fetchDbUser(email);
      setLoader(false);
      return result;
    } catch (error) {
      setLoader(false);
      setDbUserLoading(false);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoader(true);
    setDbUserLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Fetch user data immediately after successful login
      if (result.user?.email) {
        await fetchDbUser(result.user.email);
      }
      setLoader(false);
      return result;
    } catch (error) {
      setLoader(false);
      setDbUserLoading(false);
      throw error;
    }
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

  // Observer for auth state changes (handles initial load and session restoration)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser?.email) {
        // Only fetch if dbUser is not already set or email changed (avoid double-fetch after login)
        // This handles: initial app load, page refresh, session restoration
        const currentDbUser = dbUserRef.current;
        if (!currentDbUser || currentDbUser.email !== currentUser.email) {
          await fetchDbUser(currentUser.email);
        }
      } else {
        setDbUser(null);
        setDbUserLoading(false);
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
