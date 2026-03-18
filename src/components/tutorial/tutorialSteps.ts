export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  page: string; // route hint
  details: string[];
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Nexus Log",
    icon: "⚔️",
    page: "/",
    description:
      "Nexus Log is a Life-JRPG quarterly review dashboard. It turns your real-life growth into an RPG character sheet — with stats, quests, archetypes, and narrative visions.",
    details: [
      "Each quarter you set a vision, pursue quests, and level up your stats.",
      "Your dominant stat determines your Archetype Class.",
      "Everything resets each quarter via the Quarterly Review ritual.",
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "📊",
    page: "/",
    description:
      "Your command center. The Dashboard shows your character sheet at a glance — stat radar chart, XP progress bars, active quest count, and your current quarterly vision.",
    details: [
      "The Radar Chart visualises your stat levels relative to each other.",
      "Stat bars show XP progress toward the next level.",
      "When a stat levels up, you'll see a toast notification.",
      "Your Archetype Class auto-updates based on your highest stat.",
    ],
  },
  {
    id: "quests",
    title: "Quest Log",
    icon: "📜",
    page: "/quests",
    description:
      "Quests are your actionable goals for the quarter. Each quest is tied to a stat category and has an impact rating (1–5) that determines the XP reward when completed.",
    details: [
      "Create quests with a title, stat category, priority, and impact score.",
      "Completing a quest awards XP to the linked stat based on impact.",
      "Add a reflection when completing — capture what you learned.",
      "Quests carry into the Quarterly Review for archival or carry-forward.",
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    icon: "🎒",
    page: "/inventory",
    description:
      "A flexible tracker for anything you want to count — gold earned, streaks maintained, books read, or custom items. Think of it as your adventurer's bag.",
    details: [
      "Add items with a name, category, quantity, and optional description.",
      "Use categories to organise (e.g. Currency, Streaks, Collectibles).",
      "Quantities can be adjusted up or down as you progress.",
    ],
  },
  {
    id: "visions",
    title: "Visions & PNV",
    icon: "👁️",
    page: "/visions",
    description:
      "The Visions page is where you write your Present Narrative Vision — a paragraph written in the present tense as if you've already achieved your quarterly goals.",
    details: [
      "The PNV Sanctuary is a distraction-free writing mode.",
      "Write as if it's the last day of the quarter and you've succeeded.",
      'Example: "It is March 31st, and I have successfully launched…"',
      "Extract concrete goals from your vision to turn them into quests.",
      "Archived quarterly reviews are viewable here as manifesto cards.",
    ],
  },
  {
    id: "review",
    title: "Quarterly Review",
    icon: "📖",
    page: "/",
    description:
      "At the end of each quarter, you'll be prompted to complete a Quarterly Review. This archives your progress into a manifesto and lets you triage unfinished quests.",
    details: [
      "The review appears as a prompt on the Dashboard when a quarter ends.",
      "It generates a manifesto with your vision, completed quests, and stat growth.",
      "Unfinished quests can be carried forward or abandoned.",
      "Archived reviews are stored and viewable from the Visions page.",
    ],
  },
  {
    id: "settings",
    title: "Settings & XP Curve",
    icon: "⚙️",
    page: "/settings",
    description:
      "Customise your character — manage stats, set archetype names, adjust colours, and fine-tune the XP levelling curve formula.",
    details: [
      "Add, rename, reorder, or delete stat categories.",
      "Each stat can have a custom colour and archetype name.",
      "The XP curve uses: Base × Ratio ^ (Level − 1).",
      "Adjusting Base/Ratio changes how fast you level up across all stats.",
    ],
  },
];
