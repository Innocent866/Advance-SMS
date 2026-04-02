import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, MapPin, Phone, GraduationCap, CheckCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SchoolSetup = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        address: '',
        phone: '',
        classes: ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3']
    });

    const handleClassToggle = (cls) => {
        setFormData(prev => ({
            ...prev,
            classes: prev.classes.includes(cls) 
                ? prev.classes.filter(c => c !== cls)
                : [...prev.classes, cls]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/schools/complete-setup', formData);
            toast.success('School profile setup successfully!');
            await refreshUser();
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete setup');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-6"
                    >
                        <Sparkles size={40} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Welcome to GT-SchoolHub</h1>
                    <p className="text-gray-500 font-medium italic">Let's get your school profile set up in just a few steps.</p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <div className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
                    <div className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
                    <div className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
                </div>

                <motion.div 
                    layout
                    className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden relative"
                >
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                        <MapPin className="text-primary" /> Basic Information
                                    </h2>
                                    <p className="text-gray-400 font-medium">Where is your school located?</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Physical Address</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800"
                                            placeholder="123 Education Way, Lagos, Nigeria"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Contact Phone</label>
                                        <input 
                                            type="tel" 
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800"
                                            placeholder="+234 800 000 0000"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={nextStep}
                                    disabled={!formData.address || !formData.phone}
                                    className="w-full py-5 bg-primary text-white rounded-[2rem] font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    CONTINUE <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                        <GraduationCap className="text-primary" /> Academic Structure
                                    </h2>
                                    <p className="text-gray-400 font-medium">Which classes does your school currently operate?</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'].map(cls => (
                                        <button
                                            key={cls}
                                            onClick={() => handleClassToggle(cls)}
                                            className={`py-4 px-2 rounded-2xl border-2 font-bold transition-all ${
                                                formData.classes.includes(cls)
                                                ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10'
                                                : 'border-gray-100 text-gray-400 hover:border-gray-200'
                                            }`}
                                        >
                                            {cls}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={prevStep}
                                        className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-[2rem] font-black hover:bg-gray-200 transition-all active:scale-[0.98]"
                                    >
                                        BACK
                                    </button>
                                    <button 
                                        onClick={nextStep}
                                        disabled={formData.classes.length === 0}
                                        className="flex-[2] py-5 bg-primary text-white rounded-[2rem] font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        FINALIZE SETUP <ArrowRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 text-center"
                            >
                                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <CheckCircle size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">Everything Looks Good!</h2>
                                    <p className="text-gray-500 font-medium">Your school profile is ready for launch.</p>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-left space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest">Address</span>
                                        <span className="text-gray-700 font-black">{formData.address}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest">Phone</span>
                                        <span className="text-gray-700 font-black">{formData.phone}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest">Classes</span>
                                        <span className="text-gray-700 font-black">{formData.classes.length} Selected</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={prevStep}
                                        className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-[2rem] font-black hover:bg-gray-200 transition-all active:scale-[0.98]"
                                    >
                                        BACK
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-[2] py-5 bg-primary text-white rounded-[2rem] font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={24} /> : 'LAUNCH DASHBOARD'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default SchoolSetup;
