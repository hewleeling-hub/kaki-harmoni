"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductComposition } from "./ProductComposition";
import {
  CloseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckIcon,
  InfoIcon,
  DropletIcon,
  SparklesIcon,
  WavesIcon,
} from "@/components/ui/icons";
import { businessConfig } from "@/config/business";
import type { Experience } from "@/config/experiences";

export function ExperienceModal({
  exp,
  onClose,
}: {
  exp: Experience;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus trap + ESC + body scroll lock; restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const pale = `rgba(${exp.glowRgb},0.16)`;
  const titleId = `exp-title-${exp.id}`;
  const price = `RM${businessConfig.pricing.prepay}`;

  const includes = [
    { icon: DropletIcon, text: `${exp.name} essential oils` },
    { icon: SparklesIcon, text: `${exp.name} herbal spa salt` },
    { icon: WavesIcon, text: "Warm foot soak" },
    { icon: ClockIcon, text: `${exp.duration.replace("mins", "minute")} experience` },
  ];

  return (
    <div
      className="warm fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-black/40 p-0 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fade-up relative flex w-full max-w-[1200px] flex-col overflow-hidden bg-cream shadow-[var(--shadow-warm-lg)] sm:max-h-[92vh] sm:rounded-[26px]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-ivory/90 text-olive-dark shadow-[var(--shadow-warm)] transition hover:bg-ivory"
        >
          <CloseIcon size={22} />
        </button>

        <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[45%_55%]">
          {/* LEFT — product visual */}
          <div className="p-4 sm:p-5 lg:p-6">
            <ProductComposition exp={exp} />
          </div>

          {/* RIGHT — information */}
          <div className="flex flex-col px-5 pb-5 pt-1 sm:px-7 lg:py-7 lg:pr-8">
            <h2 id={titleId} className="text-[32px] leading-[1.05] text-olive-dark sm:text-[42px]">
              {exp.name}
            </h2>
            <span
              className="mt-2 inline-block w-fit rounded-full px-3 py-1.5 text-[12.5px] font-semibold leading-none"
              style={{ background: pale, color: exp.accent }}
            >
              {exp.ingredients}
            </span>
            <p className="mt-3 text-[17px] font-semibold text-brown sm:text-[18px]">{exp.headline}</p>
            <p className="mt-2 max-w-[620px] text-[15px] leading-[1.55] text-muted">{exp.longDescription}</p>

            {/* Why you'll love it (from the product poster) */}
            {exp.benefits && exp.benefits.length > 0 && (
              <Section title="Why you'll love it">
                <ul className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
                  {exp.benefits.map((b) => (
                    <li key={b.title} className="flex gap-2.5">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: exp.accent }} />
                      <span>
                        <span className="block text-[14px] font-semibold text-olive-dark">{b.title}</span>
                        <span className="block text-[13.5px] leading-snug text-muted">{b.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                {exp.naturalNote && (
                  <p
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
                    style={{ background: pale, color: exp.accent }}
                  >
                    <CheckIcon size={15} />
                    {exp.naturalNote}
                  </p>
                )}
              </Section>
            )}

            {/* Perfect for */}
            <Section title="Perfect for">
              <div className="flex flex-wrap gap-2">
                {exp.perfectFor.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-[14px] border border-line bg-ivory px-3 py-2 text-[13.5px] font-medium text-olive-dark"
                  >
                    <CheckIcon size={16} style={{ color: exp.accent }} />
                    {item}
                  </span>
                ))}
              </div>
            </Section>

            {/* Your soak includes */}
            <Section title="Your soak includes">
              <ul className="grid gap-2.5 rounded-[16px] border border-line bg-ivory p-4 sm:grid-cols-2">
                {includes.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-[14.5px] text-olive-dark">
                    <span style={{ color: exp.accent }}>
                      <Icon size={18} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </Section>

            {/* What it feels like */}
            <Section title="What it feels like">
              <div className="flex flex-wrap gap-2">
                {exp.feels.map((f) => (
                  <span
                    key={f}
                    className="rounded-full px-3 py-1.5 text-[13px] font-semibold"
                    style={{ background: pale, color: exp.accent }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </Section>

            {/* Lotti says */}
            <div className="mt-5 flex items-center gap-3 rounded-[18px] border border-line bg-sage-light/50 p-4">
              <Image src="/lotti.png" alt="Lotti" width={64} height={64} className="h-14 w-14 shrink-0 object-contain" />
              <p className="text-[15px] italic text-brown" style={{ fontFamily: "var(--font-heading)" }}>
                <span className="mr-1 font-sans text-[12px] font-semibold uppercase not-italic tracking-wide text-olive">
                  Lotti says
                </span>
                <br className="hidden sm:block" />“{exp.lottiQuote}”
              </p>
            </div>

            {/* Good to know */}
            <div className="mt-4 flex items-start gap-2.5 text-[13px] leading-relaxed text-muted">
              <span className="mt-0.5 shrink-0 text-olive">
                <InfoIcon size={17} />
              </span>
              <p>
                <span className="font-semibold text-olive-dark">Good to know: </span>
                This experience is for relaxation and general wellness. If you have allergies,
                sensitive skin or any health conditions, please let our team know before your session.
              </p>
            </div>

            {/* Footer — price + book + see all */}
            <div className="mt-6 border-t border-line pt-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[18px] font-semibold text-olive-dark">
                  {price} <span className="text-muted">• {exp.duration}</span>
                </p>
                <Link
                  href={`/#reserve?experience=${exp.id}`}
                  onClick={onClose}
                  className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[16px] bg-olive px-6 font-semibold text-ivory transition hover:-translate-y-0.5 hover:bg-olive-dark sm:w-auto sm:min-w-[220px]"
                >
                  Book {exp.name}
                  <ArrowRightIcon size={20} />
                </Link>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-muted transition hover:text-olive-dark"
              >
                <ArrowLeftIcon size={17} />
                See All Experiences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3
        className="mb-2 text-[12.5px] font-semibold uppercase text-olive"
        style={{ fontFamily: "var(--font-body)", letterSpacing: "0.13em" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
