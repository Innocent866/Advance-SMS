import React from 'react';
import { motion } from 'framer-motion';
import { Search, Book, User, Settings, CreditCard, MessageCircle, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  const categories = [
    { icon: User, title: "Getting Started", desc: "Account setup, profile management, and onboarding." },
    { icon: Book, title: "Academic Tools", desc: "Managing classes, subjects, and learning materials." },
    { icon: CreditCard, title: "Billing & Finance", desc: "Payments, invoices, and subscription plans." },
    { icon: Settings, title: "Account Settings", desc: "Security, notifications, and school profile." },
    { icon: FileText, title: "Reports & Results", desc: "Generating broadsheets and student report cards." },
    { icon: MessageCircle, title: "Communication", desc: "Messaging parents and staff announcements." }
  ];

  return (
    <div className="bg-white min-h-screen">
      
      {/* Search Hero */}
      <div className="bg-primary-900 py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                How can we help you today?
            </h1>
            <div className="relative max-w-2xl mx-auto">
                <input 
                    type="text" 
                    placeholder="Search for articles, guides, or troubleshooting..." 
                    className="w-full pl-14 pr-6 py-5 rounded-2xl shadow-2xl text-lg focus:outline-none focus:ring-4 focus:ring-primary-500/30"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
            </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => {
                const slug = cat.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                return (
                    <Link to={`/help/${slug}`} key={i}>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer h-full"
                        >
                            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                <cat.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.title}</h3>
                            <p className="text-gray-500 leading-relaxed mb-4">{cat.desc}</p>
                            <div className="flex items-center text-primary-600 font-bold text-sm">
                                View Articles <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    </Link>
                );
            })}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-50 py-20 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
             <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
             <p className="text-gray-600 mb-8">Our support team is available Mon-Fri, 9am - 5pm.</p>
             <div className="flex justify-center gap-4">
                 <Link to="/contact">
                     <button className="px-8 py-3 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                         Contact Support
                     </button>
                 </Link>
             </div>
          </div>
      </div>

    </div>
  );
};

export default HelpCenter;
