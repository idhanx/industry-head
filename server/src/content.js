// Site content served by GET /api/content. Wording follows IndustryHead_Website.html;
// sections that are not in that file keep the text from the earlier index.html.

export const features = [
  { title: "Connected Operations", tag: "Bring the plant into context.", description: "Connect the event to the process, order and people affected.", flow: ["A material shortage interrupts a production order.", "Bring the receipt, stock position and production plan into context.", "Give planning and production a shared issue to resolve."] },
  { title: "Decision Intelligence", tag: "Prioritise by impact and cost.", description: "Move from a list of losses to an informed decision about what matters next.", flow: ["A recurring stop threatens an urgent order.", "Compare the estimated cost, delivery exposure and previous evidence.", "Approve a countermeasure, assign an owner and set a review."] },
  { title: "Manufacturing Copilot", tag: "Ask questions. Follow the evidence.", description: "Ask a practical question and follow the supporting records.", flow: ["“Why did this order miss its planned completion?”", "Bring together the related stops, quality holds and shift notes.", "Review the evidence before deciding the next action."] },
  { title: "Plant Memory", tag: "Keep the learning in the system.", description: "Carry forward what happened, what was tried and what worked.", flow: ["A familiar fault returns on a different shift.", "Find the earlier cause, repair and verification record.", "Reuse the proven response and keep the new evidence attached."] },
  { title: "Action & Assurance", tag: "Make improvements hold.", description: "Keep ownership and verification connected to the original issue.", flow: ["An improvement action is marked complete.", "Check the outcome against its baseline and review period.", "Confirm the result, update the standard and schedule follow-up."] },
  { title: "Performance Intelligence", tag: "Compare, learn and improve.", description: "Use comparable evidence to guide the next improvement.", flow: ["Two lines show different cost and delivery outcomes.", "Compare process context and consistent performance definitions.", "Investigate the gap and share validated learning across teams."] }
];

export const stages = [
  { name: "Visualise", tag: "See the whole picture", title: "Make the work visible.", description: "Connect production, quality, maintenance and delivery so the team sees the same plant reality.", output: "A shared view of events, context and performance.", example: "One stop. Several connected signals.", records: [["Production", "CNC-02 stops during an urgent order."], ["Quality & maintenance", "A repeat fault and an inspection hold need attention."], ["Delivery", "The affected order is linked to its dispatch plan."]] },
  { name: "Identify", tag: "Find what matters", title: "Choose the right problem.", description: "Surface recurring losses and weigh their cost, customer and operational impact before deciding where to focus.", output: "A clear priority, with its impact and scope.", example: "Which issue needs a decision first?", records: [["Recurring equipment fault", "Repeated disruption on the same production route."], ["Cost and delivery exposure", "Estimated loss and the affected customer order considered together."], ["Priority for review", "The team selects this issue for investigation."]] },
  { name: "Analyse", tag: "Understand the cause", title: "Use evidence to find the cause.", description: "Connect event history, process conditions and previous countermeasures. Validate causes with the people closest to the work.", output: "An evidence-backed cause and a measurable baseline.", example: "Investigate before choosing the fix.", records: [["Review the history", "Compare stops, repair notes and earlier corrective actions."], ["Test the cause", "Check the suspected cause against process evidence."], ["Agree the baseline", "Record the starting condition and verification measure."]] },
  { name: "Implement", tag: "Turn decisions into action", title: "Give the solution an owner.", description: "Translate the agreed response into actions with ownership, due dates and evidence. Keep follow-up attached to the original problem.", output: "An implemented countermeasure ready for verification.", example: "An action plan that stays connected.", records: [["Assign responsibility", "Maintenance owns the approved countermeasure."], ["Carry out the change", "Record completion, supporting evidence and any exceptions."], ["Check effectiveness", "Compare the outcome with the agreed baseline."]] },
  { name: "Standardise", tag: "Make the change hold", title: "Build proven learning into the system.", description: "Once the change is verified, update the standard, skills and checks. Carry the learning across shifts and into plant memory.", output: "A verified method embedded in everyday work.", example: "The fix becomes the way the plant runs.", records: [["Update standard work", "Revise the relevant SOP and maintenance check."], ["Build capability", "Connect the change to training and skill requirements."], ["Retain the learning", "Link the proven fix and review evidence in Plant Memory."]] },
  { name: "Optimise", tag: "Improve, then improve again", title: "Scale what works. Find the next opportunity.", description: "Monitor whether the improvement holds, compare similar processes and reuse validated learning. Feed the next opportunity back into the cycle.", output: "Sustained performance and the next improvement priority.", example: "Keep the improvement cycle moving.", records: [["Monitor the result", "Review recurrence and whether the improvement is sustained."], ["Share with context", "Evaluate the proven approach for similar assets or lines."], ["Start the next cycle", "Use the new evidence to choose the next opportunity."]] }
];

export const chain = [
  ["Demand & planning", "Customer demand, capacity and priorities."],
  ["Suppliers & purchasing", "Material readiness, supplier quality and risk."],
  ["Inbound & inventory", "Receipt, inspection, stock and traceability."],
  ["Production & maintenance", "Output, equipment health and interruptions."],
  ["Quality & release", "Defects, containment, rework and approvals."],
  ["Warehouse & dispatch", "Finished goods, order readiness and shipment."],
  ["Delivery & customer", "Delivery performance, complaints and returns."],
  ["Cost & learning", "Impact, verified outcomes and better future plans."]
].map(([title, text], i) => ({ n: String(i + 1).padStart(2, "0"), title, text }));

// How fully each category typically covers a need: 2 = built in, 1 = partly / varies by product, 0 = not typical.
// Order per row: OEE dashboards, Registers/Excel/WhatsApp, ERP add-ons, Sensor-first OEE/MES. Illustrative, not a vendor audit.
const LEVELS = [[1, 1, 1, 0], [2, 1, 1, 2], [1, 0, 1, 1], [1, 1, 0, 1], [1, 0, 1, 1], [1, 0, 1, 1], [1, 0, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1], [1, 0, 1, 1], [1, 0, 1, 1]];

export const comparison = {
  lanes: {
    oee: { label: "Equipment visibility", title: ["OEE", "dashboards"], question: "“What happened?”", purpose: "Make machine performance and production losses visible.", steps: [["Capture", "machine data"], ["Measure", "OEE and losses"], ["Report", "trends and alerts"]], outcome: "See the performance." },
    manual: { label: "Manual coordination", title: ["Registers, Excel", "& WhatsApp"], question: "“What has everyone recorded?”", purpose: "Bring together records, spreadsheets and conversations to coordinate the day.", steps: [["Record", "events in registers or sheets"], ["Share", "updates through messages"], ["Compile", "reports and meeting notes"], ["Follow up", "through people and reminders"]], outcome: "Keep the team informed." },
    erp: { label: "Business transactions", title: ["ERP / accounting", "add-ons"], question: "“What was planned, posted and costed?”", purpose: "Connect orders, stock, production entries and financial records.", steps: [["Plan", "orders and resource requirements"], ["Post", "production and stock transactions"], ["Reconcile", "costs and variances"], ["Review", "business reports and approvals"]], outcome: "Control the business records." },
    mes: { label: "Connected production", title: ["Sensor-first", "OEE / MES tools"], question: "“What is happening in production?”", purpose: "Connect machine signals and production execution; scope depends on the platform.", steps: [["Connect", "machines and production data"], ["Track", "status, output and losses"], ["Guide", "execution through configured workflows"], ["Analyse", "performance and production history"]], outcome: "Connect and manage production." }
  },
  choices: [["oee", "OEE dashboards"], ["manual", "Registers, Excel & WhatsApp"], ["erp", "ERP / accounting add-ons"], ["mes", "Sensor-first OEE / MES tools"]],
  factory: {
    label: "Industryhead", title: ["Decision intelligence", "for manufacturing"], question: "“What should we do next?”",
    purpose: "Connect factory losses to decisions, accountable action and verified results.",
    steps: [["Understand", "the loss and its impact"], ["Prioritise", "what matters most"], ["Act", "with an owner and a plan"], ["Verify", "what actually improved"], ["Learn", "and retain what works"]],
    outcome: "Drive the improvement."
  },
  connected: "Morning Meetings · Action Plans · Kaizen · Skills · SOPs · Audits · Copilot + Factory Memory",
  columns: [
    ["Industryhead", "Decision intelligence<br>for manufacturing"],
    ["OEE dashboards", "Equipment visibility"],
    ["Registers, Excel & WhatsApp", "Manual coordination"],
    ["ERP / accounting add-ons", "Business transactions"],
    ["Sensor-first OEE / MES tools", "Connected production"]
  ],
  rows: [
    ["Start without wiring every machine", "✓", "Tablet / phone capture; add IoT per machine", "Manual or connected data, depending on product", "Easy to start; updates entered by people", "Manual entries or integrations", "Machine connection often central to rollout"],
    ["See equipment performance and production losses", "✓", "OEE and losses within the wider factory context", "Core purpose: availability, performance and quality", "Calculated in sheets and registers", "Depends on production modules", "Connected production and machine visibility"],
    ["Translate losses into ₹ and prioritise the response", "✓", "Link loss impact to priorities; avoid double-counting costs", "Loss rankings; financial models vary", "Manual costing and prioritisation", "Cost and variance reporting; granularity varies", "Loss costing and prioritisation vary by platform"],
    ["Floor screens in Hindi and Tamil", "✓", "Hindi and Tamil in the proposed floor experience", "Language support varies", "Depends on the team’s documents", "Depends on product and localisation", "Language support varies"],
    ["A morning meeting driven by factory priorities", "✓", "Connect losses, priorities, decisions and follow-up", "Reports and alerts inform the meeting", "Agenda assembled manually", "Reports inform the meeting; workflow varies", "Daily management features vary"],
    ["Owned actions with results checked against a baseline", "✓", "Owner → due date → evidence → effectiveness review", "Action tracking and verification vary", "Manual follow-up and evidence tracking", "Tasks and approvals; operational verification varies", "Some offer action and improvement workflows"],
    ["AI guidance grounded in your own records", "✓", "Copilot + Factory Memory; human review of recommendations", "Some offer AI analysis and recommendations", "Knowledge spread across files and conversations", "AI features and evidence access vary", "Some offer process AI and recommendations"],
    ["Quality, maintenance, safety, people and delivery together", "✓", "Shared factory context and connected action records", "Equipment performance is the main focus", "Separate records connected by people", "Coverage depends on modules and integrations", "MES scope can be broad; coverage varies"],
    ["Turn improvement into standards and capability", "✓", "Kaizen, Skills, SOPs and Audits connected in Core", "May need wider modules or connected tools", "Templates, documents and manual training logs", "Depends on quality and learning modules", "Work instructions and skills features vary"],
    ["Extend into specialist workflows", "↗", "Specialist workflows tailored to your factory’s needs", "Extensions and integrations vary", "Additional sheets or standalone tools", "Module and integration ecosystems", "Module and integration ecosystems"],
    ["Implementation supported by manufacturing expertise", "✓", "Manufacturing-led onboarding and improvement coaching in the proposed offer", "Support model depends on provider", "Usually organised internally", "Vendor or implementation partner", "Vendor or implementation partner"]
  ].map(([need, mark, ...cells], i) => ({ need, mark, cells: cells.map((t, c) => ({ t, l: c === 0 ? 2 : LEVELS[i][c - 1] })) })),
  note: "Illustrative workflow and category comparison, not a vendor-by-vendor audit. Capabilities overlap and vary by product. Industryhead reflects the proposed product scope; end-to-end performance requires factory validation."
};

comparison.coverage = comparison.columns.map((_, c) => +(comparison.rows.reduce((n, r) => n + r.cells[c].l, 0) / (2 * comparison.rows.length)).toFixed(3));

export const industries = [
  ["Auto components", "Tier-1 and Tier-2 suppliers under OTIF and PPM pressure.", "OTIF · 8D · traceability"],
  ["Precision machining", "CNC and VMC shops running many parts and changeovers.", "Op-level OEE · tool changes"],
  ["Forging & casting", "High-energy, high-scrap processes where a stop is expensive.", "Breakdowns · CoPQ"],
  ["Sheet metal & fabrication", "Press shops and welding lines with tight delivery windows.", "Press uptime · safety"],
  ["Plastics & rubber moulding", "Multi-cavity tools and cycle-time losses.", "Slow cycles · cavities"],
  ["Electrical & electronics assembly", "Line-based assembly where output follows manpower.", "Line staffing · FPY"],
  ["Pumps, valves & engineering goods", "Make-to-order with customer-specific delivery rules.", "Job orders · lots"],
  ["Multi-plant groups", "Owners comparing plants on one definition of loss.", "Benchmark · roles"]
].map(([title, text, tag]) => ({ title, text, tag }));

const ICONS = ["layers", "users", "calendar", "rupee", "wrench", "shield", "loop", "chip"];
export const services = [
  ["Plant onboarding", "Machines, parts, routings, rates, shifts and customer rules loaded from simple templates — your plant mapped before go-live."],
  ["Floor training", "Operators, supervisors and inspectors trained on the tablet screens in their own language, on their own machines."],
  ["Daily management", "Morning meeting, shift handover and escalation routines set up and coached until they run without us."],
  ["Cost-of-loss workshops", "Owners and managers learn to read losses in rupees and choose where improvement pays first."],
  ["Maintenance excellence", "Breakdown analysis, MTBF / MTTR, PM schedules and on-time compliance — TPM made practical."],
  ["Quality problem solving", "8D, root cause and cost of poor quality, with customer complaints tracked to closure."],
  ["Lean & Kaizen programmes", "Idea schemes, skills matrices and improvement events — with savings verified, not claimed."],
  ["IoT pilot", "When you are ready: sensors or PLC signals mapped to machines for measured run time and counts."]
].map(([title, text], i) => ({ k: "S-0" + (i + 1), icon: ICONS[i], title, text }));

export const steps = [
  ["Map the plant", "We collect your machines, parts, routings, rates and shifts in ready-made templates and load your history."],
  ["Go live on tablets", "Shift start, counts, stops and inspections on the floor — no wiring and no new hardware to begin."],
  ["See the rupees", "Industryhead prices every loss. The morning meeting starts from facts, not opinions."],
  ["Fix and verify", "Actions get owners and dates. Savings are measured against a frozen baseline before they count."]
].map(([title, text]) => ({ title, text }));

export const trust = [
  { icon: "lock", title: "Your data stays yours", text: "Each plant's records are isolated at the database level, with role-based access from owner to operator." },
  { icon: "shield", title: "Numbers you can audit", text: "Every figure traces back to its source entry, and an activity log shows who changed what." },
  { icon: "wifi", title: "Works when the Wi-Fi doesn't", text: "Floor entries are kept offline and sync when the connection returns — nothing lost mid-shift." }
];

export const timezones = [
  ["Europe/London", "UK — Europe/London"], ["Asia/Kolkata", "India — Asia/Kolkata"], ["Europe/Berlin", "Central Europe — Europe/Berlin"],
  ["America/New_York", "US Eastern — America/New_York"], ["Asia/Dubai", "UAE — Asia/Dubai"], ["Asia/Singapore", "Singapore — Asia/Singapore"],
  ["Australia/Sydney", "Australia — Australia/Sydney"], ["UTC", "UTC"]
];
export const sitesOptions = ["1 site", "2–5 sites", "6–20 sites", "21+ sites"];
export const durations = ["30 minutes", "45 minutes", "60 minutes"];

// ---- interactive product tour (illustrative data) ----
export const tourSeed = {
  machines: [
    { id: "CNC-01", st: "run", job: "BR-110 · Op10", note: "Running to plan" },
    { id: "CNC-02", st: "stop", job: "BR-110 · Op20", note: "Tool change" },
    { id: "VMC-03", st: "run", job: "PL-330 · Op20", note: "Running to plan" },
    { id: "PRS-01", st: "slow", job: "SM-204 · Press", note: "Slow cycle −12%" },
    { id: "ASM-L1", st: "run", job: "Line 1", note: "8 / 8 on line" },
    { id: "INSP-1", st: "hold", job: "Final inspection", note: "3 on hold" }
  ],
  actions: [
    { id: 1, title: "CNC-02: recurring tool-change overrun", owner: "Maintenance · due Thu", cost: "₹2,140", stage: 1 },
    { id: 2, title: "PRS-01: slow cycle investigation", owner: "Production · due Fri", cost: "₹3,240", stage: 0 },
    { id: 3, title: "INSP-1: 3 lots on hold — decide", owner: "Quality · due today", cost: "₹2,210", stage: 2 }
  ]
};
export const tourStatic = {
  reasons: ["Tool change", "Breakdown", "Changeover", "Waiting material"],
  loss: [["Breakdowns", 7850, 92, true], ["Changeovers", 4960, 58, false], ["Slow cycles", 3240, 38, false], ["Scrap & rework", 2210, 26, true], ["Waiting material", 1020, 12, false]].map(([label, amount, pct, hot]) => ({ label, amount, pct, hot })),
  stopSplit: [["Machine", 620, "#EBC958"], ["Labour", 540, "#5FE0AE"], ["Overhead", 380, "#7FB6C0"], ["Lost margin", 600, "#FF8A70"]].map(([label, amount, color]) => ({ label, amount, color })),
  oee: { availability: 88, performance: 83, quality: 97.8, oee: 71, target: 75 },
  oeeHours: [["06", 82], ["07", 64], ["08", 58], ["09", 74], ["10", 79], ["11", 68], ["12", 72], ["13", 77]].map(([hour, oee]) => ({ hour, oee })),
  baseCost: { total: 18420, stop: 2140, perSecond: 4 }
};
