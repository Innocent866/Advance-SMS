import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FaUserMd, FaNotesMedical, FaUserInjured, FaSearch, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const NurseDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        todayVisits: 0,
        underObservation: 0,
        emergencies: 0
    });
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch stats and recent students (mock or real endpoint)
        // For now, let's fetch students to allow lookup
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students'); // Nurse needs permissions on this route
            setStudents(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.includes(searchQuery)
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Nurse Dashboard</h1>
                <p className="text-gray-600">Welcome, {user.name}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                        <FaNotesMedical size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Today's Visits</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.todayVisits}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-full text-yellow-600 mr-4">
                        <FaUserInjured size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Under Observation</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.underObservation}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-red-100 rounded-full text-red-600 mr-4">
                        <FaUserMd size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Emergencies</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.emergencies}</h3>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 mb-8">
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
                    <FaPlus /> New Clinical Record
                </button>
            </div>

            {/* Student Search for Records */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Student Lookup</h3>
                <div className="relative mb-6">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name or admission number..." 
                        className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">ID</th>
                                <th className="p-3">Class</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
                            ) : filteredStudents.slice(0, 5).map(student => (
                                <tr key={student._id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium">{student.firstName} {student.lastName}</td>
                                    <td className="p-3 text-gray-500">{student.studentId}</td>
                                    <td className="p-3 text-gray-500">{student.classLevelName || 'N/A'}</td>
                                    <td className="p-3">
                                        <Link to={`/medical/student/${student._id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                            View Health Record
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NurseDashboard;
