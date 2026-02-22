import React from 'react';
import { motion } from 'framer-motion';
import { Shield, PenTool, BookOpen, Users } from 'lucide-react';

const FeaturesSection = () => {
  const items = [
    { role: "School Admin", icon: <Shield className="w-8 h-8"/>, color: "bg-primary-50 text-primary-600", desc: "Gain total control over operations, finance, and staff." },
    { role: "Teachers", icon: <PenTool className="w-8 h-8"/>, color: "bg-orange-50 text-orange-600", desc: "Streamline grading, lesson planning, and attendance." },
    { role: "Students", icon: <BookOpen className="w-8 h-8"/>, color: "bg-blue-50 text-blue-600", desc: "Access notes, track results, and learn from anywhere." },
    { role: "Parents", icon: <Users className="w-8 h-8"/>, color: "bg-purple-50 text-purple-600", desc: "Stay informed on child progress and make easy payments." }
  ];

  return (
    <section className="py-24 bg-milk">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900">Built for the Entire Ecosystem</h2>
                <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                    Every stakeholder in your institution benefits from our tailored dashboards.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      className="bg-white p-8 rounded-2xl shadow-sm border border-primary-50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                        <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`} aria-hidden="true">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.role}</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  );
};

export default FeaturesSection;
