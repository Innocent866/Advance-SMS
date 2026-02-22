import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, Shield, Users, BarChart, Calendar, Laptop, BookOpen } from 'lucide-react';

const KeyFeaturesGrid = () => {
    const features = [
        { title: "Academic Management", icon: <Layers />, desc: "Complete grading, results, and promotions system.", color: "primary" },
        { title: "Smart Database", icon: <Database />, desc: "Securely store student, staff, and medical records.", color: "blue" },
        { title: "Financial Controls", icon: <Shield />, desc: "Automate fee collection and expense tracking.", color: "green" },
        { title: "Community Portal", icon: <Users />, desc: "Dedicated access for parents, teachers, and students.", color: "purple" },
        { title: "Real-time Analytics", icon: <BarChart />, desc: "Visual insights into school performance metrics.", color: "orange" },
        { title: "Attendance Tracking", icon: <Calendar />, desc: "Digital attendance for students and staff with reports.", color: "red" },
        { title: "Virtual Classrooms", icon: <Laptop />, desc: "Host video lessons and share digital materials.", color: "indigo" },
        { title: "E-Library", icon: <BookOpen />, desc: "Access notes, eBooks, and past questions anytime.", color: "cyan" }
    ];

    return (
      <section className="py-24 bg-milk">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
                <p className="mt-4 text-gray-600">A complete suite of tools to manage every aspect of your school.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="p-8 bg-white rounded-3xl border border-primary-50 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 text-primary-600 flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                            {React.cloneElement(feature.icon, { size: 28 })}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>
    );
};

export default KeyFeaturesGrid;
