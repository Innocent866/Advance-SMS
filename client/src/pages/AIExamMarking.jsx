import React, { useState } from 'react';
import { FileText, CheckCircle, Brain, RefreshCw, Save, AlertCircle, Upload, Download } from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import jsPDF from 'jspdf';

const AIExamMarking = () => {
    usePageTitle('AI Exam Marking');

    const [formData, setFormData] = useState({
        subject: '',
        examType: 'WAEC',
        question: '',
        markingScheme: '',
        studentAnswer: ''
    });
    const [scriptFile, setScriptFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [finalizedScore, setFinalizedScore] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setScriptFile(e.target.files[0]);
        }
    };

    const handleGrade = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);
        setFinalizedScore(null);

        const data = new FormData();
        data.append('subject', formData.subject);
        data.append('examType', formData.examType);
        data.append('question', formData.question);
        data.append('markingScheme', formData.markingScheme);
        if (formData.studentAnswer) data.append('studentAnswer', formData.studentAnswer);
        if (scriptFile) data.append('script', scriptFile);

        try {
            const res = await api.post('/marking/grade', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
            setFinalizedScore(res.data.totalSuggestedScore);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to grade exam');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        alert(`Score Finalized: ${finalizedScore}/${result?.maxPossibleScore}`);
    };

    const handleDownloadPDF = () => {
        if (!result) return;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("AI Exam Marking Report", 10, 20);
        
        doc.setFontSize(12);
        doc.text(`Subject: ${formData.subject}`, 10, 30);
        doc.text(`Exam Type: ${formData.examType}`, 10, 38);
        doc.text(`Review Date: ${new Date().toLocaleDateString()}`, 10, 46);

        doc.setLineWidth(0.5);
        doc.line(10, 50, 200, 50);

        doc.setFontSize(14);
        doc.text(`Total Score: ${finalizedScore || result.totalSuggestedScore} / ${result.maxPossibleScore}`, 10, 60);

        doc.setFontSize(12);
        let yPos = 70;
        
        result.scoreBreakdown.forEach((item, index) => {
             if (yPos > 270) { doc.addPage(); yPos = 20; }
             
             doc.setFont(undefined, 'bold');
             const pointTitle = `${index + 1}. ${item.point}`;
             const lines = doc.splitTextToSize(pointTitle, 140);
             doc.text(lines, 10, yPos);
             
             doc.setFont(undefined, 'normal');
             doc.text(`${item.marksAwarded}/${item.maxMarks}`, 160, yPos);
             
             yPos += (lines.length * 5) + 2;
             
             const reasonLines = doc.splitTextToSize(`Reason: ${item.reason}`, 180);
             doc.text(reasonLines, 15, yPos);
             
             yPos += (reasonLines.length * 5) + 5;
        });

        doc.save(`${formData.subject}_AI_Grading_Report.pdf`);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <Brain className="text-primary" size={32} />
                    </div>
                    AI-Assisted Exam Marking
                </h1>
                <p className="text-gray-500 mt-2">
                    Upload a script or paste an answer to get WAEC/NECO standard grading.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FileText size={20} className="text-gray-500" />
                        Exam Details
                    </h2>

                    <form onSubmit={handleGrade} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. Mathematics"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                                <select
                                    name="examType"
                                    value={formData.examType}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="WAEC">WAEC</option>
                                    <option value="NECO">NECO</option>
                                    <option value="Internal">Internal Mock</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                            <textarea
                                name="question"
                                value={formData.question}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Enter the exam question here..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marking Scheme / Guide</label>
                            <textarea
                                name="markingScheme"
                                value={formData.markingScheme}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Paste the instructions or rubric for marking..."
                                required
                            />
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                             <h3 className="text-sm font-bold text-gray-700 mb-3">Student Answer (Text or File)</h3>
                             
                             <textarea
                                name="studentAnswer"
                                value={formData.studentAnswer}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-2.5 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Paste answer provided..."
                             />
                             
                             <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 font-bold uppercase">OR Upload</span>
                                <label className="flex-1 cursor-pointer">
                                    <input type="file" onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" />
                                    <div className="flex items-center justify-center gap-2 p-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 text-sm text-gray-600 transition-colors">
                                        <Upload size={16} />
                                        {scriptFile ? scriptFile.name : 'Select Script File'}
                                    </div>
                                </label>
                             </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="animate-spin" size={20} />
                                    Analyzing & Grading...
                                </>
                            ) : (
                                <>
                                    <Brain size={20} />
                                    Generate AI Score
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                {/* Results Panel */}
                <div className="space-y-6">
                    {result ? (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
                            <div className="flex justify-between items-start mb-6 border-b pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <CheckCircle size={20} className="text-green-500" />
                                        Grading Results
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Based on {formData.examType} standards</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">AI Suggested Score</p>
                                    <div className="text-3xl font-bold text-primary">
                                        {result.totalSuggestedScore} <span className="text-lg text-gray-400">/ {result.maxPossibleScore}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Score Breakdown */}
                            <div className="mb-6 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Detailed Breakdown</h3>
                                {result.scoreBreakdown?.map((item, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-gray-800">{item.point}</h4>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                item.marksAwarded === item.maxMarks 
                                                ? 'bg-green-100 text-green-700' 
                                                : item.marksAwarded > 0 
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {item.marksAwarded} / {item.maxMarks} Marks
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 italic">"{item.reason}"</p>
                                    </div>
                                ))}
                            </div>

                            {/* Overall Feedback */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Overall Feedback</h3>
                                <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm leading-relaxed">
                                    {result.feedback}
                                </div>
                            </div>

                            {/* Final Approval */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    onClick={handleConfirm}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Save size={20} />
                                    Confirm Score
                                </button>
                                <button 
                                    onClick={handleDownloadPDF}
                                    className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Download size={20} />
                                    Download Result
                                </button>
                            </div>

                        </div>
                    ) : (
                        // Empty State
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 border-2 border-dashed border-gray-200 rounded-xl">
                            <Brain size={48} className="mb-4 text-gray-300" />
                            <p className="text-center font-medium">Result will appear here generated by AI</p>
                            <p className="text-center text-sm mt-1">Fill out the form to start grading</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIExamMarking;
