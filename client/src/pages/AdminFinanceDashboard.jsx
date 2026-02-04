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
    Clock
} from 'lucide-react';
import { generateReceipt } from '../utils/receiptGenerator';
import Loader from '../components/Loader';

const AdminFinanceDashboard = () => {
    usePageTitle('Financial Management');
    
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
            setTransactions(txRes.data);
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

    const filteredTransactions = transactions.filter(tx => {
        const matchesStatus = filterStatus === 'All' || tx.status === filterStatus.toLowerCase();
        const matchesSearch = 
            tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.student?.firstName + ' ' + tx.student?.lastName).toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleDownload = (tx) => {
        try {
            generateReceipt(tx, school);
        } catch (error) {
            console.error("Download Error:", error);
            alert("Failed to generate receipt. Please try again.");
        }
    };

    if (loading) return <Loader type="spinner" />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                     <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
                     <p className="text-gray-500">Track revenue and payment history.</p>
                </div>
                <div></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">+12%</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.overview?.totalRevenue || 0)}</h3>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <CreditCard size={24} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats?.overview?.totalTransactions || 0}</h3>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Successful Payments</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats?.overview?.successfulTransactions || 0}</h3>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Pending/Failed</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats?.overview?.pendingTransactions || 0}</h3>
                </div>
            </div>

            {/* Bank Details Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard className="text-primary" size={20} />
                        School Bank Details
                    </h2>
                    <button 
                        onClick={() => {
                            setBankForm({
                                bankName: school?.bankDetails?.bankName || '',
                                accountName: school?.bankDetails?.accountName || '',
                                accountNumber: school?.bankDetails?.accountNumber || ''
                            });
                            setShowBankModal(true);
                        }}
                        className="text-primary text-sm font-semibold hover:underline"
                    >
                        Edit Details
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Bank Name</p>
                        <p className="font-medium text-gray-900">{school?.bankDetails?.bankName || 'Not Set'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Account Name</p>
                        <p className="font-medium text-gray-900">{school?.bankDetails?.accountName || 'Not Set'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Account Number</p>
                        <p className="font-mono font-medium text-gray-900 tracking-wider">{school?.bankDetails?.accountNumber || 'Not Set'}</p>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search ref, student..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full md:w-64"
                            />
                        </div>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="success">Successful</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                                <th className="px-6 py-4 font-medium">Reference</th>
                                <th className="px-6 py-4 font-medium">Student</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{tx.reference}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {tx.student ? `${tx.student.firstName} ${tx.student.lastName}` : 'Unknown Student'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {tx.student?.classId?.name || 'N/A'} • {tx.student?.studentId}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">{tx.type}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(tx.amount)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                            <div className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                tx.status === 'success' ? 'bg-green-100 text-green-700' :
                                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {tx.status === 'success' && <CheckCircle size={12} />}
                                                {tx.status === 'pending' && <Clock size={12} />}
                                                {tx.status === 'failed' && <XCircle size={12} />}
                                                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => setSelectedTransaction(tx)}
                                                className="text-primary hover:text-green-700 text-sm font-medium"
                                            >
                                                View
                                            </button>
                                            {tx.status === 'success' && (
                                                <span className="text-gray-300 text-xs italic">View Only</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bank Details Modal */}
            {showBankModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                         <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Update Bank Details</h3>
                            <button 
                                onClick={() => setShowBankModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const res = await api.put('/schools/my-school', { bankDetails: bankForm });
                                setSchool(res.data);
                                setShowBankModal(false);
                                alert('Bank details updated successfully');
                            } catch (error) {
                                console.error('Error updating bank details', error);
                                alert('Failed to update bank details');
                            }
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input 
                                    type="text"
                                    value={bankForm.bankName}
                                    onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                <input 
                                    type="text"
                                    value={bankForm.accountName}
                                    onChange={(e) => setBankForm({...bankForm, accountName: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input 
                                    type="text"
                                    value={bankForm.accountNumber}
                                    onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Transaction Details Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Transaction Details</h3>
                            <button 
                                onClick={() => setSelectedTransaction(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Total Amount</p>
                                <h2 className="text-3xl font-bold text-gray-900">{formatCurrency(selectedTransaction.amount)}</h2>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    selectedTransaction.status === 'success' ? 'bg-green-100 text-green-700' :
                                    selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {selectedTransaction.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 text-xs mb-1">Reference</p>
                                    <p className="font-mono font-medium text-gray-800 break-all">{selectedTransaction.reference}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 text-xs mb-1">Date</p>
                                    <p className="font-medium text-gray-800">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 text-xs mb-1">Payment Type</p>
                                    <p className="font-medium text-gray-800 capitalize">{selectedTransaction.type}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 text-xs mb-1">Session / Term</p>
                                    <p className="font-medium text-gray-800">{selectedTransaction.session || 'N/A'} - {selectedTransaction.term || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-primary rounded-full"></span> Student Info
                                </h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                        {selectedTransaction.student?.firstName?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{selectedTransaction.student?.firstName} {selectedTransaction.student?.lastName}</p>
                                        <p className="text-xs text-gray-500">{selectedTransaction.student?.classId?.name} • {selectedTransaction.student?.studentId}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-purple-500 rounded-full"></span> Paid By (Parent)
                                </h4>
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Name:</span>
                                        <span className="font-medium text-gray-900">{selectedTransaction.parent?.user?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="font-medium text-gray-900">{selectedTransaction.parent?.user?.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Phone:</span>
                                        <span className="font-medium text-gray-900">{selectedTransaction.parent?.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <button 
                                onClick={() => setSelectedTransaction(null)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFinanceDashboard;
