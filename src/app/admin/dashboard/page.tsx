"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  LogOut,
  ChevronDown,
  TrendingUp,
  ChevronRight,
  X,
  User,
  Circle,
  Calendar,
  Menu,
  Search,
  Plus,
  Check,
} from "lucide-react";
import { api, logout, formatDate } from "@/lib/api";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [employees, setEmployees] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tasks, setTasks] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [displayName, setDisplayName] = useState("Admin");
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskProgress, setTaskProgress] = useState("10%");
  const [taskCompletion, setTaskCompletion] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [submitting, setSubmitting] = useState(false);
  const [taskSubmitted, setTaskSubmitted] = useState(false);
  const router = useRouter();

  const fetchTasks = async (filter?: string, q?: string, month?: string, day?: string, date?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      if (q) params.q = q;
      if (month) params.month = month;
      if (day) params.day = day;
      if (date) params.date = date;
      const allTasks = await api.getAllStaffTasks(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.keys(params).length ? (params as any) : undefined,
      );
      setTasks((allTasks.info || allTasks || []).reverse());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to load tasks:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const savedName = localStorage.getItem("user_name");
      if (savedName) setDisplayName(savedName);

      const dashboard = await api.getAdminDashboard();
      setDashboardData(dashboard);
      if (dashboard.staff_list) {
        setEmployees(dashboard.staff_list);
      }
      const adminName = dashboard.admin_name || dashboard.name || dashboard.staff_name;
      if (adminName) {
        setDisplayName(adminName);
        localStorage.setItem("user_name", adminName);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (
        err.message?.includes("Authenticate") ||
        err.message?.includes("credentials")
      ) {
        router.push("/login");
        return;
      }
    }
    await fetchTasks(taskFilter, taskSearch, filterMonth, filterDay, filterDate);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterClick = (filt: string) => {
    setTaskFilter(filt);
    setFilterMonth("");
    setFilterDay("");
    setFilterDate("");
    fetchTasks(filt, taskSearch);
  };

  const handleMonthFilterChange = (month?: string, day?: string, date?: string) => {
    fetchTasks(taskFilter, taskSearch, month ?? filterMonth, day ?? filterDay, date ?? filterDate);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const computedStatus = taskProgress === "100%" ? "Completed" : "In Progress";
      await api.createTask({
        task: taskTitle,
        description: taskDescription || undefined,
        status: computedStatus,
        progress: taskProgress,
        completion_date: taskCompletion || undefined,
      });
      setShowAddTask(false);
      setTaskSubmitted(true);
      setTaskTitle("");
      setTaskDescription("");
      setTaskProgress("10%");
      const d = new Date();
      setTaskCompletion(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      );
      fetchTasks(taskFilter, taskSearch);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      if (
        err.message?.includes("Authenticate") ||
        err.message?.includes("credentials") ||
        err.message?.includes("expired")
      ) {
        router.push("/login");
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchTasks(taskFilter, taskSearch, filterMonth, filterDay, filterDate), 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskSearch]);

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8F9FA] flex font-sans antialiased text-gray-800">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`w-64 bg-white border-r border-gray-100 flex flex-col justify-between fixed h-full z-[90] lg:z-20 transition-transform duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <div>
            <div className="p-6 flex items-center gap-3 border-b border-gray-50">
              <img
                src="/logo.jpg"
                alt="Leadpath"
                className="w-8 h-8 object-contain rounded"
              />
              <div className="flex flex-col">
                <span className="text-[#003A47] font-bold text-sm tracking-wider leading-tight">
                  Leadpath
                </span>
                <span className="text-gray-400 text-[11px] font-medium tracking-tight">
                  Task Tracker
                </span>
              </div>
            </div>

            <nav className="p-4 space-y-1.5">
              <button
                onClick={() => {
                  setActiveView("dashboard");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeView === "dashboard"
                    ? "bg-[#F0F2F5] text-[#003A47]"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveView("tasks");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeView === "tasks"
                    ? "bg-[#F0F2F5] text-[#003A47]"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <ListTodo className="w-4 h-4" />
                Tasks
              </button>
              <button
                onClick={() => {
                  setActiveView("employees");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeView === "employees"
                    ? "bg-[#F0F2F5] text-[#003A47]"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Users className="w-4 h-4" />
                Employees
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 rounded-lg font-medium text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 md:pl-64 flex flex-col">
          <header className="bg-white h-20 border-b border-gray-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-[100] lg:z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Welcome {displayName.split(" ")[0]}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5 max-sm:hidden">
                  Track and monitor every task from one place.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 max-sm:hidden">
              <div className="flex items-center gap-2.5 pl-2">
                <div className="w-9 h-9 rounded-full bg-[#003A47] flex items-center justify-center text-xs font-bold text-white uppercase">
                  {getInitials(displayName)}
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {displayName}
                </span>
                <span className="text-[10px] font-semibold bg-[#003A47] text-white px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-8 space-y-8 max-w-[1400px] w-full mx-auto">
            {activeView === "dashboard" && (
              <section className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-gray-900">
                    Dashboard Overview
                  </h2>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-300 transition-colors">
                    Days
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#F4F8FC] p-4 rounded-lg border border-blue-50/50">
                    <p className="text-[13px] font-medium text-gray-400">
                      Total Employees Logged In
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {dashboardData?.total_employees ||
                        dashboardData?.logged_in ||
                        0}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[#003A47] font-semibold mt-2">
                      <TrendingUp className="w-3 h-3" />
                      <span>10%</span>
                      <span className="text-gray-400 font-normal">
                        from previous day
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F2FBF4] p-4 rounded-lg border border-green-50/50">
                    <p className="text-[13px] font-medium text-gray-400">
                      Tasks Submitted Today
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {dashboardData?.tasks_today || 0}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[#2E7D32] font-semibold mt-2">
                      <TrendingUp className="w-3 h-3" />
                      <span>100%</span>
                      <span className="text-gray-400 font-normal">
                        from previous day
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FFF8F8] p-4 rounded-lg border border-red-50/50">
                    <p className="text-[13px] font-medium text-gray-400">
                      Tasks In Progress
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {dashboardData?.tasks_in_progress || 0}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[#C62828] font-semibold mt-2">
                      <TrendingUp className="w-3 h-3" />
                      <span>100%</span>
                      <span className="text-gray-400 font-normal">
                        from previous day
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FFFBF4] p-4 rounded-lg border border-amber-50/50">
                    <p className="text-[13px] font-medium text-gray-400">
                      Completed Tasks
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {dashboardData?.completed_tasks || 0}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[#D84315] font-semibold mt-2">
                      <TrendingUp className="w-3 h-3" />
                      <span>100%</span>
                      <span className="text-gray-400 font-normal">
                        from previous day
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {(activeView === "dashboard" || activeView === "employees") && (
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 flex items-center justify-between border-b border-gray-50">
                  <h2 className="text-base font-bold text-gray-900">
                    Employees
                  </h2>
                  <button
                    onClick={() => setActiveView("employees")}
                    className="text-xs font-semibold text-[#003A47] hover:underline"
                  >
                    See all
                  </button>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    Loading...
                  </div>
                ) : employees.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No employees found.
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAFBFB] text-gray-400 text-[11px] font-semibold uppercase tracking-wider border-b border-gray-100">
                            <th className="py-3 px-6">Employees</th>
                            <th className="py-3 px-6">Roles</th>
                            <th className="py-3 px-6">Department</th>
                            <th className="py-3 px-6">Time signed In</th>
                            <th className="py-3 px-6">Time signed out</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-600">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {employees.map((emp: any, idx: number) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="py-3 px-6 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#003A47] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                  {getInitials(emp.Name)}
                                </div>
                                <span className="text-gray-900 font-semibold">
                                  {emp.Name}
                                </span>
                              </td>
                              <td className="py-3 px-6 text-gray-500">
                                {emp.role}
                              </td>
                              <td className="py-3 px-6 text-gray-500">
                                {emp.dpt}
                              </td>
                              <td className="py-3 px-6 text-gray-400">
                                {emp.auth_created_at || "-"}
                              </td>
                              <td className="py-3 px-6 text-gray-400">
                                {emp.auth_expire_at || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="md:hidden divide-y divide-gray-200">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {employees.map((emp: any, idx: number) => (
                        <div key={idx} className="p-4 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#003A47] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                              {getInitials(emp.Name)}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {emp.Name}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 ml-9">
                            <div>
                              <span className="text-gray-400">Role: </span>
                              {emp.role}
                            </div>
                            <div>
                              <span className="text-gray-400">Dept: </span>
                              {emp.dpt}
                            </div>
                            <div>
                              <span className="text-gray-400">In: </span>
                              {emp.auth_created_at || "-"}
                            </div>
                            <div>
                              <span className="text-gray-400">Out: </span>
                              {emp.auth_expire_at || "-"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {(activeView === "dashboard" || activeView === "tasks") && (
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-50 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-base font-bold text-gray-900 mr-auto">
                      All Tasks
                    </h2>
                    <div className="relative">
                      <select
                        value={taskFilter}
                        onChange={(e) => handleFilterClick(e.target.value)}
                        className="appearance-none text-xs font-semibold px-3 py-1.5 pr-8 rounded-lg border border-gray-200 bg-white text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#003A47] focus:border-[#003A47] cursor-pointer"
                      >
                        <option value="">All</option>
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={taskSearch}
                          onChange={(e) => setTaskSearch(e.target.value)}
                          placeholder="Search tasks..."
                          className="w-44 pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003A47] focus:border-[#003A47]"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveView("tasks")}
                      className="text-xs font-semibold text-[#003A47] hover:underline"
                    >
                      See all
                    </button>
                    <button
                      onClick={() => setShowAddTask(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-[#003A47] text-white px-3 py-1.5 rounded-lg hover:bg-[#002b35] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </button>
                  </div>

                  {taskFilter === "month" && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Filter by:
                      </span>
                      <div className="relative">
                        <select
                          value={filterMonth}
                          onChange={(e) => {
                            setFilterMonth(e.target.value);
                            handleMonthFilterChange(e.target.value, filterDay, filterDate);
                          }}
                          className="appearance-none text-xs font-medium px-3 py-1.5 pr-8 rounded-lg border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#003A47] focus:border-[#003A47] cursor-pointer"
                        >
                          <option value="">All Months</option>
                          <option value="1">January</option>
                          <option value="2">February</option>
                          <option value="3">March</option>
                          <option value="4">April</option>
                          <option value="5">May</option>
                          <option value="6">June</option>
                          <option value="7">July</option>
                          <option value="8">August</option>
                          <option value="9">September</option>
                          <option value="10">October</option>
                          <option value="11">November</option>
                          <option value="12">December</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      </div>
                      <div className="relative">
                        <select
                          value={filterDay}
                          onChange={(e) => {
                            setFilterDay(e.target.value);
                            handleMonthFilterChange(filterMonth, e.target.value, filterDate);
                          }}
                          className="appearance-none text-xs font-medium px-3 py-1.5 pr-8 rounded-lg border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#003A47] focus:border-[#003A47] cursor-pointer"
                        >
                          <option value="">All Days</option>
                          <option value="Mon">Monday</option>
                          <option value="Tue">Tuesday</option>
                          <option value="Wed">Wednesday</option>
                          <option value="Thu">Thursday</option>
                          <option value="Fri">Friday</option>
                          <option value="Sat">Saturday</option>
                          <option value="Sun">Sunday</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      </div>
                      <div className="relative">
                        <select
                          value={filterDate}
                          onChange={(e) => {
                            setFilterDate(e.target.value);
                            handleMonthFilterChange(filterMonth, filterDay, e.target.value);
                          }}
                          className="appearance-none text-xs font-medium px-3 py-1.5 pr-8 rounded-lg border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#003A47] focus:border-[#003A47] cursor-pointer"
                        >
                          <option value="">All Dates</option>
                          {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1)}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      </div>
                      {(filterMonth || filterDay || filterDate) && (
                        <button
                          onClick={() => {
                            setFilterMonth("");
                            setFilterDay("");
                            setFilterDate("");
                            fetchTasks(taskFilter, taskSearch);
                          }}
                          className="text-[11px] font-medium text-red-500 hover:text-red-600 transition-colors"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    Loading...
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No tasks found.
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAFBFB] text-gray-400 text-[11px] font-semibold uppercase tracking-wider border-b border-gray-100">
                            <th className="py-3 px-6">Employee</th>
                            <th className="py-3 px-6">Task Submitted</th>
                            <th className="py-3 px-6">Date Submitted</th>
                            <th className="py-3 px-6">Completion Date</th>
                            <th className="py-3 px-6">Progress</th>
                            <th className="py-3 px-6 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-600">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {tasks.map((task: any, idx: number) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                              onClick={() => setSelectedTask(task)}
                            >
                              <td className="py-3 px-6 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#003A47] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                  {getInitials(task.staff_name)}
                                </div>
                                <span className="text-gray-900 font-semibold">
                                  {task.staff_name}
                                </span>
                              </td>
                              <td className="py-3 px-6 text-gray-700">
                                {task.task || task.title}
                              </td>
                              <td className="py-3 px-6 text-gray-400">
                                {task.date_submitted || task.date}
                              </td>
                              <td className="py-3 px-6 text-gray-400">
                                {formatDate(task.completion_date)}
                              </td>
                              <td className="py-3 px-6 text-gray-900 font-semibold">
                                {task.progress || task.progress_tab || "-"}
                              </td>
                              <td className="py-3 px-4 text-gray-300">
                                <ChevronRight className="w-4 h-4" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="md:hidden divide-y divide-gray-200">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {tasks.map((task: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 space-y-2 cursor-pointer active:bg-gray-50"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#003A47] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                {getInitials(task.staff_name)}
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {task.staff_name}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div>
                              <span className="text-gray-400">Task: </span>
                              <span className="text-gray-700">
                                {task.task || task.title}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Date: </span>
                              <span className="text-gray-600">
                                {task.date_submitted || task.date}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Completion: </span>
                              <span className="text-gray-600">
                                {formatDate(task.completion_date)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Progress: </span>
                              <span className="text-gray-900 font-semibold">
                                {task.progress || task.progress_tab || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}
          </main>
        </div>

        {selectedTask && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-20"
              onClick={() => setSelectedTask(null)}
            />
            <div className="fixed inset-0 md:top-0 md:right-0 md:inset-auto h-full w-full md:max-w-[500px] bg-white shadow-xl z-40 overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 text-gray-400 text-sm font-medium">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
                <span>Submitted on {formatDate(selectedTask.completion_date)}</span>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white">
                    <ListTodo className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      Project title: {selectedTask.task || selectedTask.title}
                    </span>
                  </div>
                  <div className="border border-[#4CAF50] bg-[#E8F5E9]/30 text-[#4CAF50] rounded-lg px-3 py-2 text-sm font-semibold">
                    {selectedTask.progress || selectedTask.progress_tab || "-"}{" "}
                    Progress
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-gray-900">
                    Task description
                  </h3>
                  <div className="w-full min-h-[90px] border border-gray-200 rounded-xl p-4 text-sm text-gray-800 bg-white leading-relaxed">
                    {selectedTask.description || `Create a ${selectedTask.task || selectedTask.title} for the task tracker project.`}
                  </div>
                </div>

                <div className="space-y-4 max-w-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Assigned to</span>
                    </div>
                    <div className="w-48 flex items-center gap-2.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                      <div className="w-6 h-6 rounded-full bg-[#5D5755] flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">
                        {getInitials(selectedTask.staff_name)}
                      </div>
                      <span className="text-xs font-semibold text-gray-800">
                        {selectedTask.staff_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                      <Circle className="w-4 h-4 text-gray-400" />
                      <span>Status</span>
                    </div>
                    <div className="w-48">
                      <div
                        className={`inline-block font-semibold text-xs px-3 py-2 rounded-lg border ${
                          selectedTask.status === "Completed" ||
                          selectedTask.status === "completed"
                            ? "border-[#4CAF50] bg-[#E8F5E9] text-[#4CAF50]"
                            : "border-[#FFD54F] bg-[#FFFDE7] text-[#D4AF37]"
                        }`}
                      >
                        {selectedTask.status}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                      <ListTodo className="w-4 h-4 text-gray-400" />
                      <span>Project name</span>
                    </div>
                    <div className="w-48 text-sm font-semibold text-gray-800">
                      {selectedTask.project || "Task Tracker Project"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Completion date</span>
                    </div>
                    <div className="w-48 text-sm font-semibold text-gray-800">
                      {formatDate(selectedTask.completion_date)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {showAddTask && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-20"
              onClick={() => setShowAddTask(false)}
            />
            <div className="fixed inset-0 md:top-0 md:right-0 md:inset-auto h-full w-full md:max-w-[500px] bg-white shadow-xl z-40 overflow-y-auto">
              <div className="p-6 sm:p-8">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowAddTask(false)}
                    className="text-gray-900 hover:text-gray-600 p-1"
                  >
                    <X className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">
                  Add New Task
                </h1>
                <p className="text-sm text-gray-500 font-normal mb-8 leading-relaxed">
                  Create a new task and assign it to a staff member.
                </p>

                <form onSubmit={handleSubmitTask} className="space-y-6">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      Task title
                    </label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Landing Page design"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#003A47] focus:border-[#003A47] bg-white transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      Task description
                    </label>
                    <textarea
                      rows={4}
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Create a sign up page for the task tracker project."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#003A47] focus:border-[#003A47] bg-white transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      Progress
                    </label>
                    <div className="relative">
                      <select
                        value={taskProgress}
                        onChange={(e) => setTaskProgress(e.target.value)}
                        className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#003A47] focus:border-[#003A47] bg-white pr-10 cursor-pointer"
                      >
                        <option value="10%">10%</option>
                        <option value="25%">25%</option>
                        <option value="50%">50%</option>
                        <option value="75%">75%</option>
                        <option value="100%">100%</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        <ChevronDown className="h-4 w-4 stroke-[1.5]" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      Completion date
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-500 text-sm bg-gray-50 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(taskCompletion) || taskCompletion}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#003A47] text-white py-3.5 px-4 rounded-lg font-medium text-sm hover:bg-[#002b35] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003A47] tracking-wide disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : "Submit Task"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        {taskSubmitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-8 mx-4 w-full max-w-md flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#003A47] flex items-center justify-center mb-8 shadow-sm">
                <Check className="w-12 h-12 text-white stroke-[3]" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
                Success!
              </h1>
              <p className="text-base text-gray-500 font-normal mb-10">
                Your task has been successfully uploaded.
              </p>
              <button
                onClick={() => setTaskSubmitted(false)}
                className="w-full sm:w-56 bg-[#003A47] text-white py-3.5 px-6 rounded-lg font-medium text-base hover:bg-[#002b35] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003A47] tracking-wide"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
