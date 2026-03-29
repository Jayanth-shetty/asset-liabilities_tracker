"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useUpdates } from "@/components/UpdatesContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const {
    updates,
    isLoading: updatesLoading,
    error,
    fetchUpdates,
    createUpdate,
    updateUpdate,
    deleteUpdate,
  } = useUpdates();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">(
    "pending",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("");
  const [completedAt, setCompletedAt] = useState<{ [key: string]: string }>({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Fetch updates on mount
  useEffect(() => {
    if (user) {
      fetchUpdates();
    }
  }, [user, fetchUpdates]);

  const handleCreateUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (!title.trim() || !content.trim()) {
        throw new Error("Please fill in all fields");
      }

      await createUpdate(title, content, status);
      setTitle("");
      setContent("");
      setStatus("pending");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (updateId: string, newStatus: string) => {
    try {
      const update = updates.find((u) => u._id === updateId);
      if (!update) return;

      const newCompletedAt =
        newStatus === "completed" ? new Date().toISOString() : null;
      if (newCompletedAt) {
        setCompletedAt((prev) => ({
          ...prev,
          [updateId]: new Date(newCompletedAt).toLocaleString(),
        }));
      }

      await updateUpdate(updateId, update.title, update.content, newStatus);
      setEditingId(null);
    } catch (err: any) {
      console.error("Failed to update status:", err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 border-4 border-purple-300 border-t-white rounded-full"
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const badgeVariants = {
    pending: "bg-gray-100 text-gray-800 border-gray-200",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <motion.div
        className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: 2,
          }}
        />
      </motion.div>

      {/* Header */}
      <motion.header
        className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-purple-200 text-sm">Welcome, {user?.username}</p>
          </motion.div>
          <div className="flex gap-3">
            <Link href="/liabilities">
              <motion.button
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Liabilities
              </motion.button>
            </Link>
            <motion.button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={itemVariants}
          >
            {[
              {
                label: "Total",
                count: updates.length,
                color: "from-blue-600 to-blue-700",
              },
              {
                label: "Pending",
                count: updates.filter((u) => u.status === "pending").length,
                color: "from-gray-600 to-gray-700",
              },
              {
                label: "Completed",
                count: updates.filter((u) => u.status === "completed").length,
                color: "from-green-600 to-green-700",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className={`bg-gradient-to-r ${stat.color} rounded-xl p-6 text-white shadow-lg`}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm font-semibold opacity-80">{stat.label}</p>
                <p className="text-4xl font-bold mt-2">{stat.count}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Create Update Form */}
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Create New Update
            </h2>

            {submitError && (
              <motion.div
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {submitError}
              </motion.div>
            )}

            <form onSubmit={handleCreateUpdate} className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-white/80 font-semibold mb-2">
                  Title
                </label>
                <motion.input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter update title"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition"
                  whileFocus={{ scale: 1.02 }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-white/80 font-semibold mb-2">
                  Content
                </label>
                <motion.textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter update details"
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition resize-none"
                  whileFocus={{ scale: 1.02 }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-white/80 font-semibold mb-2">
                  Status
                </label>
                <motion.select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition"
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="pending" className="bg-slate-900">
                    Pending
                  </option>
                  <option value="in-progress" className="bg-slate-900">
                    In Progress
                  </option>
                  <option value="completed" className="bg-slate-900">
                    Completed
                  </option>
                </motion.select>
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? "Creating..." : "Create Update"}
              </motion.button>
            </form>
          </motion.div>

          {/* Updates List */}
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Updates (
                {
                  updates.filter(
                    (u) => !filterStatus || u.status === filterStatus,
                  ).length
                }
                )
              </h2>
            </div>

            {/* Filter Buttons */}
            <motion.div
              className="flex flex-wrap gap-3 mb-6"
              variants={containerVariants}
            >
              {["All", "pending", "in-progress", "completed"].map((filter) => (
                <motion.button
                  key={filter}
                  onClick={() =>
                    setFilterStatus(filter === "All" ? null : filter)
                  }
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    (filter === "All" && filterStatus === null) ||
                    (filter !== "All" && filterStatus === filter)
                      ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white"
                      : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variants={itemVariants}
                >
                  {filter === "All"
                    ? "All"
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </motion.button>
              ))}
            </motion.div>

            {error && (
              <motion.div
                className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            {updatesLoading ? (
              <motion.div
                className="text-center py-12"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-white/60">Loading updates...</p>
              </motion.div>
            ) : updates.filter(
                (u) => !filterStatus || u.status === filterStatus,
              ).length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-white/60">
                  No updates found. Create one to get started!
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div className="space-y-4">
                  {updates
                    .filter((u) => !filterStatus || u.status === filterStatus)
                    .map((update) => (
                      <motion.div
                        key={update._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="border border-white/20 rounded-xl p-5 hover:border-purple-500/50 hover:bg-white/5 transition"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">
                              {update.title}
                            </h3>
                            <p className="text-sm text-white/60">
                              by {update.username}
                            </p>
                          </div>

                          {editingId === update._id ? (
                            <motion.div
                              className="flex gap-2"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              <select
                                value={editingStatus}
                                onChange={(e) =>
                                  setEditingStatus(e.target.value)
                                }
                                className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                              >
                                <option
                                  value="pending"
                                  className="bg-slate-900"
                                >
                                  Pending
                                </option>
                                <option
                                  value="in-progress"
                                  className="bg-slate-900"
                                >
                                  In Progress
                                </option>
                                <option
                                  value="completed"
                                  className="bg-slate-900"
                                >
                                  Completed
                                </option>
                              </select>
                              <motion.button
                                onClick={() =>
                                  handleStatusChange(update._id, editingStatus)
                                }
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-sm transition"
                                whileHover={{ scale: 1.05 }}
                              >
                                Save
                              </motion.button>
                              <motion.button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 bg-white/10 border border-white/20 text-white font-semibold rounded text-sm transition hover:bg-white/20"
                                whileHover={{ scale: 1.05 }}
                              >
                                Cancel
                              </motion.button>
                            </motion.div>
                          ) : (
                            <motion.button
                              onClick={() => {
                                setEditingId(update._id);
                                setEditingStatus(update.status);
                              }}
                              className={`px-4 py-1 rounded-full text-xs font-semibold cursor-pointer transition border ${badgeVariants[update.status as keyof typeof badgeVariants]}`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {update.status.charAt(0).toUpperCase() +
                                update.status.slice(1)}
                            </motion.button>
                          )}
                        </div>

                        <p className="text-white/80 mb-4">{update.content}</p>

                        <motion.div
                          className="flex justify-between text-xs text-white/50"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <p>
                            Updated:{" "}
                            {new Date(update.updatedAt).toLocaleString()}
                          </p>
                          {completedAt[update._id] && (
                            <p>Completed: {completedAt[update._id]}</p>
                          )}
                        </motion.div>
                      </motion.div>
                    ))}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Confirm Logout
              </h3>
              <p className="text-white/80 mb-6">
                Are you sure you want to logout from your account?
              </p>
              <div className="flex gap-4">
                <motion.button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
