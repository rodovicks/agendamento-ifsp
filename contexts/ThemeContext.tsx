import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const systemColorScheme = useColorScheme();

  // Carrega a preferência do usuário ao inicializar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeState(savedTheme as Theme);
        }
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      }
    };
    loadTheme();
  }, []);

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return theme as 'light' | 'dark';
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('@theme', newTheme);
      setThemeState(newTheme);
      console.log('Tema aplicado:', newTheme);
    } catch (error) {
      console.log('Erro ao salvar tema:', error);
      setThemeState(newTheme); // Aplica mesmo se falhar ao salvar
    }
  };

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
  };

  const effectiveTheme = getEffectiveTheme();
  const isDark = effectiveTheme === 'dark';

  // Debug logs
  useEffect(() => {
    console.log('Debug Theme Context:', {
      theme,
      systemColorScheme,
      effectiveTheme,
      isDark,
    });
  }, [theme, systemColorScheme, effectiveTheme, isDark]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
