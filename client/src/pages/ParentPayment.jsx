// Placeholder to avoid empty replacement.
// I will change strategy to view TeachersList first.
import { useState, useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';
import api from '../utils/api';
import { CreditCard, CheckCircle, Clock, Download, Eye } from 'lucide-react';
import { generateReceipt } from '../utils/receiptGenerator';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const ParentPayment = () => {
    usePageTitle('Fees & Payments');
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [payType, setPayType] = useState('tuition');
    const [term, setTerm] = useState('1st Term');
    const [session, setSession] = useState('2025/2026');

    const [school, setSchool] = useState(null);

    // Debugging logs
    useEffect(() => {
        console.log("ParentPayment Debug: User:", user);
        console.log("ParentPayment Debug: School:", school);
    }, [user, school]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/payments/history');
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching history', error);
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchSchoolSettings();
    }, []);

    const fetchSchoolSettings = async () => {
        try {
            // Parent needs public info about school for receipt
            // We might need a public endpoint or allow parent to read basic school info
            // For now, assuming parent is linked to school and can read it
             const res = await api.get('/schools/my-school'); // Note: ensure this endpoint is accessible to parents or create a public one
             setSchool(res.data);
        } catch (error) {
            console.error(error);
             // Fallback if permission denied, receipt generator handles null school
        }
    };

    const handlePay = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Initialize logic to get keys/config
            const res = await api.post('/payments/initialize', {
                amount: parseFloat(amount),
                type: payType,
                term,
                session
            });
            const { key, email, reference, subaccount } = res.data;
            console.log("Paystack Init:", { key, email, amount: res.data.amount, ref: reference, subaccount });

            if (!key) {
                showNotification('Payment System Error: Public Key missing', 'error');
                setLoading(false);
                return;
            }

            // 2. Open Paystack Popup
            const handler = window.PaystackPop.setup({
                key,
                email,
                amount: res.data.amount, // in kobo
                ref: reference,
                subaccount, // Add subaccount for automatic split
                currency: 'NGN',
                callback: function(response) {
                    // 3. Verify on backend
                    api.post('/payments/verify', {
                        reference: response.reference,
                        status: response.status,
                        metadata: res.data.metadata,
                        amount: res.data.amount // Send Kobo amount
                    })
                    .then(() => {
                        showNotification('Payment successful!', 'success');
                        fetchHistory();
                        setAmount('');
                    })
                    .catch(() => {
                        showNotification('Payment verification failed', 'error');
                    });
                },
                onClose: function() {
                    setLoading(false);
                    showNotification('Payment cancelled', 'info');
                }
            });

            handler.openIframe();

        } catch (error) {
            console.error(error);
            showNotification('Payment initialization failed', 'error');
            setLoading(false);
        }
    };

    const downloadReceipt = (tx) => {
        const doc = new jsPDF();
        
        // Add School Header (Placeholder - you might want to fetch actual school info)
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Advance SMS", 105, 20, { align: "center" });
        
        doc.setFontSize(12);
        doc.text("Payment Receipt", 105, 30, { align: "center" });
        
        // Draw divider
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        
        // Receipt Details
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        
        let y = 50;
        const addLine = (label, value) => {
            doc.setFont("helvetica", "bold");
            doc.text(label, 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(value.toString(), 100, y);
            y += 10;
        };

        addLine("Receipt Ref:", tx.reference);
        addLine("Date:", new Date(tx.createdAt).toLocaleDateString() + ' ' + new Date(tx.createdAt).toLocaleTimeString());
        addLine("Amount:", `NGN ${tx.amount.toLocaleString()}`);
        addLine("Payment Type:", tx.type.replace('_', ' ').toUpperCase());
        addLine("Status:", tx.status.toUpperCase());
        if (tx.metadata) {
            if (tx.metadata.session) addLine("Session:", tx.metadata.session);
            if (tx.metadata.term) addLine("Term:", tx.metadata.term);
        }

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for your payment.", 105, 130, { align: "center" });
        
        doc.save(`Receipt_${tx.reference}.pdf`);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Fees & Payments</h1>
                <p className="text-gray-500 mt-2">Manage school fees and view transaction history</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <CreditCard size={24} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Make a Payment</h2>
                    </div>

                    <form onSubmit={handlePay} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                            <select 
                                value={payType}
                                onChange={(e) => setPayType(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="tuition">Tuition Fee</option>
                                <option value="uniform">Uniform</option>
                                <option value="books">Books</option>
                                <option value="transport">Transport</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                                <select 
                                    value={session}
                                    onChange={(e) => setSession(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option>2025/2026</option>
                                    <option>2026/2027</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                                <select 
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option>1st Term</option>
                                    <option>2nd Term</option>
                                    <option>3rd Term</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NGN)</label>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="0.00"
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !amount}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-70 mt-4"
                        >
                            {loading ? 'Processing...' : 'Pay Now'}
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Transaction History</h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {history.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No transactions yet.</p>
                        ) : (
                            history.map((tx) => (
                                <div key={tx._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        {tx.status === 'success' ? (
                                            <CheckCircle className="text-green-500" size={20} />
                                        ) : (
                                            <Clock className="text-yellow-500" size={20} />
                                        )}
                                        <div>
                                            <p className="font-bold text-gray-800 capitalize">{tx.type.replace('_', ' ')}</p>
                                            <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div>
                                            <p className="font-bold text-gray-900">₦{tx.amount.toLocaleString()}</p>
                                            <p className={`text-xs font-bold capitalize ${tx.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {tx.status}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => { setSelectedPayment(tx); setShowModal(true); }}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-full transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {tx.status === 'success' && (
                                                <button 
                                                    onClick={() => generateReceipt(tx, school)}
                                                    className="p-2 text-gray-500 hover:text-primary hover:bg-white rounded-full transition-all"
                                                    title="Download Receipt"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Details Modal */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Transaction Details</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex flex-col items-center justify-center mb-6">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${selectedPayment.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    {selectedPayment.status === 'success' ? <CheckCircle size={32} /> : <Clock size={32} />}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">₦{selectedPayment.amount.toLocaleString()}</h2>
                                <p className={`font-medium capitalize ${selectedPayment.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>{selectedPayment.status}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Reference</span>
                                    <span className="font-mono text-sm text-gray-800">{selectedPayment.reference}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Fee Type</span>
                                    <span className="font-medium text-gray-800 capitalize">{selectedPayment.type.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Date</span>
                                    <span className="font-medium text-gray-800">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                                </div>
                                {selectedPayment.metadata?.session && (
                                    <div className="flex justify-between py-2 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Session</span>
                                        <span className="font-medium text-gray-800">{selectedPayment.metadata.session}</span>
                                    </div>
                                )}
                                {selectedPayment.metadata?.term && (
                                    <div className="flex justify-between py-2 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Term</span>
                                        <span className="font-medium text-gray-800">{selectedPayment.metadata.term}</span>
                                    </div>
                                )}
                                {school?.name && (
                                    <div className="flex justify-between py-2 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Paid To</span>
                                        <span className="font-medium text-gray-800">{school.name}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Paid By</span>
                                    <span className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Method</span>
                                    <span className="font-medium text-gray-800 capitalize">{selectedPayment.channel || 'Online Payment'}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentPayment;
