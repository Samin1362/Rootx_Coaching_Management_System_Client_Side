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
  }, [user?.email]);

  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's organization from backend
      // The backend will return organization based on user's email
      const userResponse = await axiosSecure.get("/users/me").catch(err => {
        if (err.response?.status === 401) {
          // This is expected if the user is logged into Firebase but not yet created in MongoDB
          // (e.g., during the signup process)
          return { data: { success: false, data: null } };
        }
        throw err;
      });
      const userData = userResponse.data?.data;

      if (userData?.organizationId) {
        // Fetch organization details
        const [orgResponse, subResponse] = await Promise.all([
          axiosSecure.get(`/organizations/${userData.organizationId}`).catch((err) => {
            console.error("Error fetching organization:", err);
            throw new Error(`Failed to fetch organization: ${err.response?.data?.message || err.message}`);
          }),
          axiosSecure.get(`/subscriptions/organization/${userData.organizationId}`).catch((err) => {
            // 404 is acceptable (no subscription yet), other errors should be logged
            if (err.response?.status === 404) {
              console.log("No subscription found for organization");
              return { data: { data: null } };
            }
            console.error("Error fetching subscription:", err);
            return { data: { data: null } };
          }),
        ]);

        setOrganization(orgResponse.data.data);
        setSubscription(subResponse?.data?.data || null);
      } else {
        setError("No organization associated with this user");
      }
    } catch (err) {
      console.error("Error fetching organization data:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch organization data");
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
