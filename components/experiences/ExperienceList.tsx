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
      <section className="space-y-5 py-6">
        {experiences.map((exp) => (
          <ExperienceCard key={exp.id} exp={exp} onLearnMore={() => setOpen(exp)} />
        ))}
      </section>
      {open && <ExperienceModal exp={open} onClose={() => setOpen(null)} />}
    </>
  );
}
