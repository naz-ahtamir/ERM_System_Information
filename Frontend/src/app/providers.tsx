"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ToastContainer } from "@/app/components/ToastContainer";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
        <ToastContainer />
        {/* react-hot-toast renderer — dipakai oleh AuthContext untuk toast sesi habis */}
        <Toaster
          position="top-center"
          toastOptions={{
            error: {
              style: {
                background: '#ef4444',
                color: '#fff',
                fontWeight: '500',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  );
}
