// src/screens/IntroCarousel.tsx
import React, { useRef, useState, useCallback } from "react";
import { View, Text, Image, FlatList, Dimensions, TouchableOpacity, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

type Slide = {
  key: string;
  title: string;
  description: string;
  image: any; // require(...)
};

const SLIDES: Slide[] = [
  {
    key: "1",
    title: "Agende com facilidade",
    description: "Cadastre e gerencie seus atendimentos em poucos toques.",
    image: require("../../../assets/carrocel/01.png"),
  },
  {
    key: "2",
    title: "Organize seu dia",
    description: "Visualize horários, serviços e clientes em um só lugar.",
    image: require("../../../assets/carrocel/02.png"),
  },
  {
    key: "3",
    title: "Confirmações automáticas",
    description: "Envie confirmações e reduza faltas nos agendamentos.",
    image: require("../../../assets/carrocel/03.png"),
  },
];

const DOT_SIZE = 8;

export default function IntroCarousel() {
  const nav = useNavigation<any>();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const goLogin = useCallback(async () => {
    // opcional: guardar flag para não mostrar novamente
    try { await AsyncStorage.setItem("@onboarding_seen", "1"); } catch {}
    nav.reset({ index: 0, routes: [{ name: "Login" }] });
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
    <View style={{ flex: 1, backgroundColor: "#0f172a" /* slate-900 */ }}>
      <StatusBar barStyle="light-content" />
      {/* Botão Pular */}
      <TouchableOpacity
        onPress={goLogin}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 999,
          backgroundColor: "rgba(15,23,42,0.5)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>Pular</Text>
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
          <View style={{ width, height, alignItems: "center", justifyContent: "center" }}>
            <Image
              source={item.image}
              resizeMode="contain"
              style={{ width: width * 0.9, height: height * 0.55 }}
            />

            <View style={{ paddingHorizontal: 24, marginTop: 16, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", textAlign: "center" }}>
                {item.title}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 8,
                  lineHeight: 20,
                }}
              >
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Indicadores + Próximo */}
      <View
        style={{
          position: "absolute",
          bottom: 28,
          left: 0,
          right: 0,
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Dots */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {SLIDES.map((_, i) => {
            const active = i === index;
            return (
              <View
                key={i}
                style={{
                  width: DOT_SIZE * (active ? 3 : 1),
                  height: DOT_SIZE,
                  borderRadius: DOT_SIZE,
                  backgroundColor: active ? "#fff" : "rgba(255,255,255,0.4)",
                }}
              />
            );
          })}
        </View>

        {/* Botão Próximo / Começar */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: "#22c55e", // emerald-500
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 999,
            shadowColor: "#22c55e",
            shadowOpacity: 0.35,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        >
          <Text style={{ color: "#0f172a", fontWeight: "800", fontSize: 16 }}>
            {index === SLIDES.length - 1 ? "Começar" : "Próximo"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
