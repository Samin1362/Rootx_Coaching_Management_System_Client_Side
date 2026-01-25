import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaChartLine,
  FaBuilding,
  FaUsers,
  FaCreditCard,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaDollarSign,
} from "react-icons/fa";

const PlatformAnalytics = () => {
  const axiosSecure = useAxiosSecure();
  const [timeRange, setTimeRange] = useState("month");

  // Fetch analytics data
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["super-admin-analytics", timeRange],
    queryFn: async () => {
      const response = await axiosSecure.get(`/super-admin/analytics?timeRange=${timeRange}`);
      return response.data.data;
    },
  });

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <div className="card bg-base-100 shadow-lg border border-base-300">
      <div className="card-body p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base-content/60 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
            {change !== undefined && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm ${
                  changeType === "increase" ? "text-success" : "text-error"
                }`}
              >
                {changeType === "increase" ? <FaArrowUp /> : <FaArrowDown />}
                <span>{Math.abs(change)}% vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-full ${color}`}>
            <Icon className="text-2xl text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading analytics: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaChartLine className="text-primary" />
            Platform Analytics
          </h1>
          <p className="text-base-content/60 mt-1">Track platform growth and performance</p>
        </div>
        <div className="flex gap-2">
          <select
            className="select select-bordered"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Organizations"
              value={analytics?.organizations?.total || 0}
              change={analytics?.organizations?.growthRate}
              changeType={analytics?.organizations?.growthRate >= 0 ? "increase" : "decrease"}
              icon={FaBuilding}
              color="bg-primary"
            />
            <StatCard
              title="Total Users"
              value={analytics?.users?.total || 0}
              change={analytics?.users?.growthRate}
              changeType={analytics?.users?.growthRate >= 0 ? "increase" : "decrease"}
              icon={FaUsers}
              color="bg-secondary"
            />
            <StatCard
              title="Active Subscriptions"
              value={analytics?.subscriptions?.active || 0}
              change={analytics?.subscriptions?.growthRate}
              changeType={analytics?.subscriptions?.growthRate >= 0 ? "increase" : "decrease"}
              icon={FaCreditCard}
              color="bg-accent"
            />
            <StatCard
              title="Revenue"
              value={`$${(analytics?.revenue?.total || 0).toLocaleString()}`}
              change={analytics?.revenue?.growthRate}
              changeType={analytics?.revenue?.growthRate >= 0 ? "increase" : "decrease"}
              icon={FaDollarSign}
              color="bg-success"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Chart Placeholder */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-lg">Organization Growth</h2>
                <div className="h-64 flex items-center justify-center bg-base-200 rounded-lg">
                  <div className="text-center">
                    <FaChartLine className="text-4xl text-base-content/30 mx-auto mb-2" />
                    <p className="text-base-content/60">
                      {analytics?.growth?.organizations?.length || 0} new organizations
                    </p>
                    <p className="text-sm text-base-content/40">in selected period</p>
                  </div>
                </div>
                {/* Growth List */}
                <div className="mt-4 space-y-2">
                  {analytics?.growth?.organizations?.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.date}</span>
                      <span className="font-medium">+{item.count} orgs</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Chart Placeholder */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-lg">Revenue Trend</h2>
                <div className="h-64 flex items-center justify-center bg-base-200 rounded-lg">
                  <div className="text-center">
                    <FaDollarSign className="text-4xl text-base-content/30 mx-auto mb-2" />
                    <p className="text-base-content/60">
                      ${(analytics?.revenue?.total || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-base-content/40">total revenue</p>
                  </div>
                </div>
                {/* Revenue Breakdown */}
                <div className="mt-4 space-y-2">
                  {analytics?.revenue?.breakdown?.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.date}</span>
                      <span className="font-medium text-success">+${item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Organization Status */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-lg">
                  <FaBuilding className="text-primary" /> Organizations by Status
                </h2>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-success">Active</span>
                    <span className="font-bold">{analytics?.organizations?.byStatus?.active || 0}</span>
                  </div>
                  <progress
                    className="progress progress-success"
                    value={analytics?.organizations?.byStatus?.active || 0}
                    max={analytics?.organizations?.total || 1}
                  ></progress>

                  <div className="flex items-center justify-between">
                    <span className="badge badge-warning">Trial</span>
                    <span className="font-bold">{analytics?.organizations?.byStatus?.trial || 0}</span>
                  </div>
                  <progress
                    className="progress progress-warning"
                    value={analytics?.organizations?.byStatus?.trial || 0}
                    max={analytics?.organizations?.total || 1}
                  ></progress>

                  <div className="flex items-center justify-between">
                    <span className="badge badge-error">Suspended</span>
                    <span className="font-bold">{analytics?.organizations?.byStatus?.suspended || 0}</span>
                  </div>
                  <progress
                    className="progress progress-error"
                    value={analytics?.organizations?.byStatus?.suspended || 0}
                    max={analytics?.organizations?.total || 1}
                  ></progress>
                </div>
              </div>
            </div>

            {/* Subscription Plans */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-lg">
                  <FaCreditCard className="text-primary" /> Subscriptions by Plan
                </h2>
                <div className="space-y-3 mt-4">
                  {analytics?.subscriptions?.byPlan?.map((plan, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{plan.name}</span>
                        <span className="badge badge-outline badge-sm">{plan.count}</span>
                      </div>
                      <progress
                        className="progress progress-primary"
                        value={plan.count}
                        max={analytics?.subscriptions?.total || 1}
                      ></progress>
                    </div>
                  )) || (
                    <p className="text-base-content/60 text-center py-4">No data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* User Roles */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-lg">
                  <FaUsers className="text-primary" /> Users by Role
                </h2>
                <div className="space-y-3 mt-4">
                  {analytics?.users?.byRole?.map((role, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{role.role?.replace("_", " ")}</span>
                        <span className="badge badge-outline badge-sm">{role.count}</span>
                      </div>
                      <progress
                        className="progress progress-secondary"
                        value={role.count}
                        max={analytics?.users?.total || 1}
                      ></progress>
                    </div>
                  )) || (
                    <p className="text-base-content/60 text-center py-4">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Top Organizations */}
          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">Top Organizations</h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Organization</th>
                      <th>Users</th>
                      <th>Students</th>
                      <th>Plan</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.topOrganizations?.length > 0 ? (
                      analytics.topOrganizations.map((org, index) => (
                        <tr key={org._id} className="hover">
                          <td>
                            <span className={`badge ${index < 3 ? "badge-primary" : "badge-ghost"}`}>
                              #{index + 1}
                            </span>
                          </td>
                          <td>
                            <div className="font-medium">{org.name}</div>
                          </td>
                          <td>{org.userCount || 0}</td>
                          <td>{org.studentCount || 0}</td>
                          <td>
                            <span className="badge badge-outline badge-sm">{org.planName || "N/A"}</span>
                          </td>
                          <td className="text-success font-medium">
                            ${(org.revenue || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-base-content/60">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlatformAnalytics;
