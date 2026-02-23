"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

interface AuthUser {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    if (!clerkUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchUserData();
    }
  }, [clerkUser, isLoaded]);

  const signOut = async () => {
    await clerkSignOut();
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUserData();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
