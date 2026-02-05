'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPainting, updatePainting } from '@/lib/data';
import { Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Input from '@/components/Input';

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
            if (id) return `https://lh3.googleusercontent.com/d/${id}`;
        } catch (e) { console.error(e); }
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
        <div className="max-w-2xl mx-auto py-12 px-6">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-gray-900 mb-8 transition-colors">
                <ArrowLeft size={14} /> Back to Dashboard
            </Link>

            <h1 className="text-3xl font-serif text-gray-900 mb-8">Edit Painting</h1>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl border border-stone-100 shadow-sm">

                <Input
                    label="Title"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-6">
                    <Input
                        label="Price (INR)"
                        type="number"
                        required
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                    <Input
                        label="Size"
                        required
                        value={formData.size}
                        onChange={e => setFormData({ ...formData, size: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Input
                        label="Medium"
                        value={formData.medium}
                        onChange={e => setFormData({ ...formData, medium: e.target.value })}
                    />
                    <Input
                        label="Finish"
                        value={formData.finish}
                        onChange={e => setFormData({ ...formData, finish: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium ml-1">Current Image</label>
                    {formData.images && formData.images[0] && (
                        <div className="relative w-32 h-32 mb-4 mt-2 border border-stone-200 rounded overflow-hidden">
                            <Image src={formData.images[0]} alt="Current" fill className="object-cover" />
                        </div>
                    )}

                    <Input
                        label="New Image URL (Optional)"
                        type="url"
                        placeholder="Paste new Google Drive link to replace..."
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gray-900 text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    {saving && <Loader2 className="animate-spin" size={16} />}
                    Save Changes
                </button>
            </form>
        </div>
    );
}
