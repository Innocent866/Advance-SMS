import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Small delay to make the animation feel natural after load
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.6, type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-4 left-4 right-4 z-[100] md:bottom-8 md:left-8 md:right-auto md:max-w-lg"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 relative overflow-hidden">
                        {/* Decorative bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0A74DA] to-[#000D57]"></div>
                        
                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-[#000D57] mb-2">We value your privacy</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    We use cookies to improve your experience, analyze traffic, and provide better school management services. 
                                    <Link to="/privacy" className="text-[#0A74DA] font-bold hover:underline ml-1">
                                        Learn more in our Privacy Policy.
                                    </Link>
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button 
                                    onClick={handleAccept}
                                    className="flex-1 px-6 py-3 rounded-xl bg-[#0A74DA] text-white font-bold shadow-lg hover:bg-[#000D57] transition-all transform hover:-translate-y-0.5 text-sm active:scale-95"
                                >
                                    Accept Cookies
                                </button>
                                <button 
                                    onClick={handleReject}
                                    className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-gray-300 hover:bg-gray-50 transition-all text-sm active:scale-95"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
