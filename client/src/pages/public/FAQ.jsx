import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is GT-SchoolHub?",
        a: "GT-SchoolHub is a comprehensive school management system designed to streamline administration, enhance teaching, and improve parent-school communication through a unified digital platform."
      },
      {
        q: "Is there a free trial available?",
        a: "Yes! We offer a completely free plan for small schools (up to 50 students). For larger institutions, we can arrange a demo and a trial period upon request."
      },
      {
        q: "How long does it take to set up?",
        a: "You can create an account and start adding data in less than 5 minutes. Full implementation depends on your school size, but our import tools make the process very fast."
      }
    ]
  },
  {
    category: "Pricing & Billing",
    questions: [
      {
        q: "Are there any hidden fees?",
        a: "No. Our pricing is transparent. You pay per term for the plan you choose. Optional SMS credits are charged separately if you wish to use SMS notifications."
      },
      {
        q: "Can I upgrade or downgrade my plan?",
        a: "Absolutely. You can upgrade your plan at any time from your dashboard to access more features or accommodate more students."
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major debit cards, bank transfers, and USSD payments via our secure payment partner, Paystack."
      }
    ]
  },
  {
    category: "Technical & Security",
    questions: [
      {
        q: "Is my school's data secure?",
        a: "Yes, security is our top priority. We use industry-standard encryption protocols to protect your data, and we perform regular backups to ensure nothing is ever lost."
      },
      {
        q: "Do I need to install any software?",
        a: "No. GT-SchoolHub is a cloud-based web application. You can access it from any device with an internet connection using a modern web browser."
      },
      {
        q: "What happens if I lose my internet connection?",
        a: "Since it is cloud-based, you need internet to access the system. However, we have optimized the platform to work efficiently even on low-bandwidth connections."
      }
    ]
  }
];

const FAQ = () => {
  const [activeTab, setActiveTab] = useState("General");
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const activeQuestions = faqs.find(f => f.category === activeTab)?.questions || [];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary-900 py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-6">
                Frequently Asked Questions
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                Everything you need to know about GT-SchoolHub. Can't find the answer you're looking for? Reach out to our support team.
            </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
            {faqs.map((cat) => (
                <button
                    key={cat.category}
                    onClick={() => { setActiveTab(cat.category); setOpenIndex(null); }}
                    className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                        activeTab === cat.category 
                        ? 'bg-primary-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {cat.category}
                </button>
            ))}
        </div>

        {/* Questions Accordion */}
        <div className="space-y-4">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    {activeQuestions.map((faq, index) => (
                        <div 
                            key={index} 
                            className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary-200 hover:shadow-sm"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-6 text-left bg-white focus:outline-none"
                            >
                                <span className="font-bold text-lg text-gray-900">{faq.q}</span>
                                <span className={`flex-shrink-0 ml-4 p-2 rounded-full transition-colors ${openIndex === index ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                                </span>
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Still have questions? */}
        <div className="mt-20 text-center bg-gray-50 rounded-3xl p-10 border border-gray-100">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm mx-auto mb-6">
                <MessageCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Can't find the answer you're looking for? Please chat to our friendly team.
            </p>
            <Link to="/contact">
                <button className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 transition-all hover:-translate-y-1">
                    Get in touch
                </button>
            </Link>
        </div>

      </div>
    </div>
  );
};

export default FAQ;
