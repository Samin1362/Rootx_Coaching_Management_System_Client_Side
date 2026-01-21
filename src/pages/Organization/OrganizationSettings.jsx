import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaPalette,
  FaSave,
  FaMapMarkerAlt,
  FaCog,
} from "react-icons/fa";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useOrganization } from "../../contexts/organization";

const OrganizationSettings = () => {
  const axiosSecure = useAxiosSecure();
  const { organization: orgData, refreshOrganization } = useOrganization();
  
  // const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    settings: {
      timezone: "Asia/Dhaka",
      currency: "BDT",
      language: "en",
      dateFormat: "DD/MM/YYYY",
    },
    branding: {
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
    },
  });

  useEffect(() => {
    if (orgData) {
      setFormData({
        name: orgData.name || "",
        email: orgData.email || "",
        phone: orgData.phone || "",
        address: orgData.address || formData.address,
        settings: orgData.settings || formData.settings,
        branding: orgData.branding || formData.branding,
      });
    }
  }, [orgData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!orgData?._id) {
        alert("Organization ID not found. Please try again.");
        setSaving(false);
        return;
      }

      await axiosSecure.patch(`/organizations/${orgData._id}`, formData);

      // Refresh organization data
      if (refreshOrganization) {
        await refreshOrganization();
      }

      // Show success message
      alert("Organization settings updated successfully!");
    } catch (error) {
      console.error("Error updating organization:", error);
      alert("Failed to update settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <span className="loading loading-spinner loading-lg text-primary"></span>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
          <FaCog className="text-primary" />
          Organization Settings
        </h1>
        <p className="text-base-content/60 mt-1">
          Manage your organization's information and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 flex items-center gap-2">
              <FaBuilding className="text-primary" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organization Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Organization Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>

              {/* Phone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Phone</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>

              {/* Slug (Read-only) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Organization Slug</span>
                </label>
                <input
                  type="text"
                  value={orgData?.slug || ""}
                  className="input input-bordered"
                  disabled
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Cannot be changed
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary" />
              Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Street */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Street Address</span>
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>

              {/* City */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">City</span>
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>

              {/* State */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">State/Province</span>
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>

              {/* Country */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Country</span>
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>

              {/* Zip Code */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Zip/Postal Code</span>
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 flex items-center gap-2">
              <FaGlobe className="text-primary" />
              Preferences
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Timezone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Timezone</span>
                </label>
                <select
                  name="settings.timezone"
                  value={formData.settings.timezone}
                  onChange={handleChange}
                  className="select select-bordered"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="America/New_York">America/New York (GMT-5)</option>
                </select>
              </div>

              {/* Currency */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Currency</span>
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
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              {/* Language */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Language</span>
                </label>
                <select
                  name="settings.language"
                  value={formData.settings.language}
                  onChange={handleChange}
                  className="select select-bordered"
                >
                  <option value="en">English</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>

              {/* Date Format */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Date Format</span>
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
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 flex items-center gap-2">
              <FaPalette className="text-primary" />
              Branding
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Color */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Primary Color</span>
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
                    onChange={handleChange}
                    name="branding.primaryColor"
                    className="input input-bordered flex-1"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Secondary Color</span>
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
                    onChange={handleChange}
                    name="branding.secondaryColor"
                    className="input input-bordered flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => refreshOrganization && refreshOrganization()}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary text-white shadow-lg hover:shadow-xl"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationSettings;
