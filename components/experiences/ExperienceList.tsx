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
/**
 * `columns: 2` lays the cards out 2x2. The card is internally horizontal
 * (icon column + content), so it only splits at lg — below that the pair
 * would squeeze the description into a ribbon.
 */
export function ExperienceList({ columns = 1 }: { columns?: 1 | 2 }) {
  const [open, setOpen] = useState<Experience | null>(null);

  return (
    <>
      <section
        className={`py-6 ${columns === 2 ? "grid gap-5 lg:grid-cols-2 lg:items-stretch" : "space-y-5"}`}
      >
        {experiences.map((exp) => (
          <ExperienceCard key={exp.id} exp={exp} onLearnMore={() => setOpen(exp)} />
        ))}
      </section>
      {open && <ExperienceModal exp={open} onClose={() => setOpen(null)} />}
    </>
  );
}
