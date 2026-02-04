import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const helpData = {
  "getting-started": {
    title: "Getting Started",
    desc: "Everything you need to set up your school account and start onboarding.",
    articles: [
      { id: 1, title: "How to create your school account" },
      { id: 2, title: "Setting up the academic calendar" },
      { id: 3, title: "Importing student and staff data" },
      { id: 4, title: "Understanding the dashboard overview" }
    ]
  },
  "academic-tools": {
    title: "Academic Tools",
    desc: "Manage classes, subjects, lessons, and assignments.",
    articles: [
      { id: 1, title: "Creating classes and arms" },
      { id: 2, title: "Assigning subjects to teachers" },
      { id: 3, title: "Uploading learning materials" },
      { id: 4, title: "Managing daily attendance" }
    ]
  },
  "billing-finance": {
    title: "Billing & Finance",
    desc: "Manage payments, invoices, and your subscription.",
    articles: [
      { id: 1, title: "How to pay school fees online" },
      { id: 2, title: "Generating payment receipts" },
      { id: 3, title: "Understanding transaction charges" },
      { id: 4, title: "Upgrading your subscription plan" }
    ]
  },
  "account-settings": {
    title: "Account Settings",
    desc: "Manage your profile, security, and preferences.",
    articles: [
      { id: 1, title: "Changing your password" },
      { id: 2, title: "Updating school information" },
      { id: 3, title: "Managing notification preferences" },
      { id: 4, title: "Two-factor authentication setup" }
    ]
  },
  "reports-results": {
    title: "Reports & Results",
    desc: "Generate broadsheets, report cards, and analytics.",
    articles: [
      { id: 1, title: "Computing termly results" },
      { id: 2, title: "Printing student report cards" },
      { id: 3, title: "Analyzing class performance" },
      { id: 4, title: "Exporting data to Excel" }
    ]
  },
  "communication": {
    title: "Communication",
    desc: "Stay connected with parents, staff, and students.",
    articles: [
      { id: 1, title: "Sending bulk SMS to parents" },
      { id: 2, title: "Using the internal messaging system" },
      { id: 3, title: "Posting school announcements" },
      { id: 4, title: "Parent portal notifications" }
    ]
  }
};

const HelpCategory = () => {
  const { category } = useParams();
  const data = helpData[category];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Topic Not Found</h2>
          <Link to="/help" className="text-primary-600 font-bold hover:underline">Return to Help Center</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        
        {/* Breadcrumb / Back */}
        <div className="mb-8">
            <Link to="/help" className="inline-flex items-center text-gray-500 hover:text-primary-600 font-medium transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Help Center
            </Link>
        </div>

        {/* Header */}
        <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{data.title}</h1>
            <p className="text-xl text-gray-600">{data.desc}</p>
        </div>

        {/* Articles List */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {data.articles.map((article, index) => (
                <motion.div 
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 last:border-0"
                >
                    <Link to="#" className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                <FileText size={20} />
                            </div>
                            <span className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">{article.title}</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </Link>
                </motion.div>
            ))}
        </div>

        {/* Contact Note */}
        <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Can't find what you're looking for? <Link to="/contact" className="text-primary-600 font-bold hover:underline">Contact Support</Link></p>
        </div>

      </div>
    </div>
  );
};

export default HelpCategory;
