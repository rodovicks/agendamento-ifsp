import { SafeAreaView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export const Container = ({ children, className }: ContainerProps) => {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  // Remove any bg- classes from className and apply theme background
  const classWithoutBg = className ? className.replace(/bg-\S+/g, '').trim() : '';
  const finalClassName = `${styles.container} ${themeClasses.background} ${classWithoutBg}`;

  return <SafeAreaView className={finalClassName}>{children}</SafeAreaView>;
};

const styles = {
  container: 'flex flex-1',
};
