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
    console.log('📍 LoginPage useEffect triggered:', { isAuthenticated, authLoading, hasUser: !!user });
    
    if (isAuthenticated && !authLoading) {
      console.log('✅ Already authenticated, redirecting to dashboard...');
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router, user]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <svg
              className="w-8 h-8 text-[#f15a22]"
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
          <p className="text-[#6b6560]">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('==========================================');
    console.log('🔐 LOGIN FORM SUBMITTED');
    console.log('==========================================');
    console.log('ID Karyawan:', idKaryawan);
    console.log('Password length:', password.length);
    console.log('Time:', new Date().toISOString());
    
    setError("");
    setIsLoading(true);

    try {
      console.log('📡 Step 1: Calling login() from AuthContext...');
      await login(idKaryawan, password);
      
      console.log('✅ Step 2: login() completed successfully');
      console.log('Current isAuthenticated:', isAuthenticated);
      
      console.log('🎉 Step 3: Showing success notification...');
      showSuccess("Login berhasil!");
      
      console.log('⏳ Step 4: useEffect will handle redirect automatically');
      // Don't manually redirect - let the useEffect handle it after state updates
      
    } catch (err: any) {
      console.log('==========================================');
      console.log('❌ LOGIN FAILED');
      console.log('==========================================');
      console.error('Error object:', err);
      console.error('Error message:', err?.message);
      console.error('Error response:', err?.response);
      
      const errorMsg = err?.message || err?.response?.data?.message || "ID Karyawan atau password salah";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
      console.log('🏁 handleSubmit finally block - isLoading set to false');
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="bg-[#231f20] py-[calc(72px+64px)] px-5 md:px-10 border-b-[4px] border-b-[#f15a22]">
        <div className="max-w-7xl mx-auto">
          <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-4">
            Login
          </div>
          <h1 className="font-barlow-condensed font-extrabold text-white uppercase leading-[0.95] tracking-[-0.01em] text-[clamp(48px,7vw,88px)]">
            OHS Portal
          </h1>
        </div>
      </div>

      {/* Login Form */}
      <section className="py-16 md:py-24 px-5 md:px-10 bg-[#faf9f7] min-h-screen flex items-center">
        <div className="max-w-md mx-auto w-full">
          <div className="bg-[#ffffff] p-8 md:p-10 rounded shadow-sm">
            <div className="text-center mb-8">
              <div className="font-barlow-condensed text-[24px] font-bold uppercase text-[#231f20] mb-2">
                Welcome Back
              </div>
              <p className="text-[14px] text-[#6b6560]">
                Please enter your credentials to access the OHS portal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="idKaryawan"
                  className="font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2 block"
                >
                  ID Karyawan
                </label>
                <input
                  id="idKaryawan"
                  type="text"
                  value={idKaryawan}
                  onChange={(e) => setIdKaryawan(e.target.value)}
                  className="w-full px-4 py-3 bg-[#ffffff] border border-[#c5c0bb] font-barlow text-[14px] text-[#231f20] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22] transition-colors"
                  placeholder="82400469"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2 block"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#ffffff] border border-[#c5c0bb] font-barlow text-[14px] text-[#231f20] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22] transition-colors"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="block w-full px-6 py-3.5 bg-[#f15a22] text-white font-barlow-condensed font-bold text-[12px] tracking-[0.12em] uppercase border-2 border-[#f15a22] hover:bg-[#231f20] hover:border-[#231f20] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
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
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Forgot password link */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-[13px] text-[#6b6560] hover:text-[#f15a22] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-600 text-[14px]">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-[13px] text-[#6b6560]">
              <p>Contoh kredensial dari database:</p>
              <div className="mt-2 space-y-1 font-mono text-xs">
                <p>🔑 82401013 / 82401013K3 (Admin)</p>
                <p>🔑 82400469 / 82400469K3 (Supervisor)</p>
                <p>🔑 82400945 / 82400945K3 (User)</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-[14px] text-[#6b6560] hover:text-[#231f20] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to Home
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
