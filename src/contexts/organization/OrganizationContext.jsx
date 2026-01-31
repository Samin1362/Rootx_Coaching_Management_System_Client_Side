import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
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

// Polling interval in milliseconds (60 seconds)
const POLLING_INTERVAL = 60000;

export const OrganizationProvider = ({ children }) => {
  const { user, dbUser, isSuperAdmin, organizationId: authOrgId, dbUserLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [organization, setOrganization] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs to manage polling
  const pollingIntervalRef = useRef(null);
  const isPollingActiveRef = useRef(false);
  const subscriptionRef = useRef(subscription);
  const organizationRef = useRef(organization);

  // Keep refs in sync with state
  useEffect(() => {
    subscriptionRef.current = subscription;
    organizationRef.current = organization;
  }, [subscription, organization]);


  // Detect changes in subscription and notify user
  const detectSubscriptionChanges = useCallback((oldSub, newSub, oldOrg, newOrg) => {
    if (!oldSub || !newSub) return;

    const changes = [];

    // Detect tier/plan changes
    if (oldSub.tier !== newSub.tier) {
      changes.push({
        type: "plan",
        message: `Subscription plan changed from ${oldSub.tier} to ${newSub.tier}`,
        severity: "info",
      });
    }

    // Detect status changes
    if (oldSub.status !== newSub.status) {
      const severity = ["cancelled", "suspended", "expired"].includes(newSub.status)
        ? "warning"
        : "success";
      changes.push({
        type: "status",
        message: `Subscription status changed to ${newSub.status}`,
        severity,
      });
    }

    // Detect limit changes
    if (oldOrg?.limits && newOrg?.limits) {
      if (oldOrg.limits.maxStudents !== newOrg.limits.maxStudents) {
        changes.push({
          type: "limits",
          message: `Student limit updated to ${newOrg.limits.maxStudents === -1 ? "unlimited" : newOrg.limits.maxStudents}`,
          severity: "info",
        });
      }
    }

    // Show notifications for changes
    if (changes.length > 0 && typeof window !== "undefined") {
      changes.forEach((change) => {
        // Create a custom event that can be listened to by notification systems
        const event = new CustomEvent("subscription-updated", {
          detail: change,
        });
        window.dispatchEvent(event);
      });
    }

    return changes;
  }, []);

  const fetchOrganizationData = useCallback(async (orgId, isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      // Fetch organization and subscription in parallel
      const [orgResponse, subResponse] = await Promise.all([
        axiosSecure.get(`/organizations/${orgId}`).catch((err) => {
          throw new Error(`Failed to fetch organization: ${err.response?.data?.message || err.message}`);
        }),
        axiosSecure.get(`/subscriptions/organization/${orgId}`).catch((err) => {
          // 404 is acceptable (no subscription yet), other errors should be ignored
          if (err.response?.status === 404) {
            return { data: { data: null } };
          }
          return { data: { data: null } };
        }),
      ]);

      const newOrg = orgResponse.data.data;
      const newSub = subResponse?.data?.data || null;

      // Detect changes if this is a background refresh
      if (isBackgroundRefresh) {
        detectSubscriptionChanges(subscriptionRef.current, newSub, organizationRef.current, newOrg);
      }

      setOrganization(newOrg);
      setSubscription(newSub);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch organization data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [axiosSecure, detectSubscriptionChanges]);

  const refreshOrganization = useCallback(() => {
    if (user?.email && authOrgId && !isSuperAdmin) {
      fetchOrganizationData(authOrgId, false);
    }
  }, [user?.email, authOrgId, isSuperAdmin, fetchOrganizationData]);

  // Start polling for subscription updates
  const startPolling = useCallback(() => {
    if (isPollingActiveRef.current || !authOrgId || isSuperAdmin) return;

    isPollingActiveRef.current = true;
    pollingIntervalRef.current = setInterval(() => {
      // Only poll if page is visible
      if (!document.hidden && authOrgId) {
        fetchOrganizationData(authOrgId, true);
      }
    }, POLLING_INTERVAL);
  }, [authOrgId, isSuperAdmin, fetchOrganizationData]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      isPollingActiveRef.current = false;
    }
  }, []);

  // Effect to manage initial load and polling
  useEffect(() => {
    // Skip organization fetch for super admins - they don't have organizations
    if (isSuperAdmin) {
      setOrganization(null);
      setSubscription(null);
      setLoading(false);
      setError(null);
      stopPolling();
      return;
    }

    // No user logged in - reset state
    if (!user) {
      setOrganization(null);
      setSubscription(null);
      setLoading(false);
      setError(null);
      stopPolling();
      return;
    }

    // Wait for dbUser to be loaded before checking organization
    // This handles the race condition where user exists but dbUser is still loading
    if (dbUserLoading || !dbUser) {
      // Keep loading true while waiting for user data
      return;
    }

    // User is authenticated and dbUser is loaded
    if (authOrgId) {
      // User has an organization - fetch its data
      fetchOrganizationData(authOrgId, false);

      // Start polling after initial fetch (only if not already polling)
      if (!isPollingActiveRef.current) {
        const pollTimer = setTimeout(() => startPolling(), 5000);
        return () => clearTimeout(pollTimer);
      }
    } else {
      // User has no organization assigned
      setOrganization(null);
      setSubscription(null);
      setLoading(false);
      setError("No organization associated with this user");
      stopPolling();
    }
  }, [user, dbUser, isSuperAdmin, authOrgId, dbUserLoading, fetchOrganizationData, startPolling, stopPolling]);

  // Handle page visibility changes - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Immediately fetch when page becomes visible again
        if (authOrgId && !isSuperAdmin) {
          fetchOrganizationData(authOrgId, true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authOrgId, isSuperAdmin, fetchOrganizationData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const value = {
    organization,
    subscription,
    loading,
    error,
    refreshOrganization,
    organizationId: organization?._id,
    lastUpdate,
    isRefreshing,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContext;
