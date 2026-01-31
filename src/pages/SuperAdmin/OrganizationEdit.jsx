import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaBuilding,
  FaArrowLeft,
  FaSave,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCog,
  FaPalette,
  FaChartBar,
  FaCreditCard,
  FaInfoCircle,
} from "react-icons/fa";

const OrganizationEdit = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("basic");
  const [errors, setErrors] = useState({});

  // Default profile image
  const defaultProfileImage =
    "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

  // Fetch organization details
  const { data: organization, isLoading } = useQuery({
    queryKey: ["super-admin-organization", orgId],
    queryFn: async () => {
      const response = await axiosSecure.get(`/super-admin/organizations/${orgId}`);
      return response.data.data;
    },
  });

  // Fetch organization users
  const { data: usersData } = useQuery({
    queryKey: ["super-admin-organization-users", orgId],
    queryFn: async () => {
      const response = await axiosSecure.get(`/super-admin/organizations/${orgId}/users`);
      return response.data.data;
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zip: "",
    },
    status: "active",
    subscriptionTier: "free",
    subscriptionStatus: "trial",
    settings: {
      timezone: "Asia/Dhaka",
      currency: "BDT",
      language: "en",
      dateFormat: "DD/MM/YYYY",
      fiscalYearStart: "01-01",
    },
    branding: {
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      customDomain: "",
    },
    limits: {
      maxStudents: 50,
      maxBatches: 3,
      maxStaff: 2,
      maxStorage: 100,
      features: [],
    },
  });

  // Initialize form data when organization loads
  React.useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        slug: organization.slug || "",
        email: organization.email || "",
        phone: organization.phone || "",
        address: {
          street: organization.address?.street || "",
          city: organization.address?.city || "",
          state: organization.address?.state || "",
          country: organization.address?.country || "",
          zip: organization.address?.zip || "",
        },
        status: organization.status || "active",
        subscriptionTier: organization.subscriptionTier || "free",
        subscriptionStatus: organization.subscriptionStatus || "trial",
        settings: {
          timezone: organization.settings?.timezone || "Asia/Dhaka",
          currency: organization.settings?.currency || "BDT",
          language: organization.settings?.language || "en",
          dateFormat: organization.settings?.dateFormat || "DD/MM/YYYY",
          fiscalYearStart: organization.settings?.fiscalYearStart || "01-01",
        },
        branding: {
          primaryColor: organization.branding?.primaryColor || "#3B82F6",
          secondaryColor: organization.branding?.secondaryColor || "#10B981",
          customDomain: organization.branding?.customDomain || "",
        },
        limits: {
          maxStudents: organization.limits?.maxStudents || 50,
          maxBatches: organization.limits?.maxBatches || 3,
          maxStaff: organization.limits?.maxStaff || 2,
          maxStorage: organization.limits?.maxStorage || 100,
          features: organization.limits?.features || [],
        },
      });
    }
  }, [organization]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axiosSecure.patch(`/super-admin/organizations/${orgId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-organization", orgId]);
      queryClient.invalidateQueries(["super-admin-organizations"]);
      navigate(`/super-admin/organizations/${orgId}`);
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Organization name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: FaInfoCircle },
    { id: "settings", label: "Settings", icon: FaCog },
    { id: "branding", label: "Branding", icon: FaPalette },
    { id: "limits", label: "Limits & Features", icon: FaChartBar },
    { id: "subscription", label: "Subscription", icon: FaCreditCard },
    { id: "users", label: "Users", icon: FaUsers },
    { id: "data", label: "Organization Data", icon: FaChalkboardTeacher },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaBuilding className="text-primary" />
            Edit Organization
          </h1>
          <p className="text-base-content/60 mt-1">{organization?.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100 shadow border border-base-300 p-2">
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

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Organization Name *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input input-bordered ${errors.name ? "input-error" : ""}`}
                      placeholder="Enter organization name"
                    />
                    {errors.name && <span className="text-error text-sm mt-1">{errors.name}</span>}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Slug / Subdomain</span>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="organization-slug"
                      disabled
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Slug cannot be changed after creation
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Email *</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input input-bordered ${errors.email ? "input-error" : ""}`}
                      placeholder="organization@example.com"
                    />
                    {errors.email && <span className="text-error text-sm mt-1">{errors.email}</span>}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Phone</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="+880 1XXX-XXXXXX"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Status</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="select select-bordered"
                    >
                      <option value="active">Active</option>
                      <option value="trial">Trial</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="divider">Address</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">Street Address</span>
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">City</span>
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="City"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">State / Province</span>
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="State"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Country</span>
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="Country"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">ZIP / Postal Code</span>
                    </label>
                    <input
                      type="text"
                      name="address.zip"
                      value={formData.address.zip}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="ZIP code"
                    />
                  </div>
                </div>

                <div className="divider">Owner Information</div>

                <div className="alert alert-info">
                  <FaInfoCircle />
                  <div>
                    <p className="font-semibold">Owner: {organization?.owner?.name || "N/A"}</p>
                    <p className="text-sm">{organization?.owner?.email || "N/A"}</p>
                    <p className="text-xs mt-1">To change the owner, please use the user management section.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Organization Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Timezone</span>
                    </label>
                    <select
                      name="settings.timezone"
                      value={formData.settings.timezone}
                      onChange={handleChange}
                      className="select select-bordered"
                    >
                      <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                      <option value="Europe/London">Europe/London (GMT+0)</option>
                      <option value="America/New_York">America/New York (GMT-5)</option>
                      <option value="America/Los_Angeles">America/Los Angeles (GMT-8)</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Currency</span>
                    </label>
                    <select
                      name="settings.currency"
                      value={formData.settings.currency}
                      onChange={handleChange}
                      className="select select-bordered"
                    >
                      <option value="BDT">BDT - Bangladeshi Taka</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="AED">AED - UAE Dirham</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Language</span>
                    </label>
                    <select
                      name="settings.language"
                      value={formData.settings.language}
                      onChange={handleChange}
                      className="select select-bordered"
                    >
                      <option value="en">English</option>
                      <option value="bn">Bengali</option>
                      <option value="hi">Hindi</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Date Format</span>
                    </label>
                    <select
                      name="settings.dateFormat"
                      value={formData.settings.dateFormat}
                      onChange={handleChange}
                      className="select select-bordered"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Fiscal Year Start</span>
                    </label>
                    <input
                      type="text"
                      name="settings.fiscalYearStart"
                      value={formData.settings.fiscalYearStart}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="MM-DD (e.g., 01-01)"
                    />
                    <label className="label">
                      <span className="label-text-alt">Format: MM-DD (e.g., 01-01 for January 1st)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === "branding" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Branding & Customization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Primary Color</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        name="branding.primaryColor"
                        value={formData.branding.primaryColor}
                        onChange={handleChange}
                        className="w-16 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.branding.primaryColor}
                        onChange={(e) => handleChange({ target: { name: "branding.primaryColor", value: e.target.value } })}
                        className="input input-bordered flex-1"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Secondary Color</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        name="branding.secondaryColor"
                        value={formData.branding.secondaryColor}
                        onChange={handleChange}
                        className="w-16 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.branding.secondaryColor}
                        onChange={(e) => handleChange({ target: { name: "branding.secondaryColor", value: e.target.value } })}
                        className="input input-bordered flex-1"
                        placeholder="#10B981"
                      />
                    </div>
                  </div>

                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">Custom Domain</span>
                    </label>
                    <input
                      type="text"
                      name="branding.customDomain"
                      value={formData.branding.customDomain}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="custom.domain.com"
                    />
                    <label className="label">
                      <span className="label-text-alt">Optional: Use a custom domain instead of subdomain</span>
                    </label>
                  </div>
                </div>

                <div className="divider">Preview</div>

                <div className="p-4 rounded-lg border border-base-300" style={{ backgroundColor: formData.branding.primaryColor + "20" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: formData.branding.primaryColor }}
                    >
                      {formData.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold" style={{ color: formData.branding.primaryColor }}>{formData.name}</h4>
                      <p className="text-sm" style={{ color: formData.branding.secondaryColor }}>Sample preview text</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Limits Tab */}
            {activeTab === "limits" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resource Limits & Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Max Students</span>
                    </label>
                    <input
                      type="number"
                      name="limits.maxStudents"
                      value={formData.limits.maxStudents}
                      onChange={handleChange}
                      className="input input-bordered"
                      min="0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Max Batches</span>
                    </label>
                    <input
                      type="number"
                      name="limits.maxBatches"
                      value={formData.limits.maxBatches}
                      onChange={handleChange}
                      className="input input-bordered"
                      min="0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Max Staff</span>
                    </label>
                    <input
                      type="number"
                      name="limits.maxStaff"
                      value={formData.limits.maxStaff}
                      onChange={handleChange}
                      className="input input-bordered"
                      min="0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Max Storage (MB)</span>
                    </label>
                    <input
                      type="number"
                      name="limits.maxStorage"
                      value={formData.limits.maxStorage}
                      onChange={handleChange}
                      className="input input-bordered"
                      min="0"
                    />
                  </div>
                </div>

                <div className="divider">Current Usage</div>

                <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                  <div className="stat">
                    <div className="stat-title">Students</div>
                    <div className="stat-value text-2xl">{organization?.usage?.currentStudents || 0} / {formData.limits.maxStudents}</div>
                    <div className="stat-desc">
                      {((organization?.usage?.currentStudents || 0) / formData.limits.maxStudents * 100).toFixed(1)}% used
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-title">Batches</div>
                    <div className="stat-value text-2xl">{organization?.usage?.currentBatches || 0} / {formData.limits.maxBatches}</div>
                    <div className="stat-desc">
                      {((organization?.usage?.currentBatches || 0) / formData.limits.maxBatches * 100).toFixed(1)}% used
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-title">Staff</div>
                    <div className="stat-value text-2xl">{organization?.usage?.currentStaff || 0} / {formData.limits.maxStaff}</div>
                    <div className="stat-desc">
                      {((organization?.usage?.currentStaff || 0) / formData.limits.maxStaff * 100).toFixed(1)}% used
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === "subscription" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Subscription Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Subscription Tier</span>
                    </label>
                    <select
                      name="subscriptionTier"
                      value={formData.subscriptionTier}
                      onChange={handleChange}
                      className="select select-bordered"
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Subscription Status</span>
                    </label>
                    <select
                      name="subscriptionStatus"
                      value={formData.subscriptionStatus}
                      onChange={handleChange}
                      className="select select-bordered"
                    >
                      <option value="active">Active</option>
                      <option value="trial">Trial</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="divider">Current Subscription Details</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-title">Plan</div>
                    <div className="stat-value text-xl">{organization?.subscription?.planName || "N/A"}</div>
                  </div>

                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-title">Status</div>
                    <div className="stat-value text-xl">
                      <span className={`badge ${
                        organization?.subscription?.status === 'active' ? 'badge-success' :
                        organization?.subscription?.status === 'trial' ? 'badge-warning' :
                        'badge-ghost'
                      }`}>
                        {organization?.subscription?.status || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {organization?.subscription?.endDate && (
                  <div className="alert alert-warning">
                    <FaInfoCircle />
                    <div>
                      <p className="font-semibold">Subscription Expires: {new Date(organization.subscription.endDate).toLocaleDateString()}</p>
                      <p className="text-sm">Days remaining: {Math.ceil((new Date(organization.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Organization Users</h3>
                  <span className="badge badge-primary">{usersData?.users?.length || 0} users</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData?.users?.length > 0 ? (
                        usersData.users.map((user) => (
                          <tr key={user._id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="avatar">
                                  <div className="rounded-full w-10">
                                    <img
                                      src={user.photoURL || defaultProfileImage}
                                      alt={user.name}
                                      onError={(e) => {
                                        e.target.src = defaultProfileImage;
                                      }}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <div className="font-medium">{user.name || "N/A"}</div>
                                  <div className="text-sm text-base-content/60">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-outline">{user.role}</span>
                            </td>
                            <td>
                              <span className={`badge ${user.isActive ? 'badge-success' : 'badge-ghost'}`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-sm text-base-content/60">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-8 text-base-content/60">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="alert alert-info">
                  <FaInfoCircle />
                  <span>To add or remove users, use the User Management section or invite them from the organization settings.</span>
                </div>
              </div>
            )}

            {/* Organization Data Tab */}
            {activeTab === "data" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Organization Data Overview</h3>

                <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <FaUserGraduate className="text-3xl" />
                    </div>
                    <div className="stat-title">Total Students</div>
                    <div className="stat-value text-primary">{organization?.stats?.totalStudents || 0}</div>
                    <div className="stat-desc">All students in the organization</div>
                  </div>

                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <FaChalkboardTeacher className="text-3xl" />
                    </div>
                    <div className="stat-title">Total Batches</div>
                    <div className="stat-value text-secondary">{organization?.stats?.totalBatches || 0}</div>
                    <div className="stat-desc">All batches/classes</div>
                  </div>

                  <div className="stat">
                    <div className="stat-figure text-accent">
                      <FaUsers className="text-3xl" />
                    </div>
                    <div className="stat-title">Total Users</div>
                    <div className="stat-value text-accent">{organization?.stats?.totalUsers || 0}</div>
                    <div className="stat-desc">Staff and administrators</div>
                  </div>
                </div>

                <div className="divider">Data Management</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h4 className="card-title text-base">
                        <FaUserGraduate /> Students
                      </h4>
                      <p className="text-sm text-base-content/60">
                        Manage student records, admissions, and enrollments
                      </p>
                      <div className="card-actions justify-end">
                        <button className="btn btn-sm btn-outline" disabled>
                          View Students
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h4 className="card-title text-base">
                        <FaChalkboardTeacher /> Batches
                      </h4>
                      <p className="text-sm text-base-content/60">
                        Manage batches, classes, and schedules
                      </p>
                      <div className="card-actions justify-end">
                        <button className="btn btn-sm btn-outline" disabled>
                          View Batches
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-warning">
                  <FaInfoCircle />
                  <div>
                    <p className="font-semibold">Note</p>
                    <p className="text-sm">Student and batch management features will be available in future updates. Currently, you can only view the counts.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {updateMutation.isError && (
              <div className="alert alert-error mt-4">
                <span>{updateMutation.error?.response?.data?.message || "Failed to update organization"}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-6 border-t border-base-300">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-1" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrganizationEdit;
