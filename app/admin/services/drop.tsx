"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DropServiceProps {
  serviceId: string;
  serviceName: string;
  onClose?: () => void;
}

export default function DropService({ serviceId, serviceName, onClose }: DropServiceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus layanan "${serviceName}"?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus layanan');
      }

      // Refresh halaman atau navigasi kembali
      router.refresh();
      
      if (onClose) {
        onClose();
      } else {
        // Redirect ke halaman services jika tidak ada onClose handler
        router.push('/admin/services');
      }
      
      // Tampilkan pesan sukses
      alert(`Layanan "${serviceName}" berhasil dihapus!`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      console.error('Error deleting service:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">Hapus Layanan</h2>
        <p className="text-gray-700">
          Anda akan menghapus layanan: <span className="font-semibold">{serviceName}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Tindakan ini tidak dapat dibatalkan. Semua data terkait layanan ini akan dihapus permanen.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose || (() => router.back())}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
          disabled={isLoading}
        >
          Batal
        </button>
        
        <button
          type="button"
          onClick={handleDelete}
          disabled={isLoading}
          className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Menghapus...
            </>
          ) : (
            'Hapus Layanan'
          )}
        </button>
      </div>
    </div>
  );
}