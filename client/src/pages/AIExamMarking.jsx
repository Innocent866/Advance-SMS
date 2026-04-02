import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Brain, RefreshCw, Save, AlertCircle, Upload, Download } from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
// jspdf dynamically imported below

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

    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await api.get('/marking/history');
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch marking history", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

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

    const handleConfirm = async () => {
        if (!result) return;
        try {
            await api.post('/marking/save', {
                ...formData,
                scriptUrl: result.scriptUrl,
                scoreBreakdown: result.scoreBreakdown,
                totalSuggestedScore: result.totalSuggestedScore,
                finalizedScore: finalizedScore || result.totalSuggestedScore,
                maxPossibleScore: result.maxPossibleScore,
                feedback: result.feedback
            });
            alert(`Score Finalized and Saved: ${finalizedScore || result.totalSuggestedScore}/${result?.maxPossibleScore}`);
            fetchHistory();
        } catch (err) {
            console.error(err);
            alert('Failed to save marking result');
        }
    };

    const toDataURL = url => fetch(url)
      .then(response => response.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));

    const generateMarkedScriptPDF = async (data) => {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(220, 38, 38); // Red stamp
        doc.text(`GRADED: ${data.finalizedScore || data.totalSuggestedScore} / ${data.maxPossibleScore}`, 10, 20);
        
        doc.setTextColor(0, 0, 0); // Black text
        doc.setFontSize(14);
        doc.text(`Subject: ${data.subject}`, 10, 30);
        doc.text(`Exam Type: ${data.examType}`, 10, 38);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 46);

        doc.setLineWidth(0.5);
        doc.line(10, 50, 200, 50);

        let yPos = 60;
        doc.setFontSize(16);
        doc.text("Student Submission:", 10, yPos);
        yPos += 10;
        doc.setFontSize(12);

        if (data.studentAnswer) {
            const answerLines = doc.splitTextToSize(data.studentAnswer, 180);
            doc.text(answerLines, 10, yPos);
            yPos += (answerLines.length * 5) + 10;
        }

        if (data.scriptUrl) {
           const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(data.scriptUrl) || data.scriptUrl.includes('image/upload');
           
           if (isImage) {
               try {
                   const imgData = await toDataURL(data.scriptUrl);
                   // Dynamic format detection (jspdf usually handles this if prefixed correctly)
                   const format = data.scriptUrl.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';
                   
                   // Attempt to keep aspect ratio if we can load it into an image object first
                   const img = new Image();
                   img.crossOrigin = "Anonymous";
                   img.src = imgData;
                   
                   await new Promise((resolve) => {
                       img.onload = resolve;
                       img.onerror = resolve; // Continue even if sizing fails
                   });

                   const imgWidth = 180;
                   const imgHeight = (img.height * imgWidth) / img.width || 120; // fallback height
                   
                   doc.addImage(imgData, format, 10, yPos, imgWidth, Math.min(imgHeight, 180));
                   yPos += Math.min(imgHeight, 180) + 10;
               } catch (e) {
                   console.warn("Failed to embed image, falling back to link", e);
                   doc.setTextColor(0, 0, 255);
                   doc.text("Click to View Attached Script: " + data.scriptUrl, 10, yPos);
                   doc.setTextColor(0, 0, 0);
                   yPos += 10;
               }
           } else {
               // Non-image file (PDF, Doc)
               doc.setTextColor(0, 0, 255);
               doc.text("Attached Document (View Online): " + data.scriptUrl, 10, yPos);
               doc.setTextColor(0, 0, 0);
               yPos += 10;
           }
        }

        doc.addPage();
        yPos = 20;
        
        doc.setFontSize(18);
        doc.text("Detailed Marking Report", 10, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        data.scoreBreakdown.forEach((item, index) => {
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

        doc.save(`${data.subject}_Marked_Script.pdf`);
    };

    const handleDownloadCurrentMarkedScript = () => {
        if (!result) return;
        generateMarkedScriptPDF({
            ...formData,
            ...result,
            finalizedScore: finalizedScore || result.totalSuggestedScore
        });
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marking Scheme</label>
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
                                    Grading...
                                </>
                            ) : (
                                <>
                                    <Brain size={20} />
                                    Grade with AI
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
                                    onClick={handleDownloadCurrentMarkedScript}
                                    className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Download size={20} />
                                    Download Marked Script
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

            {/* History Section */}
            <div className="mt-12 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Save size={24} className="text-primary" />
                    Previous Marks History
                </h2>
                {loadingHistory ? (
                    <div className="text-center text-gray-500 py-8">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 bg-white rounded-xl shadow-sm border border-gray-100">
                        No previous marking history found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map((item) => (
                            <div key={item._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{item.subject}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{item.examType}</p>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-600 text-sm">Score:</span>
                                        <span className="font-bold text-lg text-primary">{item.finalizedScore || item.totalSuggestedScore} / {item.maxPossibleScore}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 italic mb-4">"{item.feedback}"</p>
                                </div>
                                <div className="flex justify-start">
                                    <button 
                                        onClick={() => generateMarkedScriptPDF(item)}
                                        className="text-primary hover:text-green-700 text-sm font-bold flex items-center gap-1 transition-colors bg-green-50 px-3 py-2 rounded-lg"
                                    >
                                        <Download size={16} />
                                        Download Marked Script
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIExamMarking;
