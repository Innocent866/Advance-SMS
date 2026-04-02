import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Search, MoreVertical, Edit2, Trash2, Users, Bed, MapPin } from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value !== undefined ? value : '-'}</h3>
        </div>
    </div>
);

const HostelManagement = () => {
    usePageTitle('Hostel Management');
    const navigate = useNavigate();
    const [hostels, setHostels] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHostel, setEditingHostel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Mixed',
        capacity: '',
        houseParentId: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        fetchHostels();
        fetchStaff();
    }, []);

    const fetchHostels = async () => {
        try {
            setLoading(true);
            const res = await api.get('/hostels');
            setHostels(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (error) {
            toast.error('Failed to fetch hostels');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await api.get('/boarding/house-parents');
            const staffList = Array.isArray(res.data.data) ? res.data.data : [];
            setStaff(staffList);
        } catch (error) {
            console.error('Failed to fetch house parents');
        }
    };

    const handleOpenModal = (hostel = null) => {
        if (hostel) {
            setEditingHostel(hostel);
            setFormData({
                name: hostel.name,
                type: hostel.type,
                capacity: hostel.capacity,
                houseParentId: hostel.houseParentId?._id || '',
                location: hostel.location || '',
                description: hostel.description || ''
            });
        } else {
            setEditingHostel(null);
            setFormData({
                name: '',
                type: 'Mixed',
                capacity: '',
                houseParentId: '',
                location: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingHostel) {
                await api.put(`/hostels/${editingHostel._id}`, formData);
                toast.success('Hostel updated successfully');
            } else {
                await api.post('/hostels', formData);
                toast.success('Hostel created successfully');
            }
            setIsModalOpen(false);
            fetchHostels();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this hostel and all its rooms?')) return;
        try {
            await api.delete(`/hostels/${id}`);
            toast.success('Hostel deleted');
            fetchHostels();
        } catch (error) {
            toast.error('Failed to delete hostel');
        }
    };

    const filteredHostels = (hostels || []).filter(h => 
        h?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Hostel Management</h1>
                    <p className="text-gray-500">Create and manage school hostel facilities.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all font-medium"
                >
                    <Plus size={20} />
                    <span>Add Hostel</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Hostels" value={hostels?.length || 0} icon={Building} color="bg-blue-500" />
                <StatCard label="Total Capacity" value={(hostels || []).reduce((acc, h) => acc + (h.capacity || 0), 0)} icon={Bed} color="bg-green-500" />
                <StatCard label="Occupied Beds" value={0} icon={Users} color="bg-purple-500" /> {/* Placeholder */}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search hostels..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading hostels...</div>
                ) : filteredHostels.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No hostels found. Click 'Add Hostel' to get started.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Hostel Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Capacity</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">House Parent</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredHostels.map((hostel) => (
                                    <tr key={hostel._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{hostel.name}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{hostel.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                                ${hostel.type === 'Boys' ? 'bg-blue-100 text-blue-700' : 
                                                  hostel.type === 'Girls' ? 'bg-pink-100 text-pink-700' : 
                                                  'bg-purple-100 text-purple-700'}`}
                                            >
                                                {hostel.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700">{hostel.capacity}</td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {hostel.houseParentId?.name || (hostel.wardenId ? `${hostel.wardenId.firstName} ${hostel.wardenId.lastName}` : 'Not Assigned')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            <div className="flex items-center space-x-1">
                                                <MapPin size={14} />
                                                <span>{hostel.location || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <button 
                                                    onClick={() => handleOpenModal(hostel)}
                                                    className="p-1 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(hostel._id)}
                                                    className="p-1 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/hostel-management/${hostel._id}/rooms`)}
                                                    className="p-1 hover:bg-gray-100 text-gray-600 rounded-md transition-colors"
                                                >
                                                    <Bed size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 z-50 overflow-y-auto max-h-[90vh]"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingHostel ? 'Edit Hostel' : 'Add New Hostel'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select 
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.type}
                                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        >
                                            <option value="Boys">Boys</option>
                                            <option value="Girls">Girls</option>
                                            <option value="Mixed">Mixed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                        <input 
                                            type="number" 
                                            required
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">House Parent</label>
                                    <select 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.houseParentId}
                                        onChange={(e) => setFormData({...formData, houseParentId: e.target.value})}
                                    >
                                        <option value="">Select House Parent</option>
                                        {staff
                                            .map(s => (
                                                <option key={s._id} value={s._id}>
                                                    {s.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
                                    >
                                        {editingHostel ? 'Save Changes' : 'Create Hostel'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HostelManagement;
