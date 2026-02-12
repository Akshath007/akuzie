'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAuction } from '@/lib/auction-data';
import { Loader2, ArrowLeft, Image as ImageIcon, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function NewAuctionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startingPrice: '',
        minBidIncrement: '',
        endTime: '',
        images: [''] // Array of image URLs
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const removeImageField = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate
            if (!formData.title || !formData.startingPrice || !formData.endTime) {
                throw new Error("Please fill in all required fields.");
            }

            // Convert End Time to Date object
            const endDate = new Date(formData.endTime);
            if (endDate <= new Date()) {
                throw new Error("End time must be in the future.");
            }

            const cleanImages = formData.images.filter(url => url.trim() !== '');

            await createAuction({
                title: formData.title,
                description: formData.description,
                startingPrice: Number(formData.startingPrice),
                minBidIncrement: Number(formData.minBidIncrement) || 50,
                endTime: endDate,
                startTime: new Date(), // Start immediately
                images: cleanImages,
                status: 'active'
            });

            alert("Auction created successfully!");
            router.push('/akshath/auctions');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <Link href="/akshath/auctions" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
                <ArrowLeft size={18} /> Back to Auctions
            </Link>

            <h1 className="text-3xl font-serif text-gray-900 mb-2">New Auction</h1>
            <p className="text-gray-500 mb-10">Create a new live auction listing.</p>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">

                {/* Basic Info */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Title</label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-violet-500 transition-all font-serif text-lg"
                            placeholder="e.g. The Golden Hour"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-violet-500 transition-all"
                            placeholder="Detailed description of the artwork..."
                        />
                    </div>
                </div>

                {/* Pricing & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Starting Price (₹)</label>
                        <input
                            name="startingPrice"
                            type="number"
                            min="0"
                            value={formData.startingPrice}
                            onChange={handleInputChange}
                            required
                            className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-violet-500 transition-all font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Min Bid Increment (₹)</label>
                        <input
                            name="minBidIncrement"
                            type="number"
                            min="0"
                            value={formData.minBidIncrement}
                            onChange={handleInputChange}
                            required
                            className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-violet-500 transition-all font-mono"
                            placeholder="50"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Auction End Time</label>
                        <input
                            name="endTime"
                            type="datetime-local"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            required
                            className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-violet-500 transition-all font-mono"
                        />
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Images (URLs)</label>
                    {formData.images.map((url, index) => (
                        <div key={index} className="flex gap-2">
                            <div className="relative flex-1">
                                <ImageIcon size={18} className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                                <input
                                    value={url}
                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                    placeholder="https://..."
                                    className="w-full p-3 pl-12 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-violet-500 transition-all text-sm"
                                />
                            </div>
                            {index > 0 && (
                                <button type="button" onClick={() => removeImageField(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addImageField} className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium px-2 py-1">
                        <Plus size={16} /> Add Another Image
                    </button>
                </div>

                {/* Submit */}
                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {loading ? 'Starting Auction...' : 'Start Auction'}
                    </button>
                </div>

            </form>
        </div>
    );
}
