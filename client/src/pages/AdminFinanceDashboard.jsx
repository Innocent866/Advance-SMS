import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import { 
    DollarSign, 
    CreditCard, 
    TrendingUp, 
    Calendar, 
    Search,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Building2,
    PieChart,
    ChevronRight,
    ExternalLink,
    RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateReceipt } from '../utils/receiptGenerator';
import Loader from '../components/Loader';

const AdminFinanceDashboard = () => {
    usePageTitle('Finance Dashboard');
    
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [school, setSchool] = useState(null);
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankForm, setBankForm] = useState({ bankName: '', accountName: '', accountNumber: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, txRes, schoolRes] = await Promise.all([
                api.get('/payments/admin/stats'),
                api.get('/payments/admin/all'),
                api.get('/schools/my-school')
            ]);
            setStats(statsRes.data);
            setTransactions(Array.isArray(txRes.data) ? txRes.data : txRes.data.data || []);
            setSchool(schoolRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching finance data:', error);
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const filteredTransactions = (Array.isArray(transactions) ? transactions : []).filter(tx => {
        const matchesStatus = filterStatus === 'All' || tx.status === filterStatus.toLowerCase();
        const matchesSearch = 
            (tx.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.student?.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            ((tx.student?.firstName || '') + ' ' + (tx.student?.lastName || '')).toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return <Loader type="spinner" />;

    const statsCards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(stats?.overview?.totalRevenue || 0),
            trend: stats?.overview?.revenueGrowth,
            icon: Wallet,
            color: 'blue',
            description: 'Total successful collections'
        },
        {
            title: 'Transactions',
            value: stats?.overview?.totalTransactions || 0,
            icon: CreditCard,
            color: 'purple',
            description: 'Total payment attempts'
        },
        {
            title: 'Success Rate',
            value: `${((stats?.overview?.successfulTransactions / stats?.overview?.totalTransactions) * 100 || 0).toFixed(1)}%`,
            icon: CheckCircle,
            color: 'green',
            description: 'Percentage of completed payments'
        },
        {
            title: 'Pending Volume',
            value: formatCurrency(stats?.overview?.pendingVolume || 0),
            icon: Clock,
            color: 'orange',
            description: 'Payments awaiting processing'
        }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Premium Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            School <span className="text-primary-600">Finance</span>
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Track your school's income and payments.</p>
                    </motion.div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => fetchData()}
                            className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition-all text-gray-600"
                            title="Refresh Data"
                        >
                            <RotateCcw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all transform hover:-translate-y-1">
                            <Download size={20} />
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Intelligence Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((card, idx) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 group relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${card.color}-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 opacity-50`} />
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 bg-${card.color}-50 text-${card.color}-600 rounded-2xl`}>
                                        <card.icon size={24} />
                                    </div>
                                    {card.trend !== undefined && (
                                        <div className={`flex items-center gap-1 text-sm font-bold ${parseFloat(card.trend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {parseFloat(card.trend) >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                            {Math.abs(card.trend)}%
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{card.title}</p>
                                    <h3 className="text-2xl font-black text-gray-900">{card.value}</h3>
                                    <p className="text-xs text-gray-400 mt-2 font-medium">{card.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Register & Search */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Glassmorphic Registry Table */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Recent Transactions</h2>
                                    <p className="text-sm text-gray-400 font-medium">A list of all recent payments</p>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Search records..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                                        <Filter size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Transaction</th>
                                            <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Student</th>
                                            <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        <AnimatePresence>
                                            {filteredTransactions.map((tx, idx) => (
                                                <motion.tr 
                                                    key={tx._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="hover:bg-gray-50/80 transition-all group"
                                                >
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900 font-mono tracking-tighter">#{tx.reference}</span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Calendar size={12} className="text-gray-400" />
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                                    {new Date(tx.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center font-black text-sm">
                                                                {tx.student?.firstName?.[0] || 'U'}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-gray-900">
                                                                    {tx.student ? `${tx.student.firstName} ${tx.student.lastName}` : 'Direct Deposit'}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                                    {tx.student?.classId?.name || 'Administrative'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-gray-900">{formatCurrency(tx.amount)}</span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter capitalize">
                                                                {tx.type || 'Standard Fee'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                            tx.status === 'success' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                            tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                            'bg-red-50 text-red-600 border border-red-100'
                                                        }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                                tx.status === 'success' ? 'bg-green-600' :
                                                                tx.status === 'pending' ? 'bg-amber-600' : 'bg-red-600'
                                                            }`} />
                                                            {tx.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button 
                                                            onClick={() => setSelectedTransaction(tx)}
                                                            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-50 hover:text-primary-600"
                                                        >
                                                            <ExternalLink size={18} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Insights & Bank */}
                    <div className="space-y-8">
                        
                        {/* School Bank Branding Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-primary-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-200"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <Building2 size={28} />
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setBankForm({
                                                bankName: school?.bankDetails?.bankName || '',
                                                accountName: school?.bankDetails?.accountName || '',
                                                accountNumber: school?.bankDetails?.accountNumber || ''
                                            });
                                            setShowBankModal(true);
                                        }}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all backdrop-blur-md uppercase tracking-wider"
                                    >
                                        Update
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] text-primary-200 font-black uppercase tracking-widest mb-1">Bank Name</p>
                                        <h3 className="text-xl font-black">{school?.bankDetails?.bankName || 'Not Set'}</h3>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-primary-200 font-black uppercase tracking-widest mb-1">Account Name</p>
                                        <p className="text-lg font-bold">{school?.bankDetails?.accountName || 'Not Set'}</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-[10px] text-primary-200 font-black uppercase tracking-widest mb-2">Account Number</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black tracking-[0.2em] font-mono">
                                                {school?.bankDetails?.accountNumber || '0000000000'}
                                            </span>
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Revenue Performance Chart placeholder/visualization */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <PieChart size={20} className="text-primary-600" />
                                    Fee Breakdown
                                </h3>
                                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                    <TrendingUp size={16} />
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {['Tuition', 'Exam Fees', 'Uniforms'].map((category, idx) => (
                                    <div key={category} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                            <span className="text-gray-400">{category}</span>
                                            <span className="text-gray-900">{75 - (idx * 15)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${75 - (idx * 15)}%` }}
                                                className={`h-full bg-primary-${600 - (idx * 100)} rounded-full`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Collection Status</p>
                                <h4 className="text-2xl font-black text-primary-600">EXCELLENT</h4>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Payments are on track</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bank Detail Update Hub (Modal) */}
            <AnimatePresence>
                {showBankModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBankModal(false)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl"
                        >
                            <div className="p-10">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Bank <span className="text-primary-600">Details</span></h3>
                                <p className="text-gray-400 font-medium mb-8 uppercase text-[10px] tracking-widest font-black">Update where payments are sent</p>
                                
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        const res = await api.put('/schools/my-school', { bankDetails: bankForm });
                                        setSchool(res.data);
                                        setShowBankModal(false);
                                    } catch (error) {
                                        console.error('Update failed', error);
                                    }
                                }} className="space-y-6">
                                    {[
                                        { label: 'Bank Name', key: 'bankName', placeholder: 'e.g., Zenith Bank' },
                                        { label: 'Account Name', key: 'accountName', placeholder: 'Official School Name' },
                                        { label: 'Account Number', key: 'accountNumber', placeholder: '10-digit number' }
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{field.label}</label>
                                            <input 
                                                type="text"
                                                value={bankForm[field.key]}
                                                onChange={(e) => setBankForm({...bankForm, [field.key]: e.target.value})}
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-sm font-bold placeholder:text-gray-300 transition-all"
                                                placeholder={field.placeholder}
                                                required
                                            />
                                        </div>
                                    ))}
                                    
                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            type="button"
                                            onClick={() => setShowBankModal(false)}
                                            className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            className="flex-2 px-10 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Transaction Intelligence Hub (Details Modal) */}
            <AnimatePresence>
                {selectedTransaction && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTransaction(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white rounded-[3rem] w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl"
                        >
                            <div className="bg-primary-900 p-12 text-white relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-600 rounded-full -mb-32 -mr-32 blur-3xl opacity-50" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="bg-white/10 p-4 rounded-[1.5rem] backdrop-blur-md">
                                            <Wallet size={32} className="text-primary-300" />
                                        </div>
                                        <button 
                                            onClick={() => setSelectedTransaction(null)}
                                            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all font-black text-lg"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <p className="text-primary-300 text-xs font-black uppercase tracking-[0.3em] mb-2 font-mono">Reference: {selectedTransaction.reference}</p>
                                    <h2 className="text-5xl font-black leading-none">{formatCurrency(selectedTransaction.amount)}</h2>
                                    <div className="flex items-center gap-4 mt-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            selectedTransaction.status === 'success' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                                        }`}>
                                            Transaction {selectedTransaction.status}
                                        </span>
                                        <span className="text-primary-300 text-[10px] font-bold uppercase tracking-widest">
                                            {new Date(selectedTransaction.createdAt).toLocaleTimeString()} • Verified
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-12">
                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Student</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-600">
                                                    {selectedTransaction.student?.firstName?.[0] || 'D'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900">
                                                        {selectedTransaction.student ? `${selectedTransaction.student.firstName} ${selectedTransaction.student.lastName}` : 'System Admin'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                        {selectedTransaction.student?.studentId || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Payment Type</p>
                                            <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                                                <span className="text-xs font-black text-gray-900 uppercase">{selectedTransaction.type || 'Standard'}</span>
                                                <ArrowUpRight size={16} className="text-green-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Parent Info</p>
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-sm font-black text-gray-900">{selectedTransaction.parent?.user?.name || 'Authorized Proxy'}</span>
                                                <span className="text-xs font-bold text-gray-400">{selectedTransaction.parent?.phone || 'Encrypted Communication'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Academic Period</p>
                                            <span className="text-xs font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg uppercase">
                                                {selectedTransaction.session} • {selectedTransaction.term}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
                                    <button 
                                        onClick={() => generateReceipt(selectedTransaction, school)}
                                        className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download size={16} />
                                        Download Receipt
                                    </button>
                                    <button 
                                        onClick={() => setSelectedTransaction(null)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminFinanceDashboard;
