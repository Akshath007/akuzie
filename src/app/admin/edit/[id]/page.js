'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPainting, updatePainting } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function EditPaintingPage({ params }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(null);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [id, setId] = useState(null);

    useEffect(() => {
        async function load() {
            const resolvedParams = await params;
            setId(resolvedParams.id);
            const data = await getPainting(resolvedParams.id);
            if (data) {
                setFormData(data);
            } else {
                alert("Painting not found");
                router.push('/admin/dashboard');
            }
            setLoading(false);
        }
        load();
    }, [params, router]);

    const getDirectLink = (url) => {
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
        setSaving(true);
        try {
            let finalImageUrl = formData.images ? formData.images[0] : null;

            if (newImageUrl) {
                finalImageUrl = getDirectLink(newImageUrl);
            }

            await updatePainting(id, {
                ...formData,
                price: Number(formData.price),
                images: [finalImageUrl],
            });

            router.push('/admin/dashboard');
        } catch (error) {
            console.error(error);
            alert("Error updating painting");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!formData) return null;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-100 shadow-sm rounded-lg">
            <h1 className="text-2xl font-light mb-8">Edit Painting</h1>

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
                        <label className="block text-sm text-gray-500 mb-1">Size</label>
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
                    <label className="block text-sm text-gray-500 mb-1">Current Image</label>
                    {formData.images && formData.images[0] && (
                        <div className="relative w-32 h-32 mb-4">
                            <Image src={formData.images[0]} alt="Current" fill className="object-cover rounded" />
                        </div>
                    )}

                    <label className="block text-sm text-gray-500 mb-1">New Image URL (Optional)</label>
                    <div className="space-y-2">
                        <input
                            type="url"
                            placeholder="https://drive.google.com/file/d/..."
                            className="w-full p-3 border border-gray-200 rounded"
                            value={newImageUrl}
                            onChange={e => setNewImageUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-400">
                            Paste a new Google Drive public link to replace the current image.
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gray-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    {saving && <Loader2 className="animate-spin" />}
                    Save Changes
                </button>
            </form>
        </div>
    );
}
