export type TemplateStatus = "Not Started" | "In Progress" | "Blocked" | "In Review" | "Done";

export type TemplatePriority = "High" | "Medium" | "Low";

export type TemplatePreviewRow = {
  item: string;
  owner: string;
  status: TemplateStatus;
  priority: TemplatePriority;
  due: string;
};

export type TemplatePreview = {
  summary: string;
  highlights: string[];
  metrics: { label: string; value: string }[];
  rows: TemplatePreviewRow[];
};

export type Template = {
  id: string;
  title: string;
  emoji: string;
  category: string;
  description: string;
  views: number;
  tags: string[];
  preview: TemplatePreview;
};

export const templates: Template[] = [
  {
    id: "product-launch-plan",
    title: "Product Launch Plan",
    emoji: "🚀",
    category: "Product",
    description: "Coordinate a multi-team launch with milestones, owners, and risks tracked in one board.",
    views: 21840,
    tags: ["product", "launch", "go-to-market", "milestones"],
    preview: {
      summary: "A structured plan with weekly milestones, risk tracking, and clear ownership.",
      highlights: [
        "Weekly GTM checkpoints with marketing + sales enablement.",
        "Risk register with mitigation owners.",
        "Launch retro built-in for continuous improvement.",
      ],
      metrics: [
        { label: "Launch Date", value: "Apr 18, 2026" },
        { label: "Critical Path Items", value: "12" },
        { label: "Confidence", value: "78%" },
      ],
      rows: [
        { item: "Messaging final", owner: "Priya Patel", status: "In Progress", priority: "High", due: "Mar 12" },
        { item: "Sales playbook", owner: "Chris Wong", status: "Not Started", priority: "Medium", due: "Mar 18" },
        { item: "Beta feedback synthesis", owner: "Dana Lee", status: "In Review", priority: "High", due: "Mar 10" },
        { item: "Risk register update", owner: "Alex Smith", status: "Blocked", priority: "High", due: "Mar 08" },
        { item: "Launch retro", owner: "Team", status: "Not Started", priority: "Low", due: "Apr 22" },
      ],
    },
  },
  {
    id: "engineering-runbook",
    title: "Engineering Runbook",
    emoji: "🛠️",
    category: "Engineering",
    description: "Operational handbook for on-call, incidents, and service ownership with ready-made tasks.",
    views: 18720,
    tags: ["on-call", "incidents", "sre", "runbook"],
    preview: {
      summary: "Codified service ownership with incident response and postmortems baked in.",
      highlights: [
        "Golden signals dashboard snapshot per service.",
        "Incident severity ladder with comms macros.",
        "Blameless postmortem template and action tracker.",
      ],
      metrics: [
        { label: "MTTR Goal", value: "< 35m" },
        { label: "Services Covered", value: "9" },
        { label: "On-call Rotation", value: "Weekly" },
      ],
      rows: [
        { item: "Health checks updated", owner: "Mina Cho", status: "In Progress", priority: "Medium", due: "Mar 05" },
        { item: "Pager routing audit", owner: "Luis Gomez", status: "Not Started", priority: "High", due: "Mar 09" },
        { item: "Incident comms macros", owner: "Ravi Shah", status: "Done", priority: "Low", due: "Feb 28" },
        { item: "Runbook DR drill", owner: "Team Alpha", status: "In Review", priority: "High", due: "Mar 15" },
      ],
    },
  },
  {
    id: "marketing-campaign-ops",
    title: "Campaign Ops Board",
    emoji: "📣",
    category: "Marketing",
    description: "Centralize campaign briefs, creative status, channels, and performance checkpoints.",
    views: 15410,
    tags: ["marketing", "campaign", "creative", "performance"],
    preview: {
      summary: "Plan, traffic, and measure integrated campaigns with creative QA and channel guardrails.",
      highlights: [
        "Channel playcards with budget + pacing targets.",
        "Creative QA checklist and approvals.",
        "Performance readouts with week-over-week trends.",
      ],
      metrics: [
        { label: "Active Campaigns", value: "6" },
        { label: "Budget Tracked", value: "$420k" },
        { label: "Avg. CTR", value: "3.4%" },
      ],
      rows: [
        { item: "Q2 brand film", owner: "Samira Noor", status: "In Progress", priority: "High", due: "Mar 21" },
        { item: "Lifecycle nurture v2", owner: "Hannah Kim", status: "In Review", priority: "Medium", due: "Mar 11" },
        { item: "Partner webinar", owner: "Jordan Lee", status: "Not Started", priority: "Medium", due: "Mar 28" },
        { item: "SEO content sprint", owner: "Content Pod", status: "Done", priority: "Low", due: "Feb 27" },
      ],
    },
  },
  {
    id: "customer-success-playbook",
    title: "Customer Success Playbook",
    emoji: "🤝",
    category: "Customer Success",
    description: "Lifecycle plays for onboarding, QBRs, renewals, and expansion with health scoring.",
    views: 11980,
    tags: ["customer success", "health score", "qbr", "renewal"],
    preview: {
      summary: "Outcome-driven plays tied to health signals and renewal risk tracking.",
      highlights: [
        "Account health radar with CSAT + product usage.",
        "QBR outline with success metrics and blockers.",
        "Renewal risk board with mitigation owners.",
      ],
      metrics: [
        { label: "Accounts Tracked", value: "38" },
        { label: "Renewals Next 60d", value: "7" },
        { label: "Risk Accounts", value: "4" },
      ],
      rows: [
        { item: "Onboarding checklist revamp", owner: "Taylor Brooks", status: "In Progress", priority: "Medium", due: "Mar 14" },
        { item: "Usage drop investigation", owner: "CS Ops", status: "Blocked", priority: "High", due: "Mar 06" },
        { item: "QBR deck template", owner: "Pat Jones", status: "Done", priority: "Low", due: "Feb 24" },
        { item: "Renewal risk plan", owner: "CS Team", status: "In Review", priority: "High", due: "Mar 17" },
      ],
    },
  },
  {
    id: "data-product-sprint",
    title: "Data Product Sprint",
    emoji: "📊",
    category: "Data",
    description: "Shape and deliver analytics features with hypothesis tracking, QA, and documentation.",
    views: 9870,
    tags: ["data", "analytics", "experiments", "qa"],
    preview: {
      summary: "Experiment-driven sprint doc with schema reviews, QA, and rollout safeguards.",
      highlights: [
        "Tracking plan with event taxonomy.",
        "Schema review checklist and lineage notes.",
        "Rollout with guardrail metrics and alerts.",
      ],
      metrics: [
        { label: "Hypotheses", value: "5" },
        { label: "Experiments Live", value: "2" },
        { label: "Data QA Coverage", value: "92%" },
      ],
      rows: [
        { item: "Define guardrails", owner: "Data Eng", status: "In Progress", priority: "High", due: "Mar 07" },
        { item: "Tracking QA", owner: "QA Guild", status: "Not Started", priority: "Medium", due: "Mar 13" },
        { item: "Docs refresh", owner: "Analytics", status: "Done", priority: "Low", due: "Feb 26" },
        { item: "Schema review", owner: "Data Council", status: "In Review", priority: "High", due: "Mar 09" },
      ],
    },
  },
  {
    id: "design-system-vault",
    title: "Design System Vault",
    emoji: "🎨",
    category: "Design",
    description: "Source of truth for tokens, components, accessibility checks, and release notes.",
    views: 13250,
    tags: ["design", "tokens", "components", "a11y"],
    preview: {
      summary: "Governance-ready design system with release pipeline and accessibility gates.",
      highlights: [
        "Token change log with approvals.",
        "Component status board (alpha/beta/stable).",
        "Accessibility QA checklist with axe results.",
      ],
      metrics: [
        { label: "Components", value: "42" },
        { label: "Stable", value: "24" },
        { label: "A11y Coverage", value: "96%" },
      ],
      rows: [
        { item: "Tokens sync", owner: "Design Ops", status: "In Progress", priority: "Medium", due: "Mar 04" },
        { item: "Checkbox a11y audit", owner: "QA", status: "Blocked", priority: "High", due: "Mar 06" },
        { item: "Docs site refresh", owner: "UX Writing", status: "Not Started", priority: "Low", due: "Mar 20" },
        { item: "Stable rollout report", owner: "Design Lead", status: "In Review", priority: "High", due: "Mar 15" },
      ],
    },
  },
];
