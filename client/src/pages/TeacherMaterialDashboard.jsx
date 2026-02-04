import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { FaCloudUploadAlt, FaFilePdf, FaChalkboardTeacher, FaHistory, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const TeacherMaterialDashboard = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        title: '',
        type: 'Assignment',
        subject: '',
        classLevel: '',
        arm: '',
        term: 'First Term',
        session: '2023/2024',
        description: '',
        fileUrl: '',
        status: 'Draft' // Default
    });

    const materialTypes = ['Assignment', 'Note', 'Worksheet', 'Test Prep'];
    const terms = ['First Term', 'Second Term', 'Third Term'];

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await api.get('/learning-materials/my-materials');
            setMaterials(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching materials:', error);
            toast.error('Failed to load materials');
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are allowed');
            return;
        }

        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploading(true);
        try {
            const response = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, fileUrl: response.data.url }));
            toast.success('File uploaded successfully');
            setUploading(false);
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('File upload failed');
            setUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fileUrl.endsWith('.pdf')) {
            toast.error('Only PDF files are allowed');
            return;
        }

        try {
            await api.post('/learning-materials', formData);
            toast.success(formData.status === 'Draft' ? 'Saved to drafts' : 'Submitted for approval');
            setShowForm(false);
            setFormData({
                title: '',
                type: 'Assignment',
                subject: '',
                classLevel: '',
                arm: '',
                term: 'First Term',
                session: '2023/2024',
                description: '',
                fileUrl: '',
                status: 'Draft'
            });
            fetchMaterials();
        } catch (error) {
            console.error('Error submitting material:', error);
            toast.error('Failed to submit material');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-semibold"><FaCheckCircle /> Approved</span>;
            case 'Rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-semibold"><FaTimesCircle /> Rejected</span>;
            case 'Pending Approval': return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-semibold"><FaClock /> Pending</span>;
            default: return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs font-semibold">Draft</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Learning Materials</h1>
                        <p className="text-gray-600 mt-1">Upload and manage study resources for your students</p>
                    </div>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                    >
                        <FaCloudUploadAlt className="text-lg" /> {showForm ? 'Cancel Upload' : 'Upload Material'}
                    </button>
                </div>

                {showForm && (
                     <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FaFilePdf className="text-red-500" /> New Material Details
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Basics */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input name="title" value={formData.title} onChange={handleInputChange} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Week 1 Geometry Notes" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg">
                                    {materialTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input name="subject" value={formData.subject} onChange={handleInputChange} required className="w-full p-2.5 border rounded-lg" placeholder="e.g., Mathematics" />
                            </div>

                            {/* Class Info */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                                <input name="classLevel" value={formData.classLevel} onChange={handleInputChange} required className="w-full p-2.5 border rounded-lg" placeholder="e.g., JSS1" />
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Arm (Optional)</label>
                                <input name="arm" value={formData.arm} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g., A" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                                <select name="term" value={formData.term} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg">
                                    {terms.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                             <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Material File (PDF)</label>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Link Input */}
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Paste Link</label>
                                        <input 
                                            name="fileUrl" 
                                            type="url" 
                                            value={formData.fileUrl} 
                                            onChange={handleInputChange} 
                                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
                                            placeholder="https://example.com/file.pdf" 
                                        />
                                    </div>
                                    
                                    {/* File Upload */}
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Or Upload File</label>
                                        <div className="flex items-center gap-2">
                                            <label className={`w-full flex justify-center items-center px-4 py-2 bg-white text-gray-700 rounded-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <FaCloudUploadAlt className="mr-2" />
                                                <span className="text-sm leading-normal">{uploading ? 'Uploading...' : 'Select File'}</span>
                                                <input type='file' className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Provide a direct link OR upload a PDF file.</p>
                            </div>

                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description / Instructions</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-2.5 border rounded-lg" placeholder="Read pages 1-5 before attempting..." />
                            </div>

                            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-4 border-t">
                                <button 
                                    type="button" 
                                    onClick={() => setFormData(prev => ({ ...prev, status: 'Draft' }))}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Save as Draft
                                </button>
                                <button 
                                    type="submit" 
                                    onClick={() => setFormData(prev => ({ ...prev, status: 'Pending Approval' }))}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                >
                                    Submit for Approval
                                </button>
                            </div>
                        </form>
                     </div>
                )}

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><FaHistory /> My Uploads</h3>
                    </div>
                    
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading...</div>
                    ) : materials.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No materials uploaded yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Class</th>
                                        <th className="px-6 py-4">Subject</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Downloads</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Feedback</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {materials.map((m) => (
                                        <tr key={m._id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {m.title}
                                                <a 
                                                    href={m.fileUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="block text-xs text-indigo-500 hover:underline mt-0.5"
                                                >
                                                    View PDF
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">{m.classLevel} {m.arm && `(${m.arm})`}</td>
                                            <td className="px-6 py-4">{m.subject}</td>
                                            <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{m.type}</span></td>
                                            <td className="px-6 py-4 font-mono">{m.downloadCount}</td>
                                            <td className="px-6 py-4">{getStatusBadge(m.status)}</td>
                                            <td className="px-6 py-4 text-xs text-red-600 italic max-w-xs truncate">{m.status === 'Rejected' ? m.adminFeedback : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherMaterialDashboard;
