interface SkillCategoryProps {
  title: string;
  skills: string[];
}

export function SkillCategory({ title, skills }: SkillCategoryProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-text mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-block border-2 border-text bg-background px-3 py-1 text-sm font-semibold"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
