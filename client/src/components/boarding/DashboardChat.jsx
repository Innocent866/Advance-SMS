import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, User, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DashboardChat = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            // Fetch official/general staff messages
            const res = await api.get('/chat', { params: { category: 'official' } });
            setMessages(res.data.slice(-20)); // Only show last 20 for dashboard
            setLoading(false);
        } catch (error) {
            console.error('Fetch Messages Error:', error);
        }
    };

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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const chatData = {
                content: newMessage,
                messageType: 'text',
                category: 'official'
            };

            const res = await api.post('/chat', chatData);
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">Staff Chatroom</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Official Channel</p>
                    </div>
                </div>
                <Link 
                    to="/staff/chat" 
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-all"
                    title="Open Full Hub"
                >
                    <ExternalLink size={18} />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary/20" size={32} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
                        <MessageSquare size={32} className="opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No recent messages</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender._id === user?._id;
                        return (
                            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                    <div className="flex flex-col ml-1 mb-1">
                                        <span className="text-[9px] font-black text-gray-900 uppercase tracking-tight">
                                            {msg.sender.name}
                                        </span>
                                        <span className="text-[8px] font-bold text-gray-400 capitalize tracking-widest">
                                            {getRoleLabel(msg.sender.role)}
                                        </span>
                                    </div>
                                )}
                                <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] ${
                                    isMe 
                                        ? 'bg-primary text-white rounded-tr-none' 
                                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                } shadow-sm`}>
                                    {msg.content}
                                </div>
                                <span className="text-[8px] text-gray-300 mt-1 font-bold">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-gray-50/30 border-t border-gray-100 flex items-center gap-2">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button 
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className={`p-2.5 rounded-xl transition-all ${
                        sending || !newMessage.trim() 
                            ? 'bg-gray-100 text-gray-300' 
                            : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
                    }`}
                >
                    {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
            </form>
        </div>
    );
};

export default DashboardChat;
