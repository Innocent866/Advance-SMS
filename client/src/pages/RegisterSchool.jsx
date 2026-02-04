import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import { motion } from 'framer-motion';
import { 
    School, 
    User, 
    Mail, 
    Lock, 
    MapPin, 
    Phone, 
    CheckCircle, 
    ArrowRight, 
    Shield, 
    CreditCard, 
    LayoutDashboard,
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const RegisterSchool = () => {
    usePageTitle('Register School');
    const [formData, setFormData] = useState({
        schoolName: '',
        schoolEmail: '',
        adminName: '',
        adminEmail: '',
        password: '',
        confirmPassword: '',
        address: '',
        phone: '',
        schoolType: 'primary_secondary', // Default
        state: ''
    });
    
    const { registerSchool } = useAuth();
    const navigate = useNavigate();
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            // Remove confirmPassword before sending
            const { confirmPassword, ...dataToSend } = formData;
            const res = await registerSchool(dataToSend);
            setIsLoading(false);
            
            if (res.isVerified === false || res.message) {
                 setSuccess(res.message || 'Registration successful. Account pending verification.');
            } else {
                 navigate('/dashboard');
            }
        } catch (err) {
            setIsLoading(false);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="h-screen flex bg-white overflow-hidden">
            
            {/* Left Side: Visuals & Hero (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 bg-primary-900 relative overflow-hidden flex-col justify-between p-12 text-white h-full">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-2/3 h-full bg-primary-800 rounded-l-full opacity-50 blur-3xl transform translate-x-1/3"></div>
                
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-3 text-3xl font-bold mb-12 hover:opacity-90 transition-opacity w-fit">
                        <img src={logoImg} alt="GT-SchoolHub Logo" className="w-20 h-20 object-contain" />
                        GT-SchoolHub
                    </Link>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-md"
                    >
                        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                            Build a <span className="text-primary-300">Smarter School</span> Today.
                        </h1>
                        <p className="text-primary-100 text-lg leading-relaxed mb-8">
                            Join thousands of forward-thinking schools using GT-SchoolHub to manage students, staff, payments, and results seamlessly.
                        </p>
                        
                        <div className="space-y-4">
                             {[
                                 "Automated Result Computation",
                                 "Secure Online Fee Payments",
                                 "Parent & Student Portals",
                                 "AI-Powered Teaching Tools"
                             ].map((item, i) => (
                                 <div key={i} className="flex items-center gap-3">
                                     <CheckCircle size={20} className="text-green-400" />
                                     <span className="font-medium">{item}</span>
                                 </div>
                             ))}
                        </div>
                    </motion.div>
                </div>

                <div className="relative z-10 text-sm text-primary-300">
                    &copy; {new Date().getFullYear()} Goldima Tech. All rights reserved.
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto">
                <div className="min-h-full flex flex-col justify-center p-6 sm:p-12 lg:p-24">
                     
                     <div className="mb-8">
                         <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your School Account</h2>
                         <p className="text-gray-600">Enter your details to get started with your 30-day free trial.</p>
                     </div>

                     {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3 border border-red-100"
                        >
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <div>{error}</div>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-start gap-3 border border-green-100"
                        >
                            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <div>{success}</div>
                        </motion.div>
                    )}

                     <form onSubmit={handleSubmit} className="space-y-5">
                         
                         {/* School Info Section */}
                         <div className="space-y-5">
                             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">School Details</div>
                             <div>
                                 <label className="block text-sm font-semibold text-gray-700 mb-2">School Name</label>
                                 <div className="relative">
                                     <School className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                     <input
                                         name="schoolName"
                                         required
                                         className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                         placeholder="e.g. Springfield Academy"
                                         onChange={handleChange}
                                     />
                                 </div>
                             </div>
                             
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                 <div>
                                     <label className="block text-sm font-semibold text-gray-700 mb-2">School Email</label>
                                     <div className="relative">
                                         <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                         <input
                                             name="schoolEmail"
                                             type="email"
                                             required
                                             className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                             placeholder="info@school.com"
                                             onChange={handleChange}
                                         />
                                     </div>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                     <div className="relative">
                                         <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                         <input
                                             name="phone"
                                             type="tel"
                                             required
                                             className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                             placeholder="+234..."
                                             onChange={handleChange}
                                         />
                                     </div>
                                 </div>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                 <div>
                                     <label className="block text-sm font-semibold text-gray-700 mb-2">State/Location</label>
                                     <div className="relative">
                                         <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                         <input
                                             name="state"
                                             required
                                             className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                             placeholder="e.g. Lagos"
                                             onChange={handleChange}
                                         />
                                     </div>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-semibold text-gray-700 mb-2">School Type</label>
                                     <div className="relative">
                                         <select
                                             name="schoolType"
                                             className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white appearance-none"
                                             onChange={handleChange}
                                         >
                                             <option value="primary">Primary Only</option>
                                             <option value="secondary">Secondary Only</option>
                                             <option value="primary_secondary">Primary & Secondary</option>
                                         </select>
                                     </div>
                                 </div>
                             </div>
                             
                             <div>
                                 <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                 <input
                                     name="address"
                                     required
                                     className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                     placeholder="Full School Address"
                                     onChange={handleChange}
                                 />
                             </div>
                         </div>

                         {/* Admin Info Section */}
                         <div className="space-y-5 pt-4 border-t border-gray-100">
                             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Account</div>
                             
                             <div>
                                 <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Full Name</label>
                                 <div className="relative">
                                     <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                     <input
                                         name="adminName"
                                         required
                                         className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                         placeholder="John Doe"
                                         onChange={handleChange}
                                     />
                                 </div>
                             </div>
                             
                             <div>
                                 <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email</label>
                                 <div className="relative">
                                     <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                     <input
                                         name="adminEmail"
                                         type="email"
                                         required
                                         className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                         placeholder="admin@school.com"
                                         onChange={handleChange}
                                     />
                                 </div>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                 <div>
                                     <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                     <div className="relative">
                                         <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                         <input
                                             name="password"
                                             type={showPassword ? "text" : "password"}
                                             required
                                             className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                             placeholder="At least 6 chars"
                                             onChange={handleChange}
                                         />
                                         <button
                                             type="button"
                                             onClick={() => setShowPassword(!showPassword)}
                                             className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                         >
                                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                         </button>
                                     </div>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                                     <div className="relative">
                                         <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                         <input
                                             name="confirmPassword"
                                             type={showConfirmPassword ? "text" : "password"}
                                             required
                                             className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                             placeholder="Repeat password"
                                             onChange={handleChange}
                                         />
                                         <button
                                             type="button"
                                             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                             className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                         >
                                             {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <button
                             type="submit"
                             disabled={isLoading}
                             className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 mt-8 ${
                                 isLoading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                             }`}
                         >
                             {isLoading ? (
                                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                             ) : (
                                 <>Create School Account <ArrowRight size={20} /></>
                             )}
                         </button>

                     </form>
                     
                     <div className="mt-8 text-center">
                         <p className="text-gray-600">Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:underline">Login here</Link></p>
                     </div>

                     {/* Trust Badges */}
                     <div className="mt-6 flex justify-center gap-6 opacity-60">
                         <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                             <Shield size={14} /> Secure Data
                         </div>
                         <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                             <CreditCard size={14} /> Paystack
                         </div>
                         <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                             <LayoutDashboard size={14} /> Smart Tools
                         </div>
                     </div>

                </div>
            </div>

        </div>
    );
};

export default RegisterSchool;
