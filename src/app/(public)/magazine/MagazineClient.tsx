'use client';

import { useState, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';

interface MagazineSettings {
  is_enabled: boolean;
}

interface MagazineIssue {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string;
  embed_url: string | null;
  embed_code: string | null;
  is_published: boolean;
  published_date: string;
}

// Renders an embed code string, executing any <script> tags inside it
function EmbedRenderer({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clear previous content
    el.innerHTML = '';

    const template = document.createElement('div');
    template.innerHTML = html;

    // Re-clone nodes so scripts can execute
    Array.from(template.childNodes).forEach(node => {
      if (node.nodeName === 'SCRIPT') {
        const script = document.createElement('script');
        const srcNode = node as HTMLScriptElement;
        // Copy attributes
        Array.from(srcNode.attributes).forEach(attr => {
          script.setAttribute(attr.name, attr.value);
        });
        script.textContent = srcNode.textContent;
        el.appendChild(script);
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });

    // Also look for any script tags nested inside non-script elements and re-execute them
    const innerScripts = Array.from(el.querySelectorAll('script'));
    innerScripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [html]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:border-none [&_iframe]:!max-w-full [&_iframe]:!max-h-full [&_a]:!block [&_a]:!w-full [&_a]:!h-full [&_a]:!max-w-full [&_a]:!max-h-full [&_div]:!w-full [&_div]:!h-full [&_div]:!max-w-full [&_div]:!max-h-full" 
    />
  );
}

export default function MagazineClient({ 
  settings, 
  issues 
}: { 
  settings: MagazineSettings | null;
  issues: MagazineIssue[];
}) {
  const [activeIssue, setActiveIssue] = useState<MagazineIssue | null>(issues.length > 0 ? issues[0] : null);

  // If magazine section is disabled globally or there are no published issues
  if (!settings?.is_enabled || issues.length === 0 || !activeIssue) {
    return (
      <div className="max-w-7xl mx-auto p-8 pt-12 md:pt-24 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <BookOpen className="w-16 h-16 text-slate-800 mb-6 opacity-50" />
        <h1 className="text-4xl md:text-5xl font-black mb-4">Interactive <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Magazine</span></h1>
        <p className="text-xl text-gray-400 font-bold uppercase tracking-widest max-w-lg">
          Our next issue is dropping soon. Stay tuned!
        </p>
      </div>
    );
  }

  const cleanIframeUrl = (val?: string | null) => {
    if (!val) return '';
    const match = val.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : val.trim();
  };

  const activeUrl = activeIssue.embed_code ? '' : cleanIframeUrl(activeIssue.embed_url);

  // Dynamically sanitize the embed HTML to disable lightboxes and force 100% dimensions on Flowpaper
  const sanitizedEmbedCode = activeIssue.embed_code
    ? activeIssue.embed_code
        .replace(/lightbox=["']true["']/gi, 'lightbox="false"')
        .replace(/data-fp-width=["'][^"']+["']/gi, 'data-fp-width="100%"')
        .replace(/data-fp-height=["'][^"']+["']/gi, 'data-fp-height="100%"')
    : '';

  return (
    <div className="w-full min-h-screen bg-black flex flex-col">
      {/* Featured Active Issue Player */}
      <div className="w-full h-[70vh] md:h-[80vh] bg-black relative border-b border-neutral-900 shrink-0 overflow-hidden">
        {activeIssue.embed_code ? (
          <EmbedRenderer key={activeIssue.id} html={sanitizedEmbedCode} />
        ) : (
          <iframe 
            src={activeUrl} 
            className="absolute inset-0 w-full h-full border-none"
            title={activeIssue.title}
            allowFullScreen
          />
        )}
      </div>

      {/* Issues Archive Section */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-16 bg-black">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-pink-500 font-bold text-xs uppercase tracking-widest">Library Archive</span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
              Magazine <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Issues</span>
            </h2>
          </div>
          <p className="text-neutral-400 text-sm max-w-md font-medium">
            Select any edition below to open it in the interactive reader above.
          </p>
        </div>

        {/* Responsive Issues Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {issues.map((issue) => {
            const isActive = issue.id === activeIssue.id;
            return (
              <button
                key={issue.id}
                onClick={() => {
                  setActiveIssue(issue);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col text-left group transition-all duration-300 focus:outline-none ${
                  isActive 
                    ? 'scale-[0.98] ring-2 ring-pink-500 ring-offset-4 ring-offset-black bg-neutral-900/50 p-2' 
                    : 'hover:-translate-y-1.5'
                }`}
              >
                {/* Cover Wrap */}
                <div className="aspect-[3/4] w-full bg-neutral-900 overflow-hidden relative border border-neutral-850 shadow-md">
                  <img 
                    src={issue.cover_image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600'} 
                    alt={issue.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  {isActive ? (
                    <div className="absolute inset-0 bg-pink-500/20 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-xl">
                        Reading
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="border border-white/40 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm bg-white/10 backdrop-blur-sm">
                        Open Issue
                      </span>
                    </div>
                  )}
                </div>

                {/* Cover Details */}
                <h3 className="text-sm font-extrabold text-white mt-4 line-clamp-1 group-hover:text-pink-500 uppercase tracking-tight transition-colors">
                  {issue.title}
                </h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                  {new Date(issue.published_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
