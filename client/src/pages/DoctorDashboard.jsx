import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FaStethoscope, FaUserMd, FaCalendarCheck, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [waitingList, setWaitingList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock data for now, waiting for real endpoints to populate "Waiting List"
    useEffect(() => {
        // Fetch students waiting for consultation
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
                <p className="text-gray-600">Welcome, Dr. {user.name}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                     <div className="p-3 bg-purple-100 rounded-full text-purple-600 mr-4">
                        <FaStethoscope size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Consultations</p>
                        <h3 className="text-2xl font-bold text-gray-800">0</h3>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                     <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                        <FaCalendarCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Appointments</p>
                        <h3 className="text-2xl font-bold text-gray-800">0</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Patient Queue</h3>
                <p className="text-gray-500 text-sm">No patients currently waiting.</p>
                {/* Queue list would go here */}
            </div>
        </div>
    );
};

export default DoctorDashboard;
