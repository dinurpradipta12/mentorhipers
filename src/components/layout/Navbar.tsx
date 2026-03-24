"use client";

import React from "react";
import { Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-border/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold font-calistoga tracking-tight text-foreground">
            Mentor<span className="gradient-text">hipers</span>
          </h1>
          
          <div className="hidden md:flex items-center gap-6">
            <NavItem label="Program" active />
            <NavItem label="Schedule" />
            <NavItem label="Resources" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl hover:bg-muted transition-all relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent border-2 border-white" />
          </button>
          
          <div className="h-6 w-[1px] bg-border mx-1" />
          
          <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-border/50 hover:bg-muted/50 transition-all bg-white shadow-sm">
            <span className="text-xs font-medium text-muted-foreground px-2 hidden sm:inline">Admin</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] flex items-center justify-center text-white shadow-sm">
              <User className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ label, active = false }: { label: string; active?: boolean }) => (
  <a
    href="#"
    className={cn(
      "text-sm font-medium transition-colors hover:text-accent relative py-1",
      active ? "text-foreground" : "text-muted-foreground"
    )}
  >
    {label}
    {active && (
      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-accent rounded-full" />
    )}
  </a>
);

export default Navbar;
