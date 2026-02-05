'use client';

import { useEffect, useState } from 'react';
import { getPaintings, deletePainting, updatePainting } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, PAINTING_STATUS } from '@/lib/utils';
import { Trash2, Edit } from 'lucide-react';

export default function DashboardPage() {
    const [paintings, setPaintings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPaintings = async () => {
        const data = await getPaintings();
        setPaintings(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPaintings();
    }, []);

    const handleDelete = async (id) => {
        if (confirm("Are you sure?")) {
            await deletePainting(id);
            fetchPaintings();
        }
    };

    const toggleStatus = async (painting) => {
        const newStatus = painting.status === PAINTING_STATUS.AVAILABLE
            ? PAINTING_STATUS.SOLD
            : PAINTING_STATUS.AVAILABLE;

        await updatePainting(painting.id, { status: newStatus });
        fetchPaintings();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-light mb-8">Dashboard</h1>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium">
                        <tr>
                            <th className="p-4">Image</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paintings.map((painting) => (
                            <tr key={painting.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="relative w-12 h-12 bg-gray-100">
                                        {painting.images && painting.images[0] && (
                                            <Image
                                                src={painting.images[0]}
                                                alt={painting.title}
                                                fill
                                                className="object-cover rounded-sm"
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 font-medium">{painting.title}</td>
                                <td className="p-4 text-gray-500">{formatPrice(painting.price)}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => toggleStatus(painting)}
                                        className={`px-3 py-1 text-xs rounded-full uppercase tracking-wider border ${painting.status === PAINTING_STATUS.AVAILABLE
                                                ? "bg-green-50 text-green-600 border-green-100"
                                                : "bg-gray-100 text-gray-500 border-gray-200"
                                            }`}
                                    >
                                        {painting.status}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-4">
                                        <Link href={`/admin/edit/${painting.id}`} className="text-gray-400 hover:text-gray-900">
                                            <Edit size={16} />
                                        </Link>
                                        <button onClick={() => handleDelete(painting.id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
