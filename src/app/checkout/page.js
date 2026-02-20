'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { processOrder, getPainting } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import Link from 'next/link';


export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: Details, 2: Payment
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.displayName || '',
                email: prev.email || user.email || '',
            }));
        }
    }, [user]);

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

    /**
     * PayU Hosted Checkout flow:
     * 1. Create order in Firestore
     * 2. Call /api/payu-initiate to get hash + form params
     * 3. Auto-submit hidden form to PayU payment URL
     * 4. PayU handles payment UI and redirects back to our callback
     */
    const handlePayUPayment = async () => {
        setLoading(true);
        try {
            const orderData = {
                customerName: formData.name,
                customerEmail: formData.email,
                phone: formData.phone,
                address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
                pincode: formData.postalCode,
                items: cart.map(item => ({
                    id: item.id, title: item.title, price: item.price,
                    images: item.images || [], medium: item.medium || ''
                })),
                totalAmount: total,
                paymentStatus: 'pending',
                method: 'payu_online',
                userId: user?.uid || null,
                userEmail: user?.email || formData.email,
            };
            const paintingIds = cart.map(item => item.id);

            // 1. Check availability
            const availabilityChecks = await Promise.all(paintingIds.map(id => getPainting(id)));
            const soldItems = availabilityChecks.filter(p => !p || p.status === 'sold');

            if (soldItems.length > 0) {
                alert("Sorry, one or more items in your cart were just purchased by someone else.");
                router.push('/cart');
                return;
            }

            // 2. Create local order in Firestore
            const orderId = await processOrder(orderData, paintingIds);

            // 3. Get PayU form params from server
            const productInfo = cart.map(item => item.title).join(', ').substring(0, 100);
            const response = await fetch('/api/payu-initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    amount: total,
                    productinfo: productInfo || `Akuzie Art Order`,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.formData) {
                throw new Error(data.error || 'Failed to initiate payment');
            }

            // 4. Create and auto-submit hidden form to PayU
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = data.paymentUrl;

            Object.entries(data.formData).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value || '';
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();

        } catch (error) {
            console.error("Payment initiation failed", error);
            alert(`Payment failed: ${error.message}. Please try again.`);
            setLoading(false);
        }
    };

    const handleManualPayment = async () => {
        setLoading(true);
        try {
            const orderData = {
                customerName: formData.name,
                customerEmail: formData.email,
                phone: formData.phone,
                address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
                pincode: formData.postalCode,
                items: cart.map(item => ({
                    id: item.id, title: item.title, price: item.price,
                    images: item.images || [], medium: item.medium || ''
                })),
                totalAmount: total,
                paymentStatus: 'pending',
                method: 'manual_upi',
                userId: user?.uid || null,
                userEmail: user?.email || formData.email,
            };
            const paintingIds = cart.map(item => item.id);
            const availabilityChecks = await Promise.all(paintingIds.map(id => getPainting(id)));
            const soldItems = availabilityChecks.filter(p => !p || p.status === 'sold');

            if (soldItems.length > 0) {
                alert("Sorry, one or more items in your cart were just purchased by someone else.");
                router.push('/cart');
                return;
            }

            const orderId = await processOrder(orderData, paintingIds);
            router.push(`/checkout/manual-payment?orderId=${orderId}`);
        } catch (err) {
            alert("Error creating order: " + err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
            <div className="mb-16">
                <div className="flex items-center justify-between text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                        <span className={step === 1 ? "text-gray-900 font-bold" : ""}>01.</span>
                        <span className={step === 1 ? "text-gray-900 font-bold" : ""}>Details</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                        <span className={step === 2 ? "text-gray-900 font-bold" : ""}>02.</span>
                        <span className={step === 2 ? "text-gray-900 font-bold" : ""}>Payment</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                        <span>03.</span>
                        <span>Confirmation</span>
                    </div>
                </div>
                <div className="h-[2px] bg-gray-100 relative">
                    <div
                        className="absolute left-0 top-0 h-full bg-gray-900 transition-all duration-500 ease-out"
                        style={{ width: step === 1 ? '33.33%' : step === 2 ? '66.66%' : '100%' }}
                    ></div>
                </div>
            </div>


            {step === 1 && (
                <form onSubmit={handleDetailsSubmit} className="space-y-6 fade-in">
                    <h2 className="text-2xl font-light text-gray-900 mb-8">Shipping Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wide text-gray-500">Full Name</label>
                            <input name="name" required
                                className="w-full p-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors"
                                value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wide text-gray-500">Email</label>
                            <input name="email" type="email" required
                                className="w-full p-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors"
                                value={formData.email} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wide text-gray-500">Phone Number</label>
                            <input name="phone" required placeholder="Required for payment"
                                className="w-full p-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors"
                                value={formData.phone} onChange={handleInputChange} />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-xs uppercase tracking-wide text-gray-500">Address</label>
                            <input name="address" required
                                className="w-full p-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors"
                                value={formData.address} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wide text-gray-500">City</label>
                            <input name="city" required
                                className="w-full p-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors"
                                value={formData.city} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wide text-gray-500">Postal Code</label>
                            <input name="postalCode" required
                                className="w-full p-3 border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors"
                                value={formData.postalCode} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="pt-8">
                        <button type="submit"
                            className="w-full bg-gray-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors">
                            Continue to Payment
                        </button>
                    </div>
                </form>
            )}

            {/* Step 2: Payment Options */}
            {step === 2 && (
                <div className="space-y-8 fade-in">
                    <h2 className="text-2xl font-light text-gray-900">Payment</h2>

                    {/* Order Summary */}
                    <div className="bg-gray-50 p-8 border border-gray-100 rounded-lg">
                        <div className="text-center mb-8">
                            <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Order Summary</p>
                            <p className="text-3xl font-serif text-gray-900 mb-2">{formatPrice(total)}</p>
                            <p className="text-sm text-gray-500">
                                {cart.length} {cart.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>

                        <div className="space-y-3 mb-8">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700">{item.title}</span>
                                    <span className="text-gray-900 font-medium">{formatPrice(item.price)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PayU Payment Button */}
                    <button
                        onClick={handlePayUPayment}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-5 rounded-2xl text-sm font-bold uppercase tracking-[0.2em] shadow-xl shadow-violet-200 hover:shadow-violet-300 hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                <CreditCard size={20} />
                                Pay Securely via PayU
                            </>
                        )}
                    </button>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <ShieldCheck size={14} />
                        <span>Secured by PayU | UPI • Cards • Net Banking • Wallets</span>
                    </div>

                    {/* Manual UPI Backup */}
                    <div className="pt-4 border-t border-gray-100">
                        <button
                            onClick={handleManualPayment}
                            disabled={loading}
                            className="w-full text-gray-500 text-xs hover:text-gray-900 underline"
                        >
                            Having trouble? Pay via Manual UPI Scan
                        </button>
                    </div>

                    <button
                        onClick={() => setStep(1)}
                        disabled={loading}
                        className="w-full text-gray-400 py-2 text-[10px] uppercase tracking-widest hover:text-gray-900 transition-colors disabled:opacity-50 font-bold"
                    >
                        ← Edit Shipping Details
                    </button>
                </div>
            )}
        </div>
    );
}
