import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    CheckCircle, XCircle, ShieldCheck, Building, 
    CreditCard, Users, TrendingUp, DollarSign, Activity, Plus
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <div className="text-gray-500 text-sm font-medium">{label}</div>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
        </div>
    </div>
);

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [schools, setSchools] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [editingSchool, setEditingSchool] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newSchoolData, setNewSchoolData] = useState({
        schoolName: '', schoolEmail: '', adminName: '', adminEmail: '', password: ''
    });

    const handleCreateSchool = async (e) => {
        e.preventDefault();
        try {
            await api.post('/superadmin/schools', newSchoolData);
            alert('School and Admin created successfully!');
            setIsCreating(false);
            setNewSchoolData({ schoolName: '', schoolEmail: '', adminName: '', adminEmail: '', password: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Creation failed');
        }
    };

    const fetchData = async () => {
        try {
            setError(null);
            const [statsRes, schoolsRes, paymentsRes] = await Promise.all([
                api.get('/superadmin/stats'),
                api.get('/superadmin/schools'),
                api.get('/superadmin/payments')
            ]);
            setStats(statsRes.data);
            setSchools(schoolsRes.data);
            setPayments(paymentsRes.data);
        } catch (error) {
            console.error(error);
            setError('Failed to load platform data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerify = async (id) => {
        if (!window.confirm('Are you sure you want to verify this school?')) return;
        try {
            await api.put(`/superadmin/verify-school/${id}`);
            alert('School verified successfully');
            fetchData();
        } catch (error) {
            alert('Verification failed');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen text-indigo-600 font-bold">
            <Activity className="animate-spin mr-2" /> Loading Platform Data...
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-screen text-red-600 font-bold flex-col gap-4">
            <p>{error}</p>
            <button onClick={fetchData} className="bg-indigo-600 text-white px-4 py-2 rounded">Retry</button>
        </div>
    );
    
    // Hooks fixed. Logic follows.

    const handleDelete = async (id) => {
        if (!window.confirm('CRITICAL WARNING: This will delete the school and ALL associated users, students, and data. This action cannot be undone. Are you sure?')) return;
        try {
            await api.delete(`/superadmin/schools/${id}`);
            alert('School deleted successfully');
            fetchData();
        } catch (error) {
            alert('Delete failed');
        }
    };

    const handleUpdatePlan = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/superadmin/schools/${editingSchool._id}/subscription`, {
                plan: editingSchool.subscription.plan,
                status: editingSchool.subscription.status,
                expiryDate: editingSchool.subscription.expiryDate
            });
            alert('Subscription updated');
            setEditingSchool(null);
            fetchData();
        } catch (error) {
            alert('Update failed');
        }
    };

    // ... StatCard defined outside ...

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Edit Modal */}
            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Create New School</h3>
                        <form onSubmit={handleCreateSchool} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">School Name</label>
                                <input required className="w-full border rounded p-2" value={newSchoolData.schoolName} onChange={e => setNewSchoolData({...newSchoolData, schoolName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">School Email</label>
                                <input required type="email" className="w-full border rounded p-2" value={newSchoolData.schoolEmail} onChange={e => setNewSchoolData({...newSchoolData, schoolEmail: e.target.value})} />
                            </div>
                            <hr className="my-4"/>
                            <div>
                                <label className="block text-sm font-medium mb-1">Admin Name</label>
                                <input required className="w-full border rounded p-2" value={newSchoolData.adminName} onChange={e => setNewSchoolData({...newSchoolData, adminName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Admin Email</label>
                                <input required type="email" className="w-full border rounded p-2" value={newSchoolData.adminEmail} onChange={e => setNewSchoolData({...newSchoolData, adminEmail: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <input required type="password" className="w-full border rounded p-2" value={newSchoolData.password} onChange={e => setNewSchoolData({...newSchoolData, password: e.target.value})} />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Create School</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal (Existing) */}
            {editingSchool && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Edit Subscription</h3>
                        <form onSubmit={handleUpdatePlan} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Plan</label>
                                <select 
                                    className="w-full border rounded p-2"
                                    value={editingSchool.subscription.plan}
                                    onChange={e => setEditingSchool({...editingSchool, subscription: {...editingSchool.subscription, plan: e.target.value}})}
                                >
                                    <option value="Free">Free</option>
                                    <option value="Basic">Basic</option>
                                    <option value="Standard">Standard</option>
                                    <option value="Premium">Premium</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select 
                                    className="w-full border rounded p-2"
                                    value={editingSchool.subscription.status}
                                    onChange={e => setEditingSchool({...editingSchool, subscription: {...editingSchool.subscription, status: e.target.value}})}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setEditingSchool(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Platform Administration</h1>
                </div>
                <p className="text-gray-500">Super Admin Control Center</p>
            </header>
            
            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 px-4 font-medium transition-colors border-b-2 ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('schools')}
                    className={`pb-4 px-4 font-medium transition-colors border-b-2 ${activeTab === 'schools' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Schools Management
                </button>
                {activeTab === 'schools' && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-indigo-700 transition"
                    >
                        <Plus size={16} /> Create School
                    </button>
                )}
                <button 
                    onClick={() => setActiveTab('payments')}
                    className={`pb-4 px-4 font-medium transition-colors border-b-2 ${activeTab === 'payments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Financials
                </button>
            </div>

            {/* Overview Content */}
            {activeTab === 'overview' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        label="Total Revenue" 
                        value={`₦${(stats.totalRevenue / 100).toLocaleString()}`} // Assuming amounts in Kobo if Paystack default, or Naira? Let's assume Kobo based on typical Stripe/Paystack pattern, OR simply Naira if stored that way. Checking stored... "amount: 2000000" in PLANS was 20k. So it's Kobo (x100).
                        icon={DollarSign} 
                        color="bg-green-500" 
                    />
                    <StatCard label="Total Schools" value={stats.totalSchools} icon={Building} color="bg-blue-500" />
                    <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-indigo-500" />
                    <StatCard label="Pending Verifications" value={stats.pendingSchools} icon={ShieldCheck} color="bg-orange-500" />
                </div>
            )}

            {/* Schools Content */}
            {activeTab === 'schools' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">School Name</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Plan & Status</th>
                                    <th className="px-6 py-4">Verification</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {schools.map(school => (
                                    <tr key={school._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                                                    {school.logoUrl ? <img src={school.logoUrl} className="w-full h-full object-cover rounded" /> : <Building size={16} />}
                                                </div>
                                                {school.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{school.contactEmail}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{school.subscription?.plan}</div>
                                            <div className="text-xs text-gray-400 capitalize">{school.subscription?.status}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {school.isVerified ? (
                                                <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded w-fit text-xs font-bold">
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit text-xs font-bold">
                                                    <XCircle size={12} /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            {!school.isVerified && (
                                                <button 
                                                    onClick={() => handleVerify(school._id)}
                                                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                                                >
                                                    Verify
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setEditingSchool(school)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit Subscription"
                                            >
                                                <Activity size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(school._id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                title="Delete School"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payments Content */}
            {activeTab === 'payments' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">School</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments.map(payment => (
                                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{payment.reference}</td>
                                        <td className="px-6 py-4 font-medium">{payment.schoolId?.name || 'Unknown School'}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            ₦{(payment.amount / 100).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                                                payment.status === 'success' ? 'bg-green-100 text-green-700' :
                                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
