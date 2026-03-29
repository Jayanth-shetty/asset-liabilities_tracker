"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface Update {
  _id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  status: "pending" | "completed" | "in-progress";
  createdAt: string;
  updatedAt: string;
}

interface UpdatesContextType {
  updates: Update[];
  isLoading: boolean;
  error: string | null;
  fetchUpdates: () => Promise<void>;
  createUpdate: (
    title: string,
    content: string,
    status?: string,
  ) => Promise<void>;
  updateUpdate: (
    id: string,
    title: string,
    content: string,
    status: string,
  ) => Promise<void>;
  deleteUpdate: (id: string) => Promise<void>;
}

const UpdatesContext = createContext<UpdatesContextType | undefined>(undefined);

export function UpdatesProvider({ children }: { children: ReactNode }) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/updates");
      if (!res.ok) throw new Error("Failed to fetch updates");

      const data = await res.json();
      setUpdates(data.updates);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUpdate = useCallback(
    async (title: string, content: string, status: string = "pending") => {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("authUser") || "{}");

      if (!token) throw new Error("Unauthorized");

      const res = await fetch("/api/updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          status,
          username: user.username,
        }),
      });

      if (!res.ok) throw new Error("Failed to create update");

      const data = await res.json();
      setUpdates((prev) => [data.update, ...prev]);
    },
    [],
  );

  const updateUpdate = useCallback(
    async (id: string, title: string, content: string, status: string) => {
      const token = localStorage.getItem("authToken");

      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`/api/updates/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, status }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();
      setUpdates((prev) => prev.map((u) => (u._id === id ? data.update : u)));
    },
    [],
  );

  const deleteUpdate = useCallback(async (id: string) => {
    const token = localStorage.getItem("authToken");

    if (!token) throw new Error("Unauthorized");

    const res = await fetch(`/api/updates/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete");

    setUpdates((prev) => prev.filter((u) => u._id !== id));
  }, []);

  return (
    <UpdatesContext.Provider
      value={{
        updates,
        isLoading,
        error,
        fetchUpdates,
        createUpdate,
        updateUpdate,
        deleteUpdate,
      }}
    >
      {children}
    </UpdatesContext.Provider>
  );
}

export function useUpdates() {
  const context = useContext(UpdatesContext);
  if (context === undefined) {
    throw new Error("useUpdates must be used within an UpdatesProvider");
  }
  return context;
}
