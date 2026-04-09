"use server";
import { cookies } from "next/headers";

export async function storeCookies(key: string, value: string) {
    (await cookies()).set(key, value, {
        httpOnly: false,   // Ubah ke false agar bisa diakses JavaScript
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 hari
        path: "/",          // Pastikan path root agar tersedia di semua halaman
    });
}

export async function getCookies(key: string) {
    return (await cookies()).get(key)?.value || "";
}

export async function deleteCookies(key: string) {
    (await cookies()).delete(key);
}