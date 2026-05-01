"use client";

import dynamic from "next/dynamic";
import React from "react";

//THIS IS THE UNIVERSAL V2 CATCH-ALL ROUTER (Client-side version)
//Moved to 'use client' to allow 'ssr: false' on dynamic imports, which is required
//for stabilizing the Edge bundle size while avoiding Server Component restrictions.

const SelectionContent = dynamic(() => import("@/app/ruang-sosmed/_core/SelectionContent"), { ssr: false });
const LoginContent = dynamic(() => import("@/app/ruang-sosmed/_core/LoginContent"), { ssr: false });
const BatchListContent = dynamic(() => import("@/app/ruang-sosmed/_core/BatchListContent"), { ssr: false });
const BatchContent = dynamic(() => import("@/app/ruang-sosmed/_core/BatchContent"), { ssr: false });
const AgencyListContent = dynamic(() => import("@/app/ruang-sosmed/_core/AgencyListContent"), { ssr: false });
const AgencyContent = dynamic(() => import("@/app/ruang-sosmed/_core/AgencyContent"), { ssr: false });
const PortalContent = dynamic(() => import("@/app/ruang-sosmed/_core/PortalContent"), { ssr: false });
const NotFoundContent = dynamic(() => import("@/app/ruang-sosmed/_core/NotFoundContent"), { ssr: false });
const QuizTemplatesContent = dynamic(() => import("@/app/ruang-sosmed/_core/QuizTemplatesContent"), { ssr: false });
const ArticleContent = dynamic(() => import("@/app/ruang-sosmed/_core/ArticleContent"), { ssr: false });

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
