"use client";

import { useState, useEffect, useCallback } from "react";
import Link from 'next/link';

export default function Home() {
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  const fetchMahasiswa = useCallback(async (page, search) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) {
        params.append('search', search);
      }

      const apiUrl = `https://ti-database.vercel.app/api/mahasiswa?${params.toString()}`;
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;

      const response = await fetch(apiUrl, { headers: { 'x-api-key': apiKey } });
      if (!response.ok) throw new Error("Gagal mengambil data daftar mahasiswa");

      const result = await response.json();
      setMahasiswaList(result.data);
      setTotalCount(result.count);
    } catch (err) {
      setError(err.message);
      setMahasiswaList([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setCurrentPage(1);

      if (/[a-zA-Z]/.test(searchTerm) && /[0-9]/.test(searchTerm)) {
        setError("Pencarian tidak valid. Harap cari berdasarkan NIM (hanya angka) atau nama.");
        setMahasiswaList([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      if (!searchTerm) {
        fetchMahasiswa(1, '');
      } else if (/^[0-9]+$/.test(searchTerm)) {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`https://ti-database.vercel.app/api/mahasiswa/${searchTerm}`, { headers: { 'x-api-key': apiKey } });
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error(`Mahasiswa dengan NIM ${searchTerm} tidak ditemukan.`);
            }
            throw new Error("Gagal mencari NIM");
          }
          const result = await response.json();
          setMahasiswaList([result]);
          setTotalCount(1);
        } catch (err) {
          setError(err.message);
          setMahasiswaList([]);
        } finally {
          setLoading(false);
        }
      } else {
        fetchMahasiswa(1, searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchMahasiswa]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchMahasiswa(newPage, searchTerm);
  }

  const totalPages = Math.ceil(totalCount / limit);

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-4 text-gray-500">Mencari data...</td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-4 text-red-500">Error: {error}</td>
        </tr>
      );
    }
    if (mahasiswaList.length === 0) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-4 text-gray-500">Data tidak ditemukan.</td>
        </tr>
      );
    }
    return mahasiswaList.map((mhs) => (
      <tr key={mhs.nim} className="bg-white border-b hover:bg-gray-50">
        <td className="px-6 py-4 font-medium text-gray-900">{mhs.nim}</td>
        <td className="px-6 py-4">{mhs.nama}</td>
        <td className="px-6 py-4">{mhs.jurusan}</td>
        <td className="px-6 py-4">
          <Link href={`/mahasiswa/edit/${mhs.nim}`} className="font-medium text-blue-600 hover:underline">
            Edit
          </Link>
        </td>
      </tr>
    ));
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Data Mahasiswa</h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau NIM..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">NIM</th>
                <th scope="col" className="px-6 py-3">Nama</th>
                <th scope="col" className="px-6 py-3">Jurusan</th>
                <th scope="col" className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {renderTableContent()}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages > 0 ? totalPages : 1}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}