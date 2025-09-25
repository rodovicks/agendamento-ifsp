// src/screens/IntroCarousel.tsx
import React, { useRef, useState, useCallback } from 'react';
import { View, Text, Image, FlatList, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

type Slide = {
  key: string;
  title: string;
  description: string;
  image: any; // require(...)
};

const SLIDES: Slide[] = [
  {
    key: '1',
    title: 'Agende com facilidade',
    description: 'Cadastre e gerencie seus atendimentos em poucos toques.',
    image: require('../../../assets/carrocel/01.png'),
  },
  {
    key: '2',
    title: 'Organize seu dia',
    description: 'Visualize horários, serviços e clientes em um só lugar.',
    image: require('../../../assets/carrocel/02.png'),
  },
  {
    key: '3',
    title: 'Confirmações automáticas',
    description: 'Envie confirmações e reduza faltas nos agendamentos.',
    image: require('../../../assets/carrocel/03.png'),
  },
];

const DOT_SIZE = 8;

export default function IntroCarousel() {
  const nav = useNavigation<any>();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  const goLogin = useCallback(async () => {
    // opcional: guardar flag para não mostrar novamente
    try {
      await AsyncStorage.setItem('@onboarding_seen', '1');
    } catch {}
    nav.reset({ index: 0, routes: [{ name: 'Login' }] });
  }, [nav]);

  const handleNext = useCallback(() => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      goLogin();
    }
  }, [index, goLogin]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length) {
      setIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View className={`flex-1 ${themeClasses.background}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {/* Botão Pular */}
      <TouchableOpacity
        onPress={goLogin}
        className={`absolute right-4 top-4 z-10 rounded-full border px-3 py-2 ${themeClasses.cardBackground} ${themeClasses.border}`}
        style={{ backgroundColor: isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.9)' }}>
        <Text className={`text-sm font-semibold ${themeClasses.textPrimary}`}>Pular</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={{ width, height }} className="items-center justify-center">
            <Image
              source={item.image}
              resizeMode="contain"
              style={{ width: width * 0.9, height: height * 0.55 }}
            />

            <View className="mt-4 items-center px-6">
              <Text className={`text-center text-xl font-extrabold ${themeClasses.textPrimary}`}>
                {item.title}
              </Text>
              <Text
                className={`mt-2 text-center text-sm ${themeClasses.textSecondary}`}
                style={{ lineHeight: 20 }}>
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Indicadores + Próximo */}
      <View className="absolute bottom-7 left-0 right-0 items-center" style={{ gap: 16 }}>
        {/* Dots */}
        <View className="flex-row" style={{ gap: 8 }}>
          {SLIDES.map((_, i) => {
            const active = i === index;
            return (
              <View
                key={i}
                style={{
                  width: DOT_SIZE * (active ? 3 : 1),
                  height: DOT_SIZE,
                  borderRadius: DOT_SIZE,
                  backgroundColor: active
                    ? isDark
                      ? '#fff'
                      : '#0f172a'
                    : isDark
                      ? 'rgba(255,255,255,0.4)'
                      : 'rgba(15,23,42,0.4)',
                }}
              />
            );
          })}
        </View>

        {/* Botão Próximo / Começar */}
        <TouchableOpacity
          onPress={handleNext}
          className="rounded-full bg-green-500 px-6 py-3 shadow-lg">
          <Text className="text-base font-extrabold text-slate-900">
            {index === SLIDES.length - 1 ? 'Começar' : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
