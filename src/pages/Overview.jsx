import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaDollarSign,
  FaCalendarCheck,
  FaTrophy,
  FaUsers,
  FaChartLine,
  FaClipboardList,
  FaMoneyBillWave,
  FaGraduationCap,
} from "react-icons/fa";
import {
  MdTrendingUp,
  MdTrendingDown,
  MdSchool,
  MdPeople,
  MdEventAvailable,
} from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";
import { BiSolidDashboard } from "react-icons/bi";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Loader from "../components/Loader";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100 p-4 rounded-xl shadow-2xl border-2 border-primary/20">
        <p className="font-bold text-base-content mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="text-sm font-semibold"
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Overview = () => {
  const axiosSecure = useAxiosSecure();
  const { t } = useTranslation(['overview', 'common']);

  // Fetch all data
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["allStudents"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students?limit=1000");
      return res.data.data || [];
    },
  });

  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ["allBatches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches?limit=1000");
      return res.data.data || [];
    },
  });

  const { data: admissions = [], isLoading: admissionsLoading } = useQuery({
    queryKey: ["allAdmissions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admissions?limit=1000");
      return res.data.data || [];
    },
  });

  const { data: fees = [], isLoading: feesLoading } = useQuery({
    queryKey: ["allFees"],
    queryFn: async () => {
      const res = await axiosSecure.get("/fees?limit=1000");
      return res.data.data || [];
    },
  });

  const { data: attendances = [], isLoading: attendancesLoading } = useQuery({
    queryKey: ["allAttendances"],
    queryFn: async () => {
      const res = await axiosSecure.get("/attendences?limit=1000");
      return res.data.data || [];
    },
  });

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["allExams"],
    queryFn: async () => {
      const res = await axiosSecure.get("/exams");
      return res.data?.data || [];
    },
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["allResults"],
    queryFn: async () => {
      const res = await axiosSecure.get("/results?limit=1000");
      return res.data?.data || [];
    },
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["allExpenses"],
    queryFn: async () => {
      const res = await axiosSecure.get("/expenses?limit=1000");
      return res.data.data || [];
    },
  });

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    // Student Statistics
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === "active").length;
    const maleStudents = students.filter((s) => s.gender === "Male").length;
    const femaleStudents = students.filter((s) => s.gender === "Female").length;

    // Batch Statistics
    const totalBatches = batches.length;
    const activeBatches = batches.filter((b) => b.status === "active").length;
    const completedBatches = batches.filter(
      (b) => b.status === "completed"
    ).length;

    // Admission Statistics
    const totalAdmissions = admissions.length;
    const inquiryAdmissions = admissions.filter(
      (a) => a.status === "inquiry"
    ).length;
    const followUpAdmissions = admissions.filter(
      (a) => a.status === "follow-up"
    ).length;
    const enrolledAdmissions = admissions.filter(
      (a) => a.status === "enrolled"
    ).length;

    // Financial Statistics
    const totalFees = fees.reduce((sum, f) => sum + (f.fees || 0), 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalDue = fees.reduce((sum, f) => sum + f.dueAmount, 0);
    const collectionRate =
      totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(2) : 0;
    const clearFees = fees.filter((f) => f.status === "clear").length;
    const dueFees = fees.filter((f) => f.status === "due").length;

    // Expense Statistics
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalPaid - totalExpenses;
    const profitMargin = totalPaid > 0 ? ((profit / totalPaid) * 100).toFixed(2) : 0;

    // Expense by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category || "Other";
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {});

    const expenseCategoryData = Object.entries(expensesByCategory).map(
      ([category, amount]) => ({
        category,
        amount,
      })
    );

    // Attendance Statistics
    const totalAttendanceSessions = attendances.length;
    const totalAttendanceRecords = attendances.reduce(
      (sum, a) => sum + a.records.length,
      0
    );
    const totalPresent = attendances.reduce(
      (sum, a) => sum + a.records.filter((r) => r.status === "present").length,
      0
    );
    const attendanceRate =
      totalAttendanceRecords > 0
        ? ((totalPresent / totalAttendanceRecords) * 100).toFixed(2)
        : 0;

    // Exam & Results Statistics
    const totalExams = exams.length;
    const upcomingExams = exams.filter(
      (e) => new Date(e.date) > new Date()
    ).length;
    const completedExams = exams.filter(
      (e) => new Date(e.date) <= new Date()
    ).length;
    const totalResults = results.length;
    const averageMarks =
      results.length > 0
        ? (
            results.reduce((sum, r) => sum + Number(r.marks), 0) /
            results.length
          ).toFixed(2)
        : 0;

    // Student Growth (Last 6 months)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const monthStudents = students.filter((s) => {
        const admissionDate = new Date(s.admissionDate);
        return (
          admissionDate.getMonth() === date.getMonth() &&
          admissionDate.getFullYear() === date.getFullYear()
        );
      }).length;
      last6Months.push({
        month: monthName,
        students: monthStudents,
      });
    }

    // Revenue Trend (Last 6 months)
    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const monthRevenue = fees
        .filter((f) => {
          const createdDate = new Date(f.createdAt);
          return (
            createdDate.getMonth() === date.getMonth() &&
            createdDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, f) => sum + f.paidAmount, 0);
      revenueTrend.push({
        month: monthName,
        revenue: monthRevenue,
      });
    }

    // Batch Distribution by Course
    const courseDistribution = {};
    batches.forEach((b) => {
      courseDistribution[b.course] = (courseDistribution[b.course] || 0) + 1;
    });
    const batchByCourse = Object.entries(courseDistribution).map(
      ([course, count]) => ({
        course,
        count,
      })
    );

    // Student Status Distribution
    const studentStatusData = [
      { name: "Active", value: activeStudents, color: "#10b981" },
      {
        name: "Inactive",
        value: totalStudents - activeStudents,
        color: "#ef4444",
      },
    ];

    // Admission Funnel
    const admissionFunnel = [
      { stage: "Inquiry", count: inquiryAdmissions, percentage: 100 },
      {
        stage: "Follow-up",
        count: followUpAdmissions,
        percentage: totalAdmissions
          ? ((followUpAdmissions / totalAdmissions) * 100).toFixed(0)
          : 0,
      },
      {
        stage: "Enrolled",
        count: enrolledAdmissions,
        percentage: totalAdmissions
          ? ((enrolledAdmissions / totalAdmissions) * 100).toFixed(0)
          : 0,
      },
    ];

    // Gender Distribution
    const genderData = [
      { name: "Male", value: maleStudents, color: "#3b82f6" },
      { name: "Female", value: femaleStudents, color: "#ec4899" },
    ];

    // Payment Method Distribution
    const paymentMethods = {};
    fees.forEach((f) => {
      if (f.paymentMethod) {
        paymentMethods[f.paymentMethod] =
          (paymentMethods[f.paymentMethod] || 0) + 1;
      }
    });
    const paymentMethodData = Object.entries(paymentMethods).map(
      ([method, count]) => ({
        method: method.charAt(0).toUpperCase() + method.slice(1),
        count,
      })
    );

    // Weekly Attendance Trend (Last 4 weeks)
    const weeklyAttendance = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekLabel = `Week ${4 - i}`;
      const weekAttendances = attendances.filter((a) => {
        const attDate = new Date(a.date);
        return attDate >= weekStart && attDate <= weekEnd;
      });

      const weekPresent = weekAttendances.reduce(
        (sum, a) =>
          sum + a.records.filter((r) => r.status === "present").length,
        0
      );
      const weekTotal = weekAttendances.reduce(
        (sum, a) => sum + a.records.length,
        0
      );
      const weekRate =
        weekTotal > 0 ? ((weekPresent / weekTotal) * 100).toFixed(1) : 0;

      weeklyAttendance.push({
        week: weekLabel,
        rate: parseFloat(weekRate),
      });
    }

    return {
      // Main Stats
      totalStudents,
      activeStudents,
      totalBatches,
      activeBatches,
      completedBatches,
      totalAdmissions,
      inquiryAdmissions,
      followUpAdmissions,
      enrolledAdmissions,
      totalFees,
      totalPaid,
      totalDue,
      collectionRate,
      clearFees,
      dueFees,
      totalAttendanceSessions,
      attendanceRate,
      totalExams,
      upcomingExams,
      completedExams,
      totalResults,
      averageMarks,
      maleStudents,
      femaleStudents,
      totalExpenses,
      profit,
      profitMargin,

      // Chart Data
      studentGrowth: last6Months,
      revenueTrend,
      batchByCourse,
      studentStatusData,
      admissionFunnel,
      genderData,
      paymentMethodData,
      weeklyAttendance,
      expenseCategoryData,
    };
  }, [students, batches, admissions, fees, attendances, exams, results, expenses]);

  const isLoading =
    studentsLoading ||
    batchesLoading ||
    admissionsLoading ||
    feesLoading ||
    attendancesLoading ||
    examsLoading ||
    resultsLoading ||
    expensesLoading;

  if (isLoading) {
    return <Loader message={t('common:loadingData')} />;
  }

  const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="bg-linear-to-br from-primary via-secondary to-accent rounded-3xl p-8 shadow-2xl border border-base-300">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <BiSolidDashboard className="text-white text-3xl" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t('overview:welcomeTitle')}
            </h1>
            <p className="text-white/90 text-lg">
              {t('overview:welcomeSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="stats shadow-xl bg-linear-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="stat">
            <div className="stat-figure text-white/80">
              <FaUserGraduate className="text-4xl" />
            </div>
            <div className="stat-title text-white/80 text-sm">
              {t('overview:totalStudents')}
            </div>
            <div className="stat-value text-white text-3xl">
              {analytics.totalStudents}
            </div>
            <div className="stat-desc text-white/70 flex items-center gap-1">
              <MdTrendingUp className="text-lg" />
              {analytics.activeStudents} {t('overview:activeStudents')}
            </div>
          </div>
        </div>

        {/* Active Batches */}
        <div className="stats shadow-xl bg-linear-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="stat">
            <div className="stat-figure text-white/80">
              <FaChalkboardTeacher className="text-4xl" />
            </div>
            <div className="stat-title text-white/80 text-sm">
              {t('overview:activeBatches')}
            </div>
            <div className="stat-value text-white text-3xl">
              {analytics.activeBatches}
            </div>
            <div className="stat-desc text-white/70">
              {analytics.totalBatches} {t('overview:totalBatches')}
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="stats shadow-xl bg-linear-to-br from-green-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="stat">
            <div className="stat-figure text-white/80">
              <TbCurrencyTaka className="text-4xl" />
            </div>
            <div className="stat-title text-white/80 text-sm">
              {t('overview:totalCollected')}
            </div>
            <div className="stat-value text-white text-2xl">
              ৳{analytics.totalPaid.toLocaleString()}
            </div>
            <div className="stat-desc text-white/70 flex items-center gap-1">
              {analytics.collectionRate}% {t('overview:collectionRate')}
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="stats shadow-xl bg-linear-to-br from-orange-500 to-orange-600 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="stat">
            <div className="stat-figure text-white/80">
              <FaCalendarCheck className="text-4xl" />
            </div>
            <div className="stat-title text-white/80 text-sm">
              {t('overview:attendanceRate')}
            </div>
            <div className="stat-value text-white text-3xl">
              {analytics.attendanceRate}%
            </div>
            <div className="stat-desc text-white/70">
              {analytics.totalAttendanceSessions} {t('overview:sessions')}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Admissions */}
        <div className="stats shadow-md bg-base-100 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="stat py-3 px-4">
            <div className="stat-figure text-primary">
              <MdPeople className="text-2xl" />
            </div>
            <div className="stat-title text-xs">{t('overview:admissions')}</div>
            <div className="stat-value text-primary text-xl">
              {analytics.totalAdmissions}
            </div>
          </div>
        </div>

        {/* Enrolled */}
        <div className="stats shadow-md bg-base-100 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="stat py-3 px-4">
            <div className="stat-figure text-success">
              <FaGraduationCap className="text-2xl" />
            </div>
            <div className="stat-title text-xs">{t('overview:enrolled')}</div>
            <div className="stat-value text-success text-xl">
              {analytics.enrolledAdmissions}
            </div>
          </div>
        </div>

        {/* Total Exams */}
        <div className="stats shadow-md bg-base-100 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="stat py-3 px-4">
            <div className="stat-figure text-secondary">
              <FaClipboardList className="text-2xl" />
            </div>
            <div className="stat-title text-xs">{t('overview:totalExams')}</div>
            <div className="stat-value text-secondary text-xl">
              {analytics.totalExams}
            </div>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="stats shadow-md bg-base-100 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="stat py-3 px-4">
            <div className="stat-figure text-warning">
              <MdEventAvailable className="text-2xl" />
            </div>
            <div className="stat-title text-xs">{t('overview:upcoming')}</div>
            <div className="stat-value text-warning text-xl">
              {analytics.upcomingExams}
            </div>
          </div>
        </div>

        {/* Average Marks */}
        <div className="stats shadow-md bg-base-100 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="stat py-3 px-4">
            <div className="stat-figure text-info">
              <FaTrophy className="text-2xl" />
            </div>
            <div className="stat-title text-xs">{t('overview:avgMarks')}</div>
            <div className="stat-value text-info text-xl">
              {analytics.averageMarks}
            </div>
          </div>
        </div>

        {/* Total Due */}
        <div className="stats shadow-md bg-base-100 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="stat py-3 px-4">
            <div className="stat-figure text-error">
              <FaMoneyBillWave className="text-2xl" />
            </div>
            <div className="stat-title text-xs">{t('overview:totalDue')}</div>
            <div className="stat-value text-error text-xl">
              ৳{analytics.totalDue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview Section */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
            <TbCurrencyTaka className="text-3xl text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-base-content">
              {t('overview:financialOverview')}
            </h2>
            <p className="text-sm text-base-content/60">
              {t('overview:comprehensiveRevenueStats')}
            </p>
          </div>
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Fees */}
          <div className="bg-base-100 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-base-content">
                {t('overview:totalFees')}
              </span>
              <MdSchool className="text-blue-600 dark:text-blue-400 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-base-content">
              ৳{analytics.totalFees.toLocaleString()}
            </div>
            <div className="text-xs text-base-content/70 mt-1">
              {t('overview:fromStudents', { count: fees.length })}
            </div>
          </div>

          {/* Total Collected */}
          <div className="bg-base-100 rounded-xl p-4 border-2 border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-base-content">
                {t('overview:collected')}
              </span>
              <MdTrendingUp className="text-green-600 dark:text-green-400 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-base-content">
              ৳{analytics.totalPaid.toLocaleString()}
            </div>
            <div className="text-xs text-base-content/70 mt-1">
              {t('overview:clearedPayments', { count: analytics.clearFees })}
            </div>
          </div>

          {/* Total Due */}
          <div className="bg-base-100 rounded-xl p-4 border-2 border-red-200 dark:border-red-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-base-content">
                {t('overview:pending')}
              </span>
              <MdTrendingDown className="text-red-600 dark:text-red-400 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-base-content">
              ৳{analytics.totalDue.toLocaleString()}
            </div>
            <div className="text-xs text-base-content/70 mt-1">
              {t('overview:pendingPayments', { count: analytics.dueFees })}
            </div>
          </div>

          {/* Collection Rate */}
          <div className="bg-base-100 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-base-content">
                {t('overview:collectionRate')}
              </span>
              <FaTrophy className="text-purple-600 dark:text-purple-400 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-base-content">
              {analytics.collectionRate}%
            </div>
            <div className="text-xs text-base-content/70 mt-1">
              {analytics.collectionRate >= 75 ? t('overview:excellent') : t('overview:needsAttention')}
            </div>
          </div>
        </div>

        {/* Expenses & Profit Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Total Expenses */}
          <div className="bg-base-100 rounded-xl p-4 shadow-md border-2 border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-base-content">
                Total Expenses
              </span>
              <div className="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center">
                <MdTrendingDown className="text-error text-lg" />
              </div>
            </div>
            <p className="text-3xl font-bold text-error">
              ৳{analytics.totalExpenses.toLocaleString()}
            </p>
            <p className="text-xs text-base-content/70 mt-1">
              {expenses.length} expense records
            </p>
          </div>

          {/* Net Profit */}
          <div className={`bg-base-100 rounded-xl p-4 shadow-md border-2 ${
            analytics.profit >= 0 ? 'border-primary' : 'border-error'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-base-content">
                Net Profit
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                analytics.profit >= 0 ? 'bg-primary/10' : 'bg-error/10'
              }`}>
                {analytics.profit >= 0 ? (
                  <MdTrendingUp className="text-primary text-lg" />
                ) : (
                  <MdTrendingDown className="text-error text-lg" />
                )}
              </div>
            </div>
            <p className={`text-3xl font-bold ${
              analytics.profit >= 0 ? 'text-primary' : 'text-error'
            }`}>
              ৳{analytics.profit.toLocaleString()}
            </p>
            <p className="text-xs text-base-content/70 mt-1">
              {analytics.profitMargin}% profit margin
            </p>
          </div>
        </div>

        {/* Financial Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Expenses Bar Chart */}
          <div className="bg-base-100 rounded-xl p-4 shadow-md border border-base-300">
            <h3 className="text-lg font-semibold text-base-content mb-4">
              Revenue vs Expenses
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  {
                    name: "Financial Summary",
                    Revenue: analytics.totalPaid,
                    Expenses: analytics.totalExpenses,
                    Profit: analytics.profit >= 0 ? analytics.profit : 0,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" style={{ fontSize: "12px" }} />
                <YAxis stroke="#888" style={{ fontSize: "12px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Profit" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expenses by Category Pie Chart */}
          <div className="bg-base-100 rounded-xl p-4 shadow-md border border-base-300">
            <h3 className="text-lg font-semibold text-base-content mb-4">
              Expenses by Category
            </h3>
            {analytics.expenseCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.expenseCategoryData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, percent }) =>
                      `${category} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {analytics.expenseCategoryData.map((entry, index) => {
                      const colors = [
                        "#3b82f6",
                        "#ef4444",
                        "#10b981",
                        "#f59e0b",
                        "#8b5cf6",
                        "#ec4899",
                        "#06b6d4",
                        "#84cc16",
                      ];
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-base-content/60">
                <div className="text-center">
                  <FaMoneyBillWave className="text-4xl mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No expense data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Growth Trend */}
        <div className="bg-base-100 rounded-2xl p-6 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-primary text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                {t('overview:studentGrowthTrend')}
              </h2>
              <p className="text-xs text-base-content/60">{t('overview:last6Months')}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics.studentGrowth}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="month"
                stroke="#888"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#888" style={{ fontSize: "12px" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="students"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorStudents)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-base-100 rounded-2xl p-6 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <TbCurrencyTaka className="text-success text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                {t('overview:revenueTrend')}
              </h2>
              <p className="text-xs text-base-content/60">{t('overview:last6Months')}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics.revenueTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="month"
                stroke="#888"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#888" style={{ fontSize: "12px" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Batch by Course */}
        {analytics.batchByCourse.length > 0 && (
          <div className="bg-base-100 rounded-2xl p-6 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <MdSchool className="text-secondary text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-base-content">
                  {t('overview:batchesByCourse')}
                </h2>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics.batchByCourse}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="course"
                  stroke="#888"
                  style={{ fontSize: "11px" }}
                />
                <YAxis stroke="#888" style={{ fontSize: "11px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gender Distribution */}
        {analytics.genderData.length > 0 && (
          <div className="bg-base-100 rounded-2xl p-6 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                <FaUsers className="text-info text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-base-content">
                  {t('overview:genderDistribution')}
                </h2>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={analytics.genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: ${value} (${(
                      (value / analytics.totalStudents) *
                      100
                    ).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1000}
                >
                  {analytics.genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Student Status */}
        {analytics.studentStatusData.length > 0 && (
          <div className="bg-base-100 rounded-2xl p-6 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <FaUserGraduate className="text-warning text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-base-content">
                  {t('overview:studentStatus')}
                </h2>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={analytics.studentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1000}
                >
                  {analytics.studentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admission Funnel */}
        {analytics.admissionFunnel.length > 0 && (
          <div className="bg-base-100 rounded-2xl p-6 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <FaUsers className="text-purple-500 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  {t('overview:admissionFunnel')}
                </h2>
                <p className="text-xs text-base-content/60">
                  {t('overview:conversionStages')}
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.admissionFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  type="number"
                  stroke="#888"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  dataKey="stage"
                  type="category"
                  stroke="#888"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#a855f7"
                  radius={[0, 8, 8, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weekly Attendance Trend */}
        {analytics.weeklyAttendance.length > 0 && (
          <div className="bg-base-100 rounded-2xl p-6 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <FaCalendarCheck className="text-orange-500 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  {t('overview:weeklyAttendance')}
                </h2>
                <p className="text-xs text-base-content/60">{t('overview:last4Weeks')}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={analytics.weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="week"
                  stroke="#888"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#888" style={{ fontSize: "12px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-2xl text-white">
        <h2 className="text-2xl font-bold mb-4">{t('overview:quickSummary')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold">{analytics.totalStudents}</div>
            <div className="text-sm text-white/80">{t('overview:totalStudents')}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold">{analytics.activeBatches}</div>
            <div className="text-sm text-white/80">{t('overview:activeBatches')}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold">{analytics.upcomingExams}</div>
            <div className="text-sm text-white/80">{t('overview:upcomingExams')}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold">
              {analytics.attendanceRate}%
            </div>
            <div className="text-sm text-white/80">{t('overview:attendanceRate')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
