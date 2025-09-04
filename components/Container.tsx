import { SafeAreaView } from 'react-native';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export const Container = ({ children, className }: ContainerProps) => {
  return (
    <SafeAreaView className={`${styles.container} ${className || ''}`}>{children}</SafeAreaView>
  );
};

const styles = {
  container: 'flex flex-1 m-6',
};
