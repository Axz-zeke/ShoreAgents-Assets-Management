"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Package, 
  ShieldCheck, 
  QrCode, 
  BarChart3, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Smartphone,
  Zap,
  LayoutDashboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">ShoreAgents <span className="text-primary">Assets</span></span>
          </div>
          
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Features</Link>
            <Link href="#tech-stack" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Technology</Link>
            <Link href="#security" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Security</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Link href="/dashboard">
                Go to Dashboard
                <LayoutDashboard className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
          
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 px-4 py-1 text-primary">
              <Zap className="mr-2 h-3.5 w-3.5 fill-primary" />
              Revolutionizing Asset Tracking
            </Badge>
            
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              Manage Your Assets with <br />
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Precision & Efficiency</span>
            </h1>
            
            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              The ultimate high-performance asset management solution for ShoreAgents. 
              Track inventory, generate QR codes, and manage employee assignments in real-time.
            </p>
            
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Link href="/dashboard">
                  Launch Platform
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg font-bold backdrop-blur-sm">
                <Link href="/login">Admin Login</Link>
              </Button>
            </div>

            {/* Visual Mockup/Illustration */}
            <div className="relative mt-20 overflow-hidden rounded-2xl border bg-card/50 p-4 shadow-2xl backdrop-blur-sm md:mt-24">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-background/50 p-6 text-left shadow-sm transition-all hover:border-primary/50 group">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">QR Ecosystem</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Automated QR generation and live mobile scanning for every unique asset.</p>
                </div>
                <div className="rounded-xl border bg-background/50 p-6 text-left shadow-sm transition-all hover:border-emerald-500/50 group">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Enterprise Security</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Role-based access control and RLS-hardened database for total data protection.</p>
                </div>
                <div className="rounded-xl border bg-background/50 p-6 text-left shadow-sm transition-all hover:border-blue-500/50 group">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Smart Analytics</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Real-time financial tracking, depreciation reports, and inventory health metrics.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted/30 py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Everything You Need To SCALE</h2>
              <p className="mt-4 text-muted-foreground">Built for the demanding needs of ShoreAgents professional operations.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Dynamic Categories", icon: Layers, desc: "Create custom asset categories with specific tracking fields." },
                { title: "Employee Sync", icon: Users, desc: "Assign assets to employees with full history tracking." },
                { title: "Mobile Ready", icon: Smartphone, desc: "Fully responsive design for field tracking on any device." },
                { title: "Audit Ready", icon: CheckCircle2, desc: "Total transparency for financial audits and inventory checks." },
                { title: "Fast Workflows", icon: Zap, desc: "Optimized data entry with dynamic typing and search suggestions." },
                { title: "Global Settings", icon: LayoutDashboard, desc: "Multi-timezone and multi-currency support for global sites." }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack Highlights */}
        <section id="tech-stack" className="py-24 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-16 text-3xl font-bold">Cutting-Edge Tech Stack</h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-12">
              <TechBadge name="Next.js 15" color="bg-black text-white" />
              <TechBadge name="React 19" color="bg-blue-500/10 text-blue-500" />
              <TechBadge name="TypeScript" color="bg-blue-600/10 text-blue-600" />
              <TechBadge name="Tailwind CSS 4" color="bg-cyan-500/10 text-cyan-500" />
              <TechBadge name="Supabase" color="bg-emerald-500/10 text-emerald-500" />
              <TechBadge name="PostgreSQL" color="bg-indigo-500/10 text-indigo-500" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 grayscale brightness-50 contrast-200 opacity-50">
               <Package className="h-5 w-5" />
               <span className="font-bold underline decoration-primary underline-offset-4 decoration-2">ShoreAgents Assets</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 ShoreAgents Assets Management. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Documentation</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function TechBadge({ name, color }: { name: string, color: string }) {
  return (
    <div className={`rounded-full px-6 py-2 text-sm font-black uppercase tracking-wider shadow-sm border ${color}`}>
      {name}
    </div>
  )
}
