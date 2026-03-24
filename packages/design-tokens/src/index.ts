export const studyBuddyTokens = {
  colors: {
    ink: "#111827",
    subtext: "#667085",
    line: "#D6D3F5",
    shell: "#F6F4FF",
    paper: "#FFFCF4",
    paperStrong: "#FFF7E2",
    violet: "#534AB7",
    violetSoft: "#EEEDFE",
    mint: "#DCF5EA",
    mintStrong: "#1D9E75",
    saffron: "#FAE7B5",
    saffronInk: "#8A5A00",
    coral: "#FBE5E6",
    coralInk: "#B42318",
    cobalt: "#163DA8",
    white: "#FFFFFF",
    slate: "#2E3148",
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 28,
    xl: 36,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    "2xl": 40,
  },
  shadows: {
    halo: "0 24px 80px rgba(83, 74, 183, 0.18)",
    card: "0 10px 30px rgba(46, 49, 72, 0.08)",
  },
  gradients: {
    hero:
      "radial-gradient(circle at top left, rgba(83, 74, 183, 0.18), transparent 36%), linear-gradient(135deg, #FFF9ED 0%, #F6F4FF 58%, #EEF8F2 100%)",
    card:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 252, 244, 0.96) 100%)",
  },
  typography: {
    display: "var(--font-study-display)",
    body: "var(--font-study-body)",
    mono: "var(--font-study-mono)",
  },
} as const;

export const rootVariablesCss = `
  :root {
    --sb-ink: ${studyBuddyTokens.colors.ink};
    --sb-subtext: ${studyBuddyTokens.colors.subtext};
    --sb-line: ${studyBuddyTokens.colors.line};
    --sb-shell: ${studyBuddyTokens.colors.shell};
    --sb-paper: ${studyBuddyTokens.colors.paper};
    --sb-paper-strong: ${studyBuddyTokens.colors.paperStrong};
    --sb-violet: ${studyBuddyTokens.colors.violet};
    --sb-violet-soft: ${studyBuddyTokens.colors.violetSoft};
    --sb-mint: ${studyBuddyTokens.colors.mint};
    --sb-mint-strong: ${studyBuddyTokens.colors.mintStrong};
    --sb-saffron: ${studyBuddyTokens.colors.saffron};
    --sb-saffron-ink: ${studyBuddyTokens.colors.saffronInk};
    --sb-coral: ${studyBuddyTokens.colors.coral};
    --sb-coral-ink: ${studyBuddyTokens.colors.coralInk};
    --sb-cobalt: ${studyBuddyTokens.colors.cobalt};
    --sb-white: ${studyBuddyTokens.colors.white};
    --sb-slate: ${studyBuddyTokens.colors.slate};
    --sb-shadow-card: ${studyBuddyTokens.shadows.card};
    --sb-shadow-halo: ${studyBuddyTokens.shadows.halo};
    --sb-gradient-hero: ${studyBuddyTokens.gradients.hero};
    --sb-gradient-card: ${studyBuddyTokens.gradients.card};
    --sb-radius-sm: ${studyBuddyTokens.radius.sm}px;
    --sb-radius-md: ${studyBuddyTokens.radius.md}px;
    --sb-radius-lg: ${studyBuddyTokens.radius.lg}px;
    --sb-radius-xl: ${studyBuddyTokens.radius.xl}px;
    --sb-radius-pill: ${studyBuddyTokens.radius.pill}px;
  }
`;

export const studyBuddyNativeTheme = {
  background: studyBuddyTokens.colors.shell,
  surface: studyBuddyTokens.colors.paper,
  primary: studyBuddyTokens.colors.violet,
  primarySoft: studyBuddyTokens.colors.violetSoft,
  text: studyBuddyTokens.colors.ink,
  muted: studyBuddyTokens.colors.subtext,
  success: studyBuddyTokens.colors.mintStrong,
  warning: studyBuddyTokens.colors.saffronInk,
  danger: studyBuddyTokens.colors.coralInk,
};
