import { UploadSimple, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { Card } from "./Card";

export function UploadDropzone() {
  return (
    <div className="rounded-card border-[1.5px] border-dashed border-border bg-surface px-8 py-10 text-center">
      <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-control border-[1.5px] border-accent text-accent">
        <UploadSimple size={18} weight="bold" />
      </div>
      <div className="font-ui text-[13.5px] font-semibold text-text">
        Drop your Advising Worksheet PDF here
      </div>
      <div className="mt-1 font-ui text-[11.5px] text-text-muted">or click to browse</div>
    </div>
  );
}

export type StepState = "done" | "active" | "pending";

export function ProcessingSteps({
  fileName,
  fileSize,
  steps,
}: {
  fileName: string;
  fileSize: string;
  steps: { label: string; state: StepState }[];
}) {
  return (
    <Card className="!p-6">
      <div className="mb-4 flex items-center justify-between font-ui text-[13px]">
        <span className="font-bold text-text">{fileName}</span>
        <span className="text-text-muted">{fileSize}</span>
      </div>
      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <div
            key={step.label}
            className={cn(
              "flex items-center gap-2.5 font-ui text-[13px] font-medium",
              step.state === "pending" ? "text-text-muted" : "text-text"
            )}
          >
            <span
              className={cn(
                "relative flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full",
                step.state === "done" && "bg-success text-white",
                step.state === "active" && "bg-gold",
                step.state === "pending" && "bg-accent-soft"
              )}
            >
              {step.state === "done" && <CheckCircle size={14} weight="bold" />}
              {step.state === "active" && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              )}
            </span>
            {step.label}
          </div>
        ))}
      </div>
    </Card>
  );
}
