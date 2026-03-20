"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import BottomBar from "@/components/layout/BottomBar";
import { SectionLabel } from "@/components/ui/Badge";
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Zap,
  DollarSign
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <SectionLabel label="Welcome Back" className="mb-4" />
            <h2 className="text-5xl font-serif tracking-tight text-foreground leading-[1.1]">
              Halo, <span className="gradient-text font-serif">Mentee Hipers!</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<Clock className="text-accent" />} label="Sesi" value="12 / 24" />
          <StatCard icon={<CheckCircle2 className="text-emerald-500" />} label="Tasks" value="18" />
          <StatCard icon={<Zap className="text-amber-500" />} label="Ide" value="42" />
          <StatCard icon={<DollarSign className="text-blue-500" />} label="Bayar" value="Lancar" variant="accent" />
        </div>
      </main>
      
      <BottomBar />
    </div>
  );
}

const StatCard = ({ icon, label, value, variant }: any) => (
  <div className={`p-6 rounded-3xl group transition-all duration-300 ${
    variant === "accent" ? "bg-slate-900 text-white shadow-xl" : "bg-white border border-border shadow-sm"
  }`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${variant === "accent" ? "bg-white/10" : "bg-muted/50"}`}>
      {icon}
    </div>
    <p className={`text-sm font-medium ${variant === "accent" ? "text-slate-400" : "text-muted-foreground"}`}>{label}</p>
    <h4 className="text-3xl font-bold mt-1 font-serif">{value}</h4>
  </div>
);
