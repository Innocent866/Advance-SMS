import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Bed, Building, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const RoomAllocation = () => {
    usePageTitle('Room Allocation');
    const [students, setStudents] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedHostel, setSelectedHostel] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [bedNumber, setBedNumber] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [studentRes, hostelRes] = await Promise.all([
                api.get('/students'),
                api.get('/hostels')
            ]);
            // Only show students enrolled as boarders
            const boarders = studentRes.data.filter(s => s.enrollmentStatus === 'Border');
            setStudents(boarders);
            setHostels(hostelRes.data.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleHostelChange = async (e) => {
        const hostelId = e.target.value;
        setSelectedHostel(hostelId);
        setSelectedRoom('');
        if (hostelId) {
            try {
                const res = await api.get(`/hostels/${hostelId}/rooms`);
                setRooms(res.data.data);
            } catch (error) {
                toast.error('Failed to load rooms');
            }
        } else {
            setRooms([]);
        }
    };

    const handleAllocate = async (e) => {
        e.preventDefault();
        if (!selectedStudent || !selectedHostel || !selectedRoom || !bedNumber) {
            return toast.error('Please fill all fields');
        }

        try {
            await api.post('/boarding/allocate', {
                studentId: selectedStudent._id,
                hostelId: selectedHostel,
                roomId: selectedRoom,
                bedNumber
            });
            toast.success('Room allocated successfully');
            setSelectedStudent(null);
            setSelectedHostel('');
            setSelectedRoom('');
            setBedNumber('');
            fetchInitialData(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to allocate room');
        }
    };

    const handleDeallocate = async () => {
        if (!selectedStudent) return;
        
        if (!window.confirm(`Are you sure you want to check out ${selectedStudent.firstName} from boarding?`)) {
            return;
        }

        try {
            await api.post('/boarding/deallocate', {
                studentId: selectedStudent._id
            });
            toast.success('Student checked out successfully');
            setSelectedStudent(null);
            fetchInitialData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to de-allocate student');
        }
    };

    const filteredStudents = students.filter(s => 
        (s.firstName + ' ' + s.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
            {/* Student Selection List */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-160px)]">
                <div className="p-4 border-b border-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Select Student</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search name or ID..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No students found</div>
                    ) : (
                        filteredStudents.map(student => (
                            <button 
                                key={student._id}
                                onClick={() => setSelectedStudent(student)}
                                className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${selectedStudent?._id === student._id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                            >
                                <div className="text-left">
                                    <div className="font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                                    <div className="text-sm text-gray-500">{student.studentId} | {student.classId?.name} {student.arm}</div>
                                </div>
                                {student.isBoarder ? (
                                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs flex items-center space-x-1">
                                        <CheckCircle size={12} />
                                        <span>Boarder</span>
                                    </span>
                                ) : (
                                    <span className="text-gray-400 text-xs">Day Student</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Allocation Form */}
            <div className="lg:col-span-2 space-y-8">
                {selectedStudent ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Bed size={120} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Allocate Room for {selectedStudent.firstName}</h2>
                        
                        <form onSubmit={handleAllocate} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Hostel</label>
                                    <select 
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={selectedHostel}
                                        onChange={handleHostelChange}
                                        required
                                    >
                                        <option value="">Select a hostel</option>
                                        {hostels.map(h => (
                                            <option key={h._id} value={h._id}>{h.name} ({h.type})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Room</label>
                                    <select 
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={selectedRoom}
                                        onChange={(e) => setSelectedRoom(e.target.value)}
                                        disabled={!selectedHostel}
                                        required
                                    >
                                        <option value="">Select a room</option>
                                        {rooms.map(r => (
                                            <option key={r._id} value={r._id} disabled={r.occupancy >= r.capacity}>
                                                Room {r.roomNumber} ({r.occupancy}/{r.capacity} occupied)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Bed 1, Lower Bunk"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={bedNumber}
                                        onChange={(e) => setBedNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="pt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button 
                                        type="submit"
                                        className="w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20"
                                    >
                                        <UserPlus size={20} />
                                        <span>Confirm {selectedStudent.isBoarder ? 'Re-allocation' : 'Allocation'}</span>
                                    </button>
                                    
                                    {selectedStudent.isBoarder && (
                                        <button 
                                            type="button"
                                            onClick={handleDeallocate}
                                            className="w-full bg-red-50 text-red-600 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-100 transition-all font-bold"
                                        >
                                            <AlertCircle size={20} />
                                            <span>Check Out Student</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-gray-100/50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-500 h-full flex flex-col items-center justify-center">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <AlertCircle size={40} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-medium">Select a student from the list to start room allocation</p>
                    </div>
                )}

                {/* Info Section */}
                {selectedStudent?.isBoarder && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-start space-x-4"
                    >
                        <div className="bg-blue-500 p-2 rounded-lg text-white">
                            <Building size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900">Current Assignment</h4>
                            <p className="text-blue-700 mt-1">
                                {selectedStudent.firstName} is currently assigned to <strong>Room {selectedStudent.roomId?.roomNumber || 'N/A'}</strong> in <strong>{selectedStudent.hostelId?.name || 'N/A'}</strong>. 
                                Re-allocating will update their record.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default RoomAllocation;
