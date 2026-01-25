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
  const { user, dbUser, isSuperAdmin, organizationId: authOrgId, dbUserLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [organization, setOrganization] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip organization fetch for super admins - they don't have organizations
    if (isSuperAdmin) {
      setOrganization(null);
      setSubscription(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Wait for dbUser to be loaded before checking organization
    if (dbUserLoading) {
      return;
    }

    if (user?.email && dbUser) {
      // Use organizationId from dbUser directly if available
      if (authOrgId) {
        fetchOrganizationData(authOrgId);
      } else {
        // No organization for this user
        setOrganization(null);
        setSubscription(null);
        setLoading(false);
        setError("No organization associated with this user");
      }
    } else if (!user) {
      setOrganization(null);
      setSubscription(null);
      setLoading(false);
      setError(null);
    }
  }, [user?.email, dbUser, isSuperAdmin, authOrgId, dbUserLoading]);

  const fetchOrganizationData = async (orgId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch organization and subscription in parallel
      const [orgResponse, subResponse] = await Promise.all([
        axiosSecure.get(`/organizations/${orgId}`).catch((err) => {
          console.error("Error fetching organization:", err);
          throw new Error(`Failed to fetch organization: ${err.response?.data?.message || err.message}`);
        }),
        axiosSecure.get(`/subscriptions/organization/${orgId}`).catch((err) => {
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
    } catch (err) {
      console.error("Error fetching organization data:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch organization data");
    } finally {
      setLoading(false);
    }
  };

  const refreshOrganization = () => {
    if (user?.email && authOrgId && !isSuperAdmin) {
      fetchOrganizationData(authOrgId);
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
