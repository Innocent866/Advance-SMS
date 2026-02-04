import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { FaDownload, FaSearch, FaBook, FaFilePdf } from 'react-icons/fa';

const StudentMaterialList = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('All');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            // Students only fetch Approved materials automatically via backend logic or we enforce it here
            const response = await api.get('/learning-materials?status=Approved');
            setMaterials(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching materials:', error);
            setLoading(false);
        }
    };

    const handleView = async (materialId, url) => {
        try {
            await api.post(`/learning-materials/${materialId}/download`); // Track usage
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error tracking view:', error);
            window.open(url, '_blank');
        }
    };

    const subjects = ['All', ...new Set(materials.map(m => m.subject))];
    
    const filteredMaterials = materials.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              m.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = filterSubject === 'All' || m.subject === filterSubject;
        return matchesSearch && matchesSubject;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2">Study Library</h1>
                        <p className="text-indigo-100 mb-6 max-w-xl">Access class notes, assignments, and worksheets approved by your teachers. Download and print anytime.</p>
                        
                        <div className="flex flex-col md:flex-row gap-4 max-w-2xl bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
                            <div className="flex-1 relative">
                                <FaSearch className="absolute left-3 top-3.5 text-indigo-200" />
                                <input 
                                    type="text" 
                                    placeholder="Search by title or topic..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/10 border-none rounded-lg pl-10 py-3 text-white placeholder-indigo-200 focus:ring-2 focus:ring-white/50"
                                />
                            </div>
                            <select 
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="bg-white/10 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-white/50 cursor-pointer [&>option]:text-gray-800"
                            >
                                {subjects.map(s => <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>)}
                            </select>
                        </div>
                    </div>
                     <FaBook className="absolute -right-6 -bottom-6 text-9xl text-white/10 rotate-12" />
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading library...</div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                        <FaBook className="mx-auto text-4xl text-gray-300 mb-4" />
                        <p>No materials found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMaterials.map(m => (
                            <div key={m._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden group">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                                            <FaFilePdf className="text-xl" />
                                        </div>
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">{m.type}</span>
                                    </div>
                                    
                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{m.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{m.description || 'No description provided.'}</p>
                                    
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 pb-4 border-b border-gray-50">
                                        <span>{m.subject}</span>
                                        <span>•</span>
                                        <span>{m.term}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">By {m.teacherId?.name}</span>
                                        <button 
                                            onClick={() => handleView(m._id, m.fileUrl)}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition"
                                        >
                                            <FaDownload /> View Material
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentMaterialList;
