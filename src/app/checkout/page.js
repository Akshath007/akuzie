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

    const [step, setStep] = useState(1); // 1: Details, 2: Payment Method, 3: Payment
    const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'lemon'
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
        setStep(2); // Go to payment method selection
    };

    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method);
        setStep(3); // Go to payment step
    };

    const handleLemonSqueezyPayment = async () => {
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

            // Try Lemon Squeezy checkout
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID || '1280089',
                    productName: `Akuzie Paintings - Order #${orderId.substring(0, 8)}`,
                    customData: {
                        orderId,
                        customerEmail: formData.email || '',
                        items: cart.map(item => item.title).join(', '),
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Lemon Squeezy checkout
            window.location.href = data.checkoutUrl;
        } catch (error) {
            console.error("Lemon Squeezy payment failed", error);
            alert(`Payment failed: ${error.message}. Please try UPI payment instead.`);
            setPaymentMethod('upi');
            setLoading(false);
        }
    };

    const handleUPIPayment = async () => {
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
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
            <div className="mb-16">
                <div className="flex items-center justify-between text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                        <span className={step === 1 ? "text-gray-900 font-bold" : ""}>01.</span>
                        <span className={step === 1 ? "text-gray-900 font-bold" : ""}>Details</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                        <span className={step === 2 || step === 3 ? "text-gray-900 font-bold" : ""}>02.</span>
                        <span className={step === 2 || step === 3 ? "text-gray-900 font-bold" : ""}>Payment</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                        <span>03.</span>
                        <span>Confirmation</span>
                    </div>
                </div>
                <div className="h-[2px] bg-gray-100 relative">
                    <div
                        className="absolute left-0 top-0 h-full bg-gray-900 transition-all duration-500 ease-out"
                        style={{ width: step === 1 ? '33.33%' : (step === 2 || step === 3) ? '66.66%' : '100%' }}
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

            {/* Step 2: Payment Method Selection */}
            {step === 2 && (
                <div className="space-y-8 fade-in">
                    <h2 className="text-2xl font-light text-gray-900 mb-8">Choose Payment Method</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* UPI Payment Option */}
                        <button
                            onClick={() => handlePaymentMethodSelect('upi')}
                            className="group p-8 border-2 border-gray-200 rounded-lg hover:border-violet-600 hover:bg-violet-50 transition-all duration-300 text-left"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl">💳</span>
                                <span className="text-xs uppercase tracking-wide text-gray-400 group-hover:text-violet-600">Recommended</span>
                            </div>
                            <h3 className="text-xl font-serif text-gray-900 mb-2">UPI Payment</h3>
                            <p className="text-sm text-gray-500">Pay directly via UPI (Google Pay, PhonePe, Paytm)</p>
                        </button>

                        {/* Lemon Squeezy Option */}
                        <button
                            onClick={() => handlePaymentMethodSelect('lemon')}
                            className="group p-8 border-2 border-gray-200 rounded-lg hover:border-violet-600 hover:bg-violet-50 transition-all duration-300 text-left"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl">🍋</span>
                                <span className="text-xs uppercase tracking-wide text-gray-400 group-hover:text-violet-600">International</span>
                            </div>
                            <h3 className="text-xl font-serif text-gray-900 mb-2">Card Payment</h3>
                            <p className="text-sm text-gray-500">Pay with Credit/Debit Card (Powered by Lemon Squeezy)</p>
                        </button>
                    </div>

                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => setStep(1)}
                            className="px-8 py-3 bg-white text-gray-900 border border-gray-200 text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors"
                        >
                            Back to Details
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Payment - UPI */}
            {step === 3 && paymentMethod === 'upi' && (
                <div className="space-y-8 fade-in">
                    <h2 className="text-2xl font-light text-gray-900">UPI Payment</h2>

                    <div className="bg-gray-50 p-8 text-center border border-gray-100 rounded-lg">
                        <p className="text-sm text-gray-500 mb-6 uppercase tracking-wide">Scan to Pay</p>
                        <div className="w-48 h-48 bg-white mx-auto mb-6 flex items-center justify-center border border-gray-200 rounded-lg">
                            {/* QR Code Placeholder */}
                            <span className="text-xs text-gray-400">QR Code Here</span>
                        </div>
                        <p className="text-3xl font-serif text-gray-900 mb-2">{formatPrice(total)}</p>
                        <p className="text-sm text-gray-500 mb-6">UPI ID: akuzie@upi</p>

                        <div className="text-xs text-gray-400 max-w-sm mx-auto">
                            Please complete the payment using any UPI app. Once the transaction is successful, click the button below.
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setStep(2)}
                            className="flex-1 bg-white text-gray-900 border border-gray-200 py-4 text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors"
                        >
                            Change Method
                        </button>
                        <button
                            onClick={handleUPIPayment}
                            disabled={loading}
                            className="flex-1 bg-gray-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            I Have Paid
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Payment - Lemon Squeezy */}
            {step === 3 && paymentMethod === 'lemon' && (
                <div className="space-y-8 fade-in">
                    <h2 className="text-2xl font-light text-gray-900">Card Payment</h2>

                    <div className="bg-gray-50 p-8 border border-gray-100 rounded-lg">
                        <div className="text-center mb-8">
                            <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Order Summary</p>
                            <p className="text-3xl font-serif text-gray-900 mb-2">{formatPrice(total)}</p>
                            <p className="text-sm text-gray-500">
                                {cart.length} {cart.length === 1 ? 'painting' : 'paintings'}
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

                        <div className="text-xs text-gray-500 text-center max-w-md mx-auto">
                            You will be redirected to our secure payment partner, Lemon Squeezy, to complete your purchase.
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setStep(2)}
                            disabled={loading}
                            className="flex-1 bg-white text-gray-900 border border-gray-200 py-4 text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Change Method
                        </button>
                        <button
                            onClick={handleLemonSqueezyPayment}
                            disabled={loading}
                            className="flex-1 bg-gray-900 text-white py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? 'Processing...' : 'Proceed to Payment'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
