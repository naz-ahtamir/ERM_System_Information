"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login, user } = useAuth();
  const { showError, showSuccess } = useNotifications();

  const [idKaryawan, setIdKaryawan] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router, user]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <svg
              className="w-8 h-8 text-[#FF6B1A]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="text-sm font-medium text-[#6B7280]">Checking session...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError("");
    setIsLoading(true);

    try {
      await login(idKaryawan, password);
      showSuccess("Sign in successful!");
    } catch (err: any) {
      const errorMsg = err?.message || err?.response?.data?.message || "Invalid Employee ID or password";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon & Heading */}
        <div className="text-center">          
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2937]">
            USER LOGIN
          </h1>
          {/* <p className="text-xs text-[#6B7280] mt-1.5">
            Welcome to ERM System Information
          </p> */}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E7EB] rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="idKaryawan"
                className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5"
              >
                Employee ID
              </label>
              <input
                id="idKaryawan"
                type="text"
                value={idKaryawan}
                onChange={(e) => setIdKaryawan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-colors"
                placeholder="e.g. 82400469"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#FF6B1A] hover:text-[#E85D0F] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-colors"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-start gap-2">
                <svg
                  className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#FF6B1A] hover:bg-[#E85D0F] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#FF6B1A] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
