"use client";

import React from "react";
import SelectionContent from "@/app/ruang-sosmed/_core/SelectionContent";
import LoginContent from "@/app/ruang-sosmed/_core/LoginContent";
import BatchListContent from "@/app/ruang-sosmed/_core/BatchListContent";
import BatchContent from "@/app/ruang-sosmed/_core/BatchContent";
import AgencyListContent from "@/app/ruang-sosmed/_core/AgencyListContent";
import AgencyContent from "@/app/ruang-sosmed/_core/AgencyContent";
import PortalContent from "@/app/ruang-sosmed/_core/PortalContent";
import NotFoundContent from "@/app/ruang-sosmed/_core/NotFoundContent";
import QuizTemplatesContent from "@/app/ruang-sosmed/_core/QuizTemplatesContent";
import ArticleContent from "@/app/ruang-sosmed/_core/ArticleContent";

//THIS IS THE UNIVERSAL V2 CATCH-ALL ROUTER (Client-side version)
//Keep the route components as static client imports so the Pages Edge bundle
//does not reference async chunks that are unavailable at runtime.

export default function V2MasterRouterClient({ slug = [] }: { slug?: string[] }) {
  const renderContent = () => {
    if (slug.length === 0) return <SelectionContent/>;
    if (slug[0] === "login") return <LoginContent />;
    
    if (slug[0] === "batch") {
      if (slug[1]) return <BatchContent id={slug[1]} />;
      return <BatchListContent />;
    }
    
    if (slug[0] === "agency") {
      if (slug[1]) return <AgencyContent id={slug[1]} subTab={slug[2]} />;
      return <AgencyListContent />;
    }

    if (slug[0] === "admin") {
      if (slug[1] === "templates") return <QuizTemplatesContent />;
    }

    if (slug[0] === "board") {
      if (slug[1] && slug[2]) return <ArticleContent articleId={slug[2]} workspaceId={slug[1]} />;
    }
    
    if (slug[0]) {
      return <PortalContent id={slug[0]} />;
    }

    return <NotFoundContent />;
  };

  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
            Loading Ruang Sosmed...
          </p>
        </div>
      </div>
    }>
      {renderContent()}
    </React.Suspense>
  );
}
