"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

type Section = "account" | "security" | "notifications" | "appearance";

function SectionButton({ id, active, icon, label, onClick }: {
  id: Section; active: boolean;
  icon: React.ReactNode; label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium text-left transition-colors ${
        active
          ? "bg-[#f15a22]/10 text-[#f15a22] font-semibold"
          : "text-[#6b6560] hover:bg-[#f1f0ee] hover:text-[#231f20]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<Section>("account");

  // Notification prefs (local state only — extend with backend if needed)
  const [notifPrefs, setNotifPrefs] = useState({
    findingSubmitted: true,
    approvalRequired: true,
    deadlineReminder: true,
    licenseExpiring: true,
    emailNotif: false,
  });

  // Appearance
  const [compactMode, setCompactMode] = useState(false);

  const toggle = (key: keyof typeof notifPrefs) =>
    setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-[#f15a22]" : "bg-[#c5c0bb]"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );

  const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-4 border-b border-[#f1f0ee] last:border-0">
      <div>
        <p className="text-[14px] font-medium text-[#231f20]">{label}</p>
        {description && <p className="text-[12px] text-[#6b6560] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f0ee]">
      {/* Header */}
      <div className="bg-[#231f20] px-6 md:px-10 py-8 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-4xl mx-auto">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">Account</div>
          <h1 className="font-bold text-white text-[clamp(28px,5vw,42px)] leading-tight">Settings</h1>
          <p className="text-[#8a8580] text-[13px] mt-1">Manage your account preferences</p>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar nav */}
          <div className="md:w-52 flex-shrink-0">
            <div className="bg-white rounded-xl border border-[#e5e0db] p-2 space-y-0.5">
              <SectionButton id="account" active={active === "account"} onClick={() => setActive("account")} label="Account"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              />
              <SectionButton id="security" active={active === "security"} onClick={() => setActive("security")} label="Security"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />
              <SectionButton id="notifications" active={active === "notifications"} onClick={() => setActive("notifications")} label="Notifications"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
              />
              <SectionButton id="appearance" active={active === "appearance"} onClick={() => setActive("appearance")} label="Appearance"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
              />
            </div>
          </div>

          {/* Content panel */}
          <div className="flex-1 min-w-0">

            {/* ── Account ── */}
            {active === "account" && (
              <div className="bg-white rounded-xl border border-[#e5e0db] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e5e0db]">
                  <h2 className="font-bold text-[16px] text-[#231f20]">Account Information</h2>
                  <p className="text-[12px] text-[#6b6560] mt-0.5">Your identity in the SMK3 system</p>
                </div>
                <div className="px-6 py-2">
                  <SettingRow label="Employee ID" description="Cannot be changed">
                    <span className="font-mono text-[13px] text-[#6b6560] bg-[#f1f0ee] px-3 py-1.5 rounded-lg">{user?.idKaryawan}</span>
                  </SettingRow>
                  <SettingRow label="Full Name" description="Managed by administrator">
                    <span className="text-[13px] text-[#231f20]">{user?.nama}</span>
                  </SettingRow>
                  <SettingRow label="Role" description="Assigned by administrator">
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full ${
                      user?.role === "admin" ? "bg-red-100 text-red-700" :
                      user?.role === "supervisor" ? "bg-amber-100 text-amber-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{user?.role}</span>
                  </SettingRow>
                  <SettingRow label="Department" description="Managed by administrator">
                    <span className="text-[13px] text-[#231f20]">{user?.departemen || "—"}</span>
                  </SettingRow>
                </div>
                {/* Role restriction notice */}
                {user?.role !== "admin" && (
                  <div className="mx-6 mb-4 mt-1 flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <svg className="flex-shrink-0 mt-0.5 text-amber-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <p className="text-[12px] text-amber-700 leading-relaxed">
                      Nama, jabatan, departemen, dan divisi hanya dapat diubah oleh <strong>admin</strong>. Kamu hanya dapat mengubah <strong>email</strong> melalui halaman Edit Profile.
                    </p>
                  </div>
                )}
                <div className="px-6 py-4 border-t border-[#e5e0db] bg-[#faf9f7]">
                  <Link href="/profile" className="inline-flex items-center gap-2 px-4 py-2 bg-[#f15a22] text-white text-[13px] font-bold rounded-lg hover:bg-[#d44d1a] transition-colors">
                    {user?.role === "admin" ? "Edit Profile →" : "Update Email →"}
                  </Link>
                </div>
              </div>
            )}

            {/* ── Security ── */}
            {active === "security" && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-[#e5e0db] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#e5e0db]">
                    <h2 className="font-bold text-[16px] text-[#231f20]">Password & Security</h2>
                    <p className="text-[12px] text-[#6b6560] mt-0.5">Keep your account secure</p>
                  </div>
                  <div className="px-6 py-2">
                    <SettingRow label="Password" description="Last changed: unknown">
                      <Link href="/change-password" className="px-4 py-2 bg-[#f15a22] text-white text-[12px] font-bold rounded-lg hover:bg-[#d44d1a] transition-colors">
                        Change Password
                      </Link>
                    </SettingRow>
                    <SettingRow label="Reset Password" description="Use employee ID to reset via token">
                      <Link href="/forgot-password" className="px-4 py-2 bg-white border border-[#c5c0bb] text-[12px] font-medium text-[#231f20] rounded-lg hover:border-[#f15a22] hover:text-[#f15a22] transition-colors">
                        Forgot Password
                      </Link>
                    </SettingRow>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#e5e0db] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#e5e0db]">
                    <h2 className="font-bold text-[16px] text-[#231f20]">Session</h2>
                  </div>
                  <div className="px-6 py-2">
                    <SettingRow label="Current Session" description="JWT token — expires in 7 days">
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-green-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> Active
                      </span>
                    </SettingRow>
                    <SettingRow label="Sign Out" description="Log out from all devices">
                      <button
                        onClick={() => logout()}
                        className="px-4 py-2 bg-red-50 border border-red-200 text-[12px] font-medium text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Sign Out
                      </button>
                    </SettingRow>
                  </div>
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {active === "notifications" && (
              <div className="bg-white rounded-xl border border-[#e5e0db] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e5e0db]">
                  <h2 className="font-bold text-[16px] text-[#231f20]">Notification Preferences</h2>
                  <p className="text-[12px] text-[#6b6560] mt-0.5">Choose what you want to be notified about</p>
                </div>
                <div className="px-6 py-2">
                  <SettingRow label="Finding Submitted" description="When a new K3 finding is reported">
                    <Toggle checked={notifPrefs.findingSubmitted} onChange={() => toggle("findingSubmitted")} />
                  </SettingRow>
                  <SettingRow label="Approval Required" description="When a finding needs your approval">
                    <Toggle checked={notifPrefs.approvalRequired} onChange={() => toggle("approvalRequired")} />
                  </SettingRow>
                  <SettingRow label="Deadline Reminder" description="Reminders for upcoming follow-up deadlines">
                    <Toggle checked={notifPrefs.deadlineReminder} onChange={() => toggle("deadlineReminder")} />
                  </SettingRow>
                  <SettingRow label="License Expiring" description="Alerts when object K3 licenses are about to expire">
                    <Toggle checked={notifPrefs.licenseExpiring} onChange={() => toggle("licenseExpiring")} />
                  </SettingRow>
                </div>
                <div className="px-6 py-4 border-t border-[#e5e0db] bg-[#faf9f7]">
                  <p className="text-[12px] text-[#6b6560]">
                    Email notifications require a valid email address set in your profile.
                  </p>
                </div>
              </div>
            )}

            {/* ── Appearance ── */}
            {active === "appearance" && (
              <div className="bg-white rounded-xl border border-[#e5e0db] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e5e0db]">
                  <h2 className="font-bold text-[16px] text-[#231f20]">Appearance</h2>
                  <p className="text-[12px] text-[#6b6560] mt-0.5">Customize how the application looks</p>
                </div>
                <div className="px-6 py-2">
                  <SettingRow label="Theme" description="Dark theme is applied across the sidebar">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-[#231f20] text-white text-[12px] font-medium rounded-lg">
                      <span className="w-3 h-3 rounded-full bg-[#f15a22]" /> Dark
                    </span>
                  </SettingRow>
                  <SettingRow label="Compact Mode" description="Reduce spacing in tables and lists">
                    <Toggle checked={compactMode} onChange={() => setCompactMode(!compactMode)} />
                  </SettingRow>
                  <SettingRow label="Language" description="Interface language">
                    <span className="text-[13px] text-[#231f20]">English / Indonesian</span>
                  </SettingRow>
                </div>
                <div className="px-6 py-4 border-t border-[#e5e0db] bg-[#faf9f7]">
                  <p className="text-[12px] text-[#6b6560]">Additional theme options coming soon.</p>
                </div>
              </div>
            )}

            {/* Back link */}
            <div className="mt-4">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] text-[#6b6560] hover:text-[#f15a22] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
