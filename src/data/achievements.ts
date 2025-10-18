export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "reading" | "streak" | "social" | "milestone" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  requirement: {
    type:
      | "days_read"
      | "streak"
      | "verses_saved"
      | "plans_completed"
      | "notes_taken"
      | "highlights_created"
      | "special";
    value: number;
  };
  unlockedAt?: string;
  progress?: number;
}

export const achievementsData: Achievement[] = [
  // ============================================
  // READING ACHIEVEMENTS
  // ============================================
  {
    id: "first_step",
    name: "First Step",
    description: "Complete your first day of reading",
    icon: "foot-print",
    category: "reading",
    rarity: "common",
    points: 10,
    requirement: { type: "days_read", value: 1 },
  },
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Read for 7 consecutive days",
    icon: "calendar-week",
    category: "streak",
    rarity: "common",
    points: 25,
    requirement: { type: "streak", value: 7 },
  },
  {
    id: "month_champion",
    name: "Month Champion",
    description: "Maintain a 30-day reading streak",
    icon: "calendar-month",
    category: "streak",
    rarity: "rare",
    points: 100,
    requirement: { type: "streak", value: 30 },
  },
  {
    id: "hundred_days",
    name: "Centurion",
    description: "Read for 100 total days",
    icon: "numeric-100",
    category: "milestone",
    rarity: "epic",
    points: 200,
    requirement: { type: "days_read", value: 100 },
  },
  {
    id: "year_bible",
    name: "Bible Year",
    description: "Complete a one-year Bible reading plan",
    icon: "calendar-today",
    category: "milestone",
    rarity: "legendary",
    points: 500,
    requirement: { type: "plans_completed", value: 1 },
  },

  // ============================================
  // VERSE INTERACTION ACHIEVEMENTS
  // ============================================
  {
    id: "first_save",
    name: "Treasure Hunter",
    description: "Save your first verse",
    icon: "bookmark",
    category: "reading",
    rarity: "common",
    points: 15,
    requirement: { type: "verses_saved", value: 1 },
  },
  {
    id: "verse_collector",
    name: "Verse Collector",
    description: "Save 25 verses",
    icon: "bookmark-multiple",
    category: "reading",
    rarity: "rare",
    points: 75,
    requirement: { type: "verses_saved", value: 25 },
  },
  {
    id: "highlight_artist",
    name: "Highlight Artist",
    description: "Create 50 highlights",
    icon: "highlighter",
    category: "reading",
    rarity: "rare",
    points: 80,
    requirement: { type: "highlights_created", value: 50 },
  },
  {
    id: "note_taker",
    name: "Scribe",
    description: "Write 20 journal entries",
    icon: "notebook",
    category: "reading",
    rarity: "rare",
    points: 60,
    requirement: { type: "notes_taken", value: 20 },
  },

  // ============================================
  // PLAN COMPLETION ACHIEVEMENTS
  // ============================================
  {
    id: "first_plan",
    name: "Committed",
    description: "Complete your first reading plan",
    icon: "check-circle",
    category: "milestone",
    rarity: "common",
    points: 50,
    requirement: { type: "plans_completed", value: 1 },
  },
  {
    id: "plan_explorer",
    name: "Plan Explorer",
    description: "Complete 5 different reading plans",
    icon: "compass",
    category: "milestone",
    rarity: "epic",
    points: 150,
    requirement: { type: "plans_completed", value: 5 },
  },
  {
    id: "gospel_master",
    name: "Gospel Master",
    description: "Complete all four Gospel reading plans",
    icon: "book-cross",
    category: "milestone",
    rarity: "epic",
    points: 120,
    requirement: { type: "special", value: 0 },
  },

  // ============================================
  // STREAK MASTERY ACHIEVEMENTS
  // ============================================
  {
    id: "consistent_reader",
    name: "Consistent Reader",
    description: "Maintain a 7-day streak 3 times",
    icon: "repeat",
    category: "streak",
    rarity: "rare",
    points: 90,
    requirement: { type: "special", value: 0 },
  },
  {
    id: "streak_master",
    name: "Streak Master",
    description: "Reach a 60-day streak",
    icon: "fire",
    category: "streak",
    rarity: "epic",
    points: 180,
    requirement: { type: "streak", value: 60 },
  },
  {
    id: "legendary_streak",
    name: "Legendary Streak",
    description: "Achieve a 100-day reading streak",
    icon: "crown",
    category: "streak",
    rarity: "legendary",
    points: 300,
    requirement: { type: "streak", value: 100 },
  },

  // ============================================
  // SPECIAL ACHIEVEMENTS
  // ============================================
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Read before 6 AM for 7 days straight",
    icon: "weather-sunset",
    category: "special",
    rarity: "rare",
    points: 85,
    requirement: { type: "special", value: 0 },
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Read after 10 PM for 7 days straight",
    icon: "weather-night",
    category: "special",
    rarity: "rare",
    points: 85,
    requirement: { type: "special", value: 0 },
  },
  {
    id: "weekend_warrior",
    name: "Weekend Warrior",
    description: "Read every weekend for a month",
    icon: "calendar-weekend",
    category: "special",
    rarity: "rare",
    points: 70,
    requirement: { type: "special", value: 0 },
  },
  {
    id: "variety seeker",
    name: "Variety Seeker",
    description: "Read from 10 different Bible books",
    icon: "library",
    category: "special",
    rarity: "epic",
    points: 110,
    requirement: { type: "special", value: 0 },
  },

  // ============================================
  // MILESTONE ACHIEVEMENTS
  // ============================================
  {
    id: "ten_plans",
    name: "Dedicated Scholar",
    description: "Complete 10 reading plans",
    icon: "school",
    category: "milestone",
    rarity: "legendary",
    points: 250,
    requirement: { type: "plans_completed", value: 10 },
  },
  {
    id: "verse_scholar",
    name: "Verse Scholar",
    description: "Save 100 verses",
    icon: "bookmark-multiple-outline",
    category: "milestone",
    rarity: "legendary",
    points: 280,
    requirement: { type: "verses_saved", value: 100 },
  },
  {
    id: "highlight_master",
    name: "Illuminated",
    description: "Create 200 highlights",
    icon: "lightbulb",
    category: "milestone",
    rarity: "legendary",
    points: 320,
    requirement: { type: "highlights_created", value: 200 },
  },
];

// Helper functions
export function getAchievementsByCategory(
  category: Achievement["category"],
): Achievement[] {
  return achievementsData.filter(
    (achievement) => achievement.category === category,
  );
}

export function getAchievementsByRarity(
  rarity: Achievement["rarity"],
): Achievement[] {
  return achievementsData.filter(
    (achievement) => achievement.rarity === rarity,
  );
}

export function getRarityColor(rarity: Achievement["rarity"]): string {
  switch (rarity) {
    case "common":
      return "#6b7280";
    case "rare":
      return "#3b82f6";
    case "epic":
      return "#8b5cf6";
    case "legendary":
      return "#f59e0b";
    default:
      return "#6b7280";
  }
}

export function getRarityGradient(rarity: Achievement["rarity"]): string[] {
  switch (rarity) {
    case "common":
      return ["#6b7280", "#9ca3af"];
    case "rare":
      return ["#3b82f6", "#60a5fa"];
    case "epic":
      return ["#8b5cf6", "#a78bfa"];
    case "legendary":
      return ["#f59e0b", "#fbbf24"];
    default:
      return ["#6b7280", "#9ca3af"];
  }
}

export function calculateTotalPoints(achievements: Achievement[]): number {
  return achievements.reduce(
    (total, achievement) => total + achievement.points,
    0,
  );
}

export function getProgressPercentage(
  achievement: Achievement,
  currentValue: number,
): number {
  return Math.min((currentValue / achievement.requirement.value) * 100, 100);
}
