'use client';

import { Mail, Phone, MapPin, Instagram, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate sending — usually this would go to an API route
        await new Promise(r => setTimeout(r, 1500));
        setSubmitting(false);
        setSent(true);
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 bg-[#fafafa]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-20 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-serif text-gray-900 mb-6 italic">Contact Us</h1>
                    <p className="text-gray-500 font-light tracking-wide leading-relaxed">
                        For inquiries regarding original commissions, collection details, orders, or crochet bespoke pieces,
                        please reach out through the form below or our direct channels.
                    </p>
                    <div className="w-12 h-px bg-gray-300 mx-auto mt-8"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-900 mb-4">
                                    <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-full">
                                        <Mail size={18} className="text-gray-400" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Email</span>
                                </div>
                                <p className="text-gray-600 font-light">akuzie27@gmail.com</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-900 mb-4">
                                    <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-full">
                                        <Phone size={18} className="text-gray-400" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Phone</span>
                                </div>
                                <p className="text-gray-600 font-light">+91 82172 62053</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-900 mb-4">
                                    <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-full">
                                        <Instagram size={18} className="text-gray-400" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Instagram</span>
                                </div>
                                <p className="text-gray-600 font-light">@akuzie_</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-900 mb-4">
                                    <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-full">
                                        <MapPin size={18} className="text-gray-400" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Address</span>
                                </div>
                                <p className="text-gray-600 font-light text-sm leading-relaxed">
                                    Bengaluru, Karnataka, India
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-50">
                        {sent ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                                    <Loader2 size={32} className="text-green-500 animate-in spin-in duration-700" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif text-gray-900 mb-2">Message Sent</h3>
                                    <p className="text-gray-500 font-light">Thank you for reaching out. We will get back to you shortly.</p>
                                </div>
                                <button
                                    onClick={() => setSent(false)}
                                    className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors font-bold"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Your Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-gray-900 transition-all placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="john@example.com"
                                            className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-gray-900 transition-all placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Subject</label>
                                    <select className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-gray-900 transition-all text-gray-500 appearance-none">
                                        <option>General Inquiry</option>
                                        <option>Commission Request</option>
                                        <option>Order Assistance</option>
                                        <option>Shipping Query</option>
                                        <option>Return / Refund</option>
                                        <option>Business Partnership</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        placeholder="Tell us about your interest..."
                                        className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-gray-900 transition-all placeholder:text-gray-300 resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    disabled={submitting}
                                    type="submit"
                                    className="w-full group bg-gray-900 text-white py-5 rounded-2xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
                                >
                                    {submitting ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            Send Message <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
