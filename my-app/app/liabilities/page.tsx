"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useLiabilities } from "@/components/LiabilitiesContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LiabilitiesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const {
    liabilities,
    isLoading,
    error,
    fetchLiabilities,
    createLiability,
    updateLiability,
    deleteLiability,
  } = useLiabilities();

  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [dateGiven, setDateGiven] = useState("");
  const [daysToReturn, setDaysToReturn] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch liabilities on mount
  useEffect(() => {
    if (user) {
      fetchLiabilities();
    }
  }, [user, fetchLiabilities]);

  const handleCreateLiability = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      if (!personName.trim() || !amount || !dateGiven || !daysToReturn) {
        throw new Error("Please fill in all required fields");
      }

      const numberedAmount = parseFloat(amount);
      if (numberedAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      const days = parseInt(daysToReturn);
      if (days <= 0) {
        throw new Error("Days to return must be greater than 0");
      }

      await createLiability(
        personName,
        numberedAmount,
        dateGiven,
        days,
        description,
      );
      setPersonName("");
      setAmount("");
      setDateGiven("");
      setDaysToReturn("");
      setDescription("");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create liability");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLiability = async (id: string, data?: any) => {
    try {
      setSubmitError("");
      const dataToUpdate = data || editingData;
      console.log("Updating liability with data:", dataToUpdate);

      await updateLiability(
        id,
        dataToUpdate.personName,
        typeof dataToUpdate.amount === "string"
          ? parseFloat(dataToUpdate.amount)
          : dataToUpdate.amount,
        dataToUpdate.dateGiven,
        typeof dataToUpdate.daysToReturn === "string"
          ? parseInt(dataToUpdate.daysToReturn)
          : dataToUpdate.daysToReturn,
        dataToUpdate.description,
        dataToUpdate.status,
      );
      setEditingId(null);
      setEditingData(null);
      console.log("Liability updated successfully");
    } catch (err: any) {
      console.error("Update error:", err);
      setSubmitError(err.message || "Failed to update liability");
    }
  };

  const handleDeleteLiability = async (id: string) => {
    try {
      await deleteLiability(id);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to delete liability");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-300 border-t-white rounded-full"
        />
      </div>
    );
  }

  const totalAmount = liabilities
    .filter((l) => l.status === "pending")
    .reduce((sum, l) => sum + l.amount, 0);

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

  const calculateDueDate = (dateGiven: string, daysToReturn: number) => {
    const given = new Date(dateGiven);
    const due = new Date(given.getTime() + daysToReturn * 24 * 60 * 60 * 1000);
    return due;
  };

  const getDaysUntilDue = (dateGiven: string, daysToReturn: number) => {
    const today = new Date();
    const due = calculateDueDate(dateGiven, daysToReturn);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueStatus = (dateGiven: string, daysToReturn: number) => {
    const days = getDaysUntilDue(dateGiven, daysToReturn);
    if (days < 0) return "overdue";
    if (days === 0) return "today";
    if (days <= 7) return "urgent";
    return "upcoming";
  };

  const getDueStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "bg-red-600 text-white";
      case "today":
        return "bg-orange-600 text-white";
      case "urgent":
        return "bg-yellow-600 text-white";
      default:
        return "bg-blue-600 text-white";
    }
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
            ease: "easeInOut",
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
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </motion.div>

      {/* Header */}
      <motion.header
        className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-white">Liabilities</h1>
            <p className="text-purple-200 text-sm">Track who owes you money</p>
          </motion.div>
          <Link href="/dashboard">
            <motion.button
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold rounded-lg transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Dashboard
            </motion.button>
          </Link>
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
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={itemVariants}
          >
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <p className="text-sm font-semibold opacity-80">
                Total Outstanding
              </p>
              <p className="text-4xl font-bold mt-2">
                ₹{totalAmount.toFixed(2)}
              </p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <p className="text-sm font-semibold opacity-80">
                Pending Liabilities
              </p>
              <p className="text-4xl font-bold mt-2">
                {liabilities.filter((l) => l.status === "pending").length}
              </p>
            </motion.div>
          </motion.div>

          {/* Create Liability Form */}
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Add New Liability
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

            <form onSubmit={handleCreateLiability} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-white/80 font-semibold mb-2">
                    Person Name
                  </label>
                  <motion.input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="Who owes you money?"
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
                    Amount (₹)
                  </label>
                  <motion.input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition"
                    whileFocus={{ scale: 1.02 }}
                  />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-white/80 font-semibold mb-2">
                    Date Given
                  </label>
                  <motion.input
                    type="date"
                    value={dateGiven}
                    onChange={(e) => setDateGiven(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition"
                    whileFocus={{ scale: 1.02 }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-white/80 font-semibold mb-2">
                    Days to Return
                  </label>
                  <motion.input
                    type="number"
                    value={daysToReturn}
                    onChange={(e) => setDaysToReturn(e.target.value)}
                    placeholder="30"
                    min="1"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition"
                    whileFocus={{ scale: 1.02 }}
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-white/80 font-semibold mb-2">
                  Description (Optional)
                </label>
                <motion.textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was this money for?"
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition resize-none"
                  whileFocus={{ scale: 1.02 }}
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? "Adding..." : "Add Liability"}
              </motion.button>
            </form>
          </motion.div>

          {/* Liabilities List */}
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Your Liabilities ({liabilities.length})
              </h2>
            </div>

            {/* Filter Buttons */}
            <motion.div
              className="flex flex-wrap gap-3 mb-6"
              variants={containerVariants}
            >
              {["All", "pending", "paid"].map((filter) => (
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
                  {filter}
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

            {isLoading ? (
              <motion.div
                className="text-center py-12"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-white/60">Loading liabilities...</p>
              </motion.div>
            ) : liabilities.filter(
                (l) => !filterStatus || l.status === filterStatus,
              ).length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-white/60">
                  No liabilities yet. Add one to get started!
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div className="space-y-4">
                  {liabilities
                    .filter((l) => !filterStatus || l.status === filterStatus)
                    .sort(
                      (a, b) =>
                        getDaysUntilDue(a.dateGiven, a.daysToReturn) -
                        getDaysUntilDue(b.dateGiven, b.daysToReturn),
                    )
                    .map((liability) => (
                      <motion.div
                        key={liability._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="border border-white/20 rounded-xl p-5 hover:border-purple-500/50 hover:bg-white/5 transition"
                        whileHover={{ y: -2 }}
                      >
                        {editingId === liability._id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={editingData.personName}
                                onChange={(e) =>
                                  setEditingData({
                                    ...editingData,
                                    personName: e.target.value,
                                  })
                                }
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                              />
                              <input
                                type="number"
                                value={editingData.amount}
                                onChange={(e) =>
                                  setEditingData({
                                    ...editingData,
                                    amount: e.target.value,
                                  })
                                }
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                type="date"
                                value={editingData.dateGiven}
                                onChange={(e) =>
                                  setEditingData({
                                    ...editingData,
                                    dateGiven: e.target.value,
                                  })
                                }
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                              />
                              <input
                                type="number"
                                value={editingData.daysToReturn}
                                onChange={(e) =>
                                  setEditingData({
                                    ...editingData,
                                    daysToReturn: e.target.value,
                                  })
                                }
                                placeholder="Days to return"
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                              />
                            </div>
                            <textarea
                              value={editingData.description}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                              rows={2}
                            />
                            <select
                              value={editingData.status}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  status: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                              <option value="pending" className="bg-slate-900">
                                Pending
                              </option>
                              <option value="paid" className="bg-slate-900">
                                Paid
                              </option>
                            </select>
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() =>
                                  handleUpdateLiability(
                                    liability._id,
                                    editingData,
                                  )
                                }
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                                whileHover={{ scale: 1.05 }}
                              >
                                Save
                              </motion.button>
                              <motion.button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingData(null);
                                }}
                                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white font-semibold rounded-lg transition hover:bg-white/20"
                                whileHover={{ scale: 1.05 }}
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white">
                                  {liability.personName}
                                </h3>
                                <p className="text-sm text-white/60">
                                  Given on:{" "}
                                  {new Date(
                                    liability.dateGiven,
                                  ).toLocaleDateString()}
                                  , Due in {liability.daysToReturn} days
                                </p>
                              </div>
                              <div className="flex gap-2 items-center">
                                <motion.span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    liability.status === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : getDueStatusColor(
                                          getDueStatus(
                                            liability.dateGiven,
                                            liability.daysToReturn,
                                          ),
                                        )
                                  }`}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  {liability.status === "paid"
                                    ? "Paid"
                                    : getDaysUntilDue(
                                          liability.dateGiven,
                                          liability.daysToReturn,
                                        ) > 0
                                      ? `${getDaysUntilDue(liability.dateGiven, liability.daysToReturn)} days left`
                                      : getDaysUntilDue(
                                            liability.dateGiven,
                                            liability.daysToReturn,
                                          ) === 0
                                        ? "Due Today"
                                        : `${Math.abs(getDaysUntilDue(liability.dateGiven, liability.daysToReturn))} days overdue`}
                                </motion.span>
                              </div>
                            </div>

                            <p className="text-2xl font-bold text-white mb-2">
                              ₹{liability.amount.toFixed(2)}
                            </p>

                            <p className="text-sm text-purple-200 mb-3">
                              Due by:{" "}
                              {calculateDueDate(
                                liability.dateGiven,
                                liability.daysToReturn,
                              ).toLocaleDateString()}
                            </p>

                            {liability.description && (
                              <p className="text-white/70 mb-3 text-sm">
                                {liability.description}
                              </p>
                            )}

                            <div className="flex gap-2 mt-4">
                              <motion.button
                                onClick={() => {
                                  setEditingId(liability._id);
                                  setEditingData(liability);
                                }}
                                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm transition"
                                whileHover={{ scale: 1.05 }}
                              >
                                Edit
                              </motion.button>
                              {liability.status === "pending" ? (
                                <motion.button
                                  onClick={() =>
                                    handleUpdateLiability(liability._id, {
                                      ...liability,
                                      status: "paid",
                                    })
                                  }
                                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  Mark as Paid
                                </motion.button>
                              ) : (
                                <motion.button
                                  onClick={() =>
                                    handleDeleteLiability(liability._id)
                                  }
                                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  Delete
                                </motion.button>
                              )}
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
