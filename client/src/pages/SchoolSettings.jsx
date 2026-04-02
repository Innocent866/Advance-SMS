import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { 
    Save, 
    Upload, 
    Building, 
    Bell, 
    Palette, 
    Globe, 
    Mail, 
    Sliders, 
    Image as ImageIcon, 
    Shield, 
    Check, 
    X, 
    Crown, 
    Settings, 
    Key, 
    Smartphone, 
    CreditCard, 
    FileText, 
    Eye,
    ChevronRight,
    Lock,
    Zap,
    Trophy,
    CheckCircle2,
    Brain,
    Video,
    MessageSquare,
    LineChart,
    FileCheck,
    Library
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculatePaystackGross } from '../utils/paymentUtils';

const SchoolSettings = () => {
    usePageTitle('School Settings Hub');
    const { refreshUser } = useAuth();
    
    const [activeTab, setActiveTab] = useState('profile');
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form States
    const [profile, setProfile] = useState({ name: '', address: '', contactEmail: '', logoUrl: '' });
    const [branding, setBranding] = useState({ primaryColor: '#16a34a', secondaryColor: '#f59e0b' });
    const [preferences, setPreferences] = useState({ enableAfterSchoolLearning: true, autoApproveContent: false, defaultStudentPassword: '', defaultTeacherPassword: '' });
    const [notifications, setNotifications] = useState({ email: true, sms: false });
    const [features, setFeatures] = useState({
        boarding: true,
        financials: true,
        learningManagement: true,
        advancedAnalytics: true,
        medicalRecords: true,
        disciplineManagement: true,
        attendanceTracking: true,
        aiMarking: true,
        basicReports: true,
        learningMaterials: true,
        continuousAssessment: true,
        staffAdminComm: true,
        videoManager: true
    });
    
    // Receipt Settings
    const [receiptConfig, setReceiptConfig] = useState({
        showLogo: true,
        title: 'Payment Receipt',
        message: 'Thank you for your payment.',
        contactDetails: '',
        signature: 'Management',
    });

    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountNumber: '',
        accountName: ''
    });
    
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchSchool = async () => {
            try {
                const res = await api.get('/schools/my-school');
                const data = res.data;
                setSchool(data);
                
                setProfile({
                    name: data.name || '',
                    address: data.address || '',
                    contactEmail: data.contactEmail || '',
                    logoUrl: data.logoUrl || ''
                });
                if(data.branding) setBranding(data.branding);
                if(data.preferences) setPreferences({
                    ...data.preferences,
                    defaultStudentPassword: data.defaultStudentPassword || 'student123',
                    defaultTeacherPassword: data.defaultTeacherPassword || 'teacher123'
                });
                if(data.notificationPreferences) setNotifications(data.notificationPreferences);
                
                const defaultFeatures = {
                    aiMarking: true,
                    learningManagement: true,
                    advancedAnalytics: true,
                    financials: true,
                    learningMaterials: true,
                    videoManager: true,
                    continuousAssessment: true,
                    basicReports: true,
                    staffAdminComm: true,
                    medicalRecords: true,
                    boarding: true,
                    attendanceTracking: true,
                    disciplineManagement: true
                };
                
                if (data.features) {
                    setFeatures({ ...defaultFeatures, ...data.features });
                } else {
                    setFeatures(defaultFeatures);
                }

                if(data.receiptSettings) setReceiptConfig(data.receiptSettings);
                if(data.bankDetails) setBankDetails(data.bankDetails);
                
                if (data.logoUrl) setLogoPreview(data.logoUrl);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const initializeSettings = async () => {
             const params = new URLSearchParams(window.location.search);
             const reference = params.get('reference') || params.get('trxref');
             const tab = params.get('tab');

             if (tab) {
                setActiveTab(tab);
             }

             if (reference) {
                 try {
                     setLoading(true);
                     setActiveTab('billing');
                     await api.get(`/payments/verify/${reference}`);
                     window.history.replaceState({}, document.title, window.location.pathname);
                     await fetchSchool();
                 } catch (error) {
                     console.error(error);
                     setLoading(false);
                 }
             } else {
                 fetchSchool();
             }
        };

        initializeSettings();
    }, []);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('address', profile.address);
            formData.append('contactEmail', profile.contactEmail);
            formData.append('branding', JSON.stringify(branding));
            formData.append('defaultStudentPassword', preferences.defaultStudentPassword);
            formData.append('defaultTeacherPassword', preferences.defaultTeacherPassword);
            formData.append('preferences', JSON.stringify(preferences));
            formData.append('notificationPreferences', JSON.stringify(notifications));
            formData.append('features', JSON.stringify(features));
            formData.append('receiptSettings', JSON.stringify(receiptConfig));
            formData.append('bankDetails', JSON.stringify(bankDetails));

            if (logoFile) {
                formData.append('logo', logoFile);
            }
            
            const res = await api.put('/schools/my-school', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const updatedSchool = res.data;
            setProfile(prev => ({ ...prev, logoUrl: updatedSchool.logoUrl }));
            setLogoFile(null);
            alert('Settings Hub updated successfully!');
            refreshUser();
        } catch (error) {
            console.error(error);
            alert('Failed to update Settings Hub.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpgrade = async (plan) => {
        try {
            const res = await api.post('/payments/initialize', { plan });
            if (res.data.authorization_url) {
                window.location.href = res.data.authorization_url;
            }
        } catch (error) {
            alert('Payment initialization failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleReceiptPreview = async () => {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        const schoolName = school?.name || 'Your School';
        const address = school?.address || 'School Location';
        
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(schoolName, 105, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.text(address, 105, 28, { align: "center" });
        if (receiptConfig.contactDetails) {
            doc.text(receiptConfig.contactDetails, 105, 33, { align: "center" });
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(receiptConfig.title.toUpperCase(), 105, 45, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(20, 50, 190, 50);

        let y = 65;
        const addLine = (label, value) => {
            doc.setFont("helvetica", "bold");
            doc.text(label, 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(value, 80, y);
            y += 8;
        };

        addLine("Receipt No:", "RCP-2026-PREVIEW");
        addLine("Date:", new Date().toLocaleDateString());
        addLine("Student:", "Demo Student (PR/2026/001)");
        addLine("Amount Paid:", "NGN 1,000.00");

        y += 10;
        doc.line(20, y, 190, y);
        y += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(receiptConfig.message, 105, y, { align: "center" });

        y += 20;
        doc.setFont("helvetica", "bold");
        doc.text(receiptConfig.signature, 160, y, { align: "center" });
        doc.line(140, y-5, 180, y-5);

        window.open(doc.output('bloburl'), '_blank');
    };

    if(loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Calibrating Settings Hub...</p>
        </div>
    );

    const tabs = [
        { id: 'profile', label: 'Identity & Branding', icon: Building },
        { id: 'preferences', label: 'Intelligence Rules', icon: Sliders },
        { id: 'features', label: 'Feature Matrix', icon: Shield },
        { id: 'receipts', label: 'Receipt Hub', icon: FileText },
        { id: 'notifications', label: 'Communications', icon: Bell },
        { id: 'billing', label: 'Subscription & Vault', icon: CreditCard },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto pb-20"
        >
            {/* Hero Header */}
            <div className="relative mb-10 p-8 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
                
                <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center p-4">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <Building className="text-white" size={40} />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">{profile.name || 'School Settings Hub'}</h1>
                            <p className="text-gray-400 font-medium flex items-center gap-2 mt-1">
                                <Globe size={14} className="text-primary" /> Global Enterprise Configuration
                            </p>
                        </div>
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave} 
                        disabled={saving}
                        className="flex items-center gap-3 bg-primary hover:bg-opacity-90 px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/25 transition-all disabled:opacity-50 text-white uppercase tracking-wider text-sm"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save size={20} />
                        )}
                        {saving ? 'Synchronizing...' : 'Commit Changes'}
                    </motion.button>
                </div>
            </div>

            {/* Glassmorphic Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 p-2 bg-gray-100/50 backdrop-blur-md rounded-[1.5rem] border border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                            activeTab === tab.id 
                                ? 'bg-white text-primary shadow-sm border border-gray-200' 
                                : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden min-h-[500px]"
                >
                    {activeTab === 'profile' && (
                        <div className="p-10 space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <SectionHeading title="General Identity" subtitle="Manage your school's public profile and contact details" />
                                    
                                    <div className="space-y-4">
                                        <SettingInput label="School Name" icon={Building} value={profile.name} onChange={v => setProfile({...profile, name: v})} />
                                        <SettingInput label="Official Address" icon={Globe} value={profile.address} onChange={v => setProfile({...profile, address: v})} />
                                        <SettingInput label="Contact Email" icon={Mail} value={profile.contactEmail} onChange={v => setProfile({...profile, contactEmail: v})} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <SectionHeading title="Branding Suite" subtitle="Visual identity assets for the entire platform" />
                                    
                                    <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-24 rounded-3xl bg-white border border-gray-100 shadow-inner flex items-center justify-center p-3 relative group overflow-hidden">
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                                                ) : (
                                                    <ImageIcon className="text-gray-200" size={32} />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-gray-900 shadow-lg">
                                                        <Upload size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-800">Master Logo</h4>
                                                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Transparent PNG or high-res JPG recommended (Max 2MB)</p>
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <ColorPicker label="Primary Color" color={branding.primaryColor} onChange={c => setBranding({...branding, primaryColor: c})} />
                                            <ColorPicker label="Secondary Color" color={branding.secondaryColor} onChange={c => setBranding({...branding, secondaryColor: c})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="p-10 space-y-10">
                            <SectionHeading title="Intelligence Configuration" subtitle="Configure automated rules and system-wide default thresholds" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <PreferenceToggle 
                                    title="After-School Intelligence" 
                                    desc="Globally enable specialized learning modules for after-school sessions."
                                    icon={Zap}
                                    checked={preferences.enableAfterSchoolLearning}
                                    onChange={v => setPreferences({...preferences, enableAfterSchoolLearning: v})}
                                />
                                <PreferenceToggle 
                                    title="Real-time Content Approval" 
                                    desc="Automatically publish learning materials without manual administrative review."
                                    icon={Trophy}
                                    checked={preferences.autoApproveContent}
                                    onChange={v => setPreferences({...preferences, autoApproveContent: v})}
                                />
                                <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                            <Key size={20} />
                                        </div>
                                        <h4 className="font-black text-gray-800">Security Defaults</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <SettingInput label="Student Onboarding Password" value={preferences.defaultStudentPassword} onChange={v => setPreferences({...preferences, defaultStudentPassword: v})} />
                                        <SettingInput label="Staff Onboarding Password" value={preferences.defaultTeacherPassword} onChange={v => setPreferences({...preferences, defaultTeacherPassword: v})} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'features' && (
                        <div className="p-10 space-y-10">
                            <SectionHeading title="Operational Matrix" subtitle="Activate or hibernate specialized platform modules in real-time" />
                            
                            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-white text-blue-600 rounded-xl mt-0.5 shadow-sm border border-blue-100">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900">Non-Destructive Sandbox (Zero Data Loss)</h4>
                                    <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                                        Deactivating a module instantly removes its interface from all staff and student dashboards to maintain a perfectly clean workspace. 
                                        <b className="font-bold"> Absolutely no historical data is deleted.</b> All records (e.g., past boarding attendance, medical logs, old exam algorithms) are securely preserved in the database and will seamlessly restore upon reactivation.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { id: 'aiMarking', label: 'AI Exam Marking', icon: Brain, color: 'amber' },
                                    { id: 'learningManagement', label: 'Student Assignments', icon: Zap, color: 'blue' },
                                    { id: 'advancedAnalytics', label: 'Analytics & Reports', icon: LineChart, color: 'primary' },
                                    { id: 'financials', label: 'Fees & Finance', icon: CreditCard, color: 'emerald' },
                                    { id: 'learningMaterials', label: 'Study Materials', icon: Library, color: 'indigo' },
                                    { id: 'videoManager', label: 'Video Lessons', icon: Video, color: 'rose' },
                                    { id: 'continuousAssessment', label: 'Student Results (C.A)', icon: FileCheck, color: 'amber' },
                                    { id: 'basicReports', label: 'Staff Report Sheets', icon: FileText, color: 'gray' },
                                    { id: 'staffAdminComm', label: 'Internal Staff Chat', icon: MessageSquare, color: 'primary' },
                                    { id: 'medicalRecords', label: 'Health & Medical', icon: Shield, color: 'emerald' },
                                    { id: 'boarding', label: 'Boarding & Hostel', icon: Building, color: 'indigo' },
                                    { id: 'attendanceTracking', label: 'Daily Attendance', icon: CheckCircle2, color: 'primary' },
                                    { id: 'disciplineManagement', label: 'Student Discipline', icon: Shield, color: 'rose' },
                                ].map((feat) => (
                                    <FeatureCard 
                                        key={feat.id}
                                        {...feat}
                                        active={features[feat.id]}
                                        toggle={() => setFeatures(prev => ({ ...prev, [feat.id]: !prev[feat.id] }))}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'receipts' && (
                        <div className="p-10 space-y-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <SectionHeading title="Electronic Receipt Hub" subtitle="Customize the formal financial documentation generated by the system" />
                                <button 
                                    onClick={handleReceiptPreview}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                                >
                                    <Eye size={18} /> Live Preview
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <SettingInput label="Official Receipt Title" value={receiptConfig.title} onChange={v => setReceiptConfig({...receiptConfig, title: v})} />
                                    <SettingInput label="Billing Contact Override" value={receiptConfig.contactDetails} onChange={v => setReceiptConfig({...receiptConfig, contactDetails: v})} />
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Gratitude Message</label>
                                        <textarea 
                                            value={receiptConfig.message}
                                            onChange={(e) => setReceiptConfig({...receiptConfig, message: e.target.value})}
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium h-32"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <SettingInput label="Authorized Signatory" value={receiptConfig.signature} onChange={v => setReceiptConfig({...receiptConfig, signature: v})} />
                                    <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-black text-gray-800">Visual Identity</h4>
                                                <p className="text-xs text-gray-500 mt-1">Include school logo on e-receipts</p>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="w-6 h-6 rounded-lg accent-primary" 
                                                checked={receiptConfig.showLogo}
                                                onChange={e => setReceiptConfig({...receiptConfig, showLogo: e.target.checked})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="p-10 space-y-10">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                <div className="relative z-10">
                                    <p className="text-blue-100 font-black uppercase tracking-widest text-xs mb-2">Vault Operational Status</p>
                                    <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
                                        {school?.subscription?.plan || 'Free Tier'}
                                        {school?.subscription?.plan === 'Premium' && <Crown size={32} className="text-amber-400" />}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black">
                                            <div className={`w-2 h-2 rounded-full ${school?.subscription?.status === 'active' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                                            {school?.subscription?.status?.toUpperCase() || 'ACTIVE'}
                                        </span>
                                        {school?.subscription?.expiryDate && school?.subscription?.plan !== 'Free' && (
                                            <span className="text-blue-100 text-xs font-bold font-mono text-[10px]">
                                                Next Billing: {new Date(school.subscription.expiryDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="relative z-10 flex gap-4">
                                    <div className="text-right">
                                        <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1 opacity-70">Enrollment Usage</p>
                                        <p className="text-2xl font-black">{school?.mediaUsage?.students || 0} <span className="text-sm opacity-50 font-medium">/ {school?.subscription?.maxStudents || 50} Students</span></p>
                                    </div>
                                    <div className="w-px h-12 bg-white/20" />
                                    <div className="text-right">
                                        <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1 opacity-70">Staff Capacity</p>
                                        <p className="text-2xl font-black">{school?.mediaUsage?.teachers || 0} <span className="text-sm opacity-50 font-medium">/ {school?.subscription?.maxTeachers || 5} Staff</span></p>
                                    </div>
                                </div>
                            </div>

                            <SectionHeading title="Enterprise Renewal Plans" subtitle="Select the tier that aligns with your school's growth trajectory" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <PricingPlan 
                                    name="Basic School" 
                                    price="50,000" 
                                    desc="Foundational digital management"
                                    features={['Max 300 Students', 'Max 40 Staff', 'Attendance Tracking', 'Basic Learning Hub', 'Standard Reports']}
                                    onSelect={() => handleUpgrade('Basic')}
                                />
                                <PricingPlan 
                                    name="Standard School" 
                                    price="100,000" 
                                    popular
                                    desc="Advanced automation for scale"
                                    features={['Max 700 Students', 'Max 70 Staff', 'Everything in Basic', 'Exams & CA Engine', 'Secure Staff Chat']}
                                    onSelect={() => handleUpgrade('Standard')}
                                />
                                <PricingPlan 
                                    name="Premium School" 
                                    price="200,000" 
                                    desc="Full intelligence transformation"
                                    features={['Max 1500 Students', 'Max 200 Staff', 'Everything in Standard', 'AI Marking Intelligence', 'Advanced Analytics Hub']}
                                    onSelect={() => handleUpgrade('Premium')}
                                />
                            </div>

                            <div className="mt-12 p-10 bg-emerald-50/50 rounded-[3rem] border border-emerald-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                                <div className="relative z-10 flex flex-col lg:flex-row gap-10">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                                <CreditCard size={20} />
                                            </div>
                                            <h4 className="font-black text-gray-800">Direct Settlement Vault</h4>
                                        </div>
                                        <p className="text-xs text-emerald-800 leading-relaxed max-w-md">
                                            Configure your official institution bank account to receive tuition and fee payments directly. 
                                            Upon saving, the system will automatically synchronize a <span className="font-bold underline">Paystack Subaccount</span> for real-time split settlements.
                                        </p>

                                        {school?.paystackSubaccountCode && (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                                                <CheckCircle2 size={14} /> Subaccount Verified: {school.paystackSubaccountCode}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-[1.5]">
                                        <SettingInput 
                                            label="Settlement Bank Name" 
                                            placeholder="e.g. GTBank, Zenith" 
                                            value={bankDetails.bankName} 
                                            onChange={v => setBankDetails({...bankDetails, bankName: v})} 
                                        />
                                        <SettingInput 
                                            label="Account Number" 
                                            placeholder="10 Digits" 
                                            value={bankDetails.accountNumber} 
                                            onChange={v => setBankDetails({...bankDetails, accountNumber: v})} 
                                        />
                                        <div className="md:col-span-2">
                                            <SettingInput 
                                                label="Official Account Name" 
                                                placeholder="Must match bank records" 
                                                value={bankDetails.accountName} 
                                                onChange={v => setBankDetails({...bankDetails, accountName: v})} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'notifications' && (
                        <div className="p-10 space-y-10">
                            <SectionHeading title="Communication Channels" subtitle="Manage how administrative alerts and reports are broadcast" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <PreferenceToggle 
                                    title="Enterprise Email" 
                                    desc="Receive comprehensive academic and financial summaries via secured email."
                                    icon={Mail}
                                    checked={notifications.email}
                                    onChange={v => setNotifications({...notifications, email: v})}
                                />
                                <PreferenceToggle 
                                    title="Critical SMS Interface" 
                                    desc="Broadcast high-priority alerts via SMS (Standard carrier rates apply)."
                                    icon={Smartphone}
                                    checked={notifications.sms}
                                    onChange={v => setNotifications({...notifications, sms: v})}
                                />
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

const SectionHeading = ({ title, subtitle }) => (
    <div>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h3>
        <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-[10px]">{subtitle}</p>
    </div>
);

const SettingInput = ({ label, icon: Icon, value, onChange, placeholder }) => (
    <div className="space-y-1">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" size={18} />}
            <input 
                type="text" 
                value={value} 
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full ${Icon ? 'pl-12' : 'px-6'} py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-800`}
            />
        </div>
    </div>
);

const ColorPicker = ({ label, color, onChange }) => (
    <div className="space-y-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="flex items-center gap-4 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <input 
                type="color" 
                value={color} 
                onChange={e => onChange(e.target.value)}
                className="w-10 h-10 rounded-xl border-none cursor-pointer p-0 overflow-hidden" 
            />
            <span className="font-mono text-xs font-black text-gray-400">{color.toUpperCase()}</span>
        </div>
    </div>
);

const PreferenceToggle = ({ title, desc, icon: Icon, checked, onChange }) => (
    <div 
        onClick={() => onChange(!checked)}
        className={`p-8 rounded-[2rem] border transition-all cursor-pointer group ${
            checked ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-gray-50 border-gray-100 opacity-60'
        }`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-4 rounded-2xl transition-all ${checked ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-300'}`}>
                <Icon size={24} />
            </div>
            <div className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${checked ? 'bg-primary' : 'bg-gray-200'}`}>
                <motion.div 
                    animate={{ x: checked ? 28 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                />
            </div>
        </div>
        <h4 className={`font-black text-lg transition-colors ${checked ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h4>
        <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed">{desc}</p>
    </div>
);

const FeatureCard = ({ label, icon: Icon, active, toggle, color }) => (
    <div 
        onClick={toggle}
        className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer relative overflow-hidden group ${
            active 
                ? `bg-white border-primary shadow-xl scale-[1.02]` 
                : 'bg-gray-50 border-gray-100 grayscale opacity-60'
        }`}
    >
        {active && <div className="absolute top-4 right-4 text-primary animate-in zoom-in"><CheckCircle2 size={18} /></div>}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:rotate-3 ${
            active ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-300 shadow-sm'
        }`}>
            <Icon size={24} />
        </div>
        <h4 className={`font-black text-sm tracking-tight ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</h4>
    </div>
);

const PricingPlan = ({ name, price, desc, features, popular, onSelect }) => (
    <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col relative transition-all hover:shadow-2xl ${
        popular ? 'bg-white border-primary shadow-xl scale-[1.05]' : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200 shadow-md'
    }`}>
        {popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl animate-bounce">
                Most Popular Choice
            </div>
        )}
        <h4 className="text-xl font-black text-gray-900">{name}</h4>
        <p className="text-xs text-gray-500 font-medium mt-1 mb-6">{desc}</p>
        
        <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight font-mono">₦{price}</span>
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">/ Termly</span>
        </div>

        <div className="mb-8 p-3 bg-gray-100/50 rounded-xl border border-gray-100 flex justify-between items-center text-[10px]">
            <span className="text-gray-400 font-bold uppercase tracking-widest">Processing Fee</span>
            <span className="text-blue-600 font-black">+₦{calculatePaystackGross(parseInt(price.replace(/,/g, ''))).fee.toLocaleString()}</span>
        </div>

        <ul className="space-y-4 mb-10 flex-1">
            {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-gray-600 leading-tight">
                    <Check size={14} className="text-primary mt-0.5 shrink-0" /> {f}
                </li>
            ))}
        </ul>

        <button 
            onClick={onSelect}
            className={`w-full py-4 rounded-2xl font-black text-xs transition-all active:scale-95 uppercase tracking-widest shadow-lg ${
                popular 
                    ? 'bg-gray-900 text-white hover:bg-black shadow-primary/20' 
                    : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
            }`}
        >
            Select {name.split(' ')[0]}
        </button>
    </div>
);

export default SchoolSettings;
