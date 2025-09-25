export const themeColors = {
  light: {
    // Fundos
    background: 'bg-gray-50', // Fundo principal das telas
    cardBackground: 'bg-white', // Fundo dos cards e containers
    inputBackground: 'bg-gray-50', // Fundo dos inputs

    // Textos
    textPrimary: 'text-gray-900', // Texto principal
    textSecondary: 'text-gray-600', // Texto secundário
    textMuted: 'text-gray-500', // Texto mais claro

    // Bordas
    border: 'border-gray-200',
    borderLight: 'border-gray-100',
  },
  dark: {
    // Fundos - usando classes mais específicas
    background: 'bg-slate-900', // Fundo principal das telas
    cardBackground: 'bg-slate-800', // Fundo dos cards e containers
    inputBackground: 'bg-slate-700', // Fundo dos inputs

    // Textos - usando classes mais específicas
    textPrimary: 'text-slate-100', // Texto principal
    textSecondary: 'text-slate-300', // Texto secundário
    textMuted: 'text-slate-400', // Texto mais claro

    // Bordas
    border: 'border-slate-600',
    borderLight: 'border-slate-700',
  },
};

export const getThemeClasses = (isDark: boolean) => {
  return isDark ? themeColors.dark : themeColors.light;
};
