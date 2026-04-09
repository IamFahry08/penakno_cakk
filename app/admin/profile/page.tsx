import { getCookies } from "@/helper/cookies";
import Link from "next/link";

export interface ResponseAdminProfile {
  success: boolean;
  message: string;
  data: Admin;
}

export interface Admin {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
}

async function getAdminProfile(): Promise<Admin | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/admins/me`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        Authorization: `Bearer ${await getCookies("token")}`,
      },
    });

    const responseData: ResponseAdminProfile = await response.json();
    if (!response.ok) {
      console.error("Failed to fetch admin profile:", responseData.message);
      return null;
    }
    return responseData.data;
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const adminProfile = await getAdminProfile();

  if (!adminProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't load your admin profile. Please sign in again.
          </p>
          <Link
            href="/signin"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-4 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{adminProfile.name}</h1>
                <p className="text-blue-100">@{adminProfile.user.username}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg font-medium text-gray-800">{adminProfile.name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-lg font-medium text-gray-800">{adminProfile.phone}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Username</p>
                <p className="text-lg font-medium text-gray-800">{adminProfile.user.username}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-lg font-medium text-gray-800 capitalize">
                  {adminProfile.user.role}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg col-span-1 md:col-span-2">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-lg font-medium text-gray-800">
                  {new Date(adminProfile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/customers" // ✅ path diperbaiki
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 flex items-center space-x-4 group"
          >
            <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-200 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Kelola Customers</h3>
              <p className="text-gray-600">Lihat, Tambah, edit atau hapus data customer </p>
            </div>
          </Link>

          <Link
            href="/admin/services" // ✅ path diperbaiki
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 flex items-center space-x-4 group"
          >
            <div className="bg-purple-100 p-4 rounded-full group-hover:bg-purple-200 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Kelola Services</h3>
              <p className="text-gray-600">Lihat, Tambah, edit atau hapus layanan yang ditawarkan</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}