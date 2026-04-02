import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Link, useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setSubmitted(true);
            toast.success('Password updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password. Link may be expired.');
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
                    <h2 className="text-3xl font-black text-gray-800 mb-4">Success!</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Your password has been successfully reset. You can now login with your new credentials.
                    </p>
                    <Link 
                        to="/login"
                        className="inline-flex items-center justify-center w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                    >
                        LOGIN NOW
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
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Set New Password</h1>
                    <p className="text-gray-500 font-medium">Please enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800"
                                placeholder="••••••••"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'UPDATE PASSWORD'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
