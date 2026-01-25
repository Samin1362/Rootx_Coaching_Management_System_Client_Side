import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaCog,
  FaSave,
  FaGlobe,
  FaEnvelope,
  FaShieldAlt,
  FaCreditCard,
  FaBell,
  FaDatabase,
  FaCheckCircle,
} from "react-icons/fa";

const PlatformSettings = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    general: {
      platformName: "",
      supportEmail: "",
      supportPhone: "",
      websiteUrl: "",
      defaultLanguage: "en",
      defaultTimezone: "UTC",
    },
    subscription: {
      defaultTrialDays: 14,
      allowTrialExtension: true,
      gracePeriodDays: 7,
      autoSuspendOnExpiry: true,
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireTwoFactor: false,
      allowedDomains: [],
    },
    email: {
      senderName: "",
      senderEmail: "",
      smtpHost: "",
      smtpPort: 587,
      enableEmailNotifications: true,
    },
    notifications: {
      notifyOnNewOrganization: true,
      notifyOnSubscriptionExpiry: true,
      notifyOnSuspension: true,
      adminEmailRecipients: [],
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["super-admin-settings"],
    queryFn: async () => {
      const response = await axiosSecure.get("/super-admin/settings");
      return response.data.data;
    },
  });

  // Update formData when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        general: { ...prev.general, ...settings.general },
        subscription: { ...prev.subscription, ...settings.subscription },
        security: { ...prev.security, ...settings.security },
        email: { ...prev.email, ...settings.email },
        notifications: { ...prev.notifications, ...settings.notifications },
      }));
    }
  }, [settings]);

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      return axiosSecure.put("/super-admin/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-settings"]);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const tabs = [
    { id: "general", label: "General", icon: FaGlobe },
    { id: "subscription", label: "Subscription", icon: FaCreditCard },
    { id: "security", label: "Security", icon: FaShieldAlt },
    { id: "email", label: "Email", icon: FaEnvelope },
    { id: "notifications", label: "Notifications", icon: FaBell },
  ];

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading settings: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaCog className="text-primary" />
            Platform Settings
          </h1>
          <p className="text-base-content/60 mt-1">Configure platform-wide settings</p>
        </div>
        <div className="flex gap-2 items-center">
          {saveSuccess && (
            <span className="text-success flex items-center gap-1">
              <FaCheckCircle /> Saved!
            </span>
          )}
          <button
            className="btn btn-primary btn-sm sm:btn-md"
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <FaSave className="mr-1" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-0">
            {/* Tabs */}
            <div className="tabs tabs-boxed bg-base-200 rounded-none rounded-t-2xl p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab gap-2 ${activeTab === tab.id ? "tab-active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="text-sm" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">General Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Platform Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={formData.general.platformName}
                        onChange={(e) => handleChange("general", "platformName", e.target.value)}
                        placeholder="Rootx Coaching"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Support Email</span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered"
                        value={formData.general.supportEmail}
                        onChange={(e) => handleChange("general", "supportEmail", e.target.value)}
                        placeholder="support@rootx.com"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Support Phone</span>
                      </label>
                      <input
                        type="tel"
                        className="input input-bordered"
                        value={formData.general.supportPhone}
                        onChange={(e) => handleChange("general", "supportPhone", e.target.value)}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Website URL</span>
                      </label>
                      <input
                        type="url"
                        className="input input-bordered"
                        value={formData.general.websiteUrl}
                        onChange={(e) => handleChange("general", "websiteUrl", e.target.value)}
                        placeholder="https://rootx.com"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Default Language</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={formData.general.defaultLanguage}
                        onChange={(e) => handleChange("general", "defaultLanguage", e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="bn">Bengali</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Default Timezone</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={formData.general.defaultTimezone}
                        onChange={(e) => handleChange("general", "defaultTimezone", e.target.value)}
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Asia/Kolkata">India</option>
                        <option value="Asia/Dhaka">Bangladesh</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Settings */}
              {activeTab === "subscription" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Subscription Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Default Trial Days</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        value={formData.subscription.defaultTrialDays}
                        onChange={(e) =>
                          handleChange("subscription", "defaultTrialDays", parseInt(e.target.value))
                        }
                        min="0"
                        max="90"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Grace Period Days</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        value={formData.subscription.gracePeriodDays}
                        onChange={(e) =>
                          handleChange("subscription", "gracePeriodDays", parseInt(e.target.value))
                        }
                        min="0"
                        max="30"
                      />
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">
                          Days after expiry before suspension
                        </span>
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={formData.subscription.allowTrialExtension}
                          onChange={(e) =>
                            handleChange("subscription", "allowTrialExtension", e.target.checked)
                          }
                        />
                        <span className="label-text">Allow Trial Extension</span>
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={formData.subscription.autoSuspendOnExpiry}
                          onChange={(e) =>
                            handleChange("subscription", "autoSuspendOnExpiry", e.target.checked)
                          }
                        />
                        <span className="label-text">Auto-suspend on Expiry</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Security Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Session Timeout (minutes)</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        value={formData.security.sessionTimeout}
                        onChange={(e) =>
                          handleChange("security", "sessionTimeout", parseInt(e.target.value))
                        }
                        min="5"
                        max="1440"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Max Login Attempts</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        value={formData.security.maxLoginAttempts}
                        onChange={(e) =>
                          handleChange("security", "maxLoginAttempts", parseInt(e.target.value))
                        }
                        min="3"
                        max="10"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Min Password Length</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        value={formData.security.passwordMinLength}
                        onChange={(e) =>
                          handleChange("security", "passwordMinLength", parseInt(e.target.value))
                        }
                        min="6"
                        max="32"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={formData.security.requireTwoFactor}
                          onChange={(e) =>
                            handleChange("security", "requireTwoFactor", e.target.checked)
                          }
                        />
                        <span className="label-text">Require Two-Factor Auth</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === "email" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Email Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Sender Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={formData.email.senderName}
                        onChange={(e) => handleChange("email", "senderName", e.target.value)}
                        placeholder="Rootx Coaching"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Sender Email</span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered"
                        value={formData.email.senderEmail}
                        onChange={(e) => handleChange("email", "senderEmail", e.target.value)}
                        placeholder="noreply@rootx.com"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">SMTP Host</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={formData.email.smtpHost}
                        onChange={(e) => handleChange("email", "smtpHost", e.target.value)}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">SMTP Port</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        value={formData.email.smtpPort}
                        onChange={(e) => handleChange("email", "smtpPort", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="form-control md:col-span-2">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={formData.email.enableEmailNotifications}
                          onChange={(e) =>
                            handleChange("email", "enableEmailNotifications", e.target.checked)
                          }
                        />
                        <span className="label-text">Enable Email Notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={formData.notifications.notifyOnNewOrganization}
                          onChange={(e) =>
                            handleChange("notifications", "notifyOnNewOrganization", e.target.checked)
                          }
                        />
                        <span className="label-text">Notify on New Organization Registration</span>
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={formData.notifications.notifyOnSubscriptionExpiry}
                          onChange={(e) =>
                            handleChange("notifications", "notifyOnSubscriptionExpiry", e.target.checked)
                          }
                        />
                        <span className="label-text">Notify on Subscription Expiry</span>
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={formData.notifications.notifyOnSuspension}
                          onChange={(e) =>
                            handleChange("notifications", "notifyOnSuspension", e.target.checked)
                          }
                        />
                        <span className="label-text">Notify on Organization Suspension</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformSettings;
