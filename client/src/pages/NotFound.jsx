import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Ghost } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="relative mb-8">
                    <motion.div
                        animate={{ 
                            y: [0, -20, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                            duration: 4, 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="inline-block"
                    >
                        <Ghost size={120} className="text-primary opacity-20" />
                    </motion.div>
                    <h1 className="text-[12rem] font-black text-gray-900 leading-none tracking-tighter opacity-10 absolute inset-0 flex items-center justify-center select-none">
                        404
                    </h1>
                </div>

                <div className="relative z-10 space-y-6">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Lost in the Hallways?</h2>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                        We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 inline-flex items-center justify-center gap-3 py-4 px-8 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98] shadow-sm"
                        >
                            <ArrowLeft size={20} /> GO BACK
                        </button>
                        <Link
                            to="/"
                            className="flex-1 inline-flex items-center justify-center gap-3 py-4 px-8 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                        >
                            <Home size={20} /> HOME
                        </Link>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-16 pt-8 border-t border-gray-100"
                >
                    <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">
                        GT-SchoolHub • Excellence in Education
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default NotFound;
