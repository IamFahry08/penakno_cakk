"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  // State untuk menampung data
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // Fungsi untuk menangani saat tombol diklik
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Mencegah reload halaman
    try {
      const request = JSON.stringify({
        //mengubah data menjadi string
        username,
        password,
        name,
        phone,
      });

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/admins`;
      const response = await fetch(url, {
        //menngirim data ke server
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "app-key": `${process.env.NEXT_PUBLIC_APP_KEY}`,
        },
        body: request,
      });

      if (!response.ok) {
        //kalau dia false maka muncul alrm yang di bawah
        alert("Gagal melakukan registrasi");
        return;
      }

      const responseData = await response.json();
      alert(responseData.message);
    } catch (error) {
      console.error("Error during sign up", error);
    }
    console.log("Data Register Terkirim:", {});
  }

  return (
    <div className="w-full h-dvh bg-blue-50 p-3 flex items-center justify-center">
      <div className="bg-white p-5 w-full md:w-1/2 lg:w-1/3 rounded-lg">
        <h1 className="text-center font-bold text-blue-800 text-2xl">
          Register Admin
        </h1>

        <form className="my-3" onSubmit={handleSubmit}>
          {/* --- USERNAME --- */}
          <label
            htmlFor="username"
            className="text-sm font-semibold text-blue-500"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-blue-500 text-slate-900 mb-2 rounded-2xl"
          />

          {/* --- PASSWORD --- */}
          <label
            htmlFor="password"
            className="text-sm font-semibold text-blue-500"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password} // Disambungkan ke state password
            onChange={(e) => setPassword(e.target.value)} // Update state saat ketik
            className="w-full p-2 border border-blue-500 text-slate-900 mb-2 rounded-2xl"
          />

          {/* --- NAME --- */}
          <label htmlFor="name" className="text-sm font-semibold text-blue-500">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name} // Disambungkan ke state name
            onChange={(e) => setName(e.target.value)} // Update state saat ketik
            className="w-full p-2 border border-blue-500 text-slate-900 mb-2 rounded-2xl"
          />

          {/* --- PHONE --- */}
          <label
            htmlFor="phone"
            className="text-sm font-semibold text-blue-500"
          >
            Phone
          </label>
          <input
            type="number"
            id="phone"
            value={phone} // Disambungkan ke state phone
            onChange={(e) => setPhone(e.target.value)} // Update state saat ketik
            className="w-full p-2 border border-blue-500 text-slate-900 mb-2 rounded-2xl"
          />

          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full text-sm text-white p-2 font-semibold rounded-lg hover:bg-blue-600 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mt-4"
          >
            Sign Up
          </button>
          <div className="mt-4 text-center text-sm text-slate-500">
          If you have an account, please{" "}
          <Link
            href="/signin"
            className="font-semibold text-blue-500 hover:underline ml-1"
          >
            sign in here
          </Link>
        </div>
        </form>
      </div>
    </div>
  );
}
