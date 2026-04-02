import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success('Reset instructions sent to your email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 mb-4">Check Your Email</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        We've sent password reset instructions to <strong>{email}</strong>. 
                        Please check your inbox and follow the link.
                    </p>
                    <Link 
                        to="/login"
                        className="inline-flex items-center gap-2 text-primary font-black hover:gap-3 transition-all"
                    >
                        RETURN TO LOGIN <ArrowRight size={20} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border max-w-md w-full"
            >
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Forgot Password?</h1>
                    <p className="text-gray-500 font-medium">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800"
                                placeholder="name@school.com"
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'SEND RESET LINK'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">
                        Remember your password? Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
