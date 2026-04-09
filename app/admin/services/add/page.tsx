"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddServicePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [minUsage, setMinUsage] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // ===== VALIDASI =====
    if (!name || !minUsage || !maxUsage || !price) {
      alert("Semua field wajib diisi");
      return;
    }

    if (Number(minUsage) > Number(maxUsage)) {
      alert("Min usage tidak boleh lebih besar dari Max usage");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          min_usage: Number(minUsage),
          max_usage: Number(maxUsage),
          price: Number(price),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Gagal menambahkan service");
        return;
      }

      alert("Service berhasil ditambahkan ✅");

      // reset form
      setName("");
      setMinUsage("");
      setMaxUsage("");
      setPrice("");

      // redirect ke list
      router.push("/admin/services");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <Link
            href="/admin/services"
            className="text-blue-600 hover:text-blue-800 text-sm inline-block mb-2"
          >
            ← Kembali ke Daftar Services
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Tambah Service Baru
          </h1>
          <p className="text-gray-600 mt-1">
            Isi form di bawah untuk menambahkan service baru
          </p>
        </div>

        {/* FORM */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Nama Service *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Contoh: Show Sec Miles Abu"
              />
            </div>

            {/* MIN & MAX */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Min Usage *
                </label>
                <input
                  type="number"
                  value={minUsage}
                  onChange={(e) => setMinUsage(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Max Usage *
                </label>
                <input
                  type="number"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  min={0}
                />
              </div>
            </div>

            {/* PRICE */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Harga (IDR) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 border rounded-lg"
                min={0}
                placeholder="1000000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan angka tanpa titik atau koma
              </p>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Tambah Service"}
            </button>
          </form>
        </div>

        {/* INFO */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 text-sm mb-2">
            Catatan:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Login sebagai ADMIN</li>
            <li>• Auth diambil otomatis dari HttpOnly Cookie</li>
            <li>• Min usage harus ≤ Max usage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}