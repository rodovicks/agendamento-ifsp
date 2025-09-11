// screens/intro.tsx
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { markOnboardingSeen } from '../utils/onboarding'; // <— CORRIGIDO

const { width, height } = Dimensions.get('window');

type Slide = {
  key: string;
  title: string;
  description: string;
  image: any;
};

const SLIDES: Slide[] = [
  { key: 's0', title: 'Agende com facilidade', description: 'Cadastre e gerencie seus atendimentos em poucos toques.', image: require('../assets/carrocel/0.png') },
  { key: 's1', title: 'Organize seu dia', description: 'Visualize horários, serviços e clientes em um só lugar.', image: require('../assets/carrocel/1.png') },
  { key: 's2', title: 'Sua rotina, no controle', description: 'Leve seus agendamentos no bolso com praticidade.', image: require('../assets/carrocel/2.png') },
  { key: 's3', title: 'Comece agora', description: 'Ative recursos e personalize seu estabelecimento.', image: require('../assets/carrocel/3.png') },
];

const DOT = 8;

export default function IntroScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

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
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" />

      {/* Pular — usa safe area para descer */}
      <TouchableOpacity
        onPress={goLogin}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        style={{
          position: 'absolute',
          right: 16,
          top: insets.top + 24, // aumente para +40/+56 se quiser mais baixo
          zIndex: 10,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderWidth: 1,
          borderColor: 'rgba(15,23,42,0.12)',
        }}
      >
        <Text style={{ color: '#0f172a', fontSize: 14, fontWeight: '700' }}>Pular</Text>
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
          <View style={{ width, height, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <Image source={item.image} resizeMode="contain" style={{ width: width * 0.9, height: height * 0.55 }} />
            <Text style={{ color: '#0f172a', fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 16 }}>
              {item.title}
            </Text>
            <Text style={{ color: 'rgba(15,23,42,0.75)', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 8 }}>
              {item.description}
            </Text>
          </View>
        )}
      />

      <View style={{ position: 'absolute', bottom: 28, left: 0, right: 0, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {SLIDES.map((_, i) => {
            const active = i === index;
            return (
              <View
                key={i}
                style={{
                  width: DOT * (active ? 3 : 1),
                  height: DOT,
                  borderRadius: DOT,
                  backgroundColor: active ? '#0f172a' : 'rgba(15,23,42,0.3)',
                  marginHorizontal: 4,
                }}
              />
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          style={{
            backgroundColor: '#22c55e',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 999,
            shadowColor: '#22c55e',
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16 }}>
            {index === SLIDES.length - 1 ? 'Começar' : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
