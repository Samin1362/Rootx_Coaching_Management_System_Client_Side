import React, { createContext, useContext, useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const OrganizationContext = createContext();

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
};

export const OrganizationProvider = ({ children }) => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  
  const [organization, setOrganization] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.email) {
      fetchOrganizationData();
    } else {
      setOrganization(null);
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's organization from backend
      // The backend will return organization based on user's email
      const userResponse = await axiosSecure.get("/users/me");
      const userData = userResponse.data.data;

      if (userData?.organizationId) {
        // Fetch organization details
        const [orgResponse, subResponse] = await Promise.all([
          axiosSecure.get(`/organizations/${userData.organizationId}`),
          axiosSecure.get(`/subscriptions/${userData.organizationId}`).catch(() => null),
        ]);

        setOrganization(orgResponse.data.data);
        setSubscription(subResponse?.data?.data || null);
      }
    } catch (err) {
      console.error("Error fetching organization data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrganization = () => {
    if (user?.email) {
      fetchOrganizationData();
    }
  };

  const value = {
    organization,
    subscription,
    loading,
    error,
    refreshOrganization,
    organizationId: organization?._id,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContext;
