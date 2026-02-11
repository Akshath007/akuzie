'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addPainting } from '@/lib/data';
import { Loader2, ArrowLeft, Plus, X, Image as ImageIcon } from 'lucide-react';
import Input from '@/components/Input';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AddPaintingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageInputs, setImageInputs] = useState(['']); // Array of URL strings
    const [previews, setPreviews] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        size: '',
        category: 'painting', // Default
        medium: 'Acrylic on Canvas',
        finish: 'Varnished',
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

    // Update previews whenever inputs change
    useEffect(() => {
        const newPreviews = imageInputs.map(url => getDirectLink(url));
        setPreviews(newPreviews);
    }, [imageInputs]);

    const handleImageChange = (index, value) => {
        const newInputs = [...imageInputs];
        newInputs[index] = value;
        setImageInputs(newInputs);
    };

    const addImageField = () => {
        setImageInputs([...imageInputs, '']);
    };

    const removeImageField = (index) => {
        const newInputs = imageInputs.filter((_, i) => i !== index);
        setImageInputs(newInputs.length ? newInputs : ['']);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Filter out empty images and convert
        const validImages = imageInputs
            .filter(url => url.trim() !== '')
            .map(url => getDirectLink(url));

        if (validImages.length === 0) return alert("Please add at least one image URL");

        setLoading(true);
        try {
            await addPainting({
                ...formData,
                price: Number(formData.price),
                images: validImages, // Send array of images
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
        <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-700">
            <Link href="/akshath/dashboard" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-gray-900 mb-8 transition-colors">
                <ArrowLeft size={14} /> Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-gray-900">Add New Masterpiece</h1>
                    <p className="text-gray-500 mt-2">Create a new entry in your collection.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* LEFT COL: DETAILS */}
                <div className="md:col-span-2 space-y-8 bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                            Artwork Details
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium ml-1 mb-2">Category</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200"
                                    value={formData.category}
                                    onChange={e => {
                                        const cat = e.target.value;
                                        setFormData({
                                            ...formData,
                                            category: cat,
                                            medium: cat === 'crochet' ? 'Wool / Cotton Yarn' : 'Acrylic on Canvas',
                                            finish: cat === 'crochet' ? 'Soft' : 'Varnished'
                                        });
                                    }}
                                >
                                    <option value="painting">Painting</option>
                                    <option value="crochet">Crochet</option>
                                </select>
                            </div>

                            <Input
                                label="Title"
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
                        </div>
                    </div>

                    <div className="border-t border-gray-50 pt-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Specifications
                        </h3>
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
                    </div>

                    <div className="border-t border-gray-50 pt-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Story
                        </h3>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium ml-1 mb-2">Description</label>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 min-h-[150px] resize-y"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tell the story behind this piece..."
                        />
                    </div>
                </div>

                {/* RIGHT COL: IMAGES */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Visuals
                        </h3>

                        <div className="space-y-4">
                            {imageInputs.map((url, index) => (
                                <div key={index} className="space-y-2 group">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <Input
                                                label={`Image ${index + 1} (Drive Link)`}
                                                type="url"
                                                placeholder="https://drive.google.com..."
                                                value={url}
                                                onChange={e => handleImageChange(index, e.target.value)}
                                            />
                                        </div>
                                        {imageInputs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeImageField(index)}
                                                className="mt-6 p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Preview Area */}
                                    <div className="relative aspect-video w-full rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                                        {previews[index] ? (
                                            <img
                                                src={previews[index]}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                                            />
                                        ) : null}
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300" style={{ display: previews[index] ? 'none' : 'flex' }}>
                                            <ImageIcon size={24} />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addImageField}
                                className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 text-xs font-medium uppercase tracking-wider hover:border-violet-500 hover:text-violet-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Add Another Image
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl text-xs uppercase tracking-[0.2em] hover:bg-violet-600 transition-colors shadow-lg shadow-gray-200 hover:shadow-violet-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        {loading ? 'Publishing...' : 'Publish Artwork'}
                    </button>
                </div>

            </form>
        </div>
    );
}
