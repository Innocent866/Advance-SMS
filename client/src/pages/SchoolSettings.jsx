import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Save, Building, Bell, Sliders, Upload, Image as ImageIcon } from 'lucide-react';

const SchoolSettings = () => {
    const { refreshUser } = useAuth(); // Destructure
    
    const [activeTab, setActiveTab] = useState('profile');
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form States
    const [profile, setProfile] = useState({ name: '', address: '', contactEmail: '', logoUrl: '' });
    const [branding, setBranding] = useState({ primaryColor: '#16a34a', secondaryColor: '#f59e0b' });
    const [preferences, setPreferences] = useState({ enableAfterSchoolLearning: true, autoApproveContent: false });
    const [notifications, setNotifications] = useState({ email: true, sms: false });
    
    // File Upload State
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchSchool = async () => {
            try {
                const res = await api.get('/schools/my-school');
                const data = res.data;
                setSchool(data);
                
                // Init forms
                setProfile({
                    name: data.name || '',
                    address: data.address || '',
                    contactEmail: data.contactEmail || '',
                    logoUrl: data.logoUrl || ''
                });
                if(data.branding) setBranding(data.branding);
                if(data.preferences) setPreferences(data.preferences);
                if(data.notificationPreferences) setNotifications(data.notificationPreferences);
                
                if (data.logoUrl) setLogoPreview(data.logoUrl);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const verifyPayment = async () => {
             // Check for reference in URL
             const params = new URLSearchParams(window.location.search);
             const reference = params.get('reference') || params.get('trxref');

             if (reference) {
                 try {
                     setLoading(true);
                     setActiveTab('billing'); // Switch to billing tab
                     await api.get(`/payments/verify/${reference}`);
                     alert('Payment successful! Subscription activated.');
                     
                     // Clear URL param
                     window.history.replaceState({}, document.title, window.location.pathname);
                     
                     // Refresh Data
                     await fetchSchool();
                 } catch (error) {
                     console.error(error);
                     alert('Payment verification failed: ' + (error.response?.data?.message || 'Unknown error'));
                     setLoading(false); // Stop loading if error
                 }
             } else {
                 fetchSchool();
             }
        };

        verifyPayment();
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
            
            // Append Profile Data
            formData.append('name', profile.name);
            formData.append('address', profile.address);
            formData.append('contactEmail', profile.contactEmail);

            // Append Objects as JSON Strings (Backend will parse)
            formData.append('branding', JSON.stringify(branding));
            formData.append('preferences', JSON.stringify(preferences));
            formData.append('notificationPreferences', JSON.stringify(notifications));

            // Append Logo if selected
            if (logoFile) {
                formData.append('logo', logoFile);
            }
            
            const res = await api.put('/schools/my-school', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Update local state with response (e.g. new logo url)
            const updatedSchool = res.data;
            setProfile(prev => ({ ...prev, logoUrl: updatedSchool.logoUrl }));
            setLogoFile(null); // Reset file input

            alert('Settings saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if(loading) return <div>Loading Settings...</div>;

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

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Building /> School Settings
            </h1>

            {/* Tabs */}
             <div className="flex border-b border-gray-200 mb-6">
                <TabButton id="profile" label="Profile & Branding" icon={<Building size={18} />} active={activeTab} set={setActiveTab} />
                <TabButton id="preferences" label="System Preferences" icon={<Sliders size={18} />} active={activeTab} set={setActiveTab} />
                <TabButton id="notifications" label="Notifications" icon={<Bell size={18} />} active={activeTab} set={setActiveTab} />
                <TabButton id="billing" label="Billing & Plan" icon={<div className="font-bold text-green-600">₦</div>} active={activeTab} set={setActiveTab} />
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm relative">
                {/* Save Button Floating */}
                <div className="absolute top-6 right-6">
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="font-bold text-gray-700 border-b pb-2">Basic Information</h3>
                        
                        {/* Logo Upload Section */}
                        <div className="flex items-center gap-6">
                             <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden relative">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="School Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="text-gray-400" size={32} />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">School Logo</label>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                                    >
                                        <Upload size={16} /> Choose Image
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                    {logoFile && <span className="text-xs text-gray-500">{logoFile.name}</span>}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Recommended: Square PNG or JPG, max 2MB.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">School Name</label>
                            <input className="w-full p-2 border rounded" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <input className="w-full p-2 border rounded" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Email</label>
                            <input className="w-full p-2 border rounded" value={profile.contactEmail} onChange={e => setProfile({...profile, contactEmail: e.target.value})} />
                        </div>
                        
                        <h3 className="font-bold text-gray-700 border-b pb-2 pt-4">Branding</h3>
                        <div className="flex gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Primary Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" className="h-10 w-10 border rounded cursor-pointer" value={branding.primaryColor} onChange={e => setBranding({...branding, primaryColor: e.target.value})} />
                                    <span className="text-sm text-gray-500 font-mono">{branding.primaryColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Secondary Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" className="h-10 w-10 border rounded cursor-pointer" value={branding.secondaryColor} onChange={e => setBranding({...branding, secondaryColor: e.target.value})} />
                                    <span className="text-sm text-gray-500 font-mono">{branding.secondaryColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="font-bold text-gray-700 border-b pb-2">Operational Rules</h3>
                        
                        {/* Note: This toggles the simplified "Has After School" for the entire school preference default. 
                            Individual classes can still be toggled in Learning Settings. */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-bold">Enable After-School Learning</div>
                                <div className="text-xs text-gray-500">Global switch to allow after-school modules.</div>
                            </div>
                            <input 
                                type="checkbox" className="w-5 h-5 accent-primary" 
                                checked={preferences.enableAfterSchoolLearning} 
                                onChange={e => setPreferences({...preferences, enableAfterSchoolLearning: e.target.checked})} 
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-bold">Auto-Approve Content</div>
                                <div className="text-xs text-gray-500">If enabled, teacher content is published immediately without admin review.</div>
                            </div>
                            <input 
                                type="checkbox" className="w-5 h-5 accent-primary" 
                                checked={preferences.autoApproveContent} 
                                onChange={e => setPreferences({...preferences, autoApproveContent: e.target.checked})} 
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="font-bold text-gray-700 border-b pb-2">Admin Notifications</h3>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-bold">Email Notifications</div>
                                <div className="text-xs text-gray-500">Receive weekly summaries and important alerts via email.</div>
                            </div>
                            <input 
                                type="checkbox" className="w-5 h-5 accent-primary" 
                                checked={notifications.email} 
                                onChange={e => setNotifications({...notifications, email: e.target.checked})} 
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-bold">SMS Notifications</div>
                                <div className="text-xs text-gray-500">Receive critical alerts via SMS (fees apply).</div>
                            </div>
                            <input 
                                type="checkbox" className="w-5 h-5 accent-primary" 
                                checked={notifications.sms} 
                                onChange={e => setNotifications({...notifications, sms: e.target.checked})} 
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex justify-between items-center">
                            <div>
                                <div className="text-sm text-blue-600 font-bold mb-1">SUBSCRIPTION STATUS</div>
                                <div className="text-3xl font-bold text-gray-800 capitalize">
                                    {school?.subscription?.plan || 'Free'}
                                </div>
                                <div className={`text-sm font-bold mt-1 ${school?.subscription?.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                                    Status: {school?.subscription?.status?.toUpperCase()}
                                </div>
                                {school?.subscription?.expiryDate && (
                                    <div className="text-sm text-gray-500 mt-1">
                                        Expires: {new Date(school.subscription.expiryDate).toDateString()}
                                    </div>
                                )}
                            </div>
                            {school?.subscription?.plan === 'Free' && (
                                <div className="bg-white px-4 py-2 rounded shadow-sm text-sm font-bold text-blue-600">
                                    Free Trial
                                </div>
                            )}
                        </div>

                        <h3 className="font-bold text-gray-700 border-b pb-2 pt-4">Renewal Plans</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* Basic Plan */}
                            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <h4 className="text-xl font-bold text-gray-800">Basic School</h4>
                                <div className="text-3xl font-bold text-gray-800 my-4">₦2,000<span className="text-sm text-gray-400 font-normal">/month</span></div>
                                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                                    <li className="flex gap-2">✅ Max 200 Students</li>
                                    <li className="flex gap-2">✅ Max 10 Teachers</li>
                                    <li className="flex gap-2">✅ AI Lesson Plans</li>
                                </ul>
                                <button 
                                    onClick={() => handleUpgrade('Basic')}
                                    className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                    Subscribe / Renew
                                </button>
                            </div>

                             {/* Standard Plan */}
                            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg font-bold">POPULAR</div>
                                <h4 className="text-xl font-bold text-gray-800">Standard School</h4>
                                <div className="text-3xl font-bold text-primary my-4">₦5,000<span className="text-sm text-gray-400 font-normal">/month</span></div>
                                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                                    <li className="flex gap-2">✅ Max 500 Students</li>
                                    <li className="flex gap-2">✅ Max 25 Teachers</li>
                                    <li className="flex gap-2">✅ Video Learning Platform</li>
                                </ul>
                                <button 
                                    onClick={() => handleUpgrade('Standard')}
                                    className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                                    Subscribe / Renew
                                </button>
                            </div>

                             {/* Premium Plan */}
                             <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <h4 className="text-xl font-bold text-gray-800">Premium School</h4>
                                <div className="text-3xl font-bold text-gray-800 my-4">₦15,000<span className="text-sm text-gray-400 font-normal">/month</span></div>
                                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                                    <li className="flex gap-2">✅ Max 2000 Students</li>
                                    <li className="flex gap-2">✅ Max 100 Teachers</li>
                                    <li className="flex gap-2">✅ Priority Support</li>
                                </ul>
                                <button 
                                    onClick={() => handleUpgrade('Premium')}
                                    className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                    Subscribe / Renew
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TabButton = ({ id, label, icon, active, set }) => (
    <button 
        onClick={() => set(id)}
        className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
            active === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
    >
        {icon} {label}
    </button>
);

export default SchoolSettings;
