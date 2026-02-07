'use client';

import { motion } from 'framer-motion';
import { staggerItemVariants } from '@/lib/animations';

interface ExperienceCardProps {
  company: string;
  title: string;
  location: string;
  period: string;
  highlights: string[];
}

export function ExperienceCard({
  company,
  title,
  location,
  period,
  highlights,
}: ExperienceCardProps) {
  return (
    <motion.article variants={staggerItemVariants} className="border-4 border-text bg-surface p-6 border-l-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-xl font-bold text-text">{title}</h3>
          <p className="text-lg font-semibold text-accent">{company}</p>
        </div>
        <div className="text-right sm:text-right">
          <p className="text-sm font-semibold text-text">{period}</p>
          <p className="text-sm text-muted">{location}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {highlights.map((highlight, index) => (
          <li
            key={index}
            className="text-muted leading-relaxed pl-4 border-l-2 border-muted"
          >
            {highlight}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}
