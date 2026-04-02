import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Save, CheckCircle, Clock, Coffee, Sun, Moon, Building, Users, RefreshCcw, Loader2 } from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MealTracking = () => {
    usePageTitle('Meal Tracking');
    const { user } = useAuth();
    const [hostels, setHostels] = useState([]);
    const [selectedHostel, setSelectedHostel] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mealType, setMealType] = useState('Breakfast');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState({}); // { studentId: consumed (bool) }
    const [posting, setPosting] = useState(false);
    const [recordedStudentIds, setRecordedStudentIds] = useState([]);

    const isAdmin = ['school_admin', 'assistant_admin', 'super_admin'].includes(user?.role);

    useEffect(() => {
        fetchHostels();
    }, []);

    const fetchRecords = async (currentStudents) => {
        if (!selectedHostel) return;
        try {
            const res = await api.get('/boarding/meals', {
                params: {
                    hostelId: selectedHostel,
                    date,
                    mealType
                }
            });
            
            const existingRecords = {};
            const activeStudents = currentStudents || students;
            
            // Initialize with false for all available students
            activeStudents.forEach(s => existingRecords[s._id] = false);
            
            // Overwrite with DB records
            if (res.data.success && res.data.data.length > 0) {
                res.data.data.forEach(r => {
                    existingRecords[r.studentId] = r.attended;
                });
                setRecords(existingRecords);
                setRecordedStudentIds(res.data.data.map(r => r.studentId));
            } else {
                setRecords(existingRecords);
                setRecordedStudentIds([]);
            }
        } catch (error) {
            console.error('Failed to fetch records', error);
        }
    };

    const fetchHostels = async () => {
        try {
            const res = await api.get('/hostels');
            setHostels(res.data.data);
            if (res.data.data.length > 0) {
                setSelectedHostel(res.data.data[0]._id);
                fetchStudents(res.data.data[0]._id);
            }
        } catch (error) {
            toast.error('Failed to load hostels');
        }
    };

    const fetchStudents = async (hostelId) => {
        try {
            setLoading(true);
            const res = await api.get(`/hostels/${hostelId}/students`);
            const loadedStudents = res.data.data;
            setStudents(loadedStudents);
            
            const initialRecords = {};
            loadedStudents.forEach(s => {
                initialRecords[s._id] = true;
            });
            setRecords(initialRecords);

            // Fetch existing records immediately after students are loaded
            await fetchRecords(loadedStudents);
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleHostelChange = (e) => {
        const id = e.target.value;
        setSelectedHostel(id);
        fetchStudents(id);
    };

    const toggleStatus = (studentId) => {
        if (isAdmin) return;
        setRecords(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    };

    useEffect(() => {
        if (selectedHostel && date && mealType) {
            fetchRecords();
        }
    }, [selectedHostel, date, mealType]);

    const handleSubmit = async () => {
        const formattedRecords = Object.entries(records).map(([studentId, consumed]) => ({
            studentId,
            consumed
        }));

        try {
            setPosting(true);
            await api.post('/boarding/meals', {
                hostelId: selectedHostel,
                date,
                mealType,
                records: formattedRecords
            });
            toast.success('Meal attendance saved successfully!');
            fetchRecords(); // Refresh to get the markedBy info if needed
        } catch (error) {
            toast.error('Failed to save meal tracking');
        } finally {
            setPosting(false);
        }
    };

    const displayedStudents = isAdmin 
        ? students.filter(s => recordedStudentIds.includes(s._id))
        : students;

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Meal Attendance</h1>
                    <p className="text-gray-500">Track and record student meal participation.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => fetchRecords()}
                        className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                        title="Refresh records"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {!isAdmin && (
                        <button 
                            onClick={handleSubmit}
                            disabled={loading || posting || students.length === 0}
                            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 transition-all font-bold shadow-lg shadow-green-100 disabled:opacity-50"
                        >
                            {posting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            <span>{posting ? 'Posting...' : 'Post Attendance'}</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Hostel</label>
                    <div className="relative">
                        <select 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-100 outline-none appearance-none"
                            value={selectedHostel}
                            onChange={handleHostelChange}
                        >
                            {(hostels || []).map(h => (
                                <option key={h._id} value={h._id}>{h.name}</option>
                            ))}
                        </select>
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Meal Session</label>
                    <div className="flex bg-gray-50 p-1 rounded-xl">
                        {[
                            { id: 'Breakfast', icon: Coffee },
                            { id: 'Lunch', icon: Sun },
                            { id: 'Dinner', icon: Moon }
                        ].map(({ id, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setMealType(id)}
                                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${mealType === id ? 'bg-white text-green-600 shadow-sm font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Icon size={18} />
                                <span className="text-sm">{id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Date</label>
                    <input 
                        type="date" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-100 outline-none"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <Users size={20} />
                        <span className="font-bold">{students.length} Students Total</span>
                    </div>
                    <div className="text-sm text-gray-500 italic">Toggle the meal icon to mark as absent/present</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-gray-400">Loading students...</div>
                    ) : !displayedStudents || displayedStudents.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-400">
                            {isAdmin ? 'No house parent posts found for this session.' : 'No students found.'}
                        </div>
                    ) : (
                        displayedStudents.map((student) => (
                            <motion.button
                                key={student._id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleStatus(student._id)}
                                className={`flex items-center p-4 rounded-xl border transition-all text-left ${
                                    records[student._id] 
                                        ? 'bg-green-50 border-green-200 shadow-sm' 
                                        : 'bg-white border-gray-100 grayscale opacity-60'
                                }`}
                            >
                                <div className={`p-3 rounded-full mr-4 ${records[student._id] ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Utensils size={20} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className={`font-bold truncate ${records[student._id] ? 'text-green-900' : 'text-gray-500'}`}>{student.firstName} {student.lastName}</p>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Room {student.roomId?.roomNumber || 'N/A'}</p>
                                </div>
                                {records[student._id] && (
                                    <CheckCircle size={18} className="text-green-500 ml-2 animate-bounce" />
                                )}
                            </motion.button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MealTracking;
