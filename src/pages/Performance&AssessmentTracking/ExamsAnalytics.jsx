import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  FaTrophy,
  FaChartBar,
  FaUserGraduate,
  FaMedal,
  FaAward,
  FaChartLine,
} from "react-icons/fa";
import {
  MdTrendingUp,
  MdTrendingDown,
  MdSchool,
  MdFilterList,
} from "react-icons/md";
import { BiSolidMedal } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Loader from "../../components/Loader";

// Custom tooltip component (defined outside to avoid recreation on render)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100 p-3 rounded-lg shadow-lg border border-base-300">
        <p className="font-semibold text-base-content">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ExamsAnalytics = () => {
  const axiosSecure = useAxiosSecure();

  // Filter states
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");

  // Fetch all exams
  const { data: allExams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["allExams"],
    queryFn: async () => {
      const res = await axiosSecure.get("/exams");
      return res.data;
    },
  });

  // Fetch all results
  const { data: allResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["allResults"],
    queryFn: async () => {
      const res = await axiosSecure.get("/results?limit=1000");
      return res.data;
    },
  });

  // Fetch all batches
  const { data: allBatches = [] } = useQuery({
    queryKey: ["allBatches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data;
    },
  });

  // Fetch all students
  const { data: allStudents = [] } = useQuery({
    queryKey: ["allStudents"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data;
    },
  });

  // Filter exams and results based on selection
  const filteredExams = useMemo(() => {
    if (!selectedBatchId) return allExams;
    return allExams.filter((exam) => exam.batchId === selectedBatchId);
  }, [allExams, selectedBatchId]);

  const filteredResults = useMemo(() => {
    let results = allResults;
    if (selectedBatchId) {
      const batchExamIds = filteredExams.map((e) => e._id);
      results = results.filter((r) => batchExamIds.includes(r.examId));
    }
    if (selectedExamId) {
      results = results.filter((r) => r.examId === selectedExamId);
    }
    return results;
  }, [allResults, selectedBatchId, selectedExamId, filteredExams]);

  // Helper functions with useCallback for stable references
  const getExamName = useCallback(
    (examId) => {
      const exam = allExams.find((e) => e._id === examId);
      return exam?.name || "Unknown";
    },
    [allExams]
  );

  const getExamTotalMarks = useCallback(
    (examId) => {
      const exam = allExams.find((e) => e._id === examId);
      return exam?.totalMarks || 100;
    },
    [allExams]
  );

  const getStudentName = useCallback(
    (studentId) => {
      const student = allStudents.find((s) => s._id === studentId);
      return student?.name || "Unknown";
    },
    [allStudents]
  );

  const getBatchName = useCallback(
    (batchId) => {
      const batch = allBatches.find((b) => b._id === batchId);
      return batch ? `${batch.name} - ${batch.course}` : "Unknown";
    },
    [allBatches]
  );

  // Analytics calculations
  const analytics = useMemo(() => {
    if (filteredResults.length === 0) {
      return {
        totalResults: 0,
        averageMarks: 0,
        highestMarks: 0,
        lowestMarks: 0,
        passRate: 0,
        totalExams: filteredExams.length,
        gradeDistribution: [],
        examPerformance: [],
        topPerformers: [],
        performanceTrend: [],
        marksDistribution: [],
        subjectComparison: [],
      };
    }

    // Basic stats
    const totalResults = filteredResults.length;
    const marksArray = filteredResults.map((r) => Number(r.marks));
    const averageMarks = (
      marksArray.reduce((sum, m) => sum + m, 0) / marksArray.length
    ).toFixed(2);
    const highestMarks = Math.max(...marksArray);
    const lowestMarks = Math.min(...marksArray);

    // Pass rate (assuming 40% is passing)
    const passCount = filteredResults.filter((r) => {
      const totalMarks = getExamTotalMarks(r.examId);
      const percentage = (Number(r.marks) / totalMarks) * 100;
      return percentage >= 40;
    }).length;
    const passRate = ((passCount / totalResults) * 100).toFixed(2);

    // Grade distribution
    const gradeCount = {};
    filteredResults.forEach((r) => {
      const grade = r.grade || "N/A";
      gradeCount[grade] = (gradeCount[grade] || 0) + 1;
    });
    const gradeDistribution = Object.entries(gradeCount).map(
      ([grade, count]) => ({
        grade,
        count,
        percentage: ((count / totalResults) * 100).toFixed(1),
      })
    );

    // Exam-wise performance
    const examStats = {};
    filteredResults.forEach((r) => {
      if (!examStats[r.examId]) {
        examStats[r.examId] = {
          examId: r.examId,
          examName: getExamName(r.examId),
          totalMarks: getExamTotalMarks(r.examId),
          marks: [],
        };
      }
      examStats[r.examId].marks.push(Number(r.marks));
    });

    const examPerformance = Object.values(examStats).map((exam) => {
      const avg = (
        exam.marks.reduce((sum, m) => sum + m, 0) / exam.marks.length
      ).toFixed(2);
      const percentage = ((avg / exam.totalMarks) * 100).toFixed(2);
      return {
        name: exam.examName,
        average: parseFloat(avg),
        percentage: parseFloat(percentage),
        totalMarks: exam.totalMarks,
        students: exam.marks.length,
        highest: Math.max(...exam.marks),
        lowest: Math.min(...exam.marks),
      };
    });

    // Top performers (based on average marks across all exams)
    const studentMarks = {};
    filteredResults.forEach((r) => {
      if (!studentMarks[r.studentId]) {
        studentMarks[r.studentId] = {
          studentId: r.studentId,
          studentName: getStudentName(r.studentId),
          totalMarks: 0,
          count: 0,
        };
      }
      studentMarks[r.studentId].totalMarks += Number(r.marks);
      studentMarks[r.studentId].count += 1;
    });

    const topPerformers = Object.values(studentMarks)
      .map((s) => ({
        name: s.studentName,
        average: (s.totalMarks / s.count).toFixed(2),
        exams: s.count,
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);

    // Performance trend (chronological)
    const sortedExams = [...filteredExams].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const performanceTrend = sortedExams.map((exam) => {
      const examResults = filteredResults.filter((r) => r.examId === exam._id);
      if (examResults.length === 0) {
        return {
          name: exam.name,
          average: 0,
          date: new Date(exam.date).toLocaleDateString(),
        };
      }
      const avg =
        examResults.reduce((sum, r) => sum + Number(r.marks), 0) /
        examResults.length;
      return {
        name: exam.name,
        average: parseFloat(avg.toFixed(2)),
        date: new Date(exam.date).toLocaleDateString(),
      };
    });

    // Marks distribution (ranges)
    const ranges = [
      { range: "0-20", min: 0, max: 20, count: 0 },
      { range: "21-40", min: 21, max: 40, count: 0 },
      { range: "41-60", min: 41, max: 60, count: 0 },
      { range: "61-80", min: 61, max: 80, count: 0 },
      { range: "81-100", min: 81, max: 100, count: 0 },
    ];

    filteredResults.forEach((r) => {
      const totalMarks = getExamTotalMarks(r.examId);
      const percentage = (Number(r.marks) / totalMarks) * 100;
      const range = ranges.find(
        (rng) => percentage >= rng.min && percentage <= rng.max
      );
      if (range) range.count++;
    });

    const marksDistribution = ranges.map((r) => ({
      range: r.range,
      count: r.count,
      percentage: ((r.count / totalResults) * 100).toFixed(1),
    }));

    return {
      totalResults,
      averageMarks,
      highestMarks,
      lowestMarks,
      passRate,
      totalExams: filteredExams.length,
      gradeDistribution,
      examPerformance,
      topPerformers,
      performanceTrend,
      marksDistribution,
    };
  }, [
    filteredResults,
    filteredExams,
    getExamName,
    getExamTotalMarks,
    getStudentName,
  ]);

  // Chart colors
  const COLORS = [
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // green
    "#3b82f6", // blue
    "#ef4444", // red
    "#06b6d4", // cyan
    "#f97316", // orange
  ];

  const isLoading = examsLoading || resultsLoading;

  if (isLoading) {
    return <Loader message="Loading analytics..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-base-200 rounded-2xl p-6 shadow-sm border border-base-300">
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <FaChartBar className="text-white text-xl" />
            </div>
            Exam Analytics Dashboard
          </h1>
          <p className="text-base-content/60 mt-2 ml-15">
            Comprehensive performance analytics and insights
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex items-center gap-2 mb-4">
          <MdFilterList className="text-primary text-xl" />
          <h2 className="text-lg font-semibold text-base-content">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Batch Filter */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Filter by Batch
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                setSelectedExamId("");
              }}
              className="select select-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Batches</option>
              {allBatches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name} - {batch.course}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Filter */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Filter by Exam
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="select select-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={!selectedBatchId}
            >
              <option value="">
                {selectedBatchId ? "All Exams in Batch" : "Select batch first"}
              </option>
              {filteredExams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.name} - {new Date(exam.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedBatchId || selectedExamId) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-base-content/60">
              Active Filters:
            </span>
            {selectedBatchId && (
              <span className="badge badge-primary gap-2">
                <MdSchool />
                {getBatchName(selectedBatchId)}
                <button
                  onClick={() => {
                    setSelectedBatchId("");
                    setSelectedExamId("");
                  }}
                  className="text-xs"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedExamId && (
              <span className="badge badge-secondary gap-2">
                {getExamName(selectedExamId)}
                <button
                  onClick={() => setSelectedExamId("")}
                  className="text-xs"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Results */}
        <div className="stats shadow-md bg-base-100 border border-base-300 hover:shadow-lg transition-shadow duration-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-primary">
              <FaUserGraduate className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Results</div>
            <div className="stat-value text-2xl text-primary">
              {analytics.totalResults}
            </div>
            <div className="stat-desc text-xs">
              Across {analytics.totalExams} exams
            </div>
          </div>
        </div>

        {/* Average Marks */}
        <div className="stats shadow-md bg-base-100 border border-base-300 hover:shadow-lg transition-shadow duration-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-secondary">
              <FaChartLine className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Average Marks</div>
            <div className="stat-value text-2xl text-secondary">
              {analytics.averageMarks}
            </div>
            <div className="stat-desc text-xs flex items-center gap-1">
              {analytics.averageMarks >= 60 ? (
                <>
                  <MdTrendingUp className="text-success" />
                  <span className="text-success">Good Performance</span>
                </>
              ) : (
                <>
                  <MdTrendingDown className="text-warning" />
                  <span className="text-warning">Needs Improvement</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="stats shadow-md bg-base-100 border border-base-300 hover:shadow-lg transition-shadow duration-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-success">
              <FaTrophy className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Pass Rate</div>
            <div className="stat-value text-2xl text-success">
              {analytics.passRate}%
            </div>
            <div className="stat-desc text-xs">40% minimum required</div>
          </div>
        </div>

        {/* Highest Marks */}
        <div className="stats shadow-md bg-base-100 border border-base-300 hover:shadow-lg transition-shadow duration-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-warning">
              <BiSolidMedal className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Highest Score</div>
            <div className="stat-value text-2xl text-warning">
              {analytics.highestMarks}
            </div>
            <div className="stat-desc text-xs">
              Lowest: {analytics.lowestMarks}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {analytics.totalResults > 0 ? (
        <>
          {/* Performance Trend Line Chart */}
          {analytics.performanceTrend.length > 0 && (
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
              <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                <FaChartLine className="text-primary" />
                Performance Trend Over Time
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.performanceTrend}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis
                    dataKey="name"
                    stroke="#888"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#888" style={{ fontSize: "12px" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorAvg)"
                    animationDuration={1500}
                    animationBegin={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Exam Performance & Grade Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exam Performance Bar Chart */}
            {analytics.examPerformance.length > 0 && (
              <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
                <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                  <FaChartBar className="text-secondary" />
                  Exam-wise Performance
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.examPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                      dataKey="name"
                      stroke="#888"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis stroke="#888" style={{ fontSize: "12px" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="average"
                      fill="#ec4899"
                      animationDuration={1000}
                      animationBegin={200}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Grade Distribution Pie Chart */}
            {analytics.gradeDistribution.length > 0 && (
              <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
                <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                  <FaMedal className="text-warning" />
                  Grade Distribution
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ grade, percentage }) =>
                        `${grade}: ${percentage}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      animationDuration={1000}
                      animationBegin={0}
                    >
                      {analytics.gradeDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Marks Distribution & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Marks Distribution Bar Chart */}
            {analytics.marksDistribution.length > 0 && (
              <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
                <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                  <MdSchool className="text-info" />
                  Marks Distribution (%)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.marksDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                      dataKey="range"
                      stroke="#888"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis stroke="#888" style={{ fontSize: "12px" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#06b6d4"
                      animationDuration={1000}
                      animationBegin={300}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Performers */}
            {analytics.topPerformers.length > 0 && (
              <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
                <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                  <FaAward className="text-success" />
                  Top Performers
                </h2>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {analytics.topPerformers.map((performer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0
                              ? "bg-linear-to-br from-yellow-400 to-yellow-600"
                              : index === 1
                              ? "bg-linear-to-br from-gray-300 to-gray-500"
                              : index === 2
                              ? "bg-linear-to-br from-orange-400 to-orange-600"
                              : "bg-linear-to-br from-blue-400 to-blue-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-base-content">
                            {performer.name}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {performer.exams} exams
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {performer.average}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Performance Comparison */}
          {analytics.examPerformance.length > 0 && (
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
              <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                <FaChartLine className="text-purple-500" />
                Detailed Exam Comparison
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.examPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis
                    dataKey="name"
                    stroke="#888"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#888" style={{ fontSize: "12px" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="highest"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    animationDuration={1500}
                    animationBegin={0}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    animationDuration={1500}
                    animationBegin={200}
                  />
                  <Line
                    type="monotone"
                    dataKey="lowest"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    animationDuration={1500}
                    animationBegin={400}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        // Empty State
        <div className="bg-base-100 rounded-2xl p-12 shadow-sm border border-base-300 text-center">
          <FaChartBar className="text-6xl text-base-content/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-base-content mb-2">
            No Data Available
          </h3>
          <p className="text-base-content/60">
            {selectedBatchId || selectedExamId
              ? "No results found for the selected filters. Try adjusting your filters."
              : "No exam results available yet. Results will appear here once students complete exams."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExamsAnalytics;
