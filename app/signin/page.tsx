"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
// Import fungsi yang tadi kita perbaiki
import { storeCookies } from "@/helper/cookies"; 

export interface LoginResponse {
  success?: boolean;
  message: string;
  token?: string;
  role?: string;
}

export default function SignIn() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const router = useRouter(); 

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault(); 
    
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth`;
      
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json",
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        },
      });

      const responseJson: LoginResponse = await response.json();

      if (!response.ok) {
        toast.error(responseJson.message || "Login Failed", { containerId: `toastLogin` });
        return; 
      }

      if (responseJson.success === true) {
        toast.success("Login Success!", { containerId: `toastLogin` });

        // Server Action untuk simpan cookie
        startTransition(async () => {
          await storeCookies("token", responseJson.token || "");
          await storeCookies("role", responseJson.role || "");

          if (responseJson.role === "ADMIN") {
             router.push("/admin/profile");
          } else if (responseJson.role === "CUSTOMER") {
             router.push("/customer/profile");
          } else {
             router.push("/dashboard");
          }
        });

      } else {
        toast.warning(responseJson.message || "Login Failed", { containerId: `toastLogin` });
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong", { containerId: `toastLogin` });
    }
  }

  return (
    <div className="bg-blue-100 w-full h-dvh flex justify-center items-center">
      <ToastContainer containerId={`toastLogin`} position="top-right" autoClose={4000} />
      
      <div className="bg-white w-full md:w-1/2 lg:w-1/3 p-10 rounded-lg flex flex-col shadow-lg">
        <h1 className="font-semibold text-blue-500 text-xl text-center mb-2">Sign In</h1>
        <small className="mt-2 text-sm text-slate-500 text-center block">Use Your credential to sign in</small>

        <form onSubmit={handleSignIn} className="w-full mt-5">
          <div className="mb-5">
            <label className="text-blue-400 font-semibold block">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border p-2 mt-1 rounded-sm" />
          </div>

          <div className="mb-5">
            <label className="text-blue-400 font-semibold block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 mt-1 rounded-sm" />
          </div>

          <button type="submit" disabled={pending} className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4 hover:bg-blue-600">
            {pending ? "Processing..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          If you don't have an account, please <Link href="/signup" className="text-blue-500 hover:underline">register here</Link>
        </div>
      </div>
    </div>
  );
}