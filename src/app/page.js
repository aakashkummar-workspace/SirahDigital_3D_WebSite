"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Reveal from '@/components/Reveal';
import Navbar from '@/components/Navbar';
import Avatar from '@/components/Avatar';
import Footer, { COMPANY } from '@/components/Footer';
import AnimatedHeading from '@/components/AnimatedHeading';
import SpotlightCard from '@/components/SpotlightCard';

const SirahCanvas = dynamic(() => import('@/components/SirahCanvas'), { ssr: false });

export default function Home() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', company: '', message: '',
  });

  // 'idle' | 'sending' | 'sent' | 'error'
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const submitLead = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setStatusMessage('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('sent');
      setStatusMessage('Thanks — we will be in touch shortly.');
      setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', message: '', website: '' });
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Something went wrong. Please email us instead.');
    }
  };

  // Shared styling for every field in the consultation form
  const inputClass = `w-full px-5 py-4 rounded-xl border text-sm transition-colors focus:outline-none focus:border-cyan-400 bg-[#0b0f18] border-white/10 text-white placeholder:text-gray-500`;

  const productionProjects = [
    { title: "MedFlow AI Optimizer", client: "Healthcare & Wellness", impact: "40% Admin Reduction", desc: "Live production system automating patient triage, billing routing protocols, and OCR scanning pipelines for enterprise clinics." },
    { title: "Nexus ERP Core", client: "Logistics & Supply Chain", impact: "Real-Time Tracking", desc: "Bespoke system integration linking multi-warehouse telemetry parameters straight to a centralized corporate dispatch hub." },
    { title: "OmniChannel Retail Bot", client: "Retail & E-commerce", impact: "12k+ Active Conversations", desc: "Autonomous WhatsApp Business infrastructure deployed to manage bulk sales, client retargeting, and automatic checkout links." }
  ];

  const developmentProjects = [
    { title: "Project Autonomous HR", phase: "Alpha Testing", stack: "LLM Orchestration", desc: "Custom AI agent software built to screen 500+ CVs concurrently and automatically set up logical candidate calendar loops." },
    { title: "InsightForge BI Engine", phase: "Beta Architecture", stack: "Next.js + WebGL Data", desc: "A hyper-fast system data aggregator converting raw system telemetry parameters into clean, predictive graphic dashboards." }
  ];

  const coreCapabilities = [
    { title: "AI Agents & Virtual Employees", desc: "Autonomous cognitive systems built to execute end-to-end operational loops." },
    { title: "AI Chatbots & Voice Assistants", desc: "Context-aware LLM agents handling natural multi-lingual customer pipelines." },
    { title: "Workflow & Process Automation", desc: "Connecting fragmented legacy systems to run fully untethered loops." },
    { title: "Custom Web & Mobile Apps", desc: "High-performance enterprise dashboards and bespoke cross-platform setups." },
    { title: "CRM & ERP Solutions", desc: "Tailored databases tracking resource orchestration and operational lifecycles." },
    { title: "SaaS Product Development", desc: "Multi-tenant cloud architectures engineered for rapid customer onboarding." },
    { title: "WhatsApp Business Automation", desc: "Massive scale automated outreach and customer interactive transaction channels." },
    { title: "AI Document Processing & OCR", desc: "Extracting structured data parameters straight from chaotic text layouts." },
    { title: "API Dev & System Integration", desc: "Writing clean, future-ready microservices that glue core operations together." },
    { title: "Business Intelligence Dashboards", desc: "Aggregating telemetry maps to render clean, actionable real-time insights." }
  ];

  const niches = [
    { title: "Healthcare & Wellness", desc: "Automated clinic workflows, smart patient scheduling, and OCR record processing." },
    { title: "Manufacturing", desc: "Predictive maintenance scheduling, production dashboards, and IoT system integrations." },
    { title: "Education & EdTech", desc: "Interactive custom learning portals, AI grading assistants, and student management applications." },
    { title: "Real Estate", desc: "Automated lead tracking systems, custom CRM workflows, and property portfolio analytics portals." },
    { title: "Retail & E-commerce", desc: "SaaS inventory prediction dashboards, automated WhatsApp support channels, and custom checkout apps." },
    { title: "Logistics & Supply Chain", desc: "Live route optimization networks, delivery tracking architectures, and cargo data hubs." },
    { title: "Professional Services", desc: "AI document processing, automated legal/accounting operations, and custom BI dashboards." },
    { title: "Hospitality & Travel", desc: "Autonomous guest booking bots, virtual concierge systems, and automated billing operations." },
    { title: "Human Resources & Recruitment", desc: "Automated CV screening tools, intelligent interview loops, and employee onboarding apps." },
    { title: "Legal Services", desc: "Smart AI contract analysis systems, discovery document processing tools, and legal workflow engines." },
    { title: "Construction & Engineering", desc: "Live project tracking tools, material supply dashboards, and custom blueprints systems." },
    { title: "Automotive", desc: "Inventory telemetry dashboards, customer garage CRM integrations, and predictive parts procurement dashboards." }
  ];

  // Names, roles and bios carried over from sirahdigital.in/team.
  // Photos: drop the files into /public/team/ using these filenames and they
  // appear automatically; until then each one falls back to an initials badge.
  const founder = {
    name: 'Mohamed Riyaz',
    role: 'Founder – SIRAH DIGITAL',
    bio: 'Visionary leader driving AI-powered digital growth and automation-focused business solutions at SIRAH DIGITAL.',
    photo: '/team/mohamed-riyaz.jpg',
  };

  // TODO: real profile URLs — these are placeholders.
  const founderSocials = [
    { label: 'Facebook', href: '#', path: 'M13.5 9H15V6.5h-1.9C11 6.5 10.2 7.7 10.2 9.3V11H8.5v2.5h1.7V21h2.8v-7.5h1.9l.3-2.5h-2.2V9.6c0-.4.2-.6.5-.6z' },
    { label: 'WhatsApp', href: '#', path: 'M12 3a9 9 0 00-7.8 13.5L3 21l4.7-1.2A9 9 0 1012 3zm0 2a7 7 0 016 10.6l-.3.5.6 2.2-2.3-.6-.5.3A7 7 0 1112 5zm-2.7 3.4c-.2 0-.5.1-.7.4-.2.3-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.6 4 3.5 1.9.8 2.3.6 2.7.6.4 0 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1l-.6-.3-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.3.1-.4l.4-.5.2-.4v-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4z' },
    { label: 'YouTube', href: '#', path: 'M21.6 8.2s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.8C16.1 5.2 12 5.2 12 5.2s-4.1 0-6.9.2c-.4 0-1.2 0-1.9.8-.6.6-.8 2-.8 2S2.2 9.8 2.2 11.4v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.7.8 1.7.7 2.1.8 1.6.2 6.7.2 6.7.2s4.1 0 6.9-.2c.4 0 1.2 0 1.9-.8.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2zM10.1 14.7V9.4l5.2 2.7-5.2 2.6z' },
    { label: 'Instagram', href: '#', path: 'M12 8.1A3.9 3.9 0 1015.9 12 3.9 3.9 0 0012 8.1zm0 6.4A2.5 2.5 0 1114.5 12 2.5 2.5 0 0112 14.5zm5-6.6a.9.9 0 11-.9-.9.9.9 0 01.9.9zM20 8a4.5 4.5 0 00-1.2-3.2A4.6 4.6 0 0015.6 3.6C14.3 3.5 10 3.5 8.7 3.6A4.6 4.6 0 005.5 4.8 4.5 4.5 0 004.3 8c-.1 1.3-.1 5.3 0 6.6a4.5 4.5 0 001.2 3.2 4.6 4.6 0 003.2 1.2c1.3.1 5.6.1 6.9 0a4.6 4.6 0 003.2-1.2A4.5 4.5 0 0020 14.6c.1-1.3.1-5.3 0-6.6zm-1.7 8a2.6 2.6 0 01-1.4 1.4c-1 .4-3.3.3-4.4.3s-3.4.1-4.4-.3a2.6 2.6 0 01-1.4-1.4c-.4-1-.3-3.3-.3-4.4s-.1-3.4.3-4.4a2.6 2.6 0 011.4-1.4c1-.4 3.3-.3 4.4-.3s3.4-.1 4.4.3a2.6 2.6 0 011.4 1.4c.4 1 .3 3.3.3 4.4s.1 3.4-.3 4.4z' },
  ];

  const team = [
    { name: 'M. Jesheeba Fathima', role: 'Digital Growth Specialist', bio: 'Driving strategic digital transformation and growth initiatives for businesses.', photo: '/team/jesheeba-fathima.jpg' },
    { name: 'SS. Monisha', role: 'AI Automation Engineer', bio: 'Building intelligent AI-driven automation & delivering AI-enabled automation systems.', photo: '/team/monisha.jpg' },
    { name: 'S. Sayed Salman', role: 'AI Solution Engineer', bio: 'Helping business automate workflows & uncover insights with Data + AI', photo: '/team/sayed-salman.jpg' },
    { name: 'Abdul Samad', role: 'AI Solution Engineer', bio: 'Developing intelligent automation systems and AI-powered solutions.', photo: '/team/abdul-samad.jpg' },
    { name: 'I. Aakash Kummar', role: 'AI Automation Engineer', bio: 'Creating scalable AI workflows and automation systems.', photo: '/team/aakash-kummar.jpg' },
  ];

  return (
    <main className={`relative min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-500/30 text-white bg-[#060608]`}>
      {/* WebGL particle mark, fixed behind the page content */}
      <SirahCanvas />

      <div className="pointer-events-auto">
        <Navbar />
      </div>

      <div className="relative z-10 w-full">
        
        {/* HERO — copy holds the left column, the 3D mark sits in the right */}
        <section id="hub" className="min-h-screen max-w-6xl mx-auto px-6 pt-[72px] grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          <div className="max-w-xl">
            <Reveal>
              <span className={`inline-block text-xs uppercase tracking-[0.3em] font-semibold border px-3 py-1 rounded-full mb-6 text-blue-400 border-blue-500/20 bg-blue-500/5`}>
                Sirah Digital
              </span>
            </Reveal>
            <Reveal delay={90}>
              <AnimatedHeading
                as="h1"
                text="Building intelligent systems that automate, simplify, and scale."
                stagger={45}
                className="text-4xl md:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              />
            </Reveal>
            <Reveal delay={180}>
              <p className={`mt-6 text-lg md:text-xl leading-relaxed text-gray-400`}>
                Empowering 10,000+ businesses through custom AI-powered solutions, bespoke software applications, and purpose-driven engineering.
              </p>
            </Reveal>
            <Reveal delay={270}>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#contact" className="px-6 py-3 rounded-full font-medium text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:opacity-90 shadow-lg shadow-indigo-500/20 transition-all pointer-events-auto">
                  Start an automation audit
                </a>
                <a href="#work" className={`px-6 py-3 rounded-full font-medium border transition-all pointer-events-auto border-white/10 bg-white/5 hover:bg-white/10`}>
                  See our work
                </a>
              </div>
            </Reveal>
          </div>
          {/* Right column is intentionally empty — the WebGL mark occupies it */}
          <div aria-hidden className="hidden lg:block" />
        </section>

        {/* METHODOLOGY */}
        <section id="process" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <AnimatedHeading text="Our Methodology" className="text-4xl font-bold" />
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { t: 'Automate', c: 'text-blue-500', d: 'Eliminate repetitive workflow structures with high-availability enterprise AI agents.', h: 'hover:border-blue-500/40' },
              { t: 'Simplify', c: 'text-purple-500', d: 'Deconstruct complex operations into intuitive, custom software applications.', h: 'hover:border-purple-500/40' },
              { t: 'Scale', c: 'text-pink-500', d: 'Launch cloud-ready API infrastructures positioned to grow alongside your business.', h: 'hover:border-pink-500/40' },
            ].map((m, i) => (
              <Reveal key={m.t} delay={i * 120} className="h-full">
                <SpotlightCard className={`h-full p-8 backdrop-blur-xl rounded-3xl border pointer-events-auto transition-all duration-300 hover:-translate-y-1.5 ${m.h} bg-[#0a0a0d]/70 border-white/5 hover:shadow-2xl hover:shadow-indigo-500/10`}>
                  <h3 className={`text-2xl font-semibold ${m.c}`}>{m.t}</h3>
                  <p className={`mt-4 text-sm text-gray-400`}>{m.d}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* WHAT WE BUILD */}
        <section id="offer" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-24">
          <Reveal>
            <div className="mb-16">
              <AnimatedHeading text="What We Build" className="text-4xl font-bold" />
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreCapabilities.map((cap, i) => (
              <Reveal key={i} delay={(i % 2) * 90} className="h-full">
                <SpotlightCard className={`group h-full p-6 backdrop-blur-md rounded-2xl border pointer-events-auto transition-all duration-300 hover:-translate-y-1 bg-[#0c0c10]/40 border-white/5 hover:border-indigo-500/30 hover:bg-[#0c0c10]/70`}>
                  <span className="flex gap-4 items-start">
                  <span className="text-indigo-500 font-mono text-sm mt-1 transition-transform duration-300 group-hover:scale-110">[0{i + 1}]</span>
                  <div>
                    <h4 className="text-lg font-semibold">{cap.title}</h4>
                    <p className={`mt-2 text-sm text-gray-400`}>{cap.desc}</p>
                  </div>
                  </span>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* PROJECT DEPLOYMENT HUB */}
        <section id="work" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-24">
          <Reveal>
            <div className="mb-16">
              <AnimatedHeading text="Project Deployment Hub" className="text-4xl font-bold" />
              <p className={`mt-4 text-gray-400`}>Review running enterprise production systems alongside ongoing digital R&D initiatives.</p>
            </div>
          </Reveal>

          <div className="mb-16">
            <Reveal>
              <div className="flex items-center gap-3 mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-semibold text-emerald-500 tracking-wide uppercase">Active Production Systems</h3>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productionProjects.map((proj, idx) => (
                <Reveal key={idx} delay={idx * 110} className="h-full">
                  <SpotlightCard glow="rgba(16, 185, 129, 0.14)" className={`h-full p-6 backdrop-blur-lg rounded-2xl border transition-all duration-300 pointer-events-auto hover:-translate-y-1.5 bg-[#0a0a0d]/50 border-white/5 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10`}>
                    <span className="text-xs uppercase tracking-wider text-emerald-500">{proj.client}</span>
                    <h4 className="mt-3 text-xl font-semibold">{proj.title}</h4>
                    <p className={`mt-3 text-sm leading-relaxed text-gray-400`}>{proj.desc}</p>
                    <div className={`mt-6 pt-4 border-t text-sm font-medium text-emerald-500 border-white/5`}>{proj.impact}</div>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <Reveal>
              <div className="flex items-center gap-3 mb-8">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-amber-500 tracking-wide uppercase">In Active Development</h3>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {developmentProjects.map((proj, idx) => (
                <Reveal key={idx} delay={idx * 110} className="h-full">
                  <SpotlightCard glow="rgba(245, 158, 11, 0.14)" className={`h-full p-6 backdrop-blur-lg rounded-2xl border transition-all duration-300 pointer-events-auto hover:-translate-y-1.5 bg-[#0a0a0d]/50 border-white/5 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full text-amber-500 bg-amber-500/10 border border-amber-500/20`}>{proj.phase}</span>
                      <span className="text-xs font-mono text-gray-500">{proj.stack}</span>
                    </div>
                    <h4 className="mt-4 text-xl font-semibold">{proj.title}</h4>
                    <p className={`mt-3 text-sm leading-relaxed text-gray-400`}>{proj.desc}</p>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TARGET INDUSTRIES */}
        <section id="industries" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-24">
          <Reveal>
            <div className="max-w-2xl mb-16">
              <AnimatedHeading text="Target Industries" className="text-4xl font-bold" />
              <p className={`mt-4 text-gray-400`}>Delivering domain-specific AI automation solutions engineered for highly specialized corporate segments.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {niches.map((niche, index) => (
              <Reveal key={index} delay={(index % 3) * 90} className="h-full">
                <SpotlightCard
                  glow="rgba(129, 140, 248, 0.16)"
                  className={`h-full p-6 backdrop-blur-lg rounded-2xl border transition-all duration-300 shadow-lg pointer-events-auto group hover:-translate-y-1.5 bg-[#0a0a0d]/50 border-white/5 hover:border-indigo-500/30 hover:bg-[#0c0c12]/80`}
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <h4 className="text-xl font-semibold">{niche.title}</h4>
                  <p className={`mt-3 text-sm leading-relaxed text-gray-400`}>{niche.desc}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* BRAINS — founder panel beside the wider team */}
        <section id="brains" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-24">
          {/* Stretch, not start-align, so the founder panel runs the full
              height of the team column beside it */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 lg:gap-16 items-stretch">

            {/* Founder */}
            <Reveal className="h-full">
              {/* Sizes step up at lg, where the panel is stretched tall — keeps
                  the content filling the box instead of floating in the middle */}
              <div className={`group h-full flex flex-col justify-center rounded-3xl border p-8 lg:p-10 text-center relative overflow-hidden pointer-events-auto bg-gradient-to-b from-[#0b1c2b] via-[#0a1220] to-[#0b0714] border-white/10`}>
                <div className="absolute -top-20 -left-16 w-56 h-56 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />
                <Avatar
                  src={founder.photo}
                  name={founder.name}
                  textClass="text-6xl"
                  className="w-48 h-48 lg:w-64 lg:h-64 rounded-full mx-auto relative ring-4 ring-cyan-400/30 shadow-xl"
                />
                <h3 className="mt-8 lg:mt-10 text-2xl lg:text-[2rem] font-bold uppercase tracking-wide leading-tight">{founder.name}</h3>
                <p className="mt-3 lg:mt-4 text-base lg:text-xl font-semibold text-cyan-400">{founder.role}</p>
                <p className={`mt-5 lg:mt-7 text-sm lg:text-base leading-relaxed text-gray-400`}>{founder.bio}</p>

                <div className="mt-8 lg:mt-10 flex justify-center gap-3 lg:gap-4">
                  {founderSocials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      target={s.href.startsWith('http') ? '_blank' : undefined}
                      rel={s.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                      className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full grid place-items-center border transition-colors border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400/60`}
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor"><path d={s.path} /></svg>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* The rest of the team */}
            <div>
              <Reveal>
                <AnimatedHeading
                  text="Meet Our Brains"
                  highlight="Brains"
                  className="text-4xl md:text-5xl font-bold"
                />
                <div className="mt-4 h-1 w-56 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-transparent" />
              </Reveal>

              {/* Wrapping flex, not a grid — it centres the final short row */}
              <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-14">
                {team.map((member, i) => (
                  <Reveal key={i} delay={i * 100} className="w-full sm:w-[46%] lg:w-[30%]">
                    <div className="text-center group">
                      <Avatar
                        src={member.photo}
                        name={member.name}
                        textClass="text-3xl"
                        className="w-36 h-36 rounded-full mx-auto ring-2 ring-cyan-400/40 shadow-lg transition-transform duration-500 group-hover:scale-105"
                      />
                      <h4 className="mt-6 text-lg font-bold uppercase tracking-wide">{member.name}</h4>
                      <p className="mt-2 text-cyan-400">{member.role}</p>
                      <p className={`mt-3 text-sm leading-relaxed text-gray-400`}>{member.bio}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">

            {/* Booking card + company details */}
            <div>
              <Reveal>
                <div className={`rounded-2xl border p-8 relative overflow-hidden pointer-events-auto bg-gradient-to-br from-[#0d2030] via-[#0b1524] to-[#12102a] border-cyan-400/20`}>
                  <svg viewBox="0 0 24 24" className="w-11 h-11 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="16" rx="3" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                  <h3 className="mt-6 text-2xl font-bold">Book Free Consultation</h3>
                  <p className={`mt-3 text-sm text-gray-400`}>
                    45 minutes strategy call with our AI experts.
                  </p>
                  {/* TODO: point at the real booking link (Calendly / Google Calendar) */}
                  <a
                    href="#send-message"
                    className="mt-7 w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-opacity"
                  >
                    Schedule Now
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </a>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <ul className="mt-10 space-y-6">
                  <li>
                    <a href={`mailto:${COMPANY.email}`} className={`flex items-center gap-4 transition-colors text-gray-200 hover:text-white`}>
                      <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0 text-cyan-400" fill="currentColor"><path d="M3 6.5A1.5 1.5 0 014.5 5h15A1.5 1.5 0 0121 6.5v11a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-11zm2.2.5l6.8 5 6.8-5H5.2z" /></svg>
                      <span className="text-lg">{COMPANY.email}</span>
                    </a>
                  </li>
                  <li>
                    <a href={COMPANY.phoneHref} className={`flex items-center gap-4 transition-colors text-gray-200 hover:text-white`}>
                      <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0 text-cyan-400" fill="currentColor"><path d="M6.6 3h-2A1.6 1.6 0 003 4.7C3 13.1 10.9 21 19.3 21a1.6 1.6 0 001.7-1.6v-2a1 1 0 00-.8-1l-3.4-.7a1 1 0 00-1 .4l-1 1.3a13 13 0 01-5.2-5.2l1.3-1a1 1 0 00.4-1l-.7-3.4a1 1 0 00-1-.8z" /></svg>
                      <span className="text-lg">{COMPANY.phone}</span>
                    </a>
                  </li>
                  <li className={`flex items-start gap-4 text-gray-300`}>
                    <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0 text-cyan-400 mt-0.5" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1114.5 9 2.5 2.5 0 0112 11.5z" /></svg>
                    <address className="not-italic text-lg leading-relaxed">{COMPANY.addressOneLine}</address>
                  </li>
                </ul>
              </Reveal>
            </div>

            {/* Message form */}
            <Reveal delay={80}>
              <div id="send-message" className={`rounded-2xl border p-8 md:p-10 scroll-mt-28 pointer-events-auto bg-[#0a0d15]/70 border-white/10 backdrop-blur-xl`}>
                <AnimatedHeading text="Send us a message" className="text-3xl font-bold" />

                <form
                  onSubmit={submitLead}
                  className="mt-8 space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <input
                      type="text" required placeholder="First Name" aria-label="First Name"
                      className={inputClass}
                      value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                    <input
                      type="text" placeholder="Last Name" aria-label="Last Name"
                      className={inputClass}
                      value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <input
                      type="email" required placeholder="Email" aria-label="Email"
                      className={inputClass}
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <input
                      type="tel" required placeholder="Phone (WhatsApp)" aria-label="Phone"
                      className={inputClass}
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <input
                    type="text" placeholder="Company" aria-label="Company"
                    className={inputClass}
                    value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />

                  <textarea
                    rows={5} required placeholder="Your automation needs" aria-label="Your automation needs"
                    className={`${inputClass} resize-y min-h-[140px]`}
                    value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />

                  {/* Honeypot: hidden from people, catnip for bots */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                    value={form.website || ''}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full px-6 py-4 rounded-xl font-bold text-[#04121a] bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? 'Sending…' : 'Submit'}
                  </button>

                  {statusMessage && (
                    <p
                      role="status"
                      aria-live="polite"
                      className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
                    >
                      {statusMessage}
                    </p>
                  )}
                </form>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
