import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, FileType2, ShieldAlert, Maximize2, Minimize2, FileImage } from 'lucide-react';
import toast from 'react-hot-toast';



const UnifiedFilePreview = ({ file, isOpen, onClose }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsFullscreen(false);
        }
    }, [isOpen]);

    if (!isOpen || !file) return null;

    // file object is expected to be a FileRecord or closely resemble it:
    // { url, filename, originalName, mimeType, size }
    const displayName = file.originalName || file.filename || file.title || 'Unknown File';
    const mimeType = (file.mimeType || file.fileType || '').toLowerCase();
    const url = file.url || file.fileUrl || '';

    const checkTarget = (displayName + ' ' + url).toLowerCase();
    let typeCategory = 'unknown';
    if (mimeType.includes('pdf') || /\.pdf($|\?)/i.test(checkTarget)) typeCategory = 'pdf';
    else if (mimeType.includes('image/') || /\.(png|jpe?g|gif|webp)($|\?)/i.test(checkTarget)) typeCategory = 'image';
    else if (mimeType.includes('word') || /\.docx?($|\?)/i.test(checkTarget)) typeCategory = 'word';



    const modalClasses = isFullscreen
        ? 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/95'
        : 'fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 md:p-10';

    const containerClasses = isFullscreen
        ? 'bg-white w-full h-full flex flex-col'
        : 'bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative';

    const renderIcon = () => {
        if (typeCategory === 'pdf') return <FileText size={20} className="text-red-500" />;
        if (typeCategory === 'word') return <FileType2 size={20} className="text-blue-500" />;
        if (typeCategory === 'image') return <FileImage size={20} className="text-green-500" />;
        return <FileText size={20} className="text-gray-400" />;
    };

    const iconBg = typeCategory === 'pdf' ? 'bg-red-50' : typeCategory === 'word' ? 'bg-blue-50' : typeCategory === 'image' ? 'bg-green-50' : 'bg-gray-50';

    return (
        <AnimatePresence>
            <div className={modalClasses} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={containerClasses}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 md:p-6 border-b flex flex-wrap items-center justify-between bg-white relative z-10 shrink-0 gap-4 shadow-sm">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className={`p-3 rounded-2xl shrink-0 ${iconBg}`}>
                                {renderIcon()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-black text-gray-800 truncate max-w-[150px] md:max-w-xs lg:max-w-md">
                                    {displayName}
                                </p>
                                {file.size && (
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">


                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl transition-all hidden md:flex active:scale-95"
                                title="Fullscreen"
                            >
                                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>

                            <button
                                onClick={onClose}
                                className="p-2.5 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all active:scale-95"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-hidden bg-gray-50 relative flex flex-col items-center justify-center p-4">
                        {typeCategory === 'pdf' ? (
                            <iframe 
                                src={url} 
                                className="w-full h-full border-none rounded-xl bg-white shadow-inner"
                                title={displayName}
                            />
                        ) : typeCategory === 'word' ? (
                            <iframe 
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`} 
                                className="w-full h-full border-none rounded-xl bg-white shadow-inner"
                                title={displayName}
                            />
                        ) : typeCategory === 'image' ? (
                            <img 
                                src={url} 
                                alt={displayName}
                                className="max-w-full max-h-full object-contain rounded-xl shadow-md"
                            />
                        ) : (
                            // Fallback for unknown types that cannot be safely embedded natively
                            <div className="text-center p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 max-w-sm mx-4">
                                <div className="p-8 bg-amber-50 rounded-full text-amber-500 inline-block mb-6 shadow-inner border border-amber-100">
                                    <ShieldAlert size={56} />
                                </div>
                                <h3 className="text-xl font-black text-gray-800 tracking-tight">
                                    Preview Not Available
                                </h3>
                                <p className="text-sm text-gray-500 mt-3 leading-relaxed font-medium">
                                    The format of this document cannot be safely previewed directly inside the browser.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UnifiedFilePreview;
