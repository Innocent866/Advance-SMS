import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const pricingPlans = [
  {
    name: "Free School",
    price: "0",
    frequency: "/ forever",
    desc: "Perfect for testing the waters and small setups.",
    features: [
      "Max 50 Students",
      "Max 10 Staff",
      "Student & Staff Management",
      "Attendance Tracking",
      "Basic Dashboard Access"
    ],
    notIncluded: [
      "Learning Materials",
      "Result Computation",
      "AI Marking tools"
    ],
    cta: "Start Free",
    path: "/register-school",
    recommended: false
  },
  {
    name: "Basic School",
    price: "50,000",
    frequency: "/ term",
    desc: "For small schools starting digital management.",
    features: [
      "Max 300 Students",
      "Max 40 Staff",
      "Everything in Free",
      "Learning Materials & Assignments",
      "Basic Reports & Analytics",
      "Email Support"
    ],
    notIncluded: [
      "Exam & CA Management"
    ],
    cta: "Choose Basic",
    path: "/register-school",
    recommended: false
  },
  {
    name: "Standard School",
    price: "100,000",
    frequency: "/ term",
    desc: "For growing schools needing full automation.",
    features: [
      "Max 700 Students",
      "Max 70 Staff",
      "Everything in Basic",
      "CA & Exam Management",
      "Class & Arm Management",
      "Staff-Admin Messaging",
      "Parent Portal Access"
    ],
    notIncluded: [],
    cta: "Choose Standard",
    path: "/register-school",
    recommended: true
  },
  {
    name: "Premium School",
    price: "200,000",
    frequency: "/ term",
    desc: "For advanced digital transformation & AI tools.",
    features: [
      "Max 1500 Students",
      "Max 200 Staff",
      "Everything in Standard",
      "AI Marking (WAEC Style)",
      "After-School & Quiz Modules",
      "Advanced Analytics",
      "Priority Support"
    ],
    notIncluded: [],
    cta: "Go Premium",
    path: "/register-school",
    recommended: false
  }
];

const Pricing = () => {
    
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto max-w-2xl sm:text-center mb-20">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing Plans</h2>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Invest in your school's future
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Simple, termly pricing. No hidden installation fees. Choose the plan that fits your school's size and needs.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
                <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex flex-col p-8 bg-white rounded-3xl border transition-all duration-300 ${
                        plan.recommended 
                        ? 'border-primary-600 shadow-2xl ring-2 ring-primary-600 scale-105 z-10' 
                        : 'border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1'
                    }`}
                >
                    {plan.recommended && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-4 bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wide">
                            <Star size={12} fill="white" /> Most Popular
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className={`text-xl font-bold ${plan.recommended ? 'text-primary-700' : 'text-gray-900'}`}>{plan.name}</h3>
                        <p className="text-gray-500 text-sm mt-2 min-h-[40px] leading-relaxed">{plan.desc}</p>
                    </div>

                    <div className="mb-6 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-gray-900">₦{plan.price}</span>
                        <span className="text-gray-500 text-sm font-medium">{plan.frequency}</span>
                    </div>

                    <ul className="flex-1 space-y-4 mb-8">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.recommended ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="font-medium">{feature}</span>
                            </li>
                        ))}
                        {plan.notIncluded.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-sm text-gray-400">
                                <X className="w-5 h-5 flex-shrink-0 opacity-50" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Link to={plan.path} className="w-full mt-auto">
                        <button
                            className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 transform active:scale-95 ${
                                plan.recommended 
                                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-primary-500/30' 
                                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md'
                            }`}
                        >
                            {plan.cta}
                        </button>
                    </Link>
                </motion.div>
            ))}
        </div>

        {/* Enterprise / Custom Note */}
        <div className="mt-20 text-center bg-gray-50 rounded-2xl p-10 max-w-3xl mx-auto border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Need a custom plan for a larger institution?</h3>
            <p className="text-gray-600 mb-6">
                We offer tailored solutions for large school networks, state governments, and educational boards.
            </p>
            <Link to="/contact">
                <button className="px-8 py-3 bg-white border border-gray-300 text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                    Contact Sales Team
                </button>
            </Link>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
