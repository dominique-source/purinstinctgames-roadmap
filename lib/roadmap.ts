export type Owner = "Dominique" | "François" | "Open";

export interface Task {
  id: string;
  title: string;
  detail?: string;
  suggestedOwner: Owner;
}

export interface Milestone {
  id: string;
  code: string; // M1..M12
  title: string;
  goal: string;
  window: string;
  track: "Raise" | "Games" | "INSTINCT" | "Partners";
  tasks: Task[];
}

export interface Phase {
  id: string;
  name: string;
  dates: string;
  intent: string;
  milestones: Milestone[];
}

export interface Checkpoint {
  id: string;
  code: string;
  day: string;
  criteria: string[];
  afterPhase: string; // phase id it follows
}

export const SPRINT = {
  title: "PürInstinct — 60-Day Blueprint",
  subtitle: "Seed CAD $750K @ $4.0M pre-money · Games + INSTINCT in parallel",
  range: "July 13 — September 13, 2026",
};

export const phases: Phase[] = [
  {
    id: "p1",
    name: "Phase 1 — Foundation",
    dates: "Weeks 1–2 · Jul 13–26",
    intent:
      "Lock the dataroom, the raise mechanics and the INSTINCT package so every meeting after week 2 is a selling meeting, not a preparing meeting.",
    milestones: [
      {
        id: "m1",
        code: "M1",
        title: "Investor dataroom locked",
        goal: "A complete, zero-surprise dataroom any investor can enter within 24h of a first meeting.",
        window: "Jul 13–24",
        track: "Raise",
        tasks: [
          { id: "m1t1", title: "Deck v2 final (EN)", detail: "Integrate showcase-event slide + verified comparables. Export PDF + PPTX.", suggestedOwner: "Dominique" },
          { id: "m1t2", title: "Financial model + assumptions memo", detail: "Model v9 export + 1-page memo explaining every hardcoded assumption (licence medians, volumes, capacity).", suggestedOwner: "Dominique" },
          { id: "m1t3", title: "Cap table + valuation defense", detail: "Current cap table, $4.0M pre-money rationale (Berkus / Scorecard / RFS / VC method summary).", suggestedOwner: "François" },
          { id: "m1t4", title: "Legal pack: NDA + SAFE/convertible template", detail: "Confirm instrument with counsel; standard terms sheet ready to send.", suggestedOwner: "François" },
          { id: "m1t5", title: "One-page teaser EN + FR", detail: "Traction, model, raise ask. The email attachment for every warm intro.", suggestedOwner: "Dominique" },
          { id: "m1t6", title: "Dataroom folder assembled + access flow", detail: "Corporate docs, trademark file, insurance, key contracts. Single link, tracked access.", suggestedOwner: "Open" },
        ],
      },
      {
        id: "m2",
        code: "M2",
        title: "Raise strategy & pipeline armed",
        goal: "Target list live, warm paths mapped, pitch rehearsed. 15 first meetings booked by end of Phase 2.",
        window: "Jul 13–26",
        track: "Raise",
        tasks: [
          { id: "m2t1", title: "Target list loaded into CRM / tracker", detail: "Import PurInstinct_Target_List.xlsx; statuses + next actions per name.", suggestedOwner: "François" },
          { id: "m2t2", title: "Warm-intro map from LinkedIn base", detail: "Cross the 4,767-contact scored export against every P1/P2 target; pick best introducer per target.", suggestedOwner: "François" },
          { id: "m2t3", title: "Round structure decided", detail: "$300–400K lead + $250–350K angels + institutional co-invest. Confirm instrument and floor/cap.", suggestedOwner: "François" },
          { id: "m2t4", title: "Pitch rehearsed + 40-question Q&A bank", detail: "Two dry-run pitches with friendly investors; log every objection and the agreed answer.", suggestedOwner: "Open" },
        ],
      },
      {
        id: "m3",
        code: "M3",
        title: "INSTINCT package v1 shipped",
        goal: "A producer-grade package: bible, trailer, budget top-sheet, sizzle. Ready to leave behind after every producer meeting.",
        window: "Jul 15–26",
        track: "INSTINCT",
        tasks: [
          { id: "m3t1", title: "Series bible refresh", detail: "32 athletes · 5 disciplines + PürInstinct main game · 12 episodes · elimination arc. ANW + All-Round Champion comparables page.", suggestedOwner: "Dominique" },
          { id: "m3t2", title: "40-second VO trailer final", detail: "ElevenLabs VO + CapCut edit locked from existing script.", suggestedOwner: "Dominique" },
          { id: "m3t3", title: "Budget top-sheet + financing structure", detail: "Per-episode cost, FMC / licence-fee / format-royalty structure for Québec + English Canada.", suggestedOwner: "François" },
          { id: "m3t4", title: "Sizzle cut from existing footage + Kling assets", detail: "90 seconds, INSTINCT tone. Placeholder for showcase footage upgrade in Phase 3.", suggestedOwner: "Dominique" },
        ],
      },
    ],
  },
  {
    id: "p2",
    name: "Phase 2 — Market Contact",
    dates: "Weeks 3–5 · Jul 27–Aug 16",
    intent:
      "Warm doors first. Investors, partners and producers all engaged in the same three weeks so momentum in one track feeds the others.",
    milestones: [
      {
        id: "m4",
        code: "M4",
        title: "Investor wave 1 — warm paths",
        goal: "15 first meetings held. Triptyq partner meeting + Anges Québec process formally started.",
        window: "Jul 27–Aug 16",
        track: "Raise",
        tasks: [
          { id: "m4t1", title: "Triptyq Capital — partner meeting via Bertrand Nepveu", detail: "Ask Bertrand for the formal introduction; target full-partnership pitch by Aug 7.", suggestedOwner: "François" },
          { id: "m4t2", title: "Anges Québec — official application + selection call", detail: "Submit on angesquebec.com; follow with Caroline Pelletier (VP sélection). Map member overlap.", suggestedOwner: "François" },
          { id: "m4t3", title: "Mitch Garber — warm approach", detail: "Identify best mutual door (sports-business / philanthropy circles); send teaser + founder note.", suggestedOwner: "François" },
          { id: "m4t4", title: "Institutional groundwork — IQ / BDC", detail: "Identify account directors; log program eligibility for post-lead co-investment.", suggestedOwner: "François" },
          { id: "m4t5", title: "Weekly pipeline review ritual", detail: "Monday war-room: statuses, blockers, next 5 meetings. Logged here in notes.", suggestedOwner: "Open" },
        ],
      },
      {
        id: "m5",
        code: "M5",
        title: "Partner LOIs — de-risk Year 1 revenue",
        goal: "Signed paper that puts a floor under the Year-1 plan before the term-sheet conversation happens.",
        window: "Jul 27–Aug 16",
        track: "Partners",
        tasks: [
          { id: "m5t1", title: "Moment Factory — JV term sheet advanced", detail: "Convert current discussions into a drafted term sheet; target signature before Day 60.", suggestedOwner: "Dominique" },
          { id: "m5t2", title: "RSEQ presentation + 5 school-board LOIs", detail: "Formal federation meeting; LOIs for 2026–27 Commission-scolaire packages ($20K / 3 days).", suggestedOwner: "Dominique" },
          { id: "m5t3", title: "evenko — 2027 festival rental offer", detail: "One-page cost-plus offer ($113.5K / 5 days, festival keeps ticketing) to Nick Farkas; invite to showcase.", suggestedOwner: "François" },
          { id: "m5t4", title: "Décathlon / Kipsta — merch conversation opened", detail: "Co-branded signature ball + consumer field kit; school-channel angle.", suggestedOwner: "François" },
          { id: "m5t5", title: "Corporate Day pipeline — 3 GE prospects", detail: "Three large-enterprise team-building prospects for fall 2026 ($40K product).", suggestedOwner: "François" },
        ],
      },
      {
        id: "m6",
        code: "M6",
        title: "Producer meetings — INSTINCT on the table",
        goal: "Four producer meetings completed (2 Montréal, 2 Toronto). Broadcasters reached only through them.",
        window: "Aug 3–16",
        track: "INSTINCT",
        tasks: [
          { id: "m6t1", title: "Zone3 — pitch meeting (Montréal)", detail: "Brigitte Lemonde + VP développement non-fiction. Full package + showcase invitation.", suggestedOwner: "Dominique" },
          { id: "m6t2", title: "Attraction — pitch meeting (Montréal)", detail: "Competitive tension with Zone3; same package, one week later.", suggestedOwner: "Dominique" },
          { id: "m6t3", title: "marblemedia — intro (Toronto)", detail: "Mark Bishop / Matt Hornburg. Angle: the format that graduates the All-Round Champion audience.", suggestedOwner: "François" },
          { id: "m6t4", title: "Insight Productions — intro (Toronto)", detail: "Door: Mark Lysakowski (Co-CCO, showrunner of the genre).", suggestedOwner: "François" },
          { id: "m6t5", title: "Broadcaster map logged, no direct pitch", detail: "Noovo (Justin Stockman) · TVA · CBC (Sally Catto) · Radio-Canada — reached via whichever producer engages.", suggestedOwner: "Open" },
        ],
      },
    ],
  },
  {
    id: "p3",
    name: "Phase 3 — Proof",
    dates: "Weeks 5–7 · Aug 17–30",
    intent:
      "One event turns every assumption into footage: investors see demand, producers see television, partners see their logo on it.",
    milestones: [
      {
        id: "m7",
        code: "M7",
        title: "Showcase event delivered",
        goal: "One full PürInstinct Games day, professionally filmed, with investors, producers and partners in the stands.",
        window: "Aug 17–30 (event ~Aug 22–24)",
        track: "Games",
        tasks: [
          { id: "m7t1", title: "Host + venue locked", detail: "School or corporate host; municipal or partner venue. Confirm insurance + first responder.", suggestedOwner: "Dominique" },
          { id: "m7t2", title: "Guest list — investors, producers, partners", detail: "Every open P1/P2 conversation gets a personal invitation.", suggestedOwner: "François" },
          { id: "m7t3", title: "Production plan — film for two audiences", detail: "Event-energy cut for sponsors/investors + INSTINCT-tone cut for producers. Videographer contracted.", suggestedOwner: "Dominique" },
          { id: "m7t4", title: "Séan Garnier appearance locked", detail: "Creator 01 on site; 3 co-created clips scheduled.", suggestedOwner: "Dominique" },
          { id: "m7t5", title: "Run-of-show + ops staffing", detail: "9–24 staff per model assumptions; setup/strike plan; Patrick Fortaich briefed.", suggestedOwner: "Open" },
        ],
      },
      {
        id: "m8",
        code: "M8",
        title: "Content engine live",
        goal: "The showcase becomes a permanent asset: three sizzle cuts and a social wave within 7 days of the event.",
        window: "Aug 24–30",
        track: "Games",
        tasks: [
          { id: "m8t1", title: "Sizzle cut 1 — event energy (sponsors/investors)", suggestedOwner: "Dominique" },
          { id: "m8t2", title: "Sizzle cut 2 — sport close-up (rules, five skills)", suggestedOwner: "Dominique" },
          { id: "m8t3", title: "Sizzle cut 3 — INSTINCT tone (replaces Kling placeholders)", suggestedOwner: "Dominique" },
          { id: "m8t4", title: "Social wave w/ Séan Garnier clips", detail: "Coordinated posts; tag partners present at the event.", suggestedOwner: "Open" },
        ],
      },
      {
        id: "m9",
        code: "M9",
        title: "Diligence room live",
        goal: "When the term sheet lands, DD takes days, not weeks.",
        window: "Aug 17–30",
        track: "Raise",
        tasks: [
          { id: "m9t1", title: "Monthly cash model (18 months)", detail: "Use-of-funds burn by month against the $750K.", suggestedOwner: "François" },
          { id: "m9t2", title: "IP & trademark file complete", detail: "Registered sport + brand marks, JV IP terms with Moment Factory drafted.", suggestedOwner: "François" },
          { id: "m9t3", title: "Corporate records + insurance certificates", suggestedOwner: "François" },
          { id: "m9t4", title: "LOIs and pipeline evidence filed", detail: "Everything signed in M5 goes in the dataroom same week.", suggestedOwner: "Open" },
        ],
      },
    ],
  },
  {
    id: "p4",
    name: "Phase 4 — Close",
    dates: "Weeks 7–9 · Aug 31–Sep 13",
    intent:
      "Convert. Term sheet to close on the raise, producer interest to a signed development path, and the Year-1 calendar locked.",
    milestones: [
      {
        id: "m10",
        code: "M10",
        title: "Term sheet & round close",
        goal: "$750K circled or closed by Day 60.",
        window: "Aug 31–Sep 13",
        track: "Raise",
        tasks: [
          { id: "m10t1", title: "Lead term sheet negotiated", detail: "Valuation, board/observer seat, information rights. Counsel reviews before signature.", suggestedOwner: "François" },
          { id: "m10t2", title: "Angel syndicate filled to target", detail: "Anges Québec members + strategic angels complete the round alongside the lead.", suggestedOwner: "François" },
          { id: "m10t3", title: "Institutional co-invest confirmed", detail: "IQ / AQC follow-on activated by the lead's commitment.", suggestedOwner: "François" },
          { id: "m10t4", title: "Legal close checklist executed", suggestedOwner: "François" },
        ],
      },
      {
        id: "m11",
        code: "M11",
        title: "INSTINCT — development path signed",
        goal: "One producer option or co-development agreement in negotiation; broadcaster introduced by that producer.",
        window: "Aug 31–Sep 13",
        track: "INSTINCT",
        tasks: [
          { id: "m11t1", title: "Producer shortlist decision", detail: "Pick the lead producer based on offer + broadcaster access; keep one competitor warm.", suggestedOwner: "Dominique" },
          { id: "m11t2", title: "Option / co-dev agreement negotiated", detail: "Protect format IP + PürInstinct brand integration; licence-fee floors per financial model.", suggestedOwner: "François" },
          { id: "m11t3", title: "Broadcaster introduction via producer", detail: "Noovo / TVA / CBC — producer leads, founders support with showcase footage.", suggestedOwner: "Dominique" },
        ],
      },
      {
        id: "m12",
        code: "M12",
        title: "Launch runway locked",
        goal: "Year 1 starts the day the round closes — not a quarter later.",
        window: "Sep 1–13",
        track: "Games",
        tasks: [
          { id: "m12t1", title: "Year-1 event calendar contracted", detail: "2 flagship Games + school-board packages + corporate days from M5 pipeline, dated and signed.", suggestedOwner: "Dominique" },
          { id: "m12t2", title: "Kit production order ready", detail: "FieldTurf + Proludik quotes final; negotiate supplier-sponsor terms; order triggers at close.", suggestedOwner: "Dominique" },
          { id: "m12t3", title: "First ops hire scoped", detail: "Role, comp, start date per Year-1 team budget ($388K).", suggestedOwner: "François" },
          { id: "m12t4", title: "Round announcement + PR plan", detail: "Press release, partner quotes (Moment Factory, lead investor), social plan.", suggestedOwner: "Open" },
        ],
      },
    ],
  },
];

export const checkpoints: Checkpoint[] = [
  {
    id: "c1", code: "C1", day: "Day 15 · Jul 27", afterPhase: "p1",
    criteria: [
      "Dataroom complete and access-tracked",
      "Pitch tested on 2 friendly investors",
      "INSTINCT package shipped to first producer",
    ],
  },
  {
    id: "c2", code: "C2", day: "Day 30 · Aug 11", afterPhase: "p2",
    criteria: [
      "≥ 12 investor first-meetings held",
      "≥ 2 school-board LOIs signed",
      "≥ 2 producer meetings completed",
    ],
  },
  {
    id: "c3", code: "C3", day: "Day 45 · Aug 26", afterPhase: "p3",
    criteria: [
      "Lead term sheet in negotiation OR ≥ $250K soft-circled",
      "Showcase event delivered and filmed",
      "evenko + RSEQ conversations at decision stage",
    ],
  },
  {
    id: "c4", code: "C4", day: "Day 60 · Sep 13", afterPhase: "p4",
    criteria: [
      "$750K circled or closed",
      "1 producer agreement in negotiation",
      "≥ 4 Year-1 events contracted",
    ],
  },
];

export const allMilestones: Milestone[] = phases.flatMap((p) => p.milestones);

export function milestoneById(id: string): Milestone | undefined {
  return allMilestones.find((m) => m.id === id);
}

export const trackColors: Record<Milestone["track"], string> = {
  Raise: "#CCFF00",
  Games: "#7DF9FF",
  INSTINCT: "#FF7A59",
  Partners: "#C99CFF",
};
