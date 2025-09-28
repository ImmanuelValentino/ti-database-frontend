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

  // State untuk form tambah mahasiswa
  const [newMahasiswa, setNewMahasiswa] = useState({ nim: '', nama: '', jurusan: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMahasiswa(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddMahasiswa = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const apiUrl = 'https://ti-database.vercel.app/api/mahasiswa';
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(newMahasiswa),
      });

      const result = await response.json();
      if (!response.ok) {
        const errorMessage = Array.isArray(result.error)
          ? result.error.map(e => e.message).join(', ')
          : result.error;
        throw new Error(errorMessage || 'Gagal menambahkan data');
      }

      setFormSuccess('Mahasiswa berhasil ditambahkan!');
      setNewMahasiswa({ nim: '', nama: '', jurusan: '' });
      fetchMahasiswa(1, '');
      setCurrentPage(1);

    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  const renderTableContent = () => {
    if (loading) return <tr><td colSpan="4" className="text-center py-4 text-gray-500">Mencari data...</td></tr>;
    if (error) return <tr><td colSpan="4" className="text-center py-4 text-red-500">Error: {error}</td></tr>;
    if (mahasiswaList.length === 0) return <tr><td colSpan="4" className="text-center py-4 text-gray-500">Data tidak ditemukan.</td></tr>;

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
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || loading} className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300">Previous</button>
          <span className="text-sm font-medium">Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || loading} className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300">Next</button>
        </div>

        <div className="mt-10 pt-6 border-t">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Tambah Mahasiswa Baru</h2>
          <form onSubmit={handleAddMahasiswa}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="nim" className="block text-sm font-medium text-gray-700">NIM</label>
                <input type="text" name="nim" id="nim" value={newMahasiswa.nim} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama</label>
                <input type="text" name="nama" id="nama" value={newMahasiswa.nama} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="jurusan" className="block text-sm font-medium text-gray-700">Jurusan</label>
                <input type="text" name="jurusan" id="jurusan" value={newMahasiswa.jurusan} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500" />
              </div>
            </div>
            <div className="text-center">
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400">
                {isSubmitting ? 'Menambahkan...' : 'Tambah Mahasiswa'}
              </button>
            </div>
            {formError && <p className="text-red-500 text-center mt-4">{formError}</p>}
            {formSuccess && <p className="text-green-500 text-center mt-4">{formSuccess}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}