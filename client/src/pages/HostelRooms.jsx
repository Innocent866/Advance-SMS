import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Trash2, Bed, CheckCircle, AlertCircle, Search } from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const HostelRooms = () => {
    const { id: hostelId } = useParams();
    const navigate = useNavigate();
    const [hostel, setHostel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        roomNumber: '',
        capacity: ''
    });

    usePageTitle(hostel ? `${hostel.name} - Rooms` : 'Hostel Rooms');

    useEffect(() => {
        fetchData();
    }, [hostelId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [hostelRes, roomsRes] = await Promise.all([
                api.get('/hostels'), // We need to find the specific one since there's no getById?
                api.get(`/hostels/${hostelId}/rooms`)
            ]);
            
            const currentHostel = hostelRes.data.data.find(h => h._id === hostelId);
            setHostel(currentHostel);
            setRooms(roomsRes.data.data);
        } catch (error) {
            toast.error('Failed to load room data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (room = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                roomNumber: room.roomNumber,
                capacity: room.capacity
            });
        } else {
            setEditingRoom(null);
            setFormData({
                roomNumber: '',
                capacity: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await api.put(`/hostels/rooms/${editingRoom._id}`, formData);
                toast.success('Room updated successfully');
            } else {
                await api.post('/hostels/rooms', { ...formData, hostelId });
                toast.success('Room added successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this room?')) return;
        try {
            await api.delete(`/hostels/rooms/${id}`);
            toast.success('Room deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete room');
        }
    };

    if (loading && !hostel) {
        return <div className="p-12 text-center text-gray-500">Loading room data...</div>;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => navigate('/hostel-management')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{hostel?.name} - Rooms</h1>
                        <p className="text-gray-500">Manage rooms and bed capacity for this hostel.</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all font-medium"
                >
                    <Plus size={20} />
                    <span>Add Room</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rooms.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-100 text-gray-400">
                        No rooms configured for this hostel.
                    </div>
                ) : (
                    rooms.map(room => (
                        <div key={room._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-primary/20 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/5 text-primary rounded-lg">
                                    <Bed size={24} />
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button 
                                        onClick={() => handleOpenModal(room)}
                                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(room._id)}
                                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-800">Room {room.roomNumber}</h3>
                            
                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Capacity</span>
                                    <span className="font-bold text-gray-800">{room.capacity} Beds</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Occupancy</span>
                                    <span className={`font-bold ${room.occupancy >= room.capacity ? 'text-red-500' : 'text-green-600'}`}>
                                        {room.occupancy} / {room.capacity}
                                    </span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all ${room.occupancy >= room.capacity ? 'bg-red-500' : 'bg-primary'}`}
                                        style={{ width: `${Math.min((room.occupancy / room.capacity) * 100, 100)}%` }}
                                    />
                                </div>
                                
                                <div className="pt-2 flex items-center justify-between">
                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                                        room.status === 'available' ? 'bg-green-100 text-green-700' : 
                                        room.status === 'full' ? 'bg-red-100 text-red-700' : 
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {room.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
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
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 z-50"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. 101, B-04"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.roomNumber}
                                        onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Beds)</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
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
                                        {editingRoom ? 'Update' : 'Add Room'}
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

export default HostelRooms;
