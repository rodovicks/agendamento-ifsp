// src/utils/onboarding.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationProp } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

/** Chaves usadas no AsyncStorage */
export const ONBOARDING_SEEN_KEY = '@onboarding_seen';
export const ONBOARDING_VERSION_KEY = '@onboarding_version';

/**
 * Lê se o tutorial já foi visto.
 */
export async function getOnboardingSeen(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
    return v === '1';
  } catch {
    return false;
  }
}

/**
 * Marca o tutorial como visto.
 */
export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * Limpa a flag de visto (faz o tutorial aparecer de novo).
 */
export async function clearOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_SEEN_KEY);
  } catch {
    // ignore
  }
}

/**
 * Garante a versão atual do onboarding.
 * Quando você mudar textos/imagens, aumente `currentVersion`
 * para forçar reaparecer para todos os usuários.
 *
 * @returns `true` se houve mudança de versão (e a flag foi resetada).
 */
export async function ensureOnboardingVersion(currentVersion: string): Promise<boolean> {
  try {
    const saved = await AsyncStorage.getItem(ONBOARDING_VERSION_KEY);
    if (saved !== currentVersion) {
      await AsyncStorage.removeItem(ONBOARDING_SEEN_KEY);
      await AsyncStorage.setItem(ONBOARDING_VERSION_KEY, currentVersion);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Helper: decide se deve iniciar na Intro.
 * (Opcional — você pode apenas ler o AsyncStorage direto no RootNavigator.)
 */
export async function shouldStartAtIntro(options?: { version?: string }): Promise<boolean> {
  if (options?.version) {
    await ensureOnboardingVersion(options.version);
  }
  const seen = await getOnboardingSeen();
  return !seen;
}

/**
 * Reseta a flag e navega para a Intro de forma robusta.
 * Requer que 'Intro' exista no stack atual ou em um parent.
 */
export async function resetOnboardingAndGoToIntro(navigation: NavigationProp<any>): Promise<void> {
  await clearOnboardingSeen();

  // 1) tenta substituir na navegação atual
  try {
    // @ts-ignore - alguns tipos não expõem replace
    if (navigation?.replace) {
      // @ts-ignore
      navigation.replace('Intro');
      return;
    }
  } catch {
    // segue pros fallbacks
  }

  // 2) tenta navegar direto
  try {
    navigation.navigate('Intro' as never);
    return;
  } catch {
    // segue pros fallbacks
  }

  // 3) tenta resetar o parent
  // @ts-ignore
  const parent = navigation.getParent?.();
  if (parent) {
    parent.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Intro' as never }],
      })
    );
    return;
  }

  // 4) último recurso: reset no próprio navigator
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Intro' as never }],
    })
  );
}

/**
 * Marca como visto e leva ao Login. Útil no botão "Pular" / "Começar".
 * Requer que 'Login' exista no mesmo stack.
 */
export async function completeOnboardingAndGoToLogin(navigation: NavigationProp<any>): Promise<void> {
  await markOnboardingSeen();

  // 1) tenta replace
  try {
    // @ts-ignore
    if (navigation?.replace) {
      // @ts-ignore
      navigation.replace('Login');
      return;
    }
  } catch {}

  // 2) navega
  try {
    navigation.navigate('Login' as never);
    return;
  } catch {}

  // 3) reset
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' as never }],
    })
  );
}
