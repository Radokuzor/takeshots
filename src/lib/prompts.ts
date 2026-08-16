export const PROMPT_BANK = [
  "Most likely to text an ex at 2am",
  "Most likely to cry at a wedding",
  "Most likely to become famous for the wrong reasons",
  "Most likely to start a business on a whim",
  "Most likely to forget their best friend's birthday",
  "Most likely to survive a zombie apocalypse",
  "Most likely to become a millionaire",
  "Most likely to get lost in their own neighborhood",
  "Most likely to marry a celebrity",
  "Most likely to accidentally join a cult",
  "Most likely to become a reality TV star",
  "Most likely to eat the same meal every day",
  "Most likely to ghost someone",
  "Most likely to fall asleep at a party",
  "Most likely to adopt 10 pets",
  "Most likely to win the lottery and lose it all",
  "Most likely to become an influencer",
  "Most likely to show up an hour late to their own wedding",
  "Most likely to quit their job to travel the world",
  "Most likely to still be single in 10 years",
];

export const ROUND_LENGTH_PRESETS = [
  { label: "Quick (5 prompts)", value: 5 },
  { label: "Standard (10 prompts)", value: 10 },
  { label: "Long (15 prompts)", value: 15 },
];

export function pickPrompts(count: number): string[] {
  const shuffled = [...PROMPT_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
