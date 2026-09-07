'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

type WorkspaceModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: 'medium' | 'large' | 'wide';
};

const widths = {
  medium: 'max-w-3xl',
  large: 'max-w-5xl',
  wide: 'max-w-7xl',
} as const;

export function WorkspaceModal({ open, title, onClose, children, width = 'large' }: WorkspaceModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[92dvh] w-full ${widths[width]} flex-col overflow-hidden rounded-[2rem] border border-white/30 bg-white shadow-2xl shadow-slate-950/30 sm:rounded-[3rem]`}
      >
        <h2 id={titleId} className="sr-only">{title}</h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={`Tutup ${title}`}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white/95 text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:right-6 sm:top-6"
        >
          <X size={18} aria-hidden="true" />
        </button>
        <div className="rc-workspace-modal-body min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </section>
    </div>
  );
}
