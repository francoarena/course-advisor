import { Card } from "./Card";
import { ProgressBar } from "./ProgressBar";
import { StatusPill, type StatusTone } from "./StatusPill";

export function MajorMinorCard({
  type,
  name,
  earned,
  needed,
}: {
  type: "MAJOR" | "MINOR";
  name: string;
  earned: number;
  needed: number;
}) {
  return (
    <Card>
      <div className="mb-1 font-ui text-[10px] font-bold tracking-wide text-gold">{type}</div>
      <div className="mb-2.5 font-display text-[14px] font-bold text-text">{name}</div>
      <div className="mb-1.5 font-ui text-[11.5px] text-text-muted">
        {earned} / {needed} hrs
      </div>
      <ProgressBar percent={(earned / needed) * 100} thick />
    </Card>
  );
}

export interface RequirementRow {
  name: string;
  status: StatusTone;
  earned: number;
  needed: number;
}

export function RequirementTable({ rows }: { rows: RequirementRow[] }) {
  return (
    <Card className="!p-0 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="px-[18px] py-3 text-left font-ui text-[10.5px] font-bold tracking-wide text-text-muted">
              Requirement group
            </th>
            <th className="px-[18px] py-3 text-left font-ui text-[10.5px] font-bold tracking-wide text-text-muted">
              Status
            </th>
            <th className="px-[18px] py-3 text-right font-ui text-[10.5px] font-bold tracking-wide text-text-muted">
              Hours
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-border">
              <td className="px-[18px] py-3 font-ui text-[13px] text-text">{row.name}</td>
              <td className="px-[18px] py-3">
                <StatusPill tone={row.status}>
                  {row.status === "met" ? "MET" : row.status === "notmet" ? "NOT MET" : "IN PROGRESS"}
                </StatusPill>
              </td>
              <td className="px-[18px] py-3 text-right font-ui text-[13px] text-text-muted">
                {row.earned} / {row.needed}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
