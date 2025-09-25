import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  View,
} from 'react-native';
import { Container } from '../components/Container';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';
import {
  VariaveisDisponiveis,
  EditorTemplate,
  AcoesTemplate,
  HeaderTemplate,
  LoadingTemplate,
  TEMPLATE_PADRAO,
  TemplateService,
} from '../components/TemplateMensagem';

export default function TemplateMensagemScreen() {
  const { estabelecimento } = useAuthStore();
  const navigation = useNavigation();
  const [template, setTemplate] = useState(TEMPLATE_PADRAO);
  const [loading, setLoading] = useState(false);
  const [carregandoTemplate, setCarregandoTemplate] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);

  useEffect(() => {
    carregarTemplate();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const carregarTemplate = async () => {
    if (!estabelecimento?.id) return;

    try {
      const templateCarregado = await TemplateService.carregarTemplate(estabelecimento.id);
      if (templateCarregado) {
        setTemplate(templateCarregado);
      }
    } catch (error) {
      console.error('Erro ao carregar template:', error);
    } finally {
      setCarregandoTemplate(false);
    }
  };

  const salvarTemplate = async () => {
    if (!estabelecimento?.id) return;

    setLoading(true);
    try {
      await TemplateService.salvarTemplate(estabelecimento.id, template);
      Alert.alert('Sucesso', 'Template de mensagem salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      Alert.alert('Erro', 'Não foi possível salvar o template.');
    } finally {
      setLoading(false);
    }
  };

  const restaurarPadrao = () => {
    Alert.alert(
      'Restaurar Template Padrão',
      'Tem certeza que deseja restaurar o template padrão? As alterações atuais serão perdidas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, restaurar',
          onPress: () => setTemplate(TEMPLATE_PADRAO),
        },
      ]
    );
  };

  if (carregandoTemplate) {
    return <LoadingTemplate />;
  }

  return (
    <SafeAreaView className={`flex-1 ${themeClasses.background}`}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: Math.max(keyboardHeight + 20, 100),
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={true}>
          <HeaderTemplate />

          <VariaveisDisponiveis />

          <EditorTemplate template={template} onTemplateChange={setTemplate} />

          <View className={`relative ${themeClasses.background}`}>
            <AcoesTemplate
              loading={loading}
              onSalvar={salvarTemplate}
              onRestaurarPadrao={restaurarPadrao}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
