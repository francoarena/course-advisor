import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusPill, NowPill } from "@/components/ui/StatusPill";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CourseCard, EmptySlot, ChoiceSlot } from "@/components/ui/CourseCard";
import { SemesterColumn } from "@/components/ui/SemesterColumn";
import { UploadDropzone, ProcessingSteps } from "@/components/ui/UploadDropzone";
import { MajorMinorCard, RequirementTable } from "@/components/ui/RequirementSummary";
import { ThemeToggle } from "./ThemeToggle";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="mb-4 font-display text-[16px] font-bold text-text">{title}</h2>
      <div className="rounded-card border border-border bg-bg p-6">{children}</div>
    </section>
  );
}

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="h-9 w-9 flex-shrink-0 rounded-control border border-border"
        style={{ background: `var(${varName})` }}
      />
      <div>
        <div className="font-ui text-[11.5px] font-semibold text-text">{name}</div>
        <div className="font-ui text-[10px] text-text-muted">{varName}</div>
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-[1100px] px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[24px] font-bold text-text">Course Advisor — styleguide</h1>
          <p className="mt-1 font-ui text-[13px] text-text-muted">
            Every themed primitive, real code, per specs/design.md. The fidelity source of truth
            every feature composes from.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Section title="Color tokens">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          <Swatch name="Background" varName="--color-bg" />
          <Swatch name="Surface" varName="--color-surface" />
          <Swatch name="Border" varName="--color-border" />
          <Swatch name="Text" varName="--color-text" />
          <Swatch name="Accent (forest)" varName="--color-accent" />
          <Swatch name="Accent soft" varName="--color-accent-soft" />
          <Swatch name="Gold" varName="--color-gold" />
          <Swatch name="Gold soft" varName="--color-gold-soft" />
          <Swatch name="Success" varName="--color-success" />
          <Swatch name="Danger" varName="--color-danger" />
          <Swatch name="Warning" varName="--color-warning" />
        </div>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-3">
          <div className="font-display text-[24px] font-bold text-text">
            Display / Sora 700 — Degree progress
          </div>
          <div className="font-display text-[14px] font-bold text-text">
            Display / Sora 600 — Fall 2026
          </div>
          <div className="font-ui text-[13.5px] font-normal text-text">
            UI / Public Sans 400 — Pick up your plan where you left it.
          </div>
          <div className="font-ui text-[13px] font-mono tabular-nums text-text-muted">
            Data (tabular figures) — BUS-307-A · 3.00 hrs
          </div>
        </div>
      </Section>

      <Section title="Buttons — default, hover (try it), focus, disabled">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Log in</Button>
          <Button variant="secondary">+ Add slot</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      <Section title="Inputs — default, error">
        <div className="grid max-w-md gap-4">
          <Input placeholder="jordan.casey@franciscan.edu" defaultValue="jordan.casey@franciscan.edu" />
          <Input
            type="password"
            defaultValue="wrongpass"
            error="That password doesn't match this account."
          />
        </div>
      </Section>

      <Section title="Status pills">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill tone="met">MET</StatusPill>
          <StatusPill tone="notmet">NOT MET</StatusPill>
          <StatusPill tone="inprogress">IN PROGRESS</StatusPill>
          <NowPill />
        </div>
      </Section>

      <Section title="Progress bar">
        <div className="flex max-w-xs flex-col gap-4">
          <ProgressBar percent={71} thick />
          <ProgressBar percent={100} thick />
          <ProgressBar percent={0} thick />
        </div>
      </Section>

      <Section title="Course card — needed, completed, empty slot, choice (unresolved), dragging, hover">
        <div className="grid max-w-sm gap-2">
          <CourseCard code="BUS420" title="Strategic Management" hours="3.00" />
          <CourseCard code="BUS-307-A" title="Princ of Organization & Mgmt" hours="3.00" grade="A" />
          <CourseCard code="ACC304" title="Intermediate Accounting I" hours="3.00" dragging />
          <ChoiceSlot label="CHOOSE ONE: BUS 205 / 206 / 208" options={["BUS 205", "BUS 206", "BUS 208"]} />
          <EmptySlot />
        </div>
      </Section>

      <Section title="Requirement summary — major/minor cards + status table">
        <div className="mb-4 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <MajorMinorCard type="MAJOR" name="Finance" earned={30} needed={42} />
          <MajorMinorCard type="MINOR" name="Management" earned={18} needed={18} />
        </div>
        <RequirementTable
          rows={[
            { name: "Finance Auxiliary Reqs", status: "notmet", earned: 18, needed: 18 },
            { name: "BS Core", status: "met", earned: 42, needed: 42 },
          ]}
        />
      </Section>

      <Section title="Upload dropzone + processing state">
        <div className="grid max-w-lg gap-6">
          <UploadDropzone />
          <ProcessingSteps
            fileName="AdvisingWorksheet.pdf"
            fileSize="96 KB"
            steps={[
              { label: "Reading document", state: "done" },
              { label: "Extracting majors, minors & catalog year", state: "done" },
              { label: "Parsing requirement groups…", state: "active" },
              { label: "Building your plan", state: "pending" },
            ]}
          />
        </div>
      </Section>

      <Section title="Semester column (kanban primitive) — current + future, empty state">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <SemesterColumn term="Fall 2026" filled={3} capacity={6} current>
            <CourseCard code="BUS420" title="Strategic Management" hours="3.00" />
            <ChoiceSlot label="CHOOSE ONE: BUS 205 / 206 / 208" options={["BUS 205", "BUS 206", "BUS 208"]} />
            <EmptySlot />
          </SemesterColumn>
          <SemesterColumn term="Spring 2027" filled={1} capacity={6}>
            <CourseCard code="BUS434" title="Senior Thesis" hours="3.00" />
            <EmptySlot />
          </SemesterColumn>
          <SemesterColumn term="Fall 2027" filled={0} capacity={6}>
            <EmptySlot />
            <EmptySlot />
          </SemesterColumn>
        </div>
      </Section>

      <Section title="Card — default vs. current (gold ring)">
        <div className="grid max-w-md grid-cols-2 gap-4">
          <Card>
            <div className="font-ui text-[12.5px] text-text-muted">Default card</div>
          </Card>
          <Card current>
            <div className="font-ui text-[12.5px] text-text-muted">Current-semester card</div>
          </Card>
        </div>
      </Section>
    </main>
  );
}
