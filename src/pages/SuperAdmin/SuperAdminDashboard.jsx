import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaBuilding,
  FaUsers,
  FaCreditCard,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { Link } from "react-router";

const StatCard = ({ title, value, change, changeType, icon: Icon, color, link }) => {
  const Content = (
    <div className={`card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-all duration-300 ${link ? 'cursor-pointer hover:scale-[1.02]' : ''}`}>
      <div className="card-body p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base-content/60 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'increase' ? 'text-success' : 'text-error'}`}>
                {changeType === 'increase' ? <FaArrowUp /> : <FaArrowDown />}
                <span>{change}% from last month</span>
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

  if (link) {
    return <Link to={link}>{Content}</Link>;
  }
  return Content;
};

const RecentActivityItem = ({ action, target, user, time, type }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'create':
        return 'badge-success';
      case 'update':
        return 'badge-info';
      case 'delete':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateValue = date?.$date ? date.$date : date;
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-base-200/50 rounded-lg transition-colors">
      <div className={`badge ${getTypeStyles()} badge-sm`}>{type}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{action}</p>
        <p className="text-xs text-base-content/60 truncate">{target}</p>
      </div>
      <div className="text-right whitespace-nowrap">
        <p className="text-xs text-base-content/60">{user}</p>
        <p className="text-xs text-base-content/40">{formatDate(time)}</p>
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const axiosSecure = useAxiosSecure();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["super-admin-dashboard-stats"],
    queryFn: async () => {
      const response = await axiosSecure.get("/super-admin/dashboard/stats");
      return response.data.data;
    },
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["super-admin-recent-activity"],
    queryFn: async () => {
      const response = await axiosSecure.get("/super-admin/activity-logs?limit=10");
      return response.data.data?.logs || [];
    },
  });

  // Fetch expiring subscriptions
  const { data: expiringSubscriptions, isLoading: expiringLoading } = useQuery({
    queryKey: ["super-admin-expiring-subscriptions"],
    queryFn: async () => {
      const response = await axiosSecure.get("/super-admin/subscriptions/expiring?days=30&limit=5");
      return response.data.data || [];
    },
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-base-content/60 mt-1">Platform overview and statistics</p>
        </div>
        <div className="flex gap-2">
          <Link to="/super-admin/reports" className="btn btn-outline btn-sm">
            <FaChartLine className="mr-1" /> View Reports
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Organizations"
          value={stats?.organizations?.total || 0}
          change={stats?.organizations?.growthRate}
          changeType={stats?.organizations?.growthRate >= 0 ? 'increase' : 'decrease'}
          icon={FaBuilding}
          color="bg-primary"
          link="/super-admin/organizations"
        />
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          change={stats?.users?.growthRate}
          changeType={stats?.users?.growthRate >= 0 ? 'increase' : 'decrease'}
          icon={FaUsers}
          color="bg-secondary"
          link="/super-admin/users"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.subscriptions?.active || 0}
          icon={FaCreditCard}
          color="bg-accent"
          link="/super-admin/subscriptions"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats?.revenue?.monthly?.toLocaleString() || 0}`}
          change={stats?.revenue?.growthRate}
          changeType={stats?.revenue?.growthRate >= 0 ? 'increase' : 'decrease'}
          icon={FaChartLine}
          color="bg-success"
          link="/super-admin/analytics"
        />
      </div>

      {/* Organization Status & Subscription Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Organizations by Status */}
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-lg">Organizations by Status</h2>
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-success" />
                  <span>Active</span>
                </div>
                <span className="font-bold">{stats?.organizations?.active || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaClock className="text-warning" />
                  <span>Trial</span>
                </div>
                <span className="font-bold">{stats?.organizations?.trial || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-error/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="text-error" />
                  <span>Suspended</span>
                </div>
                <span className="font-bold">{stats?.organizations?.suspended || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Subscriptions */}
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-lg">Expiring Soon (30 days)</h2>
              <Link to="/super-admin/subscriptions?filter=expiring" className="btn btn-ghost btn-xs">
                View All
              </Link>
            </div>
            <div className="space-y-2 mt-4">
              {expiringLoading ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-sm"></span>
                </div>
              ) : expiringSubscriptions?.length > 0 ? (
                expiringSubscriptions.map((sub, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{sub.organizationName || 'Organization'}</p>
                      <p className="text-xs text-base-content/60">{sub.planName || 'Plan'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-warning font-medium">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-base-content/60 py-4">No subscriptions expiring soon</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title text-lg">Recent Activity</h2>
            <Link to="/super-admin/activity-logs" className="btn btn-ghost btn-xs">
              View All
            </Link>
          </div>
          <div className="space-y-1 mt-4">
            {activityLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : recentActivity?.length > 0 ? (
              recentActivity.slice(0, 10).map((activity, index) => (
                <RecentActivityItem
                  key={index}
                  action={activity.action}
                  target={activity.organization?.name || activity.resource || 'N/A'}
                  user={activity.user?.name || activity.userName || 'System'}
                  time={activity.createdAt || activity.timestamp}
                  type={activity.action?.includes('create') ? 'create' : activity.action?.includes('delete') ? 'delete' : 'update'}
                />
              ))
            ) : (
              <p className="text-center text-base-content/60 py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-lg">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <Link to="/super-admin/organizations/create" className="btn btn-outline btn-sm">
              <FaBuilding className="mr-1" /> New Organization
            </Link>
            <Link to="/super-admin/plans" className="btn btn-outline btn-sm">
              <FaCreditCard className="mr-1" /> Manage Plans
            </Link>
            <Link to="/super-admin/users" className="btn btn-outline btn-sm">
              <FaUsers className="mr-1" /> View Users
            </Link>
            <Link to="/super-admin/settings" className="btn btn-outline btn-sm">
              <FaChartLine className="mr-1" /> Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
