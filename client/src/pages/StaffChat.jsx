import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    File, 
    Image as ImageIcon, 
    Download, 
    Paperclip,
    Smile,
    MessageSquare,
    User,
    Search,
    Loader2,
    ShieldCheck,
    Users,
    ChevronRight,
    Circle,
    Plus,
    X,
    Settings,
    Trash2,
    Check,
    Mail,
    Phone,
    Calendar,
    Eye,
    Clock,
    ShieldAlert,
    FileText,
    Briefcase,
    Info,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UnifiedFilePreview from '../components/UnifiedFilePreview';
import fileService from '../utils/fileService';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const StaffChat = () => {
    usePageTitle('Staff Communication Hub');
    const { user } = useAuth();
    const isAdmin = user.role === 'school_admin' || user.role === 'super_admin';
    
    const [messages, setMessages] = useState([]);
    const [category, setCategory] = useState('official'); 
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    
    const [staffList, setStaffList] = useState([]);
    const [groups, setGroups] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Group Management State
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState(null);
    
    const getRoleLabel = (role) => {
        const roles = {
            'house_parent': 'House Parent',
            'teacher': 'Teaching Staff',
            'school_admin': 'School Administrator',
            'assistant_admin': 'Assistant Admin',
            'super_admin': 'Super Admin',
            'hostel_warden': 'Hostel Warden'
        };
        return roles[role] || role?.replace(/_/g, ' ');
    };

    // Profile Modal State
    const [viewingProfile, setViewingProfile] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchStaff();
        fetchGroups();
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [category, selectedStaff, selectedGroup]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/chat/staff');
            setStaffList(res.data);
        } catch (error) {
            console.error('Fetch Staff Error:', error);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await api.get('/chat/groups');
            setGroups(res.data);
        } catch (error) {
            console.error('Fetch Groups Error:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            let params = {};
            if (selectedGroup) {
                params.groupId = selectedGroup._id;
            } else if (selectedStaff) {
                params.recipientId = selectedStaff._id;
            } else {
                params.category = category;
            }

            const res = await api.get('/chat', { params });
            setMessages(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Fetch Messages Error:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        try {
            const data = await fileService.uploadFile(file);

            const chatData = {
                messageType: 'file',
                attachment: {
                    url: data.file.url,
                    filename: data.file.originalName || data.file.filename || data.file.title || 'Attached File',
                    originalName: data.file.originalName || data.file.filename || data.file.title || 'Attached File',
                    fileType: data.file.mimeType,
                    size: data.file.size
                }
            };

            if (selectedGroup) {
                chatData.groupId = selectedGroup._id;
            } else if (selectedStaff) {
                chatData.recipientId = selectedStaff._id;
            } else {
                chatData.category = category;
            }

            const chatRes = await api.post('/chat', chatData);
            setMessages([...messages, chatRes.data]);
        } catch (error) {
            console.error('File Upload Error:', error);
        } finally {
            setUploading(false);
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const chatData = {
                content: newMessage,
                messageType: 'text'
            };

            if (selectedGroup) {
                chatData.groupId = selectedGroup._id;
            } else if (selectedStaff) {
                chatData.recipientId = selectedStaff._id;
            } else {
                chatData.category = category;
            }

            const res = await api.post('/chat', chatData);
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Send Message Error:', error);
        } finally {
            setSending(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return toast.error('Group name is required');
        if (selectedMembers.length === 0) return toast.error('Add at least one member');

        try {
            if (isEditing) {
                await api.put(`/chat/groups/${editingGroupId}`, {
                    name: groupName,
                    members: [...selectedMembers, user._id]
                });
                toast.success('Group updated');
            } else {
                await api.post('/chat/groups', {
                    name: groupName,
                    members: [...selectedMembers, user._id],
                    groupType: 'custom'
                });
                toast.success('Group created');
            }
            fetchGroups();
            setShowGroupModal(false);
            resetGroupForm();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm('Are you sure you want to delete this group? All messages will be lost.')) return;
        try {
            await api.delete(`/chat/groups/${groupId}`);
            toast.success('Group deleted');
            if (selectedGroup?._id === groupId) handleSelectChannel('official');
            fetchGroups();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const resetGroupForm = () => {
        setGroupName('');
        setSelectedMembers([]);
        setIsEditing(false);
        setEditingGroupId(null);
    };

    const handleEditGroup = (group) => {
        setGroupName(group.name);
        setSelectedMembers(group.members.filter(m => m !== user._id));
        setEditingGroupId(group._id);
        setIsEditing(true);
        setShowGroupModal(true);
    };

    const toggleMember = (staffId) => {
        if (selectedMembers.includes(staffId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== staffId));
        } else {
            setSelectedMembers([...selectedMembers, staffId]);
        }
    };

    const getDownloadUrl = (url = '', filename = '') => {
        if (!url) return '';
        try {
            if (url.includes('cloudinary.com')) {
                const parts = url.split('/upload/');
                if (parts.length === 2) {
                    const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                    return `${parts[0]}/upload/fl_attachment:${safeName}/${parts[1]}`;
                }
            }
            return url;
        } catch (e) {
            return url;
        }
    };

    const handleDownload = async (url, filename) => {
        const toastId = toast.loading(`Downloading ${filename || 'file'}...`);
        try {
            const downloadUrl = getDownloadUrl(url, filename);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.target = '_blank';
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Download triggered', { id: toastId });
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Download failed', { id: toastId });
        }
    };

    const handleSelectChannel = (chan) => {
        setCategory(chan);
        setSelectedStaff(null);
        setSelectedGroup(null);
    };

    const handleSelectStaff = (staff) => {
        setSelectedStaff(staff);
        setCategory('private');
        setSelectedGroup(null);
    };

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        setCategory('group');
        setSelectedStaff(null);
    };

    const handleViewProfile = (staffId) => {
        const staff = staffList.find(s => s._id === staffId);
        if (staff) {
            setViewingProfile(staff);
        } else if (staffId === user._id) {
             setViewingProfile({
                 _id: user._id,
                 name: user.name,
                 email: user.email,
                 role: user.role,
                 designation: 'Staff Member',
                 profileImage: null, // Basic view for self if not in list
                 joinedAt: user.createdAt
             });
        }
    };

    const MessageBubble = ({ msg }) => {
        const isMe = msg.sender._id === user._id;
        const senderProfile = staffList.find(s => s._id === msg.sender._id) || (isMe ? { profileImage: null } : null);

        return (
            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-6 group`}>
                {!isMe && (
                    <div 
                        className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 mt-6 mr-3 overflow-hidden border border-gray-100 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all self-start"
                        onClick={() => handleViewProfile(msg.sender._id)}
                    >
                        {senderProfile?.profileImage ? (
                            <img src={senderProfile.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User size={14} className="m-auto mt-2 text-gray-400" />
                        )}
                    </div>
                )}
                
                <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'} relative`}>
                    {!isMe && (
                        <div className="flex items-center space-x-2 mb-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleViewProfile(msg.sender._id)}>
                            <span className="text-[11px] font-black text-gray-900 tracking-tight uppercase">{msg.sender.name}</span>
                            <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase bg-gray-100/50 px-2 py-0.5 rounded-full border border-gray-100">
                                {senderProfile?.designation || getRoleLabel(msg.sender.role)}
                            </span>
                        </div>
                    )}
                    <div className={`p-4 rounded-3xl shadow-sm relative ${
                        isMe 
                            ? (category === 'official' ? 'bg-primary text-white rounded-tr-none' : 'bg-green-600 text-white rounded-tr-none')
                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)]'
                    }`}>
                        {!isMe && (
                            <button 
                                onClick={() => handleViewProfile(msg.sender._id)}
                                className="absolute -left-12 top-2 p-2 bg-white shadow-xl border border-gray-50 rounded-xl text-primary opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
                                title="View Hub Profile"
                            >
                                <Info size={16} />
                            </button>
                        )}
                        {msg.messageType === 'text' ? (
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.content}</p>
                        ) : (
                            <div className="flex items-center space-x-3 bg-black/5 p-3 rounded-2xl">
                                <div className="p-2.5 bg-white/20 rounded-xl text-current">
                                    <File size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate" title={msg.attachment?.originalName || msg.attachment?.filename || 'File'}>
                                        {msg.attachment?.originalName || msg.attachment?.filename || 'File'}
                                    </p>
                                    <p className="text-[10px] opacity-70 font-medium">{((msg.attachment?.size || 0) / 1024).toFixed(1)} KB</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button 
                                        onClick={() => setPreviewFile(msg.attachment)} 
                                        className="p-3 hover:bg-white/10 rounded-xl transition-all"
                                        title="Preview File"
                                    >
                                        <Eye size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <p className={`text-[9px] font-black mt-2 tracking-widest uppercase ${isMe ? 'text-white/60 text-right' : 'text-gray-300'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-140px)] flex bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Chat Hub</h2>
                        {isAdmin && (
                            <button 
                                onClick={() => { resetGroupForm(); setShowGroupModal(true); }}
                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark shadow-md transition-all active:scale-95"
                                title="Create Group"
                            >
                                <Plus size={18} />
                            </button>
                        )}
                    </div>

                    <div className="relative group mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                        {/* Channels */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Channels</p>
                            <div className="space-y-1">
                                <button 
                                    onClick={() => handleSelectChannel('official')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                                        category === 'official' && !selectedGroup ? 'bg-primary text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    <ShieldCheck size={18} />
                                    <span className="font-semibold text-sm">Official</span>
                                </button>
                                <button 
                                    onClick={() => handleSelectChannel('casual')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                                        category === 'casual' && !selectedGroup ? 'bg-green-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    <MessageSquare size={18} />
                                    <span className="font-semibold text-sm">Casual</span>
                                </button>
                            </div>
                        </div>

                        {/* Groups */}
                        {groups.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Groups</p>
                                <div className="space-y-1">
                                    {groups.map(group => (
                                        <div key={group._id} className="relative group">
                                            <button 
                                                onClick={() => handleSelectGroup(group)}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                                                    selectedGroup?._id === group._id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3 truncate">
                                                    <Users size={18} />
                                                    <span className="font-semibold text-sm truncate">{group.name}</span>
                                                </div>
                                            </button>
                                            {isAdmin && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEditGroup(group); }} className="p-1 text-gray-400 hover:text-blue-500 rounded bg-white shadow-sm">
                                                        <Settings size={14} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group._id); }} className="p-1 text-gray-400 hover:text-red-500 rounded bg-white shadow-sm">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Direct Messages */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Direct Messages</p>
                            <div className="space-y-1">
                                {staffList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((staff) => (
                                    <div key={staff._id} className="group flex items-center space-x-1">
                                        <button 
                                            onClick={() => handleSelectStaff(staff)}
                                            className={`flex-1 flex items-center space-x-3 px-3 py-3 rounded-xl transition-all ${
                                                selectedStaff?._id === staff._id ? 'bg-white shadow-md ring-1 ring-gray-100' : 'hover:bg-gray-100/50'
                                            }`}
                                        >
                                            <div className="relative">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                                    {staff.profileImage ? (
                                                        <img src={staff.profileImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={16} className="text-primary" />
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <p className={`text-sm font-bold truncate ${selectedStaff?._id === staff._id ? 'text-primary' : 'text-gray-700'}`}>
                                                        {staff.name}
                                                    </p>
                                                    {(staff.role === 'school_admin' || staff.role === 'super_admin') && (
                                                        <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-[8px] font-black text-amber-600 uppercase tracking-tighter shrink-0 border border-amber-200 shadow-sm">
                                                            ADMIN
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[9px] text-gray-400 capitalize truncate font-medium">
                                                    {staff.designation || getRoleLabel(staff.role)}
                                                </p>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => handleViewProfile(staff._id)}
                                            className="p-2 text-gray-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                                            title="View Profile"
                                        >
                                            <Info size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Chat Header */}
                <div className="h-20 px-8 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center space-x-4">
                        {selectedGroup ? (
                            <>
                                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shadow-inner">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 tracking-tight">{selectedGroup.name}</h3>
                                    <p className="text-[10px] text-gray-400 flex items-center">
                                        <Users size={10} className="mr-1" />
                                        {selectedGroup.members.length} Members
                                    </p>
                                </div>
                            </>
                        ) : selectedStaff ? (
                            <>
                                <div 
                                    className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                                    onClick={() => handleViewProfile(selectedStaff._id)}
                                >
                                    {selectedStaff.profileImage ? (
                                        <img src={selectedStaff.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={22} className="text-primary" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 cursor-pointer hover:text-primary transition-colors" onClick={() => handleViewProfile(selectedStaff._id)}>
                                        {selectedStaff.name}
                                    </h3>
                                    <div className="flex items-center text-[10px] text-green-500 font-bold space-x-1">
                                        <Circle size={8} fill="currentColor" />
                                        <span>ACTIVE NOW</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={`p-2.5 rounded-xl shadow-inner ${category === 'official' ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-600'}`}>
                                    {category === 'official' ? <ShieldCheck size={24} /> : <MessageSquare size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">
                                        {category === 'official' ? 'Official Broadcasts' : 'Staff Casual Room'}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-medium">Public visibility for all staff</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Message Feed */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/20 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <p className="font-medium animate-pulse">Connecting to secure tunnel...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-200 space-y-4">
                            <div className="p-10 rounded-full bg-white shadow-inner">
                                <MessageSquare size={64} className="opacity-20" />
                            </div>
                            <p className="font-bold text-gray-300">NO MESSAGES YET</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div key={msg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <MessageBubble msg={msg} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-50">
                    <form onSubmit={handleSendMessage} className="flex items-end space-x-4 max-w-5xl mx-auto">
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all flex items-end shadow-sm">
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                            >
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                            <textarea 
                                rows="1"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 resize-none py-3 px-4 text-gray-700 font-medium placeholder:text-gray-400 min-h-[50px] max-h-[200px] text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            />
                            <button type="button" className="p-3 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-xl transition-all">
                                <Smile size={20} />
                            </button>
                        </div>
                        <button 
                            type="submit"
                            disabled={sending || (!newMessage.trim() && !uploading)}
                            className={`p-4 rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center ${
                                sending || (!newMessage.trim() && !uploading)
                                    ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                                    : (category === 'official' ? 'bg-primary text-white hover:bg-primary-dark hover:-translate-y-1' : 'bg-green-600 text-white hover:bg-green-700 hover:-translate-y-1')
                            }`}
                        >
                            {sending ? <Loader2 className="animate-spin text-white" size={24} /> : <Send size={24} />}
                        </button>
                    </form>
                </div>
            </div>



            {/* Group Management Modal */}
            {showGroupModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100"
                    >
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Manage Group' : 'Create New Group'}</h3>
                            <button onClick={() => setShowGroupModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Group Name</label>
                                <input 
                                    type="text" 
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="e.g. Science Department"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Add Members</label>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1 pr-2">
                                    {staffList.map(staff => (
                                        <button 
                                            key={staff._id}
                                            onClick={() => toggleMember(staff._id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                                selectedMembers.includes(staff._id) ? 'bg-primary/5 text-primary ring-1 ring-primary/20' : 'hover:bg-gray-50 text-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                                                    {staff.profileImage ? <img src={staff.profileImage} alt="" className="w-full h-full object-cover" /> : <User size={14} className="m-auto mt-2 text-gray-400" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">{staff.name}</p>
                                                    <p className="text-[10px] opacity-60 uppercase">{staff.role?.replace(/_/g, ' ')}</p>
                                                </div>
                                            </div>
                                            {selectedMembers.includes(staff._id) && <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white"><Check size={12} strokeWidth={4} /></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex items-center justify-end space-x-3">
                            <button onClick={() => setShowGroupModal(false)} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                            <button 
                                onClick={handleCreateGroup}
                                className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg hover:bg-primary-dark transition-all active:scale-95"
                            >
                                {isEditing ? 'Save Changes' : 'Create Group'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Profile Viewing Modal */}
            <AnimatePresence>
                {viewingProfile && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20"
                        >
                            {/* Modal Header/Cover */}
                            <div className="h-32 bg-gradient-to-r from-primary to-indigo-600 relative">
                                <button 
                                    onClick={() => setViewingProfile(null)}
                                    className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="px-10 pb-10 relative">
                                <div className="absolute -top-16 left-10">
                                    <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-2xl">
                                        <div className="w-full h-full rounded-[1.25rem] bg-gray-100 overflow-hidden">
                                            {viewingProfile.profileImage ? (
                                                <img src={viewingProfile.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={48} className="m-auto mt-10 text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
                                </div>

                                <div className="mt-20">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{viewingProfile.name}</h2>
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-primary/20">
                                            {getRoleLabel(viewingProfile.role)}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 font-bold text-lg mb-8 flex items-center">
                                        <Briefcase size={18} className="mr-2 text-indigo-400" />
                                        {viewingProfile.designation || 'Staff Member'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                                            <div className="flex items-center text-sm font-bold text-gray-700 truncate">
                                                <Mail size={14} className="mr-2 text-primary" />
                                                <span className="truncate">{viewingProfile.email}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                                            <div className="flex items-center text-sm font-bold text-gray-700">
                                                <Phone size={14} className="mr-2 text-green-500" />
                                                {viewingProfile.phoneNumber || 'Not provided'}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gender</p>
                                            <div className="flex items-center text-sm font-bold text-gray-700 capitalize">
                                                <Info size={14} className="mr-2 text-orange-400" />
                                                {viewingProfile.gender || 'Not set'}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Member Since</p>
                                            <div className="flex items-center text-sm font-bold text-gray-700">
                                                <Calendar size={14} className="mr-2 text-blue-400" />
                                                {new Date(viewingProfile.joinedAt).toLocaleDateString([], { month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    {viewingProfile.bio && (
                                        <div className="mb-8">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">About</p>
                                            <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                                                <p className="text-gray-600 text-sm leading-relaxed italic">"{viewingProfile.bio}"</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex space-x-3">
                                        <button 
                                            onClick={() => {
                                                handleSelectStaff(viewingProfile);
                                                setViewingProfile(null);
                                            }}
                                            className="flex-1 flex items-center justify-center space-x-2 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl hover:bg-primary-dark transition-all transform active:scale-95"
                                        >
                                            <MessageSquare size={18} />
                                            <span>SEND MESSAGE</span>
                                        </button>
                                        <button className="p-4 bg-gray-100 text-gray-400 rounded-2xl hover:bg-gray-200 transition-all">
                                            <ExternalLink size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* File Preview Modal - Replaced with UnifiedFilePreview */}
            <UnifiedFilePreview 
                file={previewFile} 
                isOpen={!!previewFile} 
                onClose={() => setPreviewFile(null)} 
            />
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
};

export default StaffChat;
