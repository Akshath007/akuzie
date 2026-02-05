'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addPainting } from '@/lib/data';
import { Loader2 } from 'lucide-react';

export default function AddPaintingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        size: '',
        medium: 'Acrylic on Canvas',
        finish: 'Varnished',
        imageUrl: '',
        description: '',
    });

    const getDirectLink = (url) => {
        // Basic helper to convert common drive sharing links
        // 1. https://drive.google.com/file/d/{id}/view?usp=sharing
        // 2. https://drive.google.com/open?id={id}
        // Target: https://lh3.googleusercontent.com/d/{id} or leave as is if user provides direct link

        if (!url) return '';
        try {
            let id = '';
            if (url.includes('/file/d/')) {
                id = url.split('/file/d/')[1].split('/')[0];
            } else if (url.includes('id=')) {
                id = url.split('id=')[1].split('&')[0];
            }

            if (id) {
                return `https://lh3.googleusercontent.com/d/${id}`;
            }
        } catch (e) {
            console.error('Error parsing GD URL', e);
        }
        return url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.imageUrl) return alert("Please enter an image URL");

        setLoading(true);
        try {
            const directUrl = getDirectLink(formData.imageUrl);

            await addPainting({
                ...formData,
                price: Number(formData.price),
                images: [directUrl],
            });

            router.push('/admin/dashboard');
        } catch (error) {
            console.error(error);
            alert("Error adding painting");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-100 shadow-sm rounded-lg">
            <h1 className="text-2xl font-light mb-8">Add New Painting</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm text-gray-500 mb-1">Title</label>
                    <input
                        required
                        className="w-full p-3 border border-gray-200 rounded"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Price (INR)</label>
                        <input
                            type="number"
                            required
                            className="w-full p-3 border border-gray-200 rounded"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Size (e.g. 24x36")</label>
                        <input
                            required
                            className="w-full p-3 border border-gray-200 rounded"
                            value={formData.size}
                            onChange={e => setFormData({ ...formData, size: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Medium</label>
                        <input
                            className="w-full p-3 border border-gray-200 rounded"
                            value={formData.medium}
                            onChange={e => setFormData({ ...formData, medium: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Finish</label>
                        <input
                            className="w-full p-3 border border-gray-200 rounded"
                            value={formData.finish}
                            onChange={e => setFormData({ ...formData, finish: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-500 mb-1">Google Drive Image Link</label>
                    <div className="space-y-2">
                        <input
                            type="url"
                            required
                            placeholder="https://drive.google.com/file/d/..."
                            className="w-full p-3 border border-gray-200 rounded"
                            value={formData.imageUrl}
                            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                        />
                        <p className="text-xs text-gray-400">
                            Paste the "Anyone with the link" Google Drive public link here.
                            The system will try to convert it to a direct image link automatically.
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="animate-spin" />}
                    Add Painting
                </button>
            </form>
        </div>
    );
}
