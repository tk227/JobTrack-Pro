
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarDays,
  BarChart3,
  Plus,
  Search,
  LogOut,
  MapPin,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Menu,
  Video,
  Clock,
  Phone,
  Building2,
  Filter,
  ExternalLink,
  FileText,
  Download,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from "./api";

import { exportJobsToCSV } from "./exportUtils";
import Analytics from "./Analytics";
import Notifications from "./Notifications";

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function formatJob(job) {
  return {
    id: job.id,
    company: job.company_name ?? job.company ?? "",
    role: job.job_title ?? job.role ?? "",
    location: job.location ?? "",
    jobType: job.job_type ?? job.jobType ?? "Full Time",
    salary: job.salary ?? "",
    status: job.status ?? "applied",
    appliedDate: job.applied_date ?? job.appliedDate ?? "",
    jobUrl: job.job_url ?? job.jobUrl ?? "",
    description: job.description ?? "",
  };
}

function formatInterview(interview) {
  const application =
    interview.job_application_details ??
    interview.job_application ??
    {};

  return {
    id: interview.id,
    jobId:
      typeof interview.job_application === "object"
        ? interview.job_application.id
        : interview.job_application,
    company:
      interview.company_name ??
      application.company_name ??
      interview.company ??
      "",
    role:
      interview.job_title ??
      application.job_title ??
      interview.role ??
      "",
    roundName: interview.round_name ?? "",
    scheduledAt: interview.scheduled_at ?? "",
    interviewType: interview.interview_type ?? "online",
    meetingLink: interview.meeting_link ?? "",
    location: interview.location ?? "",
    status: interview.status ?? "scheduled",
    notes: interview.notes ?? "",
  };
}

function emptyJob() {
  return {
    company: "",
    role: "",
    location: "",
    jobType: "Full Time",
    salary: "",
    status: "applied",
    appliedDate: new Date().toISOString().slice(0, 10),
    jobUrl: "",
    description: "",
  };
}

function emptyInterview() {
  return {
    jobId: "",
    roundName: "",
    scheduledAt: "",
    interviewType: "online",
    meetingLink: "",
    location: "",
    status: "scheduled",
    notes: "",
  };
}

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toLocalDateTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
}

const STATUS_LABELS = {
  applied: "Applied",
  assessment: "Assessment",
  interview: "Interview",
  selected: "Selected",
  rejected: "Rejected",
};

const INTERVIEW_STATUS_LABELS = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLES = {
  applied: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  assessment: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  interview: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  selected: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-300 border-red-500/20",
};

const INTERVIEW_STATUS_STYLES = {
  scheduled: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-300 border-red-500/20",
};

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] ??
        "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function InterviewStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
        INTERVIEW_STATUS_STYLES[status] ??
        "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {INTERVIEW_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="glass glass-hover flex min-w-0 items-center justify-between gap-4 rounded-2xl p-5"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-400">
          {title}
        </p>
        <h3 className="mt-3 text-3xl font-bold tracking-tight text-white">
          {value}
        </h3>
      </div>

      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>
        <Icon size={22} />
      </div>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0 space-y-2">
      <span className="text-sm font-medium text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children, saving }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-5 sm:p-7"
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-4 rounded-2xl bg-purple-500/10 p-5 text-purple-300">
        <Icon size={30} />
      </div>

      <h3 className="text-lg font-bold text-white">{title}</h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// --------------------------------------------------
// MAIN DASHBOARD
// --------------------------------------------------

function Dashboard({ onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);

  const [activePage, setActivePage] = useState("dashboard");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [interviewSearch, setInterviewSearch] = useState("");
  const [interviewStatusFilter, setInterviewStatusFilter] =
    useState("all");

  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);

  const [editingJob, setEditingJob] = useState(null);
  const [editingInterview, setEditingInterview] = useState(null);

  const [jobForm, setJobForm] = useState(emptyJob());
  const [interviewForm, setInterviewForm] = useState(emptyInterview());

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ------------------------------------------------
  // LOAD DATA
  // ------------------------------------------------

  async function loadData() {
    setLoading(true);
    setApiError("");

    try {
      const [jobsResponse, interviewsResponse] = await Promise.all([
        getJobs(),
        getInterviews(),
      ]);

      setJobs(getList(jobsResponse).map(formatJob));
      setInterviews(getList(interviewsResponse).map(formatInterview));
    } catch (error) {
      console.error("Dashboard loading error:", error);

      setApiError(
        error.response?.data?.detail ||
          "Unable to load your data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ------------------------------------------------
  // FILTERS AND STATISTICS
  // ------------------------------------------------

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        (job.company || "").toLowerCase().includes(searchValue) ||
        (job.role || "").toLowerCase().includes(searchValue) ||
        (job.location || "").toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const searchValue = interviewSearch.trim().toLowerCase();

      const matchesSearch =
        (item.company || "").toLowerCase().includes(searchValue) ||
        (item.role || "").toLowerCase().includes(searchValue) ||
        (item.roundName || "").toLowerCase().includes(searchValue);

      const matchesStatus =
        interviewStatusFilter === "all" ||
        item.status === interviewStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [interviews, interviewSearch, interviewStatusFilter]);

  const totalApplications = jobs.length;

  const interviewCount = jobs.filter(
    (job) => job.status === "interview"
  ).length;

  const selectedCount = jobs.filter(
    (job) => job.status === "selected"
  ).length;

  const rejectedCount = jobs.filter(
    (job) => job.status === "rejected"
  ).length;

  const scheduledCount = interviews.filter(
    (item) => item.status === "scheduled"
  ).length;

  const chartData = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      const dateKey = date.toISOString().slice(0, 10);

      const count = jobs.filter((job) => {
        return job.appliedDate?.slice(0, 10) === dateKey;
      }).length;

      return {
        day: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        applications: count,
      };
    });
  }, [jobs]);

  const upcomingInterviews = useMemo(() => {
    return interviews
      .filter((item) => {
        return (
          item.status === "scheduled" &&
          item.scheduledAt &&
          new Date(item.scheduledAt) >= new Date()
        );
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt) - new Date(b.scheduledAt)
      )
      .slice(0, 5);
  }, [interviews]);

  // ------------------------------------------------
  // JOB CRUD
  // ------------------------------------------------

  function openAddJob() {
    setEditingJob(null);
    setJobForm(emptyJob());
    setJobModalOpen(true);
  }

  function openEditJob(job) {
    setEditingJob(job);
    setJobForm({ ...job });
    setJobModalOpen(true);
  }

  async function handleJobSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setApiError("");

    const payload = {
      company_name: jobForm.company,
      job_title: jobForm.role,
      location: jobForm.location,
      job_type: jobForm.jobType,
      salary: jobForm.salary,
      status: jobForm.status,
      applied_date: jobForm.appliedDate,
      job_url: jobForm.jobUrl,
      description: jobForm.description,
    };

    try {
      if (editingJob) {
        await updateJob(editingJob.id, payload);
      } else {
        await createJob(payload);
      }

      setJobModalOpen(false);
      setEditingJob(null);
      setJobForm(emptyJob());

      await loadData();
    } catch (error) {
      console.error("Job save error:", error);

      setApiError(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Unable to save job application."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteJob(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job application?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setApiError("");

    try {
      await deleteJob(id);
      await loadData();
    } catch (error) {
      console.error("Job delete error:", error);
      setApiError("Unable to delete this job application.");
    } finally {
      setDeletingId(null);
    }
  }

  // ------------------------------------------------
  // INTERVIEW CRUD
  // ------------------------------------------------

  function openAddInterview() {
    setEditingInterview(null);
    setInterviewForm(emptyInterview());
    setInterviewModalOpen(true);
  }

  function openEditInterview(item) {
    setEditingInterview(item);

    setInterviewForm({
      ...item,
      jobId: item.jobId ? String(item.jobId) : "",
      scheduledAt: toLocalDateTime(item.scheduledAt),
    });

    setInterviewModalOpen(true);
  }

  async function handleInterviewSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setApiError("");

    const payload = {
      job_application: Number(interviewForm.jobId),
      round_name: interviewForm.roundName,
      scheduled_at: interviewForm.scheduledAt,
      interview_type: interviewForm.interviewType,
      meeting_link: interviewForm.meetingLink,
      location: interviewForm.location,
      status: interviewForm.status,
      notes: interviewForm.notes,
    };

    try {
      if (editingInterview) {
        await updateInterview(editingInterview.id, payload);
      } else {
        await createInterview(payload);
      }

      setInterviewModalOpen(false);
      setEditingInterview(null);
      setInterviewForm(emptyInterview());

      await loadData();
    } catch (error) {
      console.error("Interview save error:", error);

      setApiError(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Unable to save interview."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteInterview(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this interview?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setApiError("");

    try {
      await deleteInterview(id);
      await loadData();
    } catch (error) {
      console.error("Interview delete error:", error);
      setApiError("Unable to delete this interview.");
    } finally {
      setDeletingId(null);
    }
  }

  // ------------------------------------------------
  // NAVIGATION
  // ------------------------------------------------

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "applications", label: "Applications", icon: BriefcaseBusiness },
    { id: "interviews", label: "Interviews", icon: CalendarDays },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const pageTitles = {
    dashboard: "Dashboard",
    applications: "Applications",
    interviews: "Interviews",
    analytics: "Analytics",
  };

  function navigate(page) {
    setActivePage(page);
    setMobileMenuOpen(false);
    setApiError("");
  }

  // ------------------------------------------------
  // SIDEBAR
  // ------------------------------------------------

  function SidebarContent() {
    return (
      <>
        <div className="flex items-center gap-3 px-5 py-7">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20">
            <BriefcaseBusiness size={23} className="text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="whitespace-nowrap text-xl font-extrabold tracking-tight text-white">
              JobTrack<span className="text-purple-400"> Pro</span>
            </h1>
            <p className="text-xs text-slate-500">
              Career management
            </p>
          </div>
        </div>

        <div className="px-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-purple-600/25 to-blue-600/15 text-white shadow-lg shadow-purple-900/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    size={19}
                    className={active ? "text-purple-300" : "text-slate-500"}
                  />

                  {item.label}

                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="ml-auto h-2 w-2 rounded-full bg-purple-400"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="mb-4 rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-purple-300">
              <TrendingUp size={17} />
              <span className="text-xs font-semibold">
                Keep progressing
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              Track your applications and stay prepared for your next opportunity.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </>
    );
  }

  // ------------------------------------------------
  // APPLICATION TABLE
  // ------------------------------------------------

  function ApplicationsTable({ data }) {
    if (data.length === 0) {
      return (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No applications found"
          description="Add your first job application or change your search filters."
          action={
            <button onClick={openAddJob} className="gradient-button">
              <Plus size={16} className="mr-2 inline" />
              Add application
            </button>
          }
        />
      );
    }

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[750px] text-left">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4 font-semibold">Company / Role</th>
              <th className="px-5 py-4 font-semibold">Location</th>
              <th className="px-5 py-4 font-semibold">Applied date</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((job) => (
              <tr
                key={job.id}
                className="border-b border-white/5 transition hover:bg-white/[0.025]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                      <Building2 size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-white">
                        {job.company}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {job.role}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-slate-400">
                  <span className="flex items-center gap-2">
                    <MapPin size={14} className="shrink-0" />
                    {job.location || "Not specified"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-400">
                  {formatDate(job.appliedDate)}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={job.status} />
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open job link"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-300"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}

                    <button
                      onClick={() => openEditJob(job)}
                      title="Edit"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-purple-500/10 hover:text-purple-300"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      disabled={deletingId === job.id}
                      title="Delete"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      {deletingId === job.id ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ------------------------------------------------
  // DASHBOARD PAGE
  // ------------------------------------------------

  function DashboardPage() {
    return (
      <div className="space-y-7">
        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-700/30 via-indigo-700/20 to-blue-700/20 p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-purple-300">
                <TrendingUp size={18} />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  Your career overview
                </span>
              </div>

              <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                Welcome to JobTrack Pro
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Manage your job applications, prepare for interviews and track your career progress in one place.
              </p>
            </div>

            <button
              onClick={openAddJob}
              className="gradient-button flex shrink-0 items-center justify-center gap-2 self-start sm:self-center"
            >
              <Plus size={18} />
              Add application
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={totalApplications}
            icon={BriefcaseBusiness}
            color="text-blue-300"
            bg="bg-blue-500/10"
            delay={0}
          />

          <StatCard
            title="Interviews"
            value={interviewCount}
            icon={CalendarDays}
            color="text-purple-300"
            bg="bg-purple-500/10"
            delay={0.05}
          />

          <StatCard
            title="Selected"
            value={selectedCount}
            icon={CheckCircle2}
            color="text-emerald-300"
            bg="bg-emerald-500/10"
            delay={0.1}
          />

          <StatCard
            title="Rejected"
            value={rejectedCount}
            icon={XCircle}
            color="text-red-300"
            bg="bg-red-500/10"
            delay={0.15}
          />
        </section>

        {/* Activity and summary */}
        <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-5">
          <div className="glass min-w-0 rounded-2xl p-5 sm:p-6 xl:col-span-3">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Application activity
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Your actual applications over the last 7 days
                </p>
              </div>

              <span className="rounded-lg bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300">
                Last 7 days
              </span>
            </div>

            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="applicationGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />

                  <YAxis
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#15152a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#a78bfa"
                    strokeWidth={3}
                    fill="url(#applicationGradient)"
                    activeDot={{ r: 5, fill: "#a78bfa" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass min-w-0 rounded-2xl p-5 sm:p-6 xl:col-span-2">
            <h3 className="text-lg font-bold text-white">
              Application summary
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Current application pipeline
            </p>

            <div className="mt-7 space-y-5">
              {Object.entries(STATUS_LABELS).map(([status, label]) => {
                const count = jobs.filter(
                  (job) => job.status === status
                ).length;

                const percentage =
                  totalApplications > 0
                    ? (count / totalApplications) * 100
                    : 0;

                return (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-semibold tabular-nums text-white">
                        {count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recent applications */}
        <section className="glass min-w-0 overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-5 sm:px-6">
            <div>
              <h3 className="text-lg font-bold text-white">
                Recent applications
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Your latest job applications
              </p>
            </div>

            <button
              onClick={() => navigate("applications")}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/10 hover:text-purple-200"
            >
              View all
            </button>
          </div>

          <ApplicationsTable
            data={[...jobs]
              .sort(
                (a, b) =>
                  new Date(b.appliedDate || 0) -
                  new Date(a.appliedDate || 0)
              )
              .slice(0, 5)}
          />
        </section>

        {/* Upcoming interviews */}
        <section className="glass min-w-0 rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">
                Upcoming interviews
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Stay prepared for your next opportunity
              </p>
            </div>

            <button
              onClick={() => navigate("interviews")}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/10 hover:text-purple-200"
            >
              View all
            </button>
          </div>

          {upcomingInterviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No upcoming interviews scheduled.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04] sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-xl bg-purple-500/10 p-3 text-purple-300">
                      <CalendarDays size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {item.company}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.roundName} · {item.role}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-sm text-slate-400 sm:text-right">
                    {new Date(item.scheduledAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // ------------------------------------------------
  // APPLICATIONS PAGE
  // ------------------------------------------------

  function ApplicationsPage() {
    return (
      <div className="space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              My Applications
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Manage and monitor all your job applications.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => exportJobsToCSV(filteredJobs)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
            >
              <Download size={17} />
              Export CSV
            </button>

            <button
              onClick={openAddJob}
              className="gradient-button flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add application
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_230px]">
            <div className="relative min-w-0">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search company, role or location..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="modern-input pl-11"
              />
            </div>

            <div className="relative min-w-0">
              <Filter
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="modern-input appearance-none pl-11 pr-10"
              >
                <option value="all">All statuses</option>
                <option value="applied">Applied</option>
                <option value="assessment">Assessment</option>
                <option value="interview">Interview</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="glass min-w-0 overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4 sm:px-6">
            <div>
              <h3 className="font-bold text-white">
                All applications
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {filteredJobs.length} application(s) found
              </p>
            </div>

            <button
              onClick={loadData}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          <ApplicationsTable data={filteredJobs} />
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // INTERVIEWS PAGE
  // ------------------------------------------------

  function InterviewsPage() {
    const completedCount = interviews.filter(
      (item) => item.status === "completed"
    ).length;

    const cancelledCount = interviews.filter(
      (item) => item.status === "cancelled"
    ).length;

    return (
      <div className="space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Interview Management
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Organize your interviews and track every round.
            </p>
          </div>

          <button
            onClick={openAddInterview}
            className="gradient-button flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Schedule interview
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Interviews"
            value={interviews.length}
            icon={CalendarDays}
            color="text-blue-300"
            bg="bg-blue-500/10"
          />

          <StatCard
            title="Scheduled"
            value={scheduledCount}
            icon={Clock}
            color="text-purple-300"
            bg="bg-purple-500/10"
          />

          <StatCard
            title="Completed"
            value={completedCount}
            icon={CheckCircle2}
            color="text-emerald-300"
            bg="bg-emerald-500/10"
          />
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_230px]">
            <div className="relative min-w-0">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search company, job title or round..."
                value={interviewSearch}
                onChange={(event) => setInterviewSearch(event.target.value)}
                className="modern-input pl-11"
              />
            </div>

            <div className="relative min-w-0">
              <Filter
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <select
                value={interviewStatusFilter}
                onChange={(event) => setInterviewStatusFilter(event.target.value)}
                className="modern-input appearance-none pl-11 pr-10"
              >
                <option value="all">All statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="glass min-w-0 overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-5 sm:px-6">
            <div>
              <h3 className="font-bold text-white">All interviews</h3>
              <p className="mt-1 text-xs text-slate-400">
                {filteredInterviews.length} interview(s) found · {cancelledCount} cancelled
              </p>
            </div>

            <button
              onClick={loadData}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          {filteredInterviews.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={
                interviews.length === 0
                  ? "No interviews scheduled"
                  : "No matching interviews"
              }
              description={
                interviews.length === 0
                  ? "Schedule your first interview to keep track of your preparation and progress."
                  : "Try changing your search or status filter."
              }
              action={
                interviews.length === 0 ? (
                  <button
                    onClick={openAddInterview}
                    className="gradient-button"
                  >
                    <Plus size={16} className="mr-2 inline" />
                    Schedule interview
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="divide-y divide-white/5">
              {[...filteredInterviews]
                .sort(
                  (a, b) =>
                    new Date(b.scheduledAt || 0) -
                    new Date(a.scheduledAt || 0)
                )
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-4 p-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:px-6"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="shrink-0 rounded-xl bg-purple-500/10 p-3 text-purple-300">
                        {item.interviewType === "phone" ? (
                          <Phone size={21} />
                        ) : item.interviewType === "in_person" ? (
                          <Building2 size={21} />
                        ) : (
                          <Video size={21} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-semibold text-white">
                          {item.company || "Company"}
                        </h4>

                        <p className="mt-1 text-sm text-slate-400">
                          {item.role}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <FileText size={13} />
                            {item.roundName}
                          </span>

                          <span className="flex items-center gap-1">
                            <CalendarDays size={13} />
                            {formatDate(item.scheduledAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <InterviewStatusBadge status={item.status} />

                      {item.meetingLink && (
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-2 text-blue-300 transition hover:bg-blue-500/10"
                          title="Open meeting link"
                        >
                          <ExternalLink size={17} />
                        </a>
                      )}

                      <button
                        onClick={() => openEditInterview(item)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-purple-500/10 hover:text-purple-300"
                        title="Edit interview"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() => handleDeleteInterview(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                        title="Delete interview"
                      >
                        {deletingId === item.id ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // ANALYTICS PAGE
  // ------------------------------------------------

  function AnalyticsPage() {
    return (
      <Analytics
        jobs={jobs}
        interviews={interviews}
      />
    );
  }

  // ------------------------------------------------
  // JOB FORM MODAL
  // ------------------------------------------------

  function JobFormModal() {
    return (
      <Modal
        title={editingJob ? "Edit application" : "Add new application"}
        onClose={() => setJobModalOpen(false)}
        saving={saving}
      >
        <form onSubmit={handleJobSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company name *">
              <input
                required
                value={jobForm.company}
                onChange={(event) =>
                  setJobForm({ ...jobForm, company: event.target.value })
                }
                placeholder="e.g. Google"
                className="modern-input"
              />
            </Field>

            <Field label="Job title *">
              <input
                required
                value={jobForm.role}
                onChange={(event) =>
                  setJobForm({ ...jobForm, role: event.target.value })
                }
                placeholder="e.g. Python Developer"
                className="modern-input"
              />
            </Field>

            <Field label="Location">
              <input
                value={jobForm.location}
                onChange={(event) =>
                  setJobForm({ ...jobForm, location: event.target.value })
                }
                placeholder="e.g. Bengaluru"
                className="modern-input"
              />
            </Field>

            <Field label="Job type">
              <select
                value={jobForm.jobType}
                onChange={(event) =>
                  setJobForm({ ...jobForm, jobType: event.target.value })
                }
                className="modern-input"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </Field>

            <Field label="Salary">
              <input
                value={jobForm.salary}
                onChange={(event) =>
                  setJobForm({ ...jobForm, salary: event.target.value })
                }
                placeholder="e.g. 6 LPA"
                className="modern-input"
              />
            </Field>

            <Field label="Application status">
              <select
                value={jobForm.status}
                onChange={(event) =>
                  setJobForm({ ...jobForm, status: event.target.value })
                }
                className="modern-input"
              >
                <option value="applied">Applied</option>
                <option value="assessment">Assessment</option>
                <option value="interview">Interview</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
            </Field>

            <Field label="Applied date">
              <input
                type="date"
                value={jobForm.appliedDate}
                onChange={(event) =>
                  setJobForm({ ...jobForm, appliedDate: event.target.value })
                }
                className="modern-input"
              />
            </Field>

            <Field label="Job posting URL">
              <input
                type="url"
                value={jobForm.jobUrl}
                onChange={(event) =>
                  setJobForm({ ...jobForm, jobUrl: event.target.value })
                }
                placeholder="https://..."
                className="modern-input"
              />
            </Field>
          </div>

          <Field label="Description / Notes">
            <textarea
              rows={3}
              value={jobForm.description}
              onChange={(event) =>
                setJobForm({ ...jobForm, description: event.target.value })
              }
              placeholder="Add job details or notes..."
              className="modern-input resize-none"
            />
          </Field>

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-white/5 pt-5 sm:flex-row">
            <button
              type="button"
              disabled={saving}
              onClick={() => setJobModalOpen(false)}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="gradient-button flex items-center justify-center gap-2"
            >
              {saving && (
                <LoaderCircle size={17} className="animate-spin" />
              )}
              {editingJob ? "Save changes" : "Add application"}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  // ------------------------------------------------
  // INTERVIEW FORM MODAL
  // ------------------------------------------------

  function InterviewFormModal() {
    return (
      <Modal
        title={editingInterview ? "Edit interview" : "Schedule interview"}
        onClose={() => setInterviewModalOpen(false)}
        saving={saving}
      >
        <form onSubmit={handleInterviewSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Related job application *">
              <select
                required
                value={interviewForm.jobId}
                onChange={(event) =>
                  setInterviewForm({ ...interviewForm, jobId: event.target.value })
                }
                className="modern-input"
              >
                <option value="">Select application</option>

                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.company} - {job.role}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Interview round *">
              <input
                required
                value={interviewForm.roundName}
                onChange={(event) =>
                  setInterviewForm({ ...interviewForm, roundName: event.target.value })
                }
                placeholder="e.g. Technical Round 1"
                className="modern-input"
              />
            </Field>

            <Field label="Scheduled date and time *">
              <input
                required
                type="datetime-local"
                value={interviewForm.scheduledAt}
                onChange={(event) =>
                  setInterviewForm({ ...interviewForm, scheduledAt: event.target.value })
                }
                className="modern-input"
              />
            </Field>

            <Field label="Interview type">
              <select
                value={interviewForm.interviewType}
                onChange={(event) =>
                  setInterviewForm({ ...interviewForm, interviewType: event.target.value })
                }
                className="modern-input"
              >
                <option value="online">Online</option>
                <option value="in_person">In person</option>
                <option value="phone">Phone</option>
              </select>
            </Field>

            <Field label="Meeting link">
              <input
                type="url"
                value={interviewForm.meetingLink}
                onChange={(event) =>
                  setInterviewForm({ ...interviewForm, meetingLink: event.target.value })
                }
                placeholder="https://..."
                className="modern-input"
              />
            </Field>

            <Field label="Location">
              <input
                value={interviewForm.location}
                onChange={(event) =>
                  setInterviewForm({ ...interviewForm, location: event.target.value })
                }
                placeholder="Interview location"
                className="modern-input"
              />
            </Field>

            <Field label="Interview status">
              <select
                value={interviewForm.status}
                onChange={(event) =>
                  setInterviewForm({ ...interviewForm, status: event.target.value })
                }
                className="modern-input"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              rows={3}
              value={interviewForm.notes}
              onChange={(event) =>
                setInterviewForm({ ...interviewForm, notes: event.target.value })
              }
              placeholder="Add preparation notes..."
              className="modern-input resize-none"
            />
          </Field>

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-white/5 pt-5 sm:flex-row">
            <button
              type="button"
              disabled={saving}
              onClick={() => setInterviewModalOpen(false)}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || jobs.length === 0}
              className="gradient-button flex items-center justify-center gap-2"
            >
              {saving && (
                <LoaderCircle size={17} className="animate-spin" />
              )}
              {editingInterview ? "Save changes" : "Schedule interview"}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  // ------------------------------------------------
  // MAIN RENDER
  // ------------------------------------------------

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden text-white">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/5 bg-[#0b0c19]/95 backdrop-blur-xl lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#0b0c19] lg:hidden"
            >
              <div className="absolute right-3 top-4 z-10">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="min-h-screen min-w-0 w-full lg:ml-64 lg:w-[calc(100%-16rem)]">
        {/* Top navigation */}
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-white/5 bg-[#080914]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-white">
                {pageTitles[activePage]}
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Manage your career journey
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Notifications
              interviews={interviews}
              onViewInterviews={() => navigate("interviews")}
            />

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">
                JobTrack Pro
              </p>

              <p className="text-xs text-slate-500">
                Personal workspace
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 font-bold text-white shadow-lg shadow-purple-500/10">
              J
            </div>
          </div>
        </header>

        {/* Page container */}
        <div className="mx-auto w-full max-w-[1500px] min-w-0 p-4 sm:p-6 lg:p-8">
          {apiError && (
            <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <span className="min-w-0 break-words">{apiError}</span>

              <button
                onClick={() => setApiError("")}
                className="shrink-0 text-red-300 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
              <div className="rounded-2xl bg-purple-500/10 p-4 text-purple-300">
                <LoaderCircle size={32} className="animate-spin" />
              </div>

              <p className="text-sm text-slate-400">
                Loading your workspace...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                {activePage === "dashboard" && <DashboardPage />}
                {activePage === "applications" && <ApplicationsPage />}
                {activePage === "interviews" && <InterviewsPage />}
                {activePage === "analytics" && <AnalyticsPage />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Modals */}
      {jobModalOpen && JobFormModal()}
      {interviewModalOpen && InterviewFormModal()}
    </div>
  );
}


export default Dashboard;
