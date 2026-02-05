'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { processOrder } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const router = useRouter();

    const [step, setStep] = useState(1); // 1: Details, 2: Payment
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
    });

    const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    if (cart.length === 0 && step === 1) {
        if (typeof window !== 'undefined') router.push('/cart');
        return null;
    }

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handlePaymentComplete = async () => {
        setLoading(true);
        try {
            const orderData = {
                customerName: formData.name,
                phone: formData.phone,
                address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
                items: cart.map(item => ({ id: item.id, title: item.title, price: item.price })),
                totalAmount: total,
            };

            const paintingIds = cart.map(item => item.id);

            const orderId = await processOrder(orderData, paintingIds);

            clearCart();
            router.push(`/order-confirmation?orderId=${orderId}`);
        } catch (error) {
            console.error("Order failed", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="mb-12">
                <div className="flex items-center justify-between text-sm uppercase tracking-widest text-gray-400 mb-4">
                    <span className={step === 1 ? "text-gray-900" : ""}>1. Details</span>
                    <span className={step === 2 ? "text-gray-900" : ""}>2. Payment</span>
                    <span>3. Confirmation</span>
                </div>
                <div className="h-px bg-gray-100 relative">
                    <div
                        className="absolute left-0 top-0 h-full bg-gray-900 transition-all duration-300"
                        style={{ width: step === 1 ? '33%' : '66%' }}
                    ></div>
                </div>
            </div>

            {step === 1 && (
                <form onSubmit={handleDetailsSubmit} className="space-y-6 fade-in">
                    <h2 className="text-2xl font-light text-gray-900 mb-8">Shipping Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wide text-gray-500">Full Name</label>
                            <input
                                name="name"
                                required
                                className="w-full p-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wide text-gray-500">Phone Number</label>
                            <input
                                name="phone"
                                required
                                className="w-full p-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-xs uppercase tracking-wide text-gray-500">Address</label>
                            <input
                                name="address"
                                required
                                className="w-full p-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wide text-gray-500">City</label>
                            <input
                                name="city"
                                required
                                className="w-full p-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors"
                                value={formData.city}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wide text-gray-500">Postal Code</label>
                            <input
                                name="postalCode"
                                required
                                className="w-full p-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            className="w-full bg-gray-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                        >
                            Continue to Payment
                        </button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <div className="space-y-8 fade-in">
                    <h2 className="text-2xl font-light text-gray-900">Payment</h2>

                    <div className="bg-gray-50 p-8 text-center border border-gray-100">
                        <p className="text-sm text-gray-500 mb-6 uppercase tracking-wide">Scan to Pay</p>
                        <div className="w-48 h-48 bg-white mx-auto mb-6 flex items-center justify-center border border-gray-200">
                            {/* Placeholder for QR Code */}
                            <span className="text-xs text-gray-400">QR Code Here</span>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-2">{formatPrice(total)}</p>
                        <p className="text-sm text-gray-500 mb-6">UPI ID: akuzie@upi</p>

                        <div className="text-xs text-gray-400 max-w-sm mx-auto">
                            Please complete the payment using any UPI app. Once the transaction is successful, click the button below.
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 bg-white text-gray-900 border border-gray-200 py-4 text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handlePaymentComplete}
                            disabled={loading}
                            className="flex-1 bg-gray-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            I Have Paid
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
