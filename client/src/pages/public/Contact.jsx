import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Mail, 
    Phone, 
    MapPin, 
    Send, 
    MessageSquare, 
    ArrowRight, 
    CheckCircle, 
    HelpCircle, 
    Shield, 
    Lock, 
    Users,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const Contact = () => {
    const form = useRef();
    const [formStatus, setFormStatus] = useState('idle');
    const [activeAccordion, setActiveAccordion] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('sending');

        // Extract values using FormData to handle the mapping manually
        const formData = new FormData(form.current);
        const values = Object.fromEntries(formData.entries());

        const templateParams = {
            full_name: values.from_name, // Map input 'from_name' to 'full_name'
            from: values.from_email,      // Map 'from_name' to 'name' as well
            school_name: values.school_name,
            // from_email: values.from_email,
            phone_number: values.phone_number,
            title: values.subject,     // Map 'subject' to 'Subject' (Capitalized)
            message: values.message,
            time: new Date().toLocaleString(), // Add timestamp
        };
        // Removed logs for production
        
        emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )
        .then((result) => {
            // Removed logs for production
            setFormStatus('success');
            form.current.reset(); // Reset form ref
            setTimeout(() => setFormStatus('idle'), 5000);
        }, (error) => {
            // Removed logs for production
            setFormStatus('error'); 
            alert("Failed to send message: " + error.text);
            setFormStatus('idle');
        });
    };

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    const faqs = [
        { q: "How fast do you respond to support tickets?", a: "We typically respond to all support inquiries within 2 hours during business hours. For critical issues, our team is available 24/7." },
        { q: "Can I get a free demo for my school?", a: "Absolutely! You can request a free personalized demo. Our team will walk you through the platform and show you how it fits your specific needs." },
        { q: "Do parents pay fees online directly?", a: "Yes, parents can pay school fees securely via our Paystack integration. They receive instant digital receipts, and the school gets real-time financial updates." },
        { q: "Can we customize the receipt templates?", a: "Yes, GT-SchoolHub allows you to add your school logo, address, and custom notes to all generated receipts and report cards." },
        { q: "Is our student data secure?", a: "Security is our top priority. We use industry-standard encryption, secure servers, and role-based access control to ensure your data is safe and private." }
    ];

    return (
        <div className="bg-white overflow-hidden">
            
            {/* 1. Hero Section */}
            <section className="relative py-20 lg:py-32 bg-primary-900 text-white overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                 <div className="absolute top-0 right-0 w-2/3 h-full bg-primary-800 rounded-l-full opacity-50 blur-3xl transform translate-x-1/3"></div>
                 
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                     <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto"
                     >
                         <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                             Let’s Build a <span className="text-primary-300">Smarter School</span> Together
                         </h1>
                         <p className="text-xl text-primary-100 mb-10 leading-relaxed">
                             GT-SchoolHub is here to help schools manage academics, payments, health records, and parent engagement seamlessly.
                         </p>
                         <div className="flex flex-col sm:flex-row gap-4 justify-center">
                             <a href="#contact-form">
                                 <button className="px-8 py-4 rounded-full bg-white text-primary-900 font-bold text-lg shadow-lg hover:bg-primary-50 transition-all hover:-translate-y-1">
                                     Send a Message
                                 </button>
                             </a>
                             <Link to="/register-school">
                                 <button className="px-8 py-4 rounded-full bg-transparent border border-white text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                     Request a Demo <ArrowRight size={20} />
                                 </button>
                             </Link>
                         </div>
                     </motion.div>
                 </div>
            </section>

            {/* 2. Contact Options Section */}
            <section className="py-16 bg-white -mt-10 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Mail, title: "Email Support", info: "goldima@gt-schoolhub.com.ng", link: "mailto:goldima@gt-schoolhub.com.ng" },
                            { icon: Phone, title: "Phone Number", info: "+234 913 809 5613", link: "tel:+2349138095613" },
                            { icon: MessageSquare, title: "WhatsApp Chat", info: "Chat with Support", link: "https://wa.me/2349138095613" }
                        ].map((item, i) => (
                            <motion.a 
                                key={i}
                                href={item.link}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center hover:transform hover:-translate-y-2 transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-4">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-primary-600 font-medium">{item.info}</p>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Contact Form & Map Section */}
            <section id="contact-form" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        
                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-gray-100"
                        >
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                            <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                        <input type="text" id="fullName" name="from_name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="Enter your name" required />
                                    </div>
                                    <div>
                                        <label htmlFor="schoolName" className="block text-sm font-semibold text-gray-700 mb-2">School Name</label>
                                        <input type="text" id="schoolName" name="school_name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="Enter school name" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                        <input type="email" id="email" name="from_email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="john@school.com" required />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                        <input type="tel" id="phone" name="phone_number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="+234..." required />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                    <div className="relative">
                                         <select id="subject" name="subject" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none bg-white" required>
                                            <option value="" disabled selected>Select a subject</option>
                                            <option value="Request a Demo">Request a Demo</option>
                                            <option value="Technical Support">Technical Support</option>
                                            <option value="Billing Inquiry">Billing Inquiry</option>
                                            <option value="Partnership">Partnership</option>
                                         </select>
                                         <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                    </div>
                                </div>
                                <div>
                                     <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                     <textarea id="message" name="message" rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none" placeholder="Tell us about your needs..." required></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={formStatus === 'sending'}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 ${
                                        formStatus === 'success' 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : formStatus === 'error' 
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-primary-600 hover:bg-primary-700'
                                    }`}
                                >
                                    {formStatus === 'idle' && (
                                        <>Send Message <Send size={20} /></>
                                    )}
                                    {formStatus === 'sending' && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending...
                                        </div>
                                    )}
                                    {formStatus === 'success' && (
                                        <>Message Sent! <CheckCircle size={20} /></>
                                    )}
                                    {formStatus === 'error' && (
                                        <>Failed to Send <HelpCircle size={20} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>

                        {/* Map & Info */}
                        <div className="space-y-10">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Location</h2>
                                <p className="text-gray-600 mb-8 max-w-lg">
                                    We are growing across Nigeria and beyond. While we are a digital-first company, our headquarters serves as the hub for our operations and support team.
                                </p>
                                
                                {/* Map Placeholder using CSS/Visuals */}
                                <div className="bg-white rounded-3xl p-2 shadow-lg border border-gray-100 h-[300px] relative overflow-hidden">
                                     <div className="absolute inset-0 bg-blue-50 pattern-grid-lg opacity-20"></div>
                                     <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="text-center relative z-10">
                                              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-2xl mx-auto mb-4 animate-bounce">
                                                  <MapPin size={32} />
                                              </div>
                                              <h3 className="font-bold text-gray-900 text-lg">GT-SchoolHub HQ</h3>
                                              <p className="text-sm text-gray-600">Lagos, Nigeria</p>
                                          </div>
                                          {/* Decorative circles representing coverage */}
                                          <div className="absolute w-64 h-64 bg-primary-200 rounded-full opacity-20 animate-pulse"></div>
                                          <div className="absolute w-96 h-96 bg-primary-100 rounded-full opacity-10"></div>
                                     </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-primary-900 rounded-3xl p-8 text-center text-white relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                                <h3 className="text-2xl font-bold mb-4 relative z-10">Want GT-SchoolHub for Your School?</h3>
                                <p className="text-primary-200 mb-8 relative z-10">
                                    Schedule a personalized demo and see how we can transform your school management.
                                </p>
                                <Link to="/register-school" className="relative z-10">
                                    <button className="px-8 py-3 rounded-full bg-white text-primary-900 font-bold hover:bg-gray-100 transition-all shadow-lg w-full sm:w-auto">
                                        Start a Free Demo
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

             {/* 4. FAQ Section */}
             <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
                         <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 font-bold text-sm mb-4">Support</span>
                         <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                         <p className="mt-4 text-gray-600">Common questions about getting started with GT-SchoolHub.</p>
                     </div>

                     <div className="space-y-4">
                         {faqs.map((item, index) => (
                             <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="border border-gray-100 rounded-xl overflow-hidden shadow-sm"
                             >
                                 <button 
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors text-left"
                                 >
                                     <span className="font-bold text-gray-900 text-lg">{item.q}</span>
                                     {activeAccordion === index ? <ChevronUp className="text-primary-600" /> : <ChevronDown className="text-gray-400" />}
                                 </button>
                                 {activeAccordion === index && (
                                     <div className="p-6 pt-0 bg-white text-gray-600 leading-relaxed border-t border-gray-50">
                                         {item.a}
                                     </div>
                                 )}
                             </motion.div>
                         ))}
                     </div>
                </div>
            </section>

            {/* 5. Final Trust Banner */}
            <section className="py-16 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Trusted by Schools. Built for the Future.</h2>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                           <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                               <Shield size={24} className="text-primary-600" /> Secure Payments
                           </div>
                           <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                               <Lock size={24} className="text-primary-600" /> Role-Based Access
                           </div>
                           <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                               <Users size={24} className="text-primary-600" /> Parent Portals
                           </div>
                           <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                               <CheckCircle size={24} className="text-primary-600" /> AI-Powered
                           </div>
                    </div>
                    <div className="mt-12">
                         <Link to="/register-school">
                            <button className="px-10 py-4 rounded-full bg-primary-600 text-white font-bold text-lg shadow-xl hover:bg-primary-700 transition-all hover:-translate-y-1">
                                Get Started with GT-SchoolHub Today
                            </button>
                         </Link>
                    </div>
                </div>
            </section>

             {/* Floating WhatsApp Button */}
             <a 
                href="https://wa.me/2349138095613" 
                target="_blank" 
                rel="noreferrer"
                className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer"
                title="Chat with us on WhatsApp"
             >
                 <MessageSquare size={32} fill="white" />
             </a>

        </div>
    );
};

export default Contact;
