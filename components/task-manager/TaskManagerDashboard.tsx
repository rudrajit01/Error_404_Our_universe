"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "admin" | "member";

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "completed" | "archived";
  created_at: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  assigned_to: string | null;
  project_id: string | null;
};

type TeamMember = {
  user_id: string;
  role: Role;
};

type Submission = {
  id: string;
  task_id: string;
  submitted_by: string;
  file_url: string | null;
  submission_text: string | null;
  status: string;
  submitted_at: string;
};

type Feedback = {
  id: string;
  submission_id: string;
  reviewer_id: string;
  feedback: string;
  created_at: string;
};
type Skill = {
  id: string;
  user_id: string;
  skill_name: string;
  proficiency: string;
  created_at: string;
};

type Certification = {
  id: string;
  user_id: string;
  title: string;
  issuer: string | null;
  certificate_url: string | null;
  issued_at: string | null;
  created_at: string;
};

type Props = {
  userId: string;
  role: Role;
};

const statusLabels: Record<Task["status"], string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function TaskManagerDashboard({ userId, role }: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [taskSearch, setTaskSearch] = useState("");
const [taskStatusFilter, setTaskStatusFilter] = useState("all");
const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");
  const [calendarMonth, setCalendarMonth] = useState(
  () => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(
  null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] =
    useState<Project["status"]>("active");
  const [savingProject, setSavingProject] = useState(false);
  const [projectMessage, setProjectMessage] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [transferMessage, setTransferMessage] = useState("");
  const [transferringAdmin, setTransferringAdmin] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskProject, setTaskProject] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskPriority, setTaskPriority] =
    useState<Task["priority"]>("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [savingTask, setSavingTask] = useState(false);
  const [taskMessage, setTaskMessage] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  const [skillName, setSkillName] = useState("");
  const [skillProficiency, setSkillProficiency] = useState("beginner");
  const [savingSkill, setSavingSkill] = useState(false);
  const [skillMessage, setSkillMessage] = useState("");

  const [certificationTitle, setCertificationTitle] = useState("");
  const [certificationIssuer, setCertificationIssuer] = useState("");
  const [certificationUrl, setCertificationUrl] = useState("");
  const [certificationDate, setCertificationDate] = useState("");
  const [savingCertification, setSavingCertification] = useState(false);
  const [certificationMessage, setCertificationMessage] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFileUrl, setSubmissionFileUrl] = useState("");
  const [selectedSubmissionTask, setSelectedSubmissionTask] = useState("");
  const [savingSubmission, setSavingSubmission] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  const [feedbackText, setFeedbackText] = useState("");
  const [selectedFeedbackSubmission, setSelectedFeedbackSubmission] =
    useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    const [
      projectResult,
      taskResult,
      memberResult,
      submissionResult,
      feedbackResult,
      skillResult,
      certificationResult,
    ] = await Promise.all([
      // 1. Projects
      supabase
        .from("tm_projects")
        .select("*")
        .order("created_at", { ascending: false }),

      // 2. Tasks
      supabase
        .from("tm_tasks")
        .select("*")
        .order("created_at", { ascending: false }),

      // 3. Team Members
      supabase
        .from("tm_members")
        .select("user_id, role")
        .order("role", { ascending: true }),

      // 4. Submissions
      supabase
        .from("tm_submissions")
        .select("*")
        .order("submitted_at", { ascending: false }),

      // 5. Feedback
      supabase
        .from("tm_feedback")
        .select("*")
        .order("created_at", { ascending: false }),

      // 6. Skills
      supabase
        .from("tm_skills")
        .select("*")
        .order("created_at", { ascending: false }),

      // 7. Certifications
      supabase
        .from("tm_certifications")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    const errors = [
      projectResult.error,
      taskResult.error,
      memberResult.error,
      submissionResult.error,
      feedbackResult.error,
      skillResult.error,
      certificationResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      setError(errors[0]?.message || "Unable to load dashboard data.");
    } else {
      setProjects((projectResult.data || []) as Project[]);
      setTasks((taskResult.data || []) as Task[]);
      setTeamMembers((memberResult.data || []) as TeamMember[]);
      setSubmissions((submissionResult.data || []) as Submission[]);
      setFeedbackList((feedbackResult.data || []) as Feedback[]);
      setSkills((skillResult.data || []) as Skill[]);
      setCertifications(
        (certificationResult.data || []) as Certification[]
      );
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleSaveProject = async () => {
    if (role !== "admin") return;

    const title = projectTitle.trim();

    if (!title) {
      setProjectMessage("Project title is required.");
      return;
    }

    setSavingProject(true);
    setProjectMessage("");

    const projectData = {
      title,
      description: projectDescription.trim() || null,
      status: projectStatus,
      updated_at: new Date().toISOString(),
    };

    const result = editingProject
      ? await supabase
          .from("tm_projects")
          .update(projectData)
          .eq("id", editingProject.id)
      : await supabase.from("tm_projects").insert({
          ...projectData,
          created_by: userId,
        });

    if (result.error) {
      setProjectMessage(result.error.message);
    } else {
      setProjectMessage(
        editingProject
          ? "Project updated successfully."
          : "Project created successfully."
      );

      setProjectTitle("");
      setProjectDescription("");
      setProjectStatus("active");
      setEditingProject(null);
      setShowProjectForm(false);

      await loadDashboard();
    }

    setSavingProject(false);
  };

  const handleSaveTask = async () => {
    if (role !== "admin") return;

    const title = taskTitle.trim();

    if (!title || !taskAssignee) {
      setTaskMessage("Task title and member are required.");
      return;
    }

    setSavingTask(true);
    setTaskMessage("");

    const { error } = await supabase.from("tm_tasks").insert({
      title,
      description: taskDescription.trim() || null,
      project_id: taskProject || null,
      assigned_to: taskAssignee,
      created_by: userId,
      priority: taskPriority,
      due_date: taskDueDate
        ? new Date(`${taskDueDate}T23:59:59`).toISOString()
        : null,
      status: "todo",
    });

    if (error) {
      setTaskMessage(error.message);
    } else {
      setShowTaskForm(false);
      setTaskTitle("");
      setTaskDescription("");
      setTaskProject("");
      setTaskAssignee("");
      setTaskPriority("medium");
      setTaskDueDate("");
      setTaskMessage("");

      await loadDashboard();
    }

    setSavingTask(false);
  };
  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: Task["status"]
  ) => {
    if (role !== "member") return;

    const { error } = await supabase.rpc("tm_update_task_status", {
      target_task_id: taskId,
      new_status: newStatus,
    });

    if (error) {
      setError(error.message);
      return;
    }

    await loadDashboard();
  };

  const handleSubmitTask = async () => {
    if (role !== "member") return;

    if (!selectedSubmissionTask) {
      setSubmissionMessage("Please select a task.");
      return;
    }

    if (!submissionText.trim() && !submissionFileUrl.trim()) {
      setSubmissionMessage("Add a description or submission link.");
      return;
    }

    setSavingSubmission(true);
    setSubmissionMessage("");

    const { error } = await supabase.from("tm_submissions").insert({
      task_id: selectedSubmissionTask,
      submitted_by: userId,
      submission_text: submissionText.trim() || null,
      file_url: submissionFileUrl.trim() || null,
      status: "pending",
    });

    if (error) {
      setSubmissionMessage(error.message);
    } else {
      setSubmissionText("");
      setSubmissionFileUrl("");
      setSelectedSubmissionTask("");
      setSubmissionMessage("Submission successful!");

      await loadDashboard();
    }

    setSavingSubmission(false);
  };
  const handleSaveFeedback = async () => {
    if (role !== "admin") return;

    if (!selectedFeedbackSubmission || !feedbackText.trim()) {
      setFeedbackMessage("Select a submission and enter feedback.");
      return;
    }

    setSavingFeedback(true);
    setFeedbackMessage("");

    const { error } = await supabase.from("tm_feedback").insert({
      submission_id: selectedFeedbackSubmission,
      reviewer_id: userId,
      feedback: feedbackText.trim(),
    });

    if (error) {
      setFeedbackMessage(error.message);
    } else {
      setFeedbackText("");
      setSelectedFeedbackSubmission("");
      setFeedbackMessage("Feedback submitted successfully!");

      await loadDashboard();
    }

    setSavingFeedback(false);
  };
  const handleUpdateSubmissionStatus = async (
  submissionId: string,
  newStatus: "reviewed" | "revision_required"
) => {
  if (role !== "admin") return;

  const { error } = await supabase
    .from("tm_submissions")
    .update({ status: newStatus })
    .eq("id", submissionId);

  if (error) {
    setFeedbackMessage(error.message);
    return;
  }

  setFeedbackMessage(
    newStatus === "reviewed"
      ? "Submission approved successfully!"
      : "Revision requested successfully!"
  );

  await loadDashboard();
};

  const handleSaveSkill = async () => {
  if (!skillName.trim()) {
    setSkillMessage("Skill name is required.");
    return;
  }

  setSavingSkill(true);
  setSkillMessage("");

  const { error } = await supabase.from("tm_skills").insert({
    user_id: userId,
    skill_name: skillName.trim(),
    proficiency: skillProficiency,
  });

  if (error) {
    setSkillMessage(error.message);
  } else {
    setSkillName("");
    setSkillProficiency("beginner");
    setSkillMessage("Skill added successfully!");
    await loadDashboard();
  }

  setSavingSkill(false);
};

const handleSaveCertification = async () => {
  if (!certificationTitle.trim()) {
    setCertificationMessage("Certification title is required.");
    return;
  }

  setSavingCertification(true);
  setCertificationMessage("");

  const { error } = await supabase.from("tm_certifications").insert({
    user_id: userId,
    title: certificationTitle.trim(),
    issuer: certificationIssuer.trim() || null,
    certificate_url: certificationUrl.trim() || null,
    issued_at: certificationDate || null,
  });

  if (error) {
    setCertificationMessage(error.message);
  } else {
    setCertificationTitle("");
    setCertificationIssuer("");
    setCertificationUrl("");
    setCertificationDate("");
    setCertificationMessage("Certification added successfully!");
    await loadDashboard();
  }

  setSavingCertification(false);
};
const handleTransferAdmin = async (targetUserId: string) => {
  if (role !== "admin" || targetUserId === userId) {
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to transfer Admin access to this member? You will become a Member."
  );

  if (!confirmed) return;

  setTransferringAdmin(true);
  setTransferMessage("");

  const { error } = await supabase.rpc("tm_transfer_admin", {
    target_user_id: targetUserId,
  });

  if (error) {
    setTransferMessage(error.message);
    setTransferringAdmin(false);
    return;
  }

  setTransferMessage("Admin role transferred successfully!");

  window.location.reload();
};
 const myTasks = tasks.filter((task) => task.assigned_to === userId);

const visibleTasks = (role === "admin" ? tasks : myTasks).filter(
  (task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(taskSearch.toLowerCase().trim());

    const matchesStatus =
      taskStatusFilter === "all" || task.status === taskStatusFilter;

    const matchesPriority =
      taskPriorityFilter === "all" ||
      task.priority === taskPriorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  }
);
  const completedTasks = visibleTasks.filter(
    (task) => task.status === "completed"
  ).length;

  const inProgressTasks = visibleTasks.filter(
    (task) => task.status === "in_progress"
  ).length;

  const todoTasks = visibleTasks.filter(
    (task) => task.status === "todo"
  ).length;

  const completionRate =
    visibleTasks.length > 0
      ? Math.round((completedTasks / visibleTasks.length) * 100)
      : 0;
      const firstDayOfMonth = new Date(
  calendarMonth.getFullYear(),
  calendarMonth.getMonth(),
  1
);

const daysInMonth = new Date(
  calendarMonth.getFullYear(),
  calendarMonth.getMonth() + 1,
  0
).getDate();

const startingDay = firstDayOfMonth.getDay();

const calendarDays = [
  ...Array.from({ length: startingDay }, () => null),
  ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
];

  const tabs = [
    "Overview",
    "Projects",
    "Tasks",
    "Calendar",
    "Submissions",
    "Skills & Certifications",
    ...(role === "admin" ? ["Team Management"] : []),
  ];

  const stats = [
    {
      label: "Total Tasks",
      value: visibleTasks.length,
      icon: "▤",
      color: "text-cyan-300",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: "◷",
      color: "text-violet-300",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: "✓",
      color: "text-emerald-300",
    },
    {
      label: "Pending",
      value: todoTasks,
      icon: "○",
      color: "text-amber-300",
    },
  ];

  return (
    <main className="min-h-screen bg-[#070914] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              ERROR 404 · Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Task Manager<span className="text-cyan-400">.</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Your academic and project progress, organized.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                role === "admin"
                  ? "border-violet-400/30 bg-violet-400/10 text-violet-200"
                  : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
              }`}
            >
              {role === "admin" ? "★ ADMIN" : "● MEMBER"}
            </span>

            <button
              onClick={() => void loadDashboard()}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
            >
              ↻ Refresh
            </button>
          </div>
        </header>

        <nav className="mt-7 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition ${
                activeTab === tab
                  ? "bg-cyan-400/15 font-semibold text-cyan-200"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {activeTab === "Overview" && (
          <section className="mt-8">
            <div className="mb-7">
              <p className="text-sm text-slate-400">Workspace overview</p>
              <h2 className="mt-1 text-2xl font-semibold">
                Welcome back<span className="text-cyan-400">.</span>
              </h2>
            </div>

            {loading ? (
              <p className="py-12 text-center text-slate-400">
                Loading your workspace...
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/4 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          {stat.label}
                        </span>
                        <span className={`text-xl ${stat.color}`}>
                          {stat.icon}
                        </span>
                      </div>
                      <p className="mt-5 text-3xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/4 p-6 lg:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">Task Completion</h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {completedTasks} of {visibleTasks.length} tasks
                          completed
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-cyan-300">
                        {completionRate}%
                      </span>
                    </div>

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-cyan-400 to-violet-500 transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
                    <p className="text-sm text-slate-400">Active Projects</p>
                    <p className="mt-3 text-3xl font-bold">
                      {projects.filter((p) => p.status === "active").length}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {projects.length} total projects
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/4 p-6">
                  <h3 className="font-semibold">Recent Tasks</h3>
                  {visibleTasks.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No tasks assigned yet.
                    </p>
                  ) : (
                    <div className="mt-4 divide-y divide-white/10">
                      {visibleTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="flex flex-wrap items-center justify-between gap-3 py-4"
                        >
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {task.description || "No description"}
                            </p>
                          </div>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                            {statusLabels[task.status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === "Projects" && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Projects</h2>
            <p className="mt-2 text-sm text-slate-400">
              Track team projects and academic work.
            </p>

            {role === "admin" && (
              <div className="mt-5">
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setProjectTitle("");
                    setProjectDescription("");
                    setProjectStatus("active");
                    setProjectMessage("");
                    setShowProjectForm(true);
                  }}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  + Add Project
                </button>
              </div>
            )}

            {showProjectForm && role === "admin" && (
              <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-white/4 p-6">
                <h3 className="text-lg font-semibold">
                  {editingProject ? "Edit Project" : "Create New Project"}
                </h3>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSaveProject();
                  }}
                  className="mt-5 space-y-4"
                >
                  <input
                    value={projectTitle}
                    onChange={(event) => setProjectTitle(event.target.value)}
                    placeholder="Project title"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />

                  <textarea
                    value={projectDescription}
                    onChange={(event) =>
                      setProjectDescription(event.target.value)
                    }
                    placeholder="Project description"
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />

                  <select
                    value={projectStatus}
                    onChange={(event) =>
                      setProjectStatus(event.target.value as Project["status"])
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>

                  {projectMessage && (
                    <p className="text-sm text-cyan-300">{projectMessage}</p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={savingProject}
                      className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
                    >
                      {savingProject ? "Saving..." : "Save Project"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProjectForm(false);
                        setEditingProject(null);
                        setProjectMessage("");
                      }}
                      className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <p className="py-10 text-slate-400">Loading projects...</p>
            ) : projects.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-400">
                No projects created yet.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className="rounded-2xl border border-white/10 bg-white/4 p-6"
                  >
                    <span className="text-xs uppercase tracking-wider text-cyan-300">
                      {project.status}
                    </span>

                    <h3 className="mt-3 text-lg font-semibold">
                      {project.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {project.description || "No description provided."}
                    </p>

                    {role === "admin" && (
                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => {
                            setEditingProject(project);
                            setProjectTitle(project.title);
                            setProjectDescription(project.description || "");
                            setProjectStatus(project.status);
                            setProjectMessage("");
                            setShowProjectForm(true);
                          }}
                          className="rounded-lg border border-cyan-400/30 px-4 py-2 text-xs text-cyan-300 hover:bg-cyan-400/10"
                        >
                          Edit
                        </button>

                        {project.status !== "archived" && (
                          <button
                            onClick={async () => {
                              const confirmed = window.confirm(
                                `Archive "${project.title}"?`
                              );

                              if (!confirmed) return;

                              const { error } = await supabase
                                .from("tm_projects")
                                .update({
                                  status: "archived",
                                  updated_at: new Date().toISOString(),
                                })
                                .eq("id", project.id);

                              if (error) {
                                setError(error.message);
                              } else {
                                await loadDashboard();
                              }
                            }}
                            className="rounded-lg border border-amber-400/30 px-4 py-2 text-xs text-amber-300 hover:bg-amber-400/10"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
  <p className="text-sm text-slate-400">
    Showing {visibleTasks.length} of{" "}
    {role === "admin" ? tasks.length : myTasks.length} tasks
  </p>

  <button
    type="button"
    onClick={() => {
      setTaskSearch("");
      setTaskStatusFilter("all");
      setTaskPriorityFilter("all");
    }}
    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
  >
    Reset Filters
  </button>
</div>
  <input
    type="text"
    value={taskSearch}
    onChange={(e) => setTaskSearch(e.target.value)}
    placeholder="Search tasks..."
    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
  />

  <select
    value={taskStatusFilter}
    onChange={(e) => setTaskStatusFilter(e.target.value)}
    className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
  >
    <option value="all">All Statuses</option>
    <option value="todo">To Do</option>
    <option value="in_progress">In Progress</option>
    <option value="completed">Completed</option>
  </select>

  <select
    value={taskPriorityFilter}
    onChange={(e) => setTaskPriorityFilter(e.target.value)}
    className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
  >
    <option value="all">All Priorities</option>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
  </select>
</div>

        {activeTab === "Tasks" && (
          
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Tasks</h2>
            <p className="mt-2 text-sm text-slate-400">
              {role === "admin"
                ? "View and monitor all team tasks."
                : "View the tasks assigned to you."}
            </p>

            {role === "admin" && (
              <div className="mt-5">
                <button
                  onClick={() => {
                    setTaskTitle("");
                    setTaskDescription("");
                    setTaskProject("");
                    setTaskAssignee("");
                    setTaskPriority("medium");
                    setTaskDueDate("");
                    setTaskMessage("");
                    setShowTaskForm(true);
                  }}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  + Add Task
                </button>
              </div>
            )}

            {showTaskForm && role === "admin" && (
              <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-white/4 p-6">
                <h3 className="text-lg font-semibold">Create New Task</h3>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSaveTask();
                  }}
                  className="mt-5 space-y-4"
                >
                  <input
                    value={taskTitle}
                    onChange={(event) => setTaskTitle(event.target.value)}
                    placeholder="Task title"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
                  />

                  <textarea
                    value={taskDescription}
                    onChange={(event) =>
                      setTaskDescription(event.target.value)
                    }
                    placeholder="Task description"
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
                  />

                  <select
                    value={taskProject}
                    onChange={(event) => setTaskProject(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                  >
                    <option value="">No project linked</option>
                    {projects
                      .filter((project) => project.status !== "archived")
                      .map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                  </select>

                  <select
                    value={taskAssignee}
                    onChange={(event) => setTaskAssignee(event.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                  >
                    <option value="">Select a member</option>
                    {teamMembers
                      .filter((member) => member.role === "member")
                      .map((member) => (
                        <option key={member.user_id} value={member.user_id}>
                          {member.user_id}
                        </option>
                      ))}
                  </select>

                  <select
                    value={taskPriority}
                    onChange={(event) =>
                      setTaskPriority(event.target.value as Task["priority"])
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>

                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(event) => setTaskDueDate(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                  />

                  {taskMessage && (
                    <p className="text-sm text-red-300">{taskMessage}</p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={savingTask}
                      className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
                    >
                      {savingTask ? "Saving..." : "Create Task"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <p className="py-10 text-slate-400">Loading tasks...</p>
            ) : visibleTasks.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-400">
                No tasks available.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {visibleTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-xl border border-white/10 bg-white/4 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {task.description || "No description"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white/10 px-3 py-1">
                          {task.priority} priority
                        </span>
                        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-cyan-200">
                          {statusLabels[task.status]}
                        </span>
                      </div>
                    </div>

                    {task.due_date && (
                      <p className="mt-3 text-xs text-slate-500">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                      
                    )}
                    
                    {role === "member" && (
                      <div className="mt-4 flex items-center gap-3">
                        <label
                          htmlFor={`task-status-${task.id}`}
                          className="text-sm text-slate-400"
                        >
                          Update status:
                        </label>

                        <select
                          id={`task-status-${task.id}`}
                          value={task.status}
                          onChange={(e) =>
                            void handleUpdateTaskStatus(
                              task.id,
                              e.target.value as Task["status"]
                            )
                          }
                          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Skills & Certifications" && (
  <section className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-2">

      {/* ADD SKILL */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
        <h2 className="text-xl font-semibold text-white">Add Skill</h2>
        <p className="mt-1 text-sm text-slate-400">
          Add your technical or professional skills.
        </p>

        <div className="mt-5 space-y-4">
          <input
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="Skill name (e.g. Python, React, Cybersecurity)"
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <select
            value={skillProficiency}
            onChange={(e) => setSkillProficiency(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>

          <button
            onClick={handleSaveSkill}
            disabled={savingSkill}
            className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
          >
            {savingSkill ? "Saving..." : "Add Skill"}
          </button>

          {skillMessage && (
            <p className="text-sm text-cyan-300">{skillMessage}</p>
          )}
        </div>
      </div>

      {/* ADD CERTIFICATION */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
        <h2 className="text-xl font-semibold text-white">
          Add Certification
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Record your professional certifications.
        </p>

        <div className="mt-5 space-y-4">
          <input
            value={certificationTitle}
            onChange={(e) => setCertificationTitle(e.target.value)}
            placeholder="Certification title"
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <input
            value={certificationIssuer}
            onChange={(e) => setCertificationIssuer(e.target.value)}
            placeholder="Issuing organization"
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <input
            value={certificationUrl}
            onChange={(e) => setCertificationUrl(e.target.value)}
            placeholder="Certificate URL (optional)"
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <input
            type="date"
            value={certificationDate}
            onChange={(e) => setCertificationDate(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
          />

          <button
            onClick={handleSaveCertification}
            disabled={savingCertification}
            className="w-full rounded-xl bg-purple-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {savingCertification ? "Saving..." : "Add Certification"}
          </button>

          {certificationMessage && (
            <p className="text-sm text-cyan-300">
              {certificationMessage}
            </p>
          )}
        </div>
      </div>
    </div>

    {/* SKILLS LIST */}
    <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
      <h2 className="text-xl font-semibold text-white">Saved Skills</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {skills.filter((skill) => skill.user_id === userId).map((skill) => (
          <div key={skill.id} className="rounded-xl border border-white/10 bg-slate-900 p-4">
            <p className="font-medium text-white">{skill.skill_name}</p>
            <p className="mt-1 text-sm text-cyan-300">{skill.proficiency}</p>
          </div>
        ))}

        {skills.filter((skill) => skill.user_id === userId).length === 0 && (
          <p className="text-sm text-slate-400">No skills added yet.</p>
        )}
      </div>
    </div>

    {/* CERTIFICATIONS LIST */}
    <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
      <h2 className="text-xl font-semibold text-white">
        Saved Certifications
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {certifications
          .filter((cert) => cert.user_id === userId)
          .map((cert) => (
            <div key={cert.id} className="rounded-xl border border-white/10 bg-slate-900 p-4">
              <p className="font-medium text-white">{cert.title}</p>
              {cert.issuer && (
                <p className="mt-1 text-sm text-slate-400">{cert.issuer}</p>
              )}
              {cert.issued_at && (
                <p className="mt-1 text-xs text-slate-500">
                  Issued: {cert.issued_at}
                </p>
              )}
              {cert.certificate_url && (
                <a
                  href={cert.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-cyan-300 hover:underline"
                >
                  View Certificate ↗
                </a>
              )}
            </div>
          ))}

        {certifications.filter((cert) => cert.user_id === userId).length === 0 && (
          <p className="text-sm text-slate-400">
            No certifications added yet.
          </p>
        )}
      </div>
    </div>
  </section>
)}

{activeTab === "Team Management" && role === "admin" && (
  <section className="space-y-6">
    <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Team Management
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage team roles and transfer Admin access.
          </p>
        </div>

        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2">
          <p className="text-sm text-cyan-300">
            Total Members: {teamMembers.length}
          </p>
        </div>
      </div>

      {transferMessage && (
        <p className="mt-4 rounded-xl bg-cyan-400/10 p-3 text-sm text-cyan-300">
          {transferMessage}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {teamMembers.map((member) => (
          <div
            key={member.user_id}
            className="flex flex-col gap-4 rounded-xl border border-white/10 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="break-all text-sm font-medium text-white">
                {member.user_id}
              </p>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  member.role === "admin"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-cyan-500/20 text-cyan-300"
                }`}
              >
                {member.role === "admin" ? "ADMIN" : "MEMBER"}
              </span>
            </div>

            {member.role === "member" && (
              <button
                onClick={() => handleTransferAdmin(member.user_id)}
                disabled={transferringAdmin}
                className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {transferringAdmin ? "Transferring..." : "Make Admin"}
              </button>
            )}

            {member.role === "admin" && (
              <span className="text-sm text-purple-300">
                Current Administrator
              </span>
            )}
          </div>
        ))}

        {teamMembers.length === 0 && (
          <p className="text-sm text-slate-400">
            No team members found.
          </p>
        )}
      </div>
    </div>
  </section>
)}

{activeTab === "Calendar" && (
  <section className="mt-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
  <div>
    <h2 className="text-2xl font-semibold">Task Calendar</h2>
    <p className="mt-2 text-sm text-slate-400">
      Track upcoming deadlines and overdue tasks.
    </p>
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={() =>
        setCalendarMonth(
          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
        )
      }
      className="rounded-lg border border-white/10 px-3 py-2 hover:bg-white/10"
    >
      ←
    </button>

    <span className="min-w-36 text-center font-semibold">
      {calendarMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}
    </span>

    <button
      onClick={() =>
        setCalendarMonth(
          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
        )
      }
      className="rounded-lg border border-white/10 px-3 py-2 hover:bg-white/10"
    >
      →
    </button>
  </div>
</div>
<div className="mt-6 rounded-2xl border border-white/10 bg-white/3 p-4">
  <div className="mb-3 grid grid-cols-7 gap-2">
    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (day) => (
        <div
          key={day}
          className="py-2 text-center text-xs font-semibold text-slate-400"
        >
          {day}
        </div>
      )
    )}
  </div>

  <div className="grid grid-cols-7 gap-2">
    {calendarDays.map((day, index) => {
      if (day === null) {
        return <div key={`empty-${index}`} />;
      }

      const date = new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth(),
        day
      );

      const dayTasks = tasks.filter((task) => {
        if (!task.due_date) return false;
        if (role !== "admin" && task.assigned_to !== userId) return false;

        const dueDate = new Date(task.due_date);

        return (
          dueDate.getFullYear() === date.getFullYear() &&
          dueDate.getMonth() === date.getMonth() &&
          dueDate.getDate() === date.getDate()
        );
      });

      const isSelected =
        selectedCalendarDate?.toDateString() === date.toDateString();

      return (
        <button
          key={day}
          type="button"
          onClick={() => setSelectedCalendarDate(date)}
          className={`min-h-16 rounded-xl border p-2 text-center transition ${
            isSelected
              ? "border-cyan-400 bg-cyan-500/15"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          <span className="text-sm font-semibold">{day}</span>

          {dayTasks.length > 0 && (
            <span className="mt-1 block text-xs text-cyan-300">
              {dayTasks.length} task{dayTasks.length > 1 ? "s" : ""}
            </span>
          )}
        </button>
      );
    })}
  </div>
</div>
{selectedCalendarDate && (
  <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-5">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-semibold text-cyan-300">
        Tasks for{" "}
        {selectedCalendarDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </h3>

      <button
        onClick={() => setSelectedCalendarDate(null)}
        className="text-sm text-slate-400 hover:text-white"
      >
        Clear
      </button>
    </div>

    {tasks.filter((task) => {
      if (!task.due_date) return false;
      if (role !== "admin" && task.assigned_to !== userId) return false;

      return (
        new Date(task.due_date).toDateString() ===
        selectedCalendarDate.toDateString()
      );
    }).length === 0 ? (
      <p className="text-sm text-slate-400">
        No tasks scheduled for this date.
      </p>
    ) : (
      <div className="space-y-3">
        {tasks
          .filter((task) => {
            if (!task.due_date) return false;
            if (role !== "admin" && task.assigned_to !== userId) return false;

            return (
              new Date(task.due_date).toDateString() ===
              selectedCalendarDate.toDateString()
            );
          })
          .map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <h4 className="font-medium">{task.title}</h4>
              <p className="mt-1 text-xs text-slate-400">
                Due: {new Date(task.due_date!).toLocaleTimeString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Priority: {task.priority} · Status: {task.status.replace("_", " ")}
              </p>
            </div>
          ))}
      </div>
    )}
  </div>
)}

    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks
        .filter((task) => {
          if (role === "admin") return true;
          return task.assigned_to === userId;
        })
        .filter((task) => task.due_date)
        .sort(
  (a, b) =>
    new Date(a.due_date!).getTime() -
    new Date(b.due_date!).getTime()
)
        .map((task) => {
          if (!task.due_date) return null;

          const overdue =
            new Date(task.due_date).getTime() < Date.now() &&
            task.status !== "completed";

          return (
            <article
              key={task.id}
              className="rounded-2xl border border-white/10 bg-white/4 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{task.title}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    overdue
                      ? "bg-red-500/15 text-red-300"
                      : task.status === "completed"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-cyan-500/15 text-cyan-300"
                  }`}
                >
                  {overdue
                    ? "Overdue"
                    : task.status === "completed"
                      ? "Completed"
                      : "Upcoming"}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-400">
                Due: {new Date(task.due_date).toLocaleString()}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Priority: {task.priority}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Status: {task.status.replace("_", " ")}
              </p>
            </article>
          );
        })}
    </div>

    {tasks.filter(
      (task) =>
        task.due_date &&
        (role === "admin" || task.assigned_to === userId)
    ).length === 0 && (
      <p className="mt-6 rounded-xl border border-white/10 p-6 text-center text-slate-400">
        No tasks with deadlines yet.
      </p>
    )}
  </section>
)}

        {activeTab === "Submissions" && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Task Submissions</h2>
            <p className="mt-2 text-sm text-slate-400">
              Submit your completed work and review feedback.
            </p>

            {role === "member" && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSubmitTask();
                }}
                className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/4 p-6"
              >
                <h3 className="text-lg font-semibold">Submit Your Work</h3>

                <select
                  value={selectedSubmissionTask}
                  onChange={(event) =>
                    setSelectedSubmissionTask(event.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                >
                  <option value="">Select assigned task</option>
                  {tasks
                    .filter((task) => task.assigned_to === userId)
                    .map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                </select>

                <textarea
                  value={submissionText}
                  onChange={(event) => setSubmissionText(event.target.value)}
                  placeholder="Describe your completed work..."
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
                />

                <input
                  type="url"
                  value={submissionFileUrl}
                  onChange={(event) =>
                    setSubmissionFileUrl(event.target.value)
                  }
                  placeholder="Submission link (Google Drive, GitHub, etc.)"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
                />

                {submissionMessage && (
                  <p className="text-sm text-cyan-300">{submissionMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={savingSubmission}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
                >
                  {savingSubmission ? "Submitting..." : "Submit Work"}
                </button>
              </form>
            )}
            {role === "admin" && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSaveFeedback();
                }}
                className="mt-6 space-y-4 rounded-2xl border border-cyan-400/20 bg-white/4 p-6"
              >
                <h3 className="text-lg font-semibold">Review Submission</h3>

                <select
                  value={selectedFeedbackSubmission}
                  onChange={(event) =>
                    setSelectedFeedbackSubmission(event.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                >
                  <option value="">Select a submission</option>
                  {submissions.map((submission) => (
                    <option key={submission.id} value={submission.id}>
                      {tasks.find((task) => task.id === submission.task_id)
                        ?.title || "Task"}{" "}
                      — {submission.submitted_by}
                    </option>
                  ))}
                </select>

                <textarea
                  value={feedbackText}
                  onChange={(event) => setFeedbackText(event.target.value)}
                  placeholder="Write your feedback..."
                  rows={4}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
                />

                {feedbackMessage && (
                  <p className="text-sm text-cyan-300">{feedbackMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={savingFeedback}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
                >
                  {savingFeedback ? "Saving..." : "Send Feedback"}
                </button>
              </form>
            )}

            <div className="mt-6 space-y-4">
              {submissions
                .filter(
                  (submission) =>
                    role === "admin" || submission.submitted_by === userId
                )
                .map((submission) => (
                  <article
                    key={submission.id}
                    className="rounded-xl border border-white/10 bg-white/4 p-5"
                  >
                    <h3 className="font-semibold">
                      {tasks.find((task) => task.id === submission.task_id)
                        ?.title || "Task"}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      {submission.submission_text || "No description provided"}
                    </p>

                    {submission.file_url && (
                      <a
                        href={submission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm text-cyan-300 underline"
                      >
                        View Submission
                      </a>
                    )}

                    <p className="mt-3 text-xs text-slate-500">
                      Status: {submission.status} ·{" "}
                      {new Date(submission.submitted_at).toLocaleString()}
                    </p>

                    <div className="mt-4 border-t border-white/10 pt-4">
                      <h4 className="text-sm font-semibold">Feedback</h4>
                      {feedbackList
                        .filter(
                          (feedback) =>
                            feedback.submission_id === submission.id
                        )
                        .map((feedback) => (
                          <p
                            key={feedback.id}
                            className="mt-2 text-sm text-slate-300"
                          >
                            {feedback.feedback}
                          </p>
                        ))}
                    </div>
                  </article>
                ))}
            </div>
          </section>
        )}

        <footer className="mt-14 border-t border-white/10 pt-5 text-center text-xs text-slate-500">
          ERROR 404 · Task Manager · Academic Workspace
        </footer>
      </div>
    </main>
  );
}