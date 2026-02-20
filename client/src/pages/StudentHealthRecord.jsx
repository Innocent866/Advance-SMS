import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { FaUserInjured, FaHistory, FaPlus, FaFileMedical } from 'react-icons/fa';

const StudentHealthRecord = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        recordType: 'Consultation',
        symptoms: '',
        diagnosis: '',
        prescription: '',
        comments: '',
        temperature: '',
        bloodPressure: '',
        weight: '',
        status: 'Under Observation'
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Parallel fetch
            const [studentRes, recordsRes] = await Promise.all([
                api.get(`/students/${id}`),
                api.get(`/medical/student/${id}`)
            ]);
            setStudent(studentRes.data);
            setRecords(recordsRes.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load health records');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medical', {
                studentId: id,
                ...formData
            });
            toast.success('Record added successfully');
            setShowForm(false);
            fetchData(); // Refresh
            // Reset form
            setFormData({
                recordType: 'Consultation',
                symptoms: '',
                diagnosis: '',
                prescription: '',
                comments: '',
                temperature: '',
                bloodPressure: '',
                weight: '',
                status: 'Under Observation'
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to save record');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Medical Records...</div>;
    if (!student) return <div className="p-8 text-center text-red-500">Student not found</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <button 
                onClick={() => navigate(-1)}
                className="mb-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
            >
                &larr; Back to Dashboard
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
                        <FaUserInjured size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{student.firstName} {student.lastName}</h1>
                        <p className="text-gray-500">ID: {student.studentId} | Class: {student.classLevelName || 'N/A'}</p>
                    </div>
                    <div className="ml-auto">
                        <button 
                            onClick={() => setShowForm(!showForm)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <FaPlus /> New Record
                        </button>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaFileMedical /> New Medical Entry
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                            <select name="recordType" value={formData.recordType} onChange={handleInputChange} className="w-full p-2 border rounded-lg">
                                <option>Consultation</option>
                                <option>Observation</option>
                                <option>Emergency</option>
                                <option>Routine Checkup</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 border rounded-lg">
                                <option>Under Observation</option>
                                <option>Admitted</option>
                                <option>Referred</option>
                                <option>Discharged</option>
                                <option>Healthy</option>
                            </select>
                        </div>
                        
                        {/* Vitals */}
                        <div className="col-span-2 grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temp (°C)</label>
                                <input type="text" name="temperature" value={formData.temperature} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="36.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">BP (mmHg)</label>
                                <input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="120/80" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="45" />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                            <textarea name="symptoms" value={formData.symptoms} onChange={handleInputChange} className="w-full p-2 border rounded-lg" rows="2" required placeholder="Describe symptoms..."></textarea>
                        </div>
                        
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis / Doctor's Notes</label>
                            <textarea name="diagnosis" value={formData.diagnosis} onChange={handleInputChange} className="w-full p-2 border rounded-lg" rows="2" placeholder="Diagnosis..."></textarea>
                        </div>

                        <div className="col-span-2 flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Record</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <FaHistory className="text-gray-500" />
                    <h3 className="font-semibold text-gray-700">Medical History</h3>
                </div>
                {records.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No medical records found for this student.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {records.map(record => (
                            <div key={record._id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mr-2 ${
                                            record.recordType === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {record.recordType}
                                        </span>
                                        <span className="text-sm text-gray-500">{new Date(record.createdAt).toLocaleString()}</span>
                                    </div>
                                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        Recorded by: {record.recordedBy?.name || 'Unknown'} ({record.recordedBy?.role})
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="text-gray-800">
                                        <span className="font-semibold">Symptoms:</span> {record.symptoms}
                                    </div>
                                    {record.diagnosis && (
                                        <div className="text-indigo-800">
                                            <span className="font-semibold">Diagnosis:</span> {record.diagnosis}
                                        </div>
                                    )}
                                </div>
                                {(record.temperature || record.bloodPressure) && (
                                    <div className="mt-2 text-xs text-gray-500 flex gap-4">
                                        {record.temperature && <span>Temp: {record.temperature}°C</span>}
                                        {record.bloodPressure && <span>BP: {record.bloodPressure}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentHealthRecord;
