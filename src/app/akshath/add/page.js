'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addPainting } from '@/lib/data';
import { Loader2, ArrowLeft } from 'lucide-react';
import Input from '@/components/Input';
import Link from 'next/link';

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
        if (!formData.imageUrl) return alert("Please enter an image URL");

        setLoading(true);
        try {
            const directUrl = getDirectLink(formData.imageUrl);
            await addPainting({
                ...formData,
                price: Number(formData.price),
                images: [directUrl],
            });
            router.push('/akshath/dashboard');
        } catch (error) {
            console.error(error);
            alert("Error adding painting");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <Link href="/akshath/dashboard" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-gray-900 mb-8 transition-colors">
                <ArrowLeft size={14} /> Back to Dashboard
            </Link>

            <h1 className="text-3xl font-serif text-gray-900 mb-8">Add New Painting</h1>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl border border-stone-100 shadow-sm">

                <Input
                    label="Artwork Title"
                    required
                    placeholder="e.g. 'Silent Chaos'"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-6">
                    <Input
                        label="Price (INR)"
                        type="number"
                        required
                        placeholder="5000"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                    <Input
                        label="Dimensions"
                        required
                        placeholder={'e.g. 24" x 36"'}
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

                <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium ml-1">Description</label>
                    <textarea
                        className="w-full bg-white border border-gray-200 rounded-none px-4 py-3 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 min-h-[100px]"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Tell the story behind this piece..."
                    />
                </div>

                <div>
                    <Input
                        label="Google Drive Image Link"
                        type="url"
                        required
                        placeholder="https://drive.google.com/file/d/..."
                        value={formData.imageUrl}
                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                    <p className="text-[10px] text-stone-400 mt-2 ml-1">
                        Make sure the file setting is "Anyone with the link".
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="animate-spin" size={16} />}
                    {loading ? 'Adding...' : 'Add to Collection'}
                </button>
            </form>
        </div>
    );
}
