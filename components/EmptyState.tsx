import type { ReactNode } from "react";
import { Icon } from "./Icon";

/** Friendly, consistent empty-state block (icon + message + optional action). */
export function EmptyState({
  icon = "calendar",
  title,
  sub,
  action,
  compact = false,
}: {
  icon?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div style={{ textAlign: "center", padding: compact ? "20px 16px" : "34px 18px", color: "var(--ink-faint)" }}>
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: "var(--surface-2)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon name={icon} size={24} color="var(--ink-faint)" />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink-soft)", marginBottom: sub ? 4 : 0 }}>
        {title}
      </div>
      {sub && <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{sub}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}
