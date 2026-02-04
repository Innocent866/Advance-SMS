import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import logoImg from '../assets/logo.png';
import { 
    School, 
    Mail, 
    Lock, 
    ArrowRight, 
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    usePageTitle('Login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const userData = await login(email, password);
            setIsLoading(false);
            if (userData.role === 'parent') {
                navigate('/parent-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setIsLoading(false);
            setError(err.response?.data?.message || 'Login failed. Please checks your credentials.');
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
                            Welcome Back to <span className="text-primary-300">Excellence.</span>
                        </h1>
                        <p className="text-primary-100 text-lg leading-relaxed mb-8">
                            Sign in to access your dashboard, manage records, and stay connected with your school community.
                        </p>
                        
                        <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                 <CheckCircle size={20} className="text-green-400" />
                                 <span className="font-medium">Secure Access</span>
                             </div>
                             <div className="flex items-center gap-3">
                                 <CheckCircle size={20} className="text-green-400" />
                                 <span className="font-medium">Real-time Updates</span>
                             </div>
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
                         <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                         <p className="text-gray-600">Enter your credentials to continue.</p>
                     </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex flex-col gap-2 border border-red-100 text-sm shadow-sm"
                        >
                            <div className="flex items-center gap-2 font-bold">
                                <AlertCircle size={18} />
                                Login Successful
                            </div>
                           <div>{error}</div>
                           
                           <div className="mt-2 pt-2 border-t border-red-100 text-xs text-red-600">
                                <p>Trouble logging in? Contact Support:</p>
                                <p>Email: goldimatech@gmail.com</p>
                                <p>Phone: +234 913 809 5613</p>
                           </div>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Password</label>
                                <Link to="/reset-password" class="text-xs text-primary-600 font-medium hover:underline">Forgot Password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        <button
                            type="submit"
                            disabled={isLoading}
                             className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 ${
                                 isLoading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                             }`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>Sign In <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register-school" className="text-primary-600 font-bold hover:underline">
                            Register your school
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
