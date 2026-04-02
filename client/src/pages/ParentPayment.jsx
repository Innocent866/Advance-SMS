import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, 
    CheckCircle, 
    Clock, 
    Download, 
    Eye, 
    Zap, 
    Activity, 
    TrendingUp, 
    ShieldCheck, 
    LayoutGrid, 
    List, 
    Filter, 
    RefreshCw, 
    ArrowUpRight, 
    ChevronRight, 
    X,
    History,
    Calendar,
    Award,
    Hash,
    Receipt,
    Wallet,
    UserCircle,
    AlertCircle,
    Building
} from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';
import { generateReceipt } from '../utils/receiptGenerator';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { calculatePaystackGross } from '../utils/paymentUtils';

const ParentPayment = () => {
    usePageTitle('Payment Intelligence Hub');
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [payType, setPayType] = useState('tuition');
    const [term, setTerm] = useState('1st Term');
    const [session, setSession] = useState('2025/2026');
    const [school, setSchool] = useState(null);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/payments/history');
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching history', error);
        } finally {
            setPageLoading(false);
        }
    };

    const fetchSchoolSettings = async () => {
        try {
            const res = await api.get('/schools/my-school');
            setSchool(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchHistory(), fetchSchoolSettings()]);
        };
        init();
    }, []);

    const handlePay = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const grossData = calculatePaystackGross(parseFloat(amount));
            const res = await api.post('/payments/initialize', {
                amount: grossData.total, // Total to pay
                baseAmount: grossData.base, // Actual tuition
                gatewayFee: grossData.fee, // Added fee
                type: payType,
                term,
                session
            });
            const { key, email, reference, subaccount } = res.data;

            if (!key) {
                showNotification('Payment System Error: Public Key missing', 'error');
                setLoading(false);
                return;
            }

            const handler = window.PaystackPop.setup({
                key,
                email,
                amount: res.data.amount,
                reference: reference,
                metadata: res.data.metadata,
                subaccount,
                currency: 'NGN',
                callback: function(response) {
                    api.post('/payments/verify', {
                        reference: response.reference,
                        status: response.status,
                        metadata: res.data.metadata,
                        amount: res.data.amount
                    })
                    .then(() => {
                        showNotification('Transaction Mastered!', 'success');
                        fetchHistory();
                        setAmount('');
                    })
                    .catch(() => {
                        showNotification('Verification Failure', 'error');
                    });
                },
                onClose: function() {
                    setLoading(false);
                    showNotification('Gateway Closed', 'info');
                }
            });

            handler.openIframe();

        } catch (error) {
            console.error(error);
            showNotification('Initialization Failure', 'error');
            setLoading(false);
        }
    };

    const stats = {
        totalPaid: history.filter(p => p.status === 'success').reduce((acc, curr) => acc + curr.amount, 0),
        transactionCount: history.length,
        lastTransaction: history[0] ? history[0].amount : 0,
        pendingCount: history.filter(p => p.status === 'pending').length
    };

    const isPaymentReady = school?.paystackSubaccountCode;

    if (pageLoading) return <Loader fullScreen={true} />;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            {/* Neural Payments Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12 text-center lg:text-left">
                    <div className="space-y-6 flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Zap size={14} className="text-primary" /> Capital Allocation Portal
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                            Payment <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400">Intelligence Hub</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-medium max-w-xl">
                            Synchronize institutional investments and monitor transaction telemetry with real-time biometric-grade security.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                        <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 text-center lg:text-left group hover:bg-white/10 transition-all">
                            <TrendingUp className="text-primary mb-4 mx-auto lg:mx-0 group-hover:scale-110 transition-transform" size={24} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Total Investment</p>
                            <h3 className="text-2xl font-black">₦{stats.totalPaid.toLocaleString()}</h3>
                        </div>
                        <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 text-center lg:text-left group hover:bg-white/10 transition-all">
                            <Activity className="text-blue-400 mb-4 mx-auto lg:mx-0 group-hover:scale-110 transition-transform" size={24} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/60 mb-1">Telemetry Nodes</p>
                            <h3 className="text-2xl font-black">{stats.transactionCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Precision Payment Console */}
                <div className="lg:col-span-5 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-gray-100 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-all" />
                        
                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Initiate Transfer</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Capital Injection Protocol</p>
                            </div>
                        </div>

                        {!isPaymentReady && (
                            <div className="mb-8 p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-4 animate-pulse">
                                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-1" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Gate Hibernate Mode</p>
                                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                        Your school's payment destination is currently being finalized. Please contact the administrator to activate the Direct Settlement Vault.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handlePay} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-4">Allocation Type</label>
                                <div className="relative">
                                    <select 
                                        value={payType}
                                        onChange={(e) => setPayType(e.target.value)}
                                        className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-gray-900 font-bold text-sm focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="tuition">Tuition Matrix</option>
                                        <option value="uniform">Apparel Procurement</option>
                                        <option value="books">Resource Acquisition</option>
                                        <option value="transport">Logistics Coverage</option>
                                        <option value="other">Miscellaneous Vector</option>
                                    </select>
                                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-4">Cycle</label>
                                    <select 
                                        value={session}
                                        onChange={(e) => setSession(e.target.value)}
                                        className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold text-sm outline-none cursor-pointer"
                                    >
                                        <option>2025/2026</option>
                                        <option>2026/2027</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-4">Phase</label>
                                    <select 
                                        value={term}
                                        onChange={(e) => setTerm(e.target.value)}
                                        className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold text-sm outline-none cursor-pointer"
                                    >
                                        <option>1st Term</option>
                                        <option>2nd Term</option>
                                        <option>3rd Term</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-4">Capital Amount (NGN)</label>
                                <div className="relative">
                                    <div className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-gray-400">₦</div>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-14 pr-8 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-gray-900 font-bold text-sm focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="0.00"
                                        required 
                                    />
                                </div>
                            </div>
                            
                            {amount && parseFloat(amount) > 0 && (
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest">Base Tuition</span>
                                        <span className="text-gray-900 font-black">₦{parseFloat(amount).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Institutional Processing Fee</span>
                                        <span className="text-blue-600 font-black">+₦{calculatePaystackGross(parseFloat(amount)).fee.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-gray-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Final Total</span>
                                        <span className="text-lg font-black text-primary">₦{calculatePaystackGross(parseFloat(amount)).total.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading || !amount || !isPaymentReady}
                                className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all shadow-2xl ${
                                    (loading || !isPaymentReady)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                                        : 'bg-primary text-white shadow-primary/30 hover:bg-green-700 hover:y-[-2px]'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="animate-spin" size={18} /> Syncing Hub...
                                    </>
                                ) : (
                                    <>
                                        Authorize Injection <ArrowUpRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 flex items-start gap-5">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Gateway Protocol</p>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                All financial injections are verified via multi-layer encryption gateways. Verify all parameters before authorization.
                            </p>
                        </div>
                    </div>

                    {school?.bankDetails?.accountNumber && (
                        <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
                            <div className="relative z-10 flex items-start gap-5">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                                    <Building size={20} />
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Direct Bank Transfer</p>
                                        <p className="text-xs text-emerald-800 leading-relaxed font-bold">
                                            Prefer manual transfer? Use these institutional credentials:
                                        </p>
                                    </div>
                                    <div className="space-y-2 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100/50 shadow-inner">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-400 font-bold uppercase tracking-widest">Bank</span>
                                            <span className="text-gray-900 font-black">{school.bankDetails.bankName}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-400 font-bold uppercase tracking-widest">Account</span>
                                            <span className="text-gray-900 font-black font-mono tracking-tighter">{school.bankDetails.accountNumber}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-400 font-bold uppercase tracking-widest">Name</span>
                                            <span className="text-gray-900 font-black truncate max-w-[150px]">{school.bankDetails.accountName}</span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-emerald-600/60 font-black italic">
                                        * Please upload your transfer receipt to the administration portal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Transaction Artifact Matrix */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <History size={20} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight italic">Telemetry <span className="text-primary">Log</span></h3>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Real-time Feed
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {history.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-32 text-center bg-gray-50 rounded-[3.5rem] border-2 border-dashed border-gray-100"
                                >
                                    <Activity size={48} className="text-gray-200 mx-auto mb-6" />
                                    <p className="text-gray-400 font-black text-xs uppercase tracking-widest">No transaction signals discovered</p>
                                </motion.div>
                            ) : (
                                history.map((tx, idx) => (
                                    <motion.div 
                                        key={tx._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col md:flex-row justify-between items-center gap-6"
                                    >
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${
                                                tx.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            } shadow-inner group-hover:scale-110 transition-transform`}>
                                                {tx.status === 'success' ? <CheckCircle size={28} /> : <Clock size={28} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className="font-black text-gray-900 text-lg capitalize tracking-tight">{tx.type.replace('_', ' ')}</p>
                                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                        tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {tx.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-gray-400">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                                        <Calendar size={12} /> {new Date(tx.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 truncate max-w-[120px]">
                                                        <Hash size={12} /> {tx.reference.substring(0, 10)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-900 tabular-nums">₦{tx.amount.toLocaleString()}</p>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{tx.metadata?.term || 'Session'} Node</p>
                                            </div>
                                            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                                <button 
                                                    onClick={() => { setSelectedPayment(tx); setShowModal(true); }}
                                                    className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                                                    title="View Matrix Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {tx.status === 'success' && (
                                                    <button 
                                                        onClick={() => generateReceipt(tx, school)}
                                                        className="p-3 text-gray-400 hover:text-primary hover:bg-white rounded-xl transition-all"
                                                        title="Synthesize Receipt"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* High-Fidelity Audit Modal */}
            <AnimatePresence>
                {showModal && selectedPayment && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-gray-950/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[4rem] shadow-3xl w-full max-w-2xl overflow-hidden relative z-10 border border-white/20"
                        >
                            <div className="p-12">
                                <div className="flex justify-between items-start mb-12">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl">
                                            <Receipt size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Audit Console</h3>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Transaction Verification Protocol</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowModal(false)} 
                                        className="p-4 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-950 group"
                                    >
                                        <X size={24} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center justify-center py-10 mb-12 bg-gray-50/50 rounded-[3rem] border border-gray-100 relative overflow-hidden group">
                                    <div className={`absolute top-0 left-0 w-full h-2 ${selectedPayment.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 relative ${selectedPayment.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {selectedPayment.status === 'success' ? <CheckCircle size={48} className="animate-bounce" /> : <Clock size={48} />}
                                        {selectedPayment.status === 'success' && <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />}
                                    </div>
                                    <h2 className="text-5xl font-black text-gray-950 tracking-tighter tabular-nums mb-2">₦{selectedPayment.amount.toLocaleString()}</h2>
                                    <p className={`text-xs font-black uppercase tracking-[0.3em] ${selectedPayment.status === 'success' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        Verification: {selectedPayment.status}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                    {[
                                        { label: 'Artifact ID', value: selectedPayment.reference, icon: Hash, mono: true },
                                        { label: 'Allocation', value: selectedPayment.type.replace('_', ' '), icon: Wallet, capitalize: true },
                                        { label: 'Time Horizon', value: new Date(selectedPayment.createdAt).toLocaleString(), icon: Clock },
                                        { label: 'Academic Cycle', value: `${selectedPayment.metadata?.session || 'N/A'} - ${selectedPayment.metadata?.term || 'N/A'}`, icon: Award },
                                        { label: 'Institutional Node', value: school?.name || 'Central Matrix', icon: ShieldCheck },
                                        { label: 'Origin Entity', value: `${user?.firstName} ${user?.lastName}`, icon: UserCircle },
                                        { label: 'Gateway Channel', value: selectedPayment.channel || 'Neural Uplink', icon: Zap, capitalize: true }
                                    ].map((field, i) => (
                                        <div key={i} className="flex flex-col space-y-2 pb-4 border-b border-gray-50">
                                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                                <field.icon size={12} className="text-primary" /> {field.label}
                                            </div>
                                            <span className={`text-sm font-bold text-gray-900 ${field.mono ? 'font-mono' : ''} ${field.capitalize ? 'capitalize' : ''} truncate`}>
                                                {field.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 flex gap-4">
                                    {selectedPayment.status === 'success' && (
                                        <button 
                                            onClick={() => generateReceipt(selectedPayment, school)}
                                            className="flex-1 py-6 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-green-700 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Download size={18} /> Synthesize Receipt
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-6 bg-gray-100 text-gray-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        Seal Console
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

export default ParentPayment;
