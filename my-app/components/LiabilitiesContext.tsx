"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface Liability {
  _id: string;
  userId: string;
  personName: string;
  amount: number;
  dateGiven: string;
  daysToReturn: number;
  description: string;
  status: "pending" | "paid";
  createdAt: string;
  updatedAt: string;
}

interface LiabilitiesContextType {
  liabilities: Liability[];
  isLoading: boolean;
  error: string | null;
  fetchLiabilities: () => Promise<void>;
  createLiability: (
    personName: string,
    amount: number,
    dateGiven: string,
    daysToReturn: number,
    description?: string,
  ) => Promise<void>;
  updateLiability: (
    id: string,
    personName: string,
    amount: number,
    dateGiven: string,
    daysToReturn: number,
    description: string,
    status: string,
  ) => Promise<void>;
  deleteLiability: (id: string) => Promise<void>;
}

const LiabilitiesContext = createContext<LiabilitiesContextType | undefined>(
  undefined,
);

export function LiabilitiesProvider({ children }: { children: ReactNode }) {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiabilities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/liabilities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch liabilities");

      const data = await res.json();
      setLiabilities(data.liabilities);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createLiability = useCallback(
    async (
      personName: string,
      amount: number,
      dateGiven: string,
      daysToReturn: number,
      description?: string,
    ) => {
      const token = localStorage.getItem("authToken");

      if (!token) throw new Error("Unauthorized");

      const res = await fetch("/api/liabilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          personName,
          amount,
          dateGiven,
          daysToReturn,
          description,
        }),
      });

      if (!res.ok) throw new Error("Failed to create liability");

      const data = await res.json();
      setLiabilities((prev) => [data.liability, ...prev]);
    },
    [],
  );

  const updateLiability = useCallback(
    async (
      id: string,
      personName: string,
      amount: number,
      dateGiven: string,
      daysToReturn: number,
      description: string,
      status: string,
    ) => {
      const token = localStorage.getItem("authToken");

      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`/api/liabilities/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          personName,
          amount,
          dateGiven,
          daysToReturn,
          description,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update liability");
      }

      setLiabilities((prev) =>
        prev.map((l) => (l._id === id ? data.liability : l)),
      );
    },
    [],
  );

  const deleteLiability = useCallback(async (id: string) => {
    const token = localStorage.getItem("authToken");

    if (!token) throw new Error("Unauthorized");

    try {
      const res = await fetch(`/api/liabilities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete liability");
      }

      setLiabilities((prev) => prev.filter((l) => l._id !== id));
    } catch (error: any) {
      throw error;
    }
  }, []);

  return (
    <LiabilitiesContext.Provider
      value={{
        liabilities,
        isLoading,
        error,
        fetchLiabilities,
        createLiability,
        updateLiability,
        deleteLiability,
      }}
    >
      {children}
    </LiabilitiesContext.Provider>
  );
}

export function useLiabilities() {
  const context = useContext(LiabilitiesContext);
  if (context === undefined) {
    throw new Error("useLiabilities must be used within a LiabilitiesProvider");
  }
  return context;
}
