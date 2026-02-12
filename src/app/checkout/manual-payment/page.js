'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Upload, CheckCircle2, QrCode, ArrowLeft, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { markItemsAsSold } from '@/lib/data';

function ManualPaymentContent() {
    const { cart, clearCart } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        if (orderId) {
            const fetchOrder = async () => {
                const docRef = doc(db, "orders", orderId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrderData(docSnap.data());
                }
            };
            fetchOrder();
        }
    }, [orderId]);

    const total = orderData?.totalAmount || cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const upiLink = `upi://pay?pa=akuzie@ptyes&pn=Akuzie&cu=INR&am=${total}&tn=Order%20Payment`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !orderId) {
            alert("Order ID or screenshot missing.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Upload to Cloudinary via our API route
            const formData = new FormData();
            formData.append('file', file);
            formData.append('orderId', orderId);

            const uploadRes = await fetch('/api/upload-payment', {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) throw new Error(uploadData.details || uploadData.error || 'Upload failed');

            // 2. Update Firestore Order
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, {
                paymentScreenshot: uploadData.url,
                paymentStatus: 'pending',
                paymentUploadedAt: serverTimestamp(),
            });

            // 3. Mark items as SOLD instantly to prevent others from buying
            await markItemsAsSold(orderId);

            setIsSuccess(true);
            clearCart();
        } catch (err) {
            console.error("Payment submission failed:", err);
            alert("Submission failed: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-20">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 text-center animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-serif text-gray-900 mb-4">Payment Uploaded</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                        Verification is in progress. You can track the status in your profile or at the link below.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push(`/orders/${orderId}`)}
                            className="w-full bg-violet-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-100"
                        >
                            View Order Details
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-white text-gray-400 py-3 rounded-2xl font-bold uppercase tracking-widest hover:text-gray-900 transition-all text-[10px]"
                        >
                            Back to Gallery
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 py-24 md:py-32">
            <div className="max-w-xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200/40 border border-gray-100 flex flex-col md:flex-row">

                <div className="flex-1 p-8 md:p-12">
                    <button
                        onClick={() => router.back()}
                        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[10px]">Back</span>
                    </button>

                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-serif text-gray-900 mb-3">Manual Payment</h1>
                        <p className="text-gray-500 text-sm">Follow instructions to complete your order</p>
                    </div>

                    <div className="bg-gray-50 rounded-3xl p-6 mb-10">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Order #{orderId?.slice(-6)}</span>
                            <span className="text-violet-600 font-bold bg-violet-50 px-3 py-1 rounded-full text-[10px]">TOTAL TO PAY</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-bold text-gray-900">Total Amount</span>
                            <span className="text-2xl font-serif text-gray-900">{formatPrice(total)}</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="text-center">
                            <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-sm mb-4 relative group">
                                <img
                                    src="/upi-qr.png"
                                    alt="UPI QR Code"
                                    className="w-56 h-56 relative z-10 mx-auto"
                                    onError={(e) => { e.target.onerror = null; e.target.src = qrCodeUrl; }}
                                />
                                <div className="mt-4 flex items-center justify-center gap-2 text-violet-600 font-bold text-xs">
                                    <QrCode size={14} /> Scan to Pay
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Scan this QR code using <span className="text-gray-900 font-semibold">Google Pay</span>, <span className="text-gray-900 font-semibold">PhonePe</span>, or <span className="text-gray-900 font-semibold">Paytm</span> payment app only.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-gray-100">
                            <div className="space-y-4">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">Step 2: Upload Payment Screenshot</label>
                                <div className={`relative border-2 border-dashed rounded-[2rem] transition-all duration-300 group ${preview ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/30'}`}>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" required />
                                    <div className="p-10 text-center pointer-events-none">
                                        {preview ? (
                                            <div className="flex flex-col items-center">
                                                <div className="relative w-20 h-20 rounded-xl overflow-hidden mb-3 border-2 border-white shadow-md">
                                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-xs font-bold text-green-600">Image Selected</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Upload size={20} className="text-gray-400 mb-3" />
                                                <span className="text-sm font-medium text-gray-600">Tap to upload screenshot</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !file}
                                className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${!file || isSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700 shadow-xl shadow-violet-200/50 active:scale-[0.98]'}`}
                            >
                                {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : 'Submit Payment'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
            `}</style>
        </div>
    );
}

export default function ManualPaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-violet-600" size={48} /></div>}>
            <ManualPaymentContent />
        </Suspense>
    );
}
