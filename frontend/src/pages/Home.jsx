import { useState } from 'react'
import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Tasks & Projects',
    description: 'Create tasks, assign team members, track status, and organize work across projects.'
  },
  {
    title: 'Clients & Invoices',
    description: 'Manage client records, contacts, and billing workflows from one workspace.'
  },
  {
    title: 'Reports & Analytics',
    description: 'Preview and export business reports in multiple formats, including PDF.'
  },
  {
    title: 'Team Management',
    description: 'Handle employees, departments, roles, and permissions with role-based access.'
  },
  {
    title: 'Search & Data Transfer',
    description: 'Advanced list search with export and import support for core business data.'
  },
  {
    title: 'Real-Time Updates',
    description: 'Receive live notifications when tasks are assigned or statuses change.'
  }
]

const faqs = [
  {
    id: 1,
    question: 'What is Business Management System?',
    answer: 'A full-stack platform for managing projects, tasks, employees, clients, invoices, and reports in one place.'
  },
  {
    id: 2,
    question: 'Who can use the platform?',
    answer: 'The system supports Admin, Team Leader, and Employee roles. Each role sees the tools relevant to their responsibilities.'
  },
  {
    id: 3,
    question: 'How do tasks and projects work?',
    answer: 'Managers create projects and tasks, assign them to employees, and track progress through statuses such as To Do, In Progress, and Done.'
  },
  {
    id: 4,
    question: 'Can I manage clients and invoices?',
    answer: 'Yes. Admins and team leaders can manage clients, create invoices, and keep business records organized.'
  },
  {
    id: 5,
    question: 'Does the system support reports?',
    answer: 'Yes. You can preview reports such as task summaries, overdue tasks, project progress, employee workload, and client directories.'
  },
  {
    id: 6,
    question: 'Is authentication secure?',
    answer: 'The app uses JWT access tokens, refresh token rotation, role-based access, and permission checks on protected API routes.'
  }
]

export default function Home() {
  const [expandedId, setExpandedId] = useState(null)

  const toggleFaq = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-700/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300/80">
            Business Operations Platform
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Manage your team, clients, and workflow
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            A centralized workspace for projects, tasks, employees, clients, invoices, and reports.
            Built for managers and teams that need clear visibility and secure access.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="rounded-3xl bg-sky-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="rounded-3xl border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Explore Features
            </a>
          </div>
        </section>

        <section id="features" className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-xl ring-1 ring-white/5"
            >
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white">Frequently Asked Questions</h2>
            <p className="mt-2 text-sm text-slate-400">Quick answers about how the platform works</p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-900"
                >
                  <h3 className="pr-4 text-sm font-semibold text-slate-100">{faq.question}</h3>
                  <span
                    className={`text-slate-400 transition-transform ${expandedId === faq.id ? 'rotate-180' : ''}`}
                  >
                    ▼
                  </span>
                </button>

                {expandedId === faq.id && (
                  <div className="border-t border-slate-800 px-5 py-4">
                    <p className="text-sm leading-6 text-slate-400">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
