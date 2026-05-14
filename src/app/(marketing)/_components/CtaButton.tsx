'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CtaButtonProps {
  href: string;
  label: string;
}

export function CtaButton({ href, label }: CtaButtonProps) {
  return (
    <>
      <style>{`
        .flux-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 52px;
          padding: 0 36px;
          background: #f4a02b;
          color: #5a2208;
          font-family: var(--font-archivo);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          overflow: hidden;
          cursor: pointer;
          border: none;
          outline: none;
          border-radius: 9999px;
        }

        .flux-btn::before,
        .flux-btn::after,
        .flux-btn .corner-bl,
        .flux-btn .corner-br {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background: #5a2208;
          border-radius: 9999px;
          transition: border-radius 0.4s ease, width 0.4s ease, height 0.4s ease;
          z-index: 1;
        }

        .flux-btn::before  { top: 0;    left: 0; }
        .flux-btn::after   { top: 0;    right: 0; }
        .flux-btn .corner-bl { bottom: 0; left: 0; }
        .flux-btn .corner-br { bottom: 0; right: 0; }

        .flux-btn:hover::before,
        .flux-btn:hover::after,
        .flux-btn:hover .corner-bl,
        .flux-btn:hover .corner-br {
          width: 100%;
          height: 100%;
          border-radius: 26px;
        }

        .flux-btn:hover::before  { border-radius: 0 26px 26px 26px; }
        .flux-btn:hover::after   { border-radius: 26px 0 26px 26px; }
        .flux-btn:hover .corner-bl { border-radius: 26px 26px 26px 0; }
        .flux-btn:hover .corner-br { border-radius: 26px 26px 0 26px; }

        .flux-btn .flux-label {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.3s ease;
        }

        .flux-btn:hover .flux-label {
          color: #f4a02b;
        }
      `}</style>
      <Link href={href} className="flux-btn">
        <span className="corner-bl" />
        <span className="corner-br" />
        <span className="flux-label">
          {label}
          <ArrowRight size={16} strokeWidth={2.5} />
        </span>
      </Link>
    </>
  );
}
