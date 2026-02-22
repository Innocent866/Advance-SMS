import { useState, useEffect } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import api from '../../utils/api';
import { Save, FileText, Upload } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
// jspdf dynamically imported below

const ReceiptSettings = () => {
    usePageTitle('Receipt Settings');
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [school, setSchool] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        showLogo: true,
        title: 'Payment Receipt',
        message: 'Thank you for your payment.',
        contactDetails: '',
        signature: 'Management',
    });

    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/schools/my-school');
            setSchool(res.data);
            if (res.data.receiptSettings) {
                setFormData({
                    showLogo: res.data.receiptSettings.showLogo ?? true,
                    title: res.data.receiptSettings.title || 'Payment Receipt',
                    message: res.data.receiptSettings.message || 'Thank you for your payment.',
                    contactDetails: res.data.receiptSettings.contactDetails || '',
                    signature: res.data.receiptSettings.signature || 'Management',
                });
            }
            setLogoPreview(res.data.receiptSettings?.logoUrl || res.data.logoUrl);
        } catch (error) {
            console.error(error);
            showNotification('Failed to fetch settings', 'error');
        }
    };

    const handlePreview = async () => {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        // Mock Data for Preview
        const schoolName = school?.name || 'School Name';
        const address = school?.address || 'School Address';
        
        // --- Header ---
        if (formData.showLogo && logoPreview) {
             // Simulating logo - in real generic pdf generartion careful with CORS images
             // For preview, we might just show text if image cross-origin fails, or use base64 if available
             doc.setFontSize(10);
             doc.text("[LOGO]", 20, 20);
        }

        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(schoolName, 105, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(address, 105, 28, { align: "center" });
        if (formData.contactDetails) {
            doc.text(formData.contactDetails, 105, 33, { align: "center" });
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(formData.title.toUpperCase(), 105, 45, { align: "center" });

        // Divider
        doc.setLineWidth(0.5);
        doc.line(20, 50, 190, 50);

        // --- Mock Content ---
        let y = 65;
        const addLine = (label, value) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(label, 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(value, 80, y);
            y += 8;
        };

        addLine("Receipt No:", "RCP-2025-00001");
        addLine("Date:", new Date().toLocaleDateString());
        addLine("Student:", "John Doe (PR/2025/001)");
        addLine("Class:", "JSS 1 A");
        addLine("Amount Paid:", "NGN 50,000");
        addLine("Payment For:", "TUITION FEE");

        // Divider
        y += 10;
        doc.line(20, y, 190, y);
        y += 10;

        // Footer Message
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(formData.message, 105, y, { align: "center" });

        // Signature
        y += 20;
        doc.setFont("helvetica", "bold");
        doc.text(formData.signature, 160, y, { align: "center" });
        doc.setLineWidth(0.2);
        doc.line(140, y-5, 180, y-5); // Signature line

        window.open(doc.output('bloburl'), '_blank');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await api.put('/schools/my-school', {
                receiptSettings: JSON.stringify(formData)
            });
            showNotification('Receipt settings updated', 'success');
        } catch (error) {
            console.error(error);
            showNotification('Failed to update settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Receipt Settings</h1>
                    <p className="text-gray-500 mt-2">Customize the official payment receipt for your school</p>
                </div>
                <button 
                    onClick={handlePreview}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <FileText size={18} />
                    Preview Receipt
                </button>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Title</label>
                            <input 
                                type="text" 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="E.g. Official Receipt"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Contact Override (Optional)</label>
                            <input 
                                type="text" 
                                value={formData.contactDetails}
                                onChange={(e) => setFormData({...formData, contactDetails: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="E.g. accounts@school.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Footer Message</label>
                        <textarea 
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none h-24"
                            placeholder="Message to display at the bottom"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Signature Name</label>
                            <input 
                                type="text" 
                                value={formData.signature}
                                onChange={(e) => setFormData({...formData, signature: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                         <div className="flex items-center gap-4 pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={formData.showLogo}
                                    onChange={(e) => setFormData({...formData, showLogo: e.target.checked})}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <span className="text-gray-700">Show School Logo on Receipt</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-medium disabled:opacity-70"
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReceiptSettings;
