import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await api.get(`/auth/verify-email/${token}`);
                setStatus('success');
                setMessage(res.data.message);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border max-w-md w-full text-center"
            >
                {status === 'verifying' && (
                    <>
                        <Loader2 className="animate-spin text-primary mx-auto mb-6" size={60} />
                        <h2 className="text-3xl font-black text-gray-800 mb-4">Verifying Email...</h2>
                        <p className="text-gray-500 leading-relaxed">
                            Please wait while we confirm your email address.
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-800 mb-4">Email Verified!</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            {message || 'Your email has been successfully verified. You can now access your dashboard and complete your school profile.'}
                        </p>
                        <Link 
                            to="/login"
                            className="inline-flex items-center justify-center w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                        >
                            PROCEED TO LOGIN
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-800 mb-4">Verification Failed</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            {message}
                        </p>
                        <div className="flex flex-col gap-4">
                            <Link 
                                to="/register-school"
                                className="inline-flex items-center justify-center w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                            >
                                TRY REGISTERING AGAIN
                            </Link>
                            <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">
                                Back to Login
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
