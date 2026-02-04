import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { FaCheck, FaTimes, FaFilePdf, FaEye, FaFilter } from 'react-icons/fa';

const AdminMaterialReview = () => {
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Pending Approval');

    // Review Modal State
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetchMaterials();
    }, []);

    useEffect(() => {
        if (filterStatus === 'All') {
            setFilteredMaterials(materials);
        } else {
            setFilteredMaterials(materials.filter(m => m.status === filterStatus));
        }
    }, [materials, filterStatus]);

    const fetchMaterials = async () => {
        try {
            const response = await api.get('/learning-materials?status='); // Get all, we will filter locally or via query params properly
            setMaterials(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching materials:', error);
            toast.error('Failed to load materials');
            setLoading(false);
        }
    };

    const handleAction = async (status) => {
        if (!selectedMaterial) return;
        try {
            await api.put(`/learning-materials/${selectedMaterial._id}/status`, { 
                status, 
                adminFeedback: feedback 
            });
            toast.success(`Material ${status}`);
            setSelectedMaterial(null);
            setFeedback('');
            fetchMaterials();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Review Learning Materials</h1>
                    
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm">
                        <FaFilter className="text-gray-400 ml-2" />
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border-none bg-transparent focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Draft">Drafts</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading...</div>
                    ) : filteredMaterials.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No materials found with status "{filterStatus}".</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {filteredMaterials.map(m => (
                                <div key={m._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition bg-white flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                                m.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                                m.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>{m.status}</span>
                                            <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{m.title}</h3>
                                        <p className="text-sm text-gray-500 mb-3">{m.subject} • {m.classLevel}</p>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{m.type}</span>
                                            <span className="text-xs text-gray-500">by {m.teacherId?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setSelectedMaterial(m)}
                                        className="w-full mt-2 bg-indigo-50 text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition flex items-center justify-center gap-2"
                                    >
                                        <FaEye /> Review Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Review Modal */}
                {selectedMaterial && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="font-bold text-gray-800">{selectedMaterial.title}</h2>
                                <button onClick={() => setSelectedMaterial(null)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                            </div>

                            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                                {/* PDF Preview Area */}
                                <div className="flex-1 bg-gray-100 border-r overflow-hidden relative group">
                                    <iframe 
                                        src={selectedMaterial.fileUrl}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        title="PDF Preview"
                                    ></iframe>
                                    
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a 
                                            href={selectedMaterial.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            download
                                            className="px-4 py-2 bg-gray-900/80 text-white rounded-lg hover:bg-black text-xs font-medium backdrop-blur-sm"
                                        >
                                            Download Original
                                        </a>
                                    </div>
                                </div>

                                {/* Review Actions */}
                                <div className="w-full md:w-80 p-6 bg-white overflow-y-auto">
                                    <h3 className="font-bold text-gray-900 mb-4">Review Action</h3>
                                    
                                    <div className="spac-y-4 mb-6">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-semibold">Description</label>
                                            <p className="text-sm text-gray-700 mt-1">{selectedMaterial.description || 'No description provided.'}</p>
                                        </div>
                                        <hr className="my-4 border-gray-100" />
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-semibold">Metadata</label>
                                            <div className="text-sm text-gray-600 mt-2 space-y-2">
                                                <div className="flex justify-between"><span>Class:</span> <span className="font-medium">{selectedMaterial.classLevel}</span></div>
                                                <div className="flex justify-between"><span>Subject:</span> <span className="font-medium">{selectedMaterial.subject}</span></div>
                                                <div className="flex justify-between"><span>Teacher:</span> <span className="font-medium">{selectedMaterial.teacherId?.name}</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Review Comments (for Teacher)</label>
                                        <textarea 
                                            value={feedback} 
                                            onChange={(e) => setFeedback(e.target.value)}
                                            className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" 
                                            rows="4"
                                            placeholder="Reason for rejection or approval notes..."
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => handleAction('Rejected')}
                                            className="py-2.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm flex items-center justify-center gap-2"
                                        >
                                            <FaTimes /> Reject
                                        </button>
                                        <button 
                                            onClick={() => handleAction('Approved')}
                                            className="py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center justify-center gap-2"
                                        >
                                            <FaCheck /> Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMaterialReview;
