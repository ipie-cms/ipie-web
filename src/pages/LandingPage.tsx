import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  Bot,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Database,
  FileText,
  FolderKanban,
  Gavel,
  Handshake,
  LifeBuoy,
  Landmark,
  Layers,
  Mail,
  MapPin,
  Minus,
  Network,
  Phone,
  Plus,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  Users,
  Vote,
  Workflow,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const NAV_LINKS = ['Home', 'About', 'Services'] as const

const STATS = [
  { icon: Scale, value: '540+', label: 'Resolved Cases' },
  { icon: Building2, value: '540+', label: 'Registered Entities' },
  { icon: Landmark, value: '100', label: 'Courts Connected' },
  { icon: MapPin, value: '25+', label: 'States and UTs' },
]

const PILLARS = [
  { name: 'MCA', logo: '/assets/pillars/mca.svg' },
  { name: 'IBBI', logo: '/assets/pillars/ibbi.svg' },
  { name: 'NCLT', logo: '/assets/pillars/nclt.svg' },
  { name: 'NeSL', logo: '/assets/pillars/nesl.svg' },
]

const HERO_ORBIT_ICONS = [Scale, Building2, Landmark, Handshake, ShieldCheck, FileText, Users, Vote]

const ABOUT_PETALS = [
  { icon: FolderKanban, label: 'Case Mgmt' },
  { icon: FileText, label: 'Claims' },
  { icon: Handshake, label: 'Stakeholders' },
  { icon: Gavel, label: 'Resolution' },
  { icon: ClipboardCheck, label: 'Compliance' },
  { icon: Vote, label: 'E-Voting' },
  { icon: ShieldCheck, label: 'Security' },
  { icon: BarChart3, label: 'Analytics' },
]

const HIGHLIGHTS = [
  {
    number: '01',
    icon: Database,
    title: 'Single Source of Truth',
    description:
      'A well-established repository of accurate, real-time and non-duplicated information for all IBC stakeholders.',
  },
  {
    number: '02',
    icon: Layers,
    title: 'Integrated Digital Ecosystem',
    description:
      'Seamlessly connects IBBI, NCLT, insolvency professionals and other stakeholders on one platform.',
  },
  {
    number: '03',
    icon: Workflow,
    title: 'End-to-End Process Automation',
    description:
      'Digitises case movement across every process, reducing manual intervention and ensuring faster resolution.',
  },
  {
    number: '04',
    icon: RefreshCw,
    title: 'Real-Time Collaboration',
    description:
      'Enables faster information sharing, stakeholder communication, meetings, e-voting and secure workflows.',
  },
  {
    number: '05',
    icon: ShieldCheck,
    title: 'Secure & Transparent Platform',
    description:
      'Safeguards information integrity and ensures compliance with regulatory frameworks throughout.',
  },
  {
    number: '06',
    icon: BarChart3,
    title: 'Data-Driven Intelligence',
    description:
      'Empowers regulators and stakeholders with integrated dashboards and analytical capabilities.',
  },
]

const SERVICES = [
  {
    icon: FolderKanban,
    title: 'Unified Case Management',
    description:
      'Streamline insolvency and bankruptcy proceedings from case initiation through resolution and closure.',
  },
  {
    icon: FileText,
    title: 'Claims Management',
    description:
      'Digitise the complete claims cycle with secure validation, collation, verification and settlement workflows.',
  },
  {
    icon: Handshake,
    title: 'Stakeholder Management',
    description:
      'Facilitate collaboration across creditors, resolution professionals, regulators and other stakeholders.',
  },
  {
    icon: Gavel,
    title: 'Resolution & Liquidation Management',
    description:
      'Support e-auctions, liquidation, distribution, resolution plan submission, evaluation and finalisation.',
  },
  {
    icon: ClipboardCheck,
    title: 'Compliance & Reporting',
    description:
      'Simplify regulatory compliance with automated statutory reports, audit trails and monitoring tools.',
  },
  {
    icon: Vote,
    title: 'Virtual Data Rooms & E-Voting',
    description:
      'Provide a secure virtual space for document sharing, e-voting and confidential collaboration.',
  },
]

const MINISTERS = [
  {
    name: 'Smt. Nirmala Sitharaman',
    title: "Hon'ble Finance Minister",
    bio: 'Leading India’s insolvency and bankruptcy reforms with a vision for a transparent, efficient ecosystem.',
    photo: '/assets/ministers/minister-1.svg',
  },
  {
    name: 'Shri Harsh Malhotra',
    title: "Hon'ble Minister of State",
    bio: 'Committed to strengthening corporate governance and advancing digitisation across the insolvency ecosystem.',
    photo: '/assets/ministers/minister-2.svg',
  },
]

const NEWS = [
  {
    category: 'Announcement',
    date: 'January 7, 2026',
    title: 'iPIE Platform 2.0 Launched',
    image: '/assets/news/news-1.svg',
  },
  {
    category: 'Update',
    date: 'January 7, 2026',
    title: 'Integration with e-Courts Goes Live',
    image: '/assets/news/news-2.svg',
  },
  {
    category: 'News',
    date: 'January 7, 2026',
    title: 'National IBC Conference for 2026',
    image: '/assets/news/news-3.svg',
  },
  {
    category: 'Circular',
    date: 'January 7, 2026',
    title: 'New Compliance Guidelines Issued',
    image: '/assets/news/news-4.svg',
  },
]

const FAQS = [
  {
    question: 'What is iPIE?',
    answer:
      'iPIE (Integrated Platform for IBC Ecosystem) is a unified digital platform connecting all stakeholders of the insolvency and bankruptcy ecosystem for seamless information sharing, transparency and efficient resolution.',
  },
  {
    question: 'How it Works?',
    answer:
      'iPIE connects regulators, courts, insolvency professionals and other stakeholders on a single platform, digitising case management, claims, compliance and reporting end to end.',
  },
  {
    question: 'Does iPIE charge any fees for its services?',
    answer:
      'Fee details vary by service and stakeholder category - see the Services section above or contact support for specifics.',
  },
  {
    question: 'Is iPIE secure?',
    answer:
      'Yes - iPIE is built on a secure, transparent platform with access controls, audit trails and compliance with applicable regulatory and data-protection requirements.',
  },
]

function Logo({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const isDark = tone === 'dark'
  return (
    <Link
      to="/"
      className={`flex items-center gap-2 font-serif font-semibold ${isDark ? 'text-blue-900' : 'text-white'}`}
    >
      <span
        className={`flex size-8 items-center justify-center rounded-md ${isDark ? 'bg-blue-900 text-white' : 'bg-white/15'}`}
      >
        <Network className="size-4" />
      </span>
      iPIE
    </Link>
  )
}

function OrbitIllustration() {
  const radius = 110
  const icons = HERO_ORBIT_ICONS
  return (
    <div className="relative mx-auto size-64 shrink-0 sm:size-72">
      <div className="absolute inset-0 rounded-full border border-dashed border-blue-300" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg">
          iPIE
        </div>
      </div>
      {icons.map((Icon, index) => {
        const angle = (index / icons.length) * 2 * Math.PI - Math.PI / 2
        const x = radius * Math.cos(angle)
        const y = radius * Math.sin(angle)
        return (
          <div
            key={index}
            className="absolute flex size-10 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-sm"
            style={{ left: `calc(50% + ${x}px - 1.25rem)`, top: `calc(50% + ${y}px - 1.25rem)` }}
          >
            <Icon className="size-4" />
          </div>
        )
      })}
    </div>
  )
}

function AboutDiagram() {
  const radius = 128
  const petals = ABOUT_PETALS
  return (
    <div className="relative mx-auto size-72 shrink-0">
      <div
        className="absolute inset-8 rounded-full"
        style={{
          background:
            'conic-gradient(from 0deg, #bfdbfe 0deg 45deg, #a5b4fc 45deg 90deg, #bbf7d0 90deg 135deg, #fde68a 135deg 180deg, #fbcfe8 180deg 225deg, #c7d2fe 225deg 270deg, #99f6e4 270deg 315deg, #fecaca 315deg 360deg)',
        }}
      />
      <div className="absolute inset-16 flex items-center justify-center rounded-full bg-white shadow-inner">
        <span className="text-lg font-bold text-blue-700">iPIE</span>
      </div>
      {petals.map(({ icon: Icon, label }, index) => {
        const angle = (index / petals.length) * 2 * Math.PI - Math.PI / 2
        const x = radius * Math.cos(angle)
        const y = radius * Math.sin(angle)
        return (
          <div
            key={label}
            className="absolute flex w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-lg border border-blue-100 bg-white px-1.5 py-1.5 text-center shadow-sm"
            style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
          >
            <Icon className="size-3.5 text-blue-600" />
            <span className="text-[9px] font-medium leading-tight text-slate-600">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/50">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium"
        aria-expanded={open}
      >
        {question}
        {open ? <Minus className="size-4 shrink-0" /> : <Plus className="size-4 shrink-0" />}
      </button>
      {open && <p className="px-5 pb-4 text-sm text-muted-foreground">{answer}</p>}
    </div>
  )
}

export function LandingPage() {
  const [resourcesOpen, setResourcesOpen] = useState(false)

  return (
    <div className="min-h-svh bg-white text-slate-900">
      <header className="sticky top-0 z-20">
        <div className="bg-blue-800 text-white">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-1.5 text-xs">
            <span className="hidden items-center gap-2 text-blue-100 sm:flex">
              <Landmark className="size-3.5" />
              Ministry of Corporate Affairs, Government of India
            </span>

            <div className="relative ml-auto hidden max-w-xs flex-1 items-center sm:flex">
              <Search className="pointer-events-none absolute left-2.5 size-3.5 text-blue-200" />
              <input
                type="search"
                placeholder="Search"
                className="w-full rounded-md bg-white/10 py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-blue-200 outline-none focus:bg-white/20"
              />
            </div>

            <button
              type="button"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1 font-medium text-blue-800 hover:bg-blue-50"
            >
              <LifeBuoy className="size-3.5" />
              Need Assistance
            </button>
          </div>
        </div>

        <div className="border-b bg-white text-slate-700">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
            <Logo tone="dark" />

            <nav className="ml-auto hidden items-center gap-6 text-sm font-medium md:flex">
              {NAV_LINKS.map((link, index) => (
                <a
                  key={link}
                  href="#"
                  className={index === 0 ? 'text-blue-700' : 'hover:text-blue-700'}
                >
                  {link}
                </a>
              ))}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setResourcesOpen((value) => !value)}
                  className="flex items-center gap-1 hover:text-blue-700"
                >
                  Resources
                  <ChevronDown className="size-3.5" />
                </button>
                {resourcesOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 rounded-md border bg-white py-1 text-slate-900 shadow-lg">
                    {['Guidelines', 'FAQs', 'Downloads'].map((item) => (
                      <a key={item} href="#" className="block px-3 py-2 text-sm hover:bg-slate-50">
                        {item}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="border-blue-200 text-blue-700">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section
        className="relative overflow-hidden bg-blue-50 pb-24 pt-16"
        style={{
          backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 md:flex-row">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Integrated Platform for IBC Ecosystem
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              A unified digital platform connecting all stakeholders of the insolvency and
              bankruptcy code ecosystem for seamless information sharing, transparency and efficient
              resolution.
            </p>
            <Button size="lg" className="mt-6 bg-blue-600 text-white hover:bg-blue-700">
              Learn more
            </Button>
          </div>
          <OrbitIllustration />
        </div>

        <div className="mx-auto -mb-32 mt-12 max-w-5xl px-6">
          <Card className="relative grid grid-cols-2 gap-6 rounded-2xl p-8 shadow-xl sm:grid-cols-4">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Icon className="size-5" />
                </span>
                <span className="text-2xl font-bold text-slate-900">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}

            <button
              type="button"
              aria-label="Chat with iPIE assistant"
              className="absolute -right-6 -top-16 flex size-14 items-center justify-center rounded-full border-2 border-pink-300 bg-pink-500 text-white shadow-lg transition-transform hover:scale-105"
            >
              <Bot className="size-6" />
            </button>
          </Card>
        </div>
      </section>

      <section className="bg-white pb-16 pt-40">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-blue-200" />
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-blue-700">
              4 Pillars of IBC
            </p>
            <span className="h-px w-16 bg-blue-200" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.name}
                className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-slate-200"
              >
                <img src={pillar.logo} alt={`${pillar.name} emblem`} className="size-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-2xl font-bold text-slate-900">About iPIE</h2>
            <p className="mt-2 text-muted-foreground">
              Powerful capabilities designed for a seamless IBC experience
            </p>
          </div>
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <AboutDiagram />
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-serif text-2xl font-bold text-slate-900">
                Integrated Platform for IBC Ecosystem
              </h3>
              <p className="mt-4 text-muted-foreground">
                iPIE brings every stakeholder of the insolvency and bankruptcy ecosystem onto one
                connected platform - regulators, courts, insolvency professionals and creditors -
                enabling collaborative, transparent and efficient case resolution.
              </p>
              <Button className="mt-6 bg-blue-600 text-white hover:bg-blue-700">Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-2xl font-bold text-slate-900">Key Highlights</h2>
            <p className="mt-2 text-muted-foreground">
              Powerful capabilities designed for a seamless IBC experience
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HIGHLIGHTS.map(({ number, icon: Icon, title, description }) => (
              <Card key={number} className="p-6">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-blue-200">{number}</span>
                  <Icon className="size-5 text-blue-600" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                <a
                  href="#"
                  className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  Learn More
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-2xl font-bold text-slate-900">Our Services</h2>
            <p className="mt-2 text-muted-foreground">
              Designed to simplify every stage of the IBC ecosystem
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="bg-white p-6">
                <span className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                <a
                  href="#"
                  className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  Learn More
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center font-serif text-2xl font-bold text-slate-900">
            Our Ministers
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {MINISTERS.map(({ name, title, bio, photo }) => (
              <Card key={name} className="flex-row items-center gap-4 p-6">
                <img
                  src={photo}
                  alt={name}
                  className="size-20 shrink-0 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-muted-foreground">{title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{bio}</p>
                  <a
                    href="#"
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
                  >
                    Read more &rarr;
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-2xl font-bold text-slate-900">What's New</h2>
            <p className="mt-2 text-muted-foreground">
              Designed to simplify every stage of the IBC ecosystem
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {NEWS.map(({ category, date, title, image }) => (
              <Card key={title} className="overflow-hidden p-0">
                <img src={image} alt="" className="h-32 w-full object-cover" />
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                    {category}
                  </p>
                  <p className="text-xs text-muted-foreground">{date}</p>
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">{title}</h3>
                  <a
                    href="#"
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
                  >
                    Read more &rarr;
                  </a>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline">View all News</Button>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-10 text-center font-serif text-2xl font-bold text-slate-900">
            Frequently Asked Questions (FAQ&apos;s)
          </h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-blue-950 py-12 text-blue-100">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-blue-200">
              A digital platform connecting all stakeholders of the insolvency and bankruptcy
              ecosystem.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Get In Touch</p>
            <ul className="space-y-2 text-sm text-blue-200">
              <li className="flex items-center gap-2">
                <MapPin className="size-4" /> Ediscot, GOI Complex, New Delhi 110003
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" /> support@ipie.gov.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4" /> 011-XXXX-XXXX
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Policies</p>
            <ul className="space-y-2 text-sm text-blue-200">
              {[
                'Privacy Policy',
                'Terms of Use',
                'Security Policy',
                'Accessibility',
                'Disclaimer',
              ].map((policy) => (
                <li key={policy}>
                  <a href="#" className="hover:text-white">
                    {policy}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mb-3 mt-6 text-sm font-semibold text-white">Follow Us</p>
            <div className="flex gap-3">
              {[Twitter, Facebook, Linkedin, Instagram].map((Icon, index) => (
                <span
                  key={index}
                  className="flex size-8 items-center justify-center rounded-full bg-white/10"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-blue-300">
          &copy; {new Date().getFullYear()} iPIE - Integrated Platform for IBC Ecosystem. All rights
          reserved.
        </p>
      </footer>
    </div>
  )
}
