"use client";

import { useState } from "react";
import { experiences } from "@/config/experiences";
import type { Experience } from "@/config/experiences";
import { ExperienceCard } from "./ExperienceCard";
import { ExperienceModal } from "./ExperienceModal";

/**
 * Client wrapper: renders the experience cards and, when "Learn More" is
 * clicked, opens the detail modal without navigating away (scroll preserved).
 */
export function ExperienceList() {
  const [open, setOpen] = useState<Experience | null>(null);

  return (
    <>
      {/* 2×2 from md up. One column on phones — four tall cards side by side
          would squeeze the description into a ribbon. */}
      <section className="grid gap-5 py-6 md:grid-cols-2">
        {experiences.map((exp) => (
          <ExperienceCard key={exp.id} exp={exp} onLearnMore={() => setOpen(exp)} />
        ))}
      </section>
      {open && <ExperienceModal exp={open} onClose={() => setOpen(null)} />}
    </>
  );
}
