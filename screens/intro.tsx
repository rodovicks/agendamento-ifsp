// screens/intro.tsx
import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { markOnboardingSeen } from '../utils/onboarding'; // <— CORRIGIDO
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

const { width, height } = Dimensions.get('window');

type Slide = {
  key: string;
  title: string;
  description: string;
  image: any;
};

const SLIDES: Slide[] = [
  {
    key: 's0',
    title: 'Agende com facilidade',
    description: 'Cadastre e gerencie seus atendimentos em poucos toques.',
    image: require('../assets/carrocel/0.png'),
  },
  {
    key: 's1',
    title: 'Organize seu dia',
    description: 'Visualize horários, serviços e clientes em um só lugar.',
    image: require('../assets/carrocel/1.png'),
  },
  {
    key: 's2',
    title: 'Sua rotina, no controle',
    description: 'Leve seus agendamentos no bolso com praticidade.',
    image: require('../assets/carrocel/2.png'),
  },
  {
    key: 's3',
    title: 'Comece agora',
    description: 'Ative recursos e personalize seu estabelecimento.',
    image: require('../assets/carrocel/3.png'),
  },
];

const DOT = 8;

export default function IntroScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  const goLogin = useCallback(async () => {
    await markOnboardingSeen();
    navigation.replace('Login'); // Intro e Login no MESMO stack
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      goLogin();
    }
  }, [index, goLogin]);

  return (
    <View className={`flex-1 ${themeClasses.background}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Pular — usa safe area para descer */}
      <TouchableOpacity
        onPress={goLogin}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        className={`absolute right-4 z-10 rounded-full border px-3 py-2 ${themeClasses.cardBackground} ${themeClasses.border}`}
        style={{ top: insets.top + 24 }}>
        <Text className={`text-sm font-bold ${themeClasses.textPrimary}`}>Pular</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={{ width, height }} className="items-center justify-center px-6">
            <Image
              source={item.image}
              resizeMode="contain"
              style={{ width: width * 0.9, height: height * 0.55 }}
            />
            <Text className={`mt-4 text-center text-xl font-extrabold ${themeClasses.textPrimary}`}>
              {item.title}
            </Text>
            <Text
              className={`mt-2 px-2 text-center text-sm ${themeClasses.textSecondary}`}
              style={{ lineHeight: 20 }}>
              {item.description}
            </Text>
          </View>
        )}
      />

      <View className="absolute bottom-7 left-0 right-0 items-center">
        <View className="mb-4 flex-row">
          {SLIDES.map((_, i) => {
            const active = i === index;
            return (
              <View
                key={i}
                className={`mx-1 h-2 rounded-full ${active ? themeClasses.textPrimary : themeClasses.textSecondary}`}
                style={{
                  width: DOT * (active ? 3 : 1),
                  backgroundColor: active
                    ? isDark
                      ? '#fff'
                      : '#0f172a'
                    : isDark
                      ? 'rgba(255,255,255,0.3)'
                      : 'rgba(15,23,42,0.3)',
                }}
              />
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          className="rounded-full bg-green-500 px-6 py-3 shadow-lg">
          <Text className="text-base font-extrabold text-slate-900">
            {index === SLIDES.length - 1 ? 'Começar' : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
