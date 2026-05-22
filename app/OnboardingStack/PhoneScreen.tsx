import { useRegister } from 'api/hooks';
import { FadeInView } from 'components/onboarding/FadeInView';
import { OnboardingFooter } from 'components/onboarding/OnboardingFooter';
import { OnboardingProgressBar } from 'components/onboarding/OnboardingProgressBar';
import { useOnboardingStep } from 'components/onboarding/useOnboardingStep';
import { CountryPickerModal } from 'components/phone/CountryPickerModal';
import { COUNTRIES, Country, toFlagEmoji } from 'components/phone/countryData';
import { AppText } from 'components/text/AppText';
import { useRouter } from 'expo-router';
import { isValidPhoneNumber } from 'libphonenumber-js';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === 'VN')!;

export default function PhoneScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { currentStep, totalSteps, goNext, goBack } = useOnboardingStep();
  const register = useRegister();
  const numberRef = useRef<TextInput>(null);

  const saved = ZustandPersist.getState().userProfile;
  const [country, setCountry] = useState<Country>(() => {
    const savedCode = saved?.phoneCode;
    return COUNTRIES.find((c) => c.dialCode.replace(/^\+/, '') === savedCode) ?? DEFAULT_COUNTRY;
  });
  const [phoneNumber, setPhoneNumber] = useState(saved?.phoneNumber ?? '');
  const [pickerVisible, setPickerVisible] = useState(false);

  const fullNumber = `${country.dialCode}${phoneNumber.trim()}`;
  const isValid = phoneNumber.trim().length > 0 && isValidPhoneNumber(fullNumber);

  const handleSelect = useCallback((selected: Country) => {
    setCountry(selected);
    setPickerVisible(false);
    numberRef.current?.focus();
  }, []);

  const handleNext = useCallback(() => {
    if (!isValid || register.isPending) return;
    const phoneCode = country.dialCode.replace(/^\+/, '');
    const number = phoneNumber.trim();
    ZustandPersist.getState().setUserProfile({ phoneCode, phoneNumber: number } as any);
    register.mutate(
      { phoneCode, phoneNumber: number },
      { onSuccess: () => goNext(router) },
    );
  }, [isValid, register, country.dialCode, phoneNumber, goNext, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <FadeInView style={styles.content}>
        <AppText style={styles.title}>{"What's your phone number?"}</AppText>
        <AppText style={styles.subtitle}>
          {"We'll use this to verify your account. It won't be visible to others."}
        </AppText>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.fieldWrapper, styles.codeButton]}
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.7}
          >
            <AppText style={styles.flagText}>{toFlagEmoji(country.code)}</AppText>
            <AppText style={styles.codeText}>{country.dialCode}</AppText>
          </TouchableOpacity>

          <View style={[styles.fieldWrapper, styles.numberWrapper]}>
            <TextInput
              ref={numberRef}
              style={styles.input}
              value={phoneNumber}
              onChangeText={(t) => setPhoneNumber(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={14}
              placeholder="912 345 678"
              placeholderTextColor={theme.color.neutral[500]}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
          </View>
        </View>
      </FadeInView>

      <OnboardingFooter
        currentStep={currentStep}
        onNext={handleNext}
        onBack={() => goBack(router)}
        nextDisabled={!isValid || register.isPending}
        loading={register.isPending}
      />

      <CountryPickerModal
        visible={pickerVisible}
        selected={country}
        onSelect={handleSelect}
        onClose={() => setPickerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.color.neutral[900] },
    content: { flex: 1, paddingHorizontal: 24 },
    title: {
      fontSize: theme.fontSize.p24,
      fontWeight: 'bold',
      color: theme.color.textColor.white,
      textAlign: 'center',
      marginTop: 42,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: theme.fontSize.p14,
      color: theme.color.neutral[400],
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 20,
    },
    row: { flexDirection: 'row', gap: 12, marginHorizontal: 20 },
    fieldWrapper: { borderBottomWidth: 2, borderBottomColor: theme.color.primary[500] },
    codeButton: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingVertical: 12, paddingHorizontal: 4,
    },
    flagText: { fontSize: 22 },
    codeText: { fontSize: 22, fontWeight: '600', color: theme.color.textColor.white },
    numberWrapper: { flex: 1 },
    input: {
      fontSize: 24, fontWeight: '600',
      color: theme.color.textColor.white,
      textAlign: 'center', paddingVertical: 12,
    },
  });
