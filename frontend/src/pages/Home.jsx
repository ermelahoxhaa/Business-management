import { useState } from 'react'

const faqs = [
  {
    id: 1,
    question: 'What is Business Management System?',
    answer: 'Business Management System is a comprehensive platform designed to streamline business operations. It helps you manage orders, clients, deliveries, invoices, and team tasks all in one place.'
  },
  {
    id: 2,
    question: 'How do I create and track orders?',
    answer: 'You can create orders directly from the Orders section. Each order is automatically assigned a unique ID and can be tracked in real-time. You can update status, assign to team members, and view complete order history.'
  },
  {
    id: 3,
    question: 'Can I manage multiple clients?',
    answer: 'Yes! Our Client System allows you to manage unlimited clients. Store comprehensive client information, view history, track communications, and manage all customer-related data in one centralized location.'
  },
  {
    id: 4,
    question: 'Is my data secure?',
    answer: 'Data security is our priority. We implement industry-standard encryption, secure authentication, and role-based access control to ensure your business data remains protected at all times.'
  },
  {
    id: 5,
    question: 'How do I assign tasks to team members?',
    answer: 'In the Tasks section, you can create tasks with detailed descriptions, set priorities and due dates, and assign them to specific team members. Assignees receive notifications and can update task status in real-time.'
  },
  {
    id: 6,
    question: 'Can I generate reports?',
    answer: 'Yes! The Reports section provides comprehensive analytics and business performance insights. You can view project progress, task completion rates, team productivity, and other key metrics.'
  },
  {
    id: 7,
    question: 'How do I manage my team?',
    answer: 'Use the Team Management section to add team members, assign roles, set permissions, and track their activities. You can manage access levels based on your organization\'s needs.'
  },
  {
    id: 8,
    question: 'What support is available?',
    answer: 'We offer comprehensive documentation, video tutorials, and dedicated customer support. Contact our support team for any questions or issues you may encounter.'
  }
]

export default function Home() {
  const [expandedId, setExpandedId] = useState(null)

  const toggleFaq = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-white">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gray-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 max-w-5xl mx-auto text-center py-20">
        <div className="inline-block mb-6">
          <span className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-full text-sm font-medium">✨ Modern Business Solutions</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Welcome to Business <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Management System</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Streamline your operations with our all-in-one platform. Manage orders, clients, deliveries, and invoices effortlessly.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition duration-300 shadow-lg hover:shadow-gray-400/50">
            🚀 Get Started
          </button>

          <button className="px-8 py-3 border-2 border-gray-800 text-gray-800 rounded-lg font-semibold hover:bg-gray-50 transition duration-300">
            📖 Learn More
          </button>
        </div>
      </div>

      
      <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800">Order Management</h3>
          <p className="text-sm text-gray-600 mt-2">
            Create, update and track all business orders in real time.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800">Client System</h3>
          <p className="text-sm text-gray-600 mt-2">
            Manage all customer data and history in one place.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800">Reports</h3>
          <p className="text-sm text-gray-600 mt-2">
            View analytics and business performance easily.
          </p>
        </div>

      </div>

      {/* About Us Section */}
      <div className="max-w-6xl mx-auto mt-20 bg-white p-10 rounded-lg shadow-sm border">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">About Us</h2>
          <p className="mt-4 text-gray-600 leading-7 max-w-3xl mx-auto">
            Business Management System is a modern full-stack application built to simplify business operations such as order handling, client management, delivery tracking and invoicing. We help businesses streamline their workflows and focus on growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Our Mission</h3>
            <p className="text-sm text-gray-600">
              To help businesses manage operations efficiently using modern technology.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Our Vision</h3>
            <p className="text-sm text-gray-600">
              To build a scalable system that supports real-world business workflows.
            </p>
          </div>
        </div>
      </div>

      {/* Client Testimonials Section */}
      <div className="max-w-6xl mx-auto mt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">What Our Clients Say</h2>
          <p className="mt-2 text-gray-600">Success stories from businesses using our platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600 italic mb-4">
              "This system has completely transformed how we manage our orders. The real-time tracking is incredible!"
            </p>
            <div className="border-t pt-4">
              <p className="font-semibold text-gray-800">John Martinez</p>
              <p className="text-sm text-gray-600">Operations Manager, Tech Solutions Inc.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600 italic mb-4">
              "Managing multiple clients and invoices is now effortless. Highly recommend!"
            </p>
            <div className="border-t pt-4">
              <p className="font-semibold text-gray-800">Sarah Johnson</p>
              <p className="text-sm text-gray-600">Finance Director, Global Logistics</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600 italic mb-4">
              "The best investment we made this year. Saved us hours in administrative work every week."
            </p>
            <div className="border-t pt-4">
              <p className="font-semibold text-gray-800">Michael Chen</p>
              <p className="text-sm text-gray-600">CEO, Distribution Experts</p>
            </div>
          </div>

        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-6xl mx-auto mt-20 mb-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Frequently Asked Questions</h2>
          <p className="mt-2 text-gray-600">Find answers to common questions about our platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
              >
                <h3 className="font-semibold text-gray-800">{faq.question}</h3>
                <span className={`text-gray-600 text-xl transform transition-transform ${expandedId === faq.id ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {expandedId === faq.id && (
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}