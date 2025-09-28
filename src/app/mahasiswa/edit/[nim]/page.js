"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";

export default function EditMahasiswaPage() {
    const router = useRouter();
    const params = useParams();
    const { nim } = params;

    const [mahasiswa, setMahasiswa] = useState(null);
    const [jurusan, setJurusan] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    const fetchMahasiswaData = useCallback(async () => {
        if (!nim) return;
        setLoading(true);
        try {
            const response = await fetch(`https://ti-database.vercel.app/api/mahasiswa/${nim}`, {
                headers: { 'x-api-key': apiKey }
            });
            if (!response.ok) throw new Error("Gagal mengambil data mahasiswa");
            const data = await response.json();
            setMahasiswa(data);
            setJurusan(data.jurusan);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [nim, apiKey]);

    useEffect(() => {
        fetchMahasiswaData();
    }, [fetchMahasiswaData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage('');

        try {
            const response = await fetch(`https://ti-database.vercel.app/api/mahasiswa/${nim}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({ jurusan: jurusan })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.[0]?.message || 'Gagal memperbarui data');
            }

            setSuccessMessage("Jurusan berhasil diperbarui! Anda akan diarahkan kembali...");
            // Arahkan kembali ke halaman utama setelah 2 detik
            setTimeout(() => {
                router.push('/');
            }, 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p className="text-center mt-12">Memuat data mahasiswa...</p>;

    return (
        <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
            <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">Edit Data Mahasiswa</h1>
                {mahasiswa ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">NIM</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{mahasiswa.nim}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Nama</label>
                            <p className="mt-1 text-lg text-gray-900">{mahasiswa.nama}</p>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="jurusan" className="block text-sm font-medium text-gray-700">Jurusan</label>
                            <input
                                id="jurusan"
                                type="text"
                                value={jurusan}
                                onChange={(e) => setJurusan(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Simpan Perubahan
                            </button>
                            <Link href="/" className="text-sm text-gray-600 hover:underline">
                                Batal
                            </Link>
                        </div>
                    </form>
                ) : (
                    <p className="text-center text-red-500">{error || "Data mahasiswa tidak ditemukan."}</p>
                )}
            </div>
        </main>
    );
}