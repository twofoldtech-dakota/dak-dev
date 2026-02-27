interface Step {
  label: string;
  highlight?: boolean;
}

interface FlowDiagramProps {
  before: string;
  after: string;
}

function StepColumn({
  title,
  steps,
  highlightColor,
}: {
  title: string;
  steps: Step[];
  highlightColor: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted mb-4">
        {title}
      </h4>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-stretch">
            {/* Connector line + arrow */}
            <div className="flex flex-col items-center w-5 shrink-0">
              {i > 0 && (
                <div className="w-0.5 h-3 bg-text/30" />
              )}
              {i > 0 && (
                <div
                  className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-text/30 mb-0.5"
                  aria-hidden="true"
                />
              )}
            </div>
            {/* Step box */}
            <div
              className={`flex-1 border-2 px-3 py-2 mb-0 ${
                step.highlight
                  ? `${highlightColor} bg-surface/60`
                  : 'border-text/40 bg-surface/30'
              }`}
            >
              <span className="text-sm leading-snug">{step.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FlowDiagram({ before, after }: FlowDiagramProps) {
  let beforeSteps: Step[];
  let afterSteps: Step[];

  try {
    beforeSteps = JSON.parse(before);
    afterSteps = JSON.parse(after);
  } catch {
    return null;
  }

  if (!Array.isArray(beforeSteps) || !Array.isArray(afterSteps)) return null;

  return (
    <div
      className="not-prose my-8 grid grid-cols-1 md:grid-cols-2 gap-6"
      role="figure"
      aria-label="Flow comparison diagram showing before and after workflows"
    >
      <StepColumn
        title="Without"
        steps={beforeSteps}
        highlightColor="border-chapter-6"
      />
      <StepColumn
        title="With"
        steps={afterSteps}
        highlightColor="border-chapter-1"
      />
    </div>
  );
}
