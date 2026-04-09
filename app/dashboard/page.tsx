"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("User");

  // Fungsi untuk pengecekan keamanan (Protected Route)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    // Kalau tidak ada token, tendang balik ke halaman login
    if (!token) {
      router.push("/signin"); // Pastikan url loginmu sesuai (/signin atau /auth/signin)
    } else {
      // Kalau ada, simpan data ke state buat ditampilkan
      setUserRole(role || "GUEST");
      // Opsional: Kamu bisa decode token JWT disini kalau mau ambil username asli
    }
  }, [router]);

  const handleLogout = () => {
    // Hapus semua data sesi
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    
    // Redirect ke login
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-md w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                D
              </div>
              <span className="font-bold text-xl text-gray-800">DashboardKu</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Halo, Admin</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="opacity-90">
            Selamat, kamu berhasil masuk ke sistem. Token kamu valid dan tersimpan di Local Storage.
          </p>
        </div>

        {/* Stats Grid (Contoh Widget) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
              <span className="p-2 bg-green-100 text-green-600 rounded-lg text-xs font-bold">+12%</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">Rp 12.500.000</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">User Role</h3>
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold">Active</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{userRole}</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Pending Tasks</h3>
              <span className="p-2 bg-orange-100 text-orange-600 rounded-lg text-xs font-bold">Urgent</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">5 Tasks</p>
          </div>
        </div>

        {/* Content Area Kosong */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-64 flex flex-col items-center justify-center text-center">
            <div className="text-gray-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Mulai Kelola Datamu</h3>
            <p className="text-gray-500 mt-1 max-w-sm">Ini adalah template dashboard. Silakan tambahkan tabel, chart, atau fitur lainnya di sini.</p>
        </div>

      </main>
    </div>
  );
}