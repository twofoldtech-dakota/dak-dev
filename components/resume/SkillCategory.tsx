'use client';

import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';

interface SkillCategoryProps {
  title: string;
  skills: string[];
}

export function SkillCategory({ title, skills }: SkillCategoryProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-text mb-3">{title}</h3>
      <motion.div
        className="flex flex-wrap gap-2"
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {skills.map((skill) => (
          <motion.span
            key={skill}
            variants={staggerItemVariants}
            className="inline-block border-2 border-text bg-background px-3 py-1 text-sm font-semibold"
          >
            {skill}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
