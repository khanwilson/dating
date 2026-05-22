import { Ionicons } from '@expo/vector-icons';
import { useConfirmPhoneOtp, useRequestPhoneOtp } from 'api/hooks';
import { ApiError } from 'api/index';
import { PopupPhone404 } from 'components/modal/PopupPhone404';
import { getOnboardingRoute } from 'components/onboarding/useOnboardingStep';
import { CountryPickerModal } from 'components/phone/CountryPickerModal';
import { COUNTRIES, Country, toFlagEmoji } from 'components/phone/countryData';
import { AppText } from 'components/text/AppText';
import { router } from 'expo-router';
import { isValidPhoneNumber } from 'libphonenumber-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === 'VN')!;
const TITLE = 'Welcome back';
const CHAR_DELAY = 65;
const OTP_COUNTDOWN = 59;

// ---------- OTP Modal ----------
function OtpModal({
  visible,
  hint,
  otp,
  onChangeOtp,
  onVerify,
  onResend,
  countdown,
  isPending,
  isError,
  onDismiss,
  theme,
  insets,
}: {
  visible: boolean;
  hint: string;
  otp: string;
  onChangeOtp: (v: string) => void;
  onVerify: () => void;
  onResend: () => void;
  countdown: number;
  isPending: boolean;
  isError: boolean;
  onDismiss: () => void;
  theme: ITheme;
  insets: { bottom: number };
}) {
  const styles = useMemo(() => createModalStyles(theme, insets), [theme, insets]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) setTimeout(() => inputRef.current?.focus(), 200);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        style={styles.sheetWrap}
        behavior={Platform.OS === 'ios' ? 'position' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <AppText style={styles.title}>Enter OTP</AppText>
          <AppText style={styles.hint}>{hint}</AppText>

          <View style={styles.otpField}>
            <TextInput
              ref={inputRef}
              style={styles.otpInput}
              value={otp}
              onChangeText={(t) => onChangeOtp(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="• • • • • •"
              placeholderTextColor={theme.color.neutral[500]}
              returnKeyType="done"
              onSubmitEditing={onVerify}
            />
          </View>

          {isError && (
            <AppText style={styles.errorText}>Invalid OTP. Please try again.</AppText>
          )}

          <TouchableOpacity
            style={[styles.verifyBtn, (!otp.trim() || isPending) && styles.verifyBtnDisabled]}
            onPress={onVerify}
            disabled={!otp.trim() || isPending}
          >
            {isPending
              ? <ActivityIndicator size="small" color="#fff" />
              : <AppText style={styles.verifyBtnText}>Verify</AppText>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendBtn}
            onPress={onResend}
            disabled={countdown > 0}
          >
            <AppText style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </AppText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------- Main screen ----------
export default function SignInScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  // Typewriter
  const [chars, setChars] = useState(0);

  // Reanimated
  const titleY = useSharedValue(screenH / 2 - insets.top - 72);
  const iconOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const phoneBtnOpacity = useSharedValue(0);
  const emailBtnOpacity = useSharedValue(0);
  const newUserOpacity = useSharedValue(0);
  const htlX = useSharedValue(-140); const htlY = useSharedValue(-140);
  const htrX = useSharedValue(140); const htrY = useSharedValue(-140);
  const hblX = useSharedValue(-140); const hblY = useSharedValue(140);
  const hbrX = useSharedValue(140); const hbrY = useSharedValue(140);

  useEffect(() => {
    let i = 0;
    let tid: ReturnType<typeof setTimeout>;
    const iv = setInterval(() => {
      i += 1;
      setChars(i);
      if (i >= TITLE.length) {
        clearInterval(iv);
        tid = setTimeout(() => {
          titleY.value = withSpring(0, { damping: 14, stiffness: 85 });
          iconOpacity.value = withDelay(120, withTiming(1, { duration: 380 }));
          subtitleOpacity.value = withDelay(220, withTiming(1, { duration: 380 }));
          phoneBtnOpacity.value = withDelay(380, withTiming(1, { duration: 320 }));
          emailBtnOpacity.value = withDelay(480, withTiming(1, { duration: 320 }));
          newUserOpacity.value = withDelay(580, withTiming(1, { duration: 320 }));
          const hs = { damping: 4, stiffness: 75, mass: 0.7 };
          htlX.value = withSpring(0, hs); htlY.value = withSpring(0, hs);
          htrX.value = withSpring(0, hs); htrY.value = withSpring(0, hs);
          hblX.value = withSpring(0, hs); hblY.value = withSpring(0, hs);
          hbrX.value = withSpring(0, hs); hbrY.value = withSpring(0, hs);
        }, 160);
      }
    }, CHAR_DELAY);
    return () => { clearInterval(iv); clearTimeout(tid); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ transform: [{ translateY: titleY.value }] }));
  const iconStyle = useAnimatedStyle(() => ({ opacity: iconOpacity.value }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const phoneStyle = useAnimatedStyle(() => ({ opacity: phoneBtnOpacity.value }));
  const emailStyle = useAnimatedStyle(() => ({ opacity: emailBtnOpacity.value }));
  const newUserStyle = useAnimatedStyle(() => ({ opacity: newUserOpacity.value }));
  const htlStyle = useAnimatedStyle(() => ({ transform: [{ translateX: htlX.value }, { translateY: htlY.value }, { rotate: '45deg' }] }));
  const htrStyle = useAnimatedStyle(() => ({ transform: [{ translateX: htrX.value }, { translateY: htrY.value }, { rotate: '-45deg' }] }));
  const hblStyle = useAnimatedStyle(() => ({ transform: [{ translateX: hblX.value }, { translateY: hblY.value }, { rotate: '-45deg' }] }));
  const hbrStyle = useAnimatedStyle(() => ({ transform: [{ translateX: hbrX.value }, { translateY: hbrY.value }, { rotate: '45deg' }] }));

  // Phone
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  // OTP modal
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [phone404Visible, setPhone404Visible] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestOtp = useRequestPhoneOtp();
  const verifyOtp = useConfirmPhoneOtp();

  const isPhoneValid =
    phoneNumber.trim().length > 0 &&
    isValidPhoneNumber(`${country.dialCode}${phoneNumber.trim()}`);

  const startCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(OTP_COUNTDOWN);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const [phoneExpanded, setPhoneExpanded] = useState(false);

  const sendOtp = useCallback(() => {
    if (!isPhoneValid || requestOtp.isPending) return;
    const phoneCode = country.dialCode.replace(/^\+/, '');
    requestOtp.mutate(
      { phoneCode, phoneNumber: phoneNumber.trim() },
      {
        onSuccess: () => {
          setOtp('');
          setOtpModalVisible(true);
          startCountdown();
        },
        onError: (error: ApiError) => {
          const status = error?.statusCode;
          const code = error?.data?.code;
          if (status === 404 && code === 'PHONE_NOT_REGISTERED') {
            setPhone404Visible(true);
          }
        },
      },
    );
  }, [isPhoneValid, requestOtp, country.dialCode, phoneNumber, startCountdown]);

  const resendOtp = useCallback(() => {
    if (countdown > 0) return;
    const phoneCode = country.dialCode.replace(/^\+/, '');
    requestOtp.mutate(
      { phoneCode, phoneNumber: phoneNumber.trim() },
      { onSuccess: () => startCountdown() },
    );
  }, [countdown, country.dialCode, phoneNumber, requestOtp, startCountdown]);

  const handleVerify = useCallback(() => {
    if (!otp.trim() || verifyOtp.isPending) return;
    verifyOtp.mutate({
      phoneCode: country.dialCode.replace(/^\+/, ''),
      phoneNumber: phoneNumber.trim(),
      otp: otp.trim(),
    });
  }, [otp, verifyOtp, country.dialCode, phoneNumber]);

  const handleNewUser = useCallback(() => {
    ZustandPersist.getState().clearProfile();
    ZustandPersist.getState().logout();
    router.replace(getOnboardingRoute(1) as any);
  }, []);

  const otpHint = `Sent to ${country.dialCode} ${phoneNumber}`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Decorative hearts */}
      <Animated.View style={[styles.heartTL, htlStyle]} pointerEvents="none">
        <Ionicons name="heart" size={22} color={`${theme.color.primary[500]}55`} />
      </Animated.View>
      <Animated.View style={[styles.heartTR, htrStyle]} pointerEvents="none">
        <Ionicons name="heart" size={17} color={`${theme.color.primary[500]}45`} />
      </Animated.View>
      <Animated.View style={[styles.heartBL, hblStyle]} pointerEvents="none">
        <Ionicons name="heart" size={16} color={`${theme.color.primary[500]}40`} />
      </Animated.View>
      <Animated.View style={[styles.heartBR, hbrStyle]} pointerEvents="none">
        <Ionicons name="heart" size={26} color={`${theme.color.primary[500]}50`} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={iconStyle}>
            <Ionicons name="heart" size={44} color={theme.color.primary[500]} />
          </Animated.View>
          <Animated.View style={titleStyle}>
            <AppText style={styles.title}>
              {TITLE.slice(0, chars)}{chars < TITLE.length ? '|' : ''}
            </AppText>
          </Animated.View>
          <Animated.View style={subtitleStyle}>
            <AppText style={styles.subtitle}>Sign in to continue</AppText>
          </Animated.View>
        </View>

        {/* Phone */}
        <Animated.View style={phoneStyle}>
          <TouchableOpacity
            style={[styles.methodBtn, phoneExpanded && styles.methodBtnActive]}
            onPress={() => setPhoneExpanded((v) => !v)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color={phoneExpanded ? theme.color.primary[500] : theme.color.neutral[400]}
            />
            <AppText style={[styles.methodBtnText, phoneExpanded && styles.methodBtnTextActive]}>
              Phone number
            </AppText>
            <Ionicons
              name={phoneExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.color.neutral[500]}
            />
          </TouchableOpacity>

          {phoneExpanded && (
            <View style={styles.methodContent}>
              <View style={styles.phoneRow}>
                <TouchableOpacity
                  style={[styles.underlineField, styles.codeBtn]}
                  onPress={() => setPickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <AppText style={styles.flagText}>{toFlagEmoji(country.code)}</AppText>
                  <AppText style={styles.codeText}>{country.dialCode}</AppText>
                </TouchableOpacity>
                <View style={[styles.underlineField, styles.phoneInputWrap]}>
                  <TextInput
                    style={styles.textInput}
                    value={phoneNumber}
                    onChangeText={(t) => setPhoneNumber(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={14}
                    placeholder="912 345 678"
                    placeholderTextColor={theme.color.neutral[500]}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={sendOtp}
                  />
                </View>
              </View>
              {requestOtp.isError && (
                <AppText style={styles.errorText}>Failed to send OTP. Please try again.</AppText>
              )}
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  (!isPhoneValid || requestOtp.isPending || countdown > 0) && styles.actionBtnDisabled,
                ]}
                onPress={() => countdown > 0 ? setOtpModalVisible(true) : sendOtp()}
                disabled={!isPhoneValid || requestOtp.isPending}
              >
                {requestOtp.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : countdown > 0 ? (
                  <AppText style={styles.actionBtnText}>Resend in {countdown}s</AppText>
                ) : (
                  <AppText style={styles.actionBtnText}>Send OTP</AppText>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Email — hidden until email OTP endpoint is available */}
        {/* <Animated.View style={emailStyle}>...</Animated.View> */}
      </ScrollView>

      {/* New user */}
      <Animated.View style={newUserStyle}>
        <TouchableOpacity style={styles.newUserBtn} onPress={handleNewUser}>
          <AppText style={styles.newUserText}>Start as new user</AppText>
        </TouchableOpacity>
      </Animated.View>

      {/* OTP Modal */}
      <OtpModal
        visible={otpModalVisible}
        hint={otpHint}
        otp={otp}
        onChangeOtp={setOtp}
        onVerify={handleVerify}
        onResend={resendOtp}
        countdown={countdown}
        isPending={verifyOtp.isPending}
        isError={verifyOtp.isError}
        onDismiss={() => setOtpModalVisible(false)}
        theme={theme}
        insets={insets}
      />

      <CountryPickerModal
        visible={pickerVisible}
        selected={country}
        onSelect={(c) => { setCountry(c); setPickerVisible(false); }}
        onClose={() => setPickerVisible(false)}
      />

      <PopupPhone404
        visible={phone404Visible}
        onClose={() => setPhone404Visible(false)}
        onRegister={() => {
          setPhone404Visible(false);
          ZustandPersist.getState().clearProfile();
          ZustandPersist.getState().logout();
          router.replace(getOnboardingRoute(1) as any);
        }}
      />
    </KeyboardAvoidingView>
  );
}

// ---------- Styles ----------
const createStyles = (theme: ITheme, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.color.neutral[900], paddingTop: insets.top },
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 16 },
    header: { alignItems: 'center', paddingVertical: 44, gap: 10 },
    title: { fontSize: 30, fontWeight: 'bold', color: theme.color.textColor.white },
    subtitle: { fontSize: 15, color: theme.color.neutral[400] },
    heartTL: { position: 'absolute', top: insets.top + 90, left: 28 },
    heartTR: { position: 'absolute', top: insets.top + 110, right: 28 },
    heartBL: { position: 'absolute', bottom: 210, left: 22 },
    heartBR: { position: 'absolute', bottom: 190, right: 22 },
    methodBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 16, paddingHorizontal: 16,
      borderRadius: 12, borderWidth: 1.5,
      borderColor: theme.color.neutral[700], marginBottom: 10,
    },
    methodBtnActive: { borderColor: theme.color.primary[500] },
    methodBtnText: { flex: 1, fontSize: 16, color: theme.color.neutral[400] },
    methodBtnTextActive: { color: theme.color.primary[500] },
    methodContent: { paddingHorizontal: 4, paddingBottom: 16, gap: 12 },
    phoneRow: { flexDirection: 'row', gap: 12 },
    underlineField: { borderBottomWidth: 2, borderBottomColor: theme.color.primary[500] },
    codeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 4 },
    flagText: { fontSize: 22 },
    codeText: { fontSize: 20, fontWeight: '600', color: theme.color.textColor.white },
    phoneInputWrap: { flex: 1 },
    textInput: { fontSize: 18, fontWeight: '500', color: theme.color.textColor.white, paddingVertical: 10 },
    actionBtn: { backgroundColor: theme.color.primary[500], borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
    actionBtnDisabled: { opacity: 0.45 },
    actionBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    errorText: { fontSize: 13, color: theme.color.red[500] },
    newUserBtn: { paddingVertical: 16, paddingBottom: insets.bottom + 16, alignItems: 'center' },
    newUserText: { fontSize: 14, color: theme.color.textColor.white, textDecorationLine: 'underline' },
  });

const createModalStyles = (theme: ITheme, insets: { bottom: number }) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
    sheetWrap: { justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: theme.color.neutral[800],
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: insets.bottom + 24,
      gap: 16,
    },
    handle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: theme.color.neutral[600],
      alignSelf: 'center', marginBottom: 8,
    },
    title: { fontSize: 20, fontWeight: '700', color: theme.color.textColor.white, textAlign: 'center' },
    hint: { fontSize: 13, color: theme.color.neutral[400], textAlign: 'center', marginTop: -8 },
    otpField: {
      borderBottomWidth: 2,
      borderBottomColor: theme.color.primary[500],
      marginHorizontal: 16,
    },
    otpInput: {
      fontSize: 28, fontWeight: '700',
      color: theme.color.textColor.white,
      textAlign: 'center', letterSpacing: 10,
      paddingVertical: 12,
    },
    errorText: { fontSize: 13, color: theme.color.red[500], textAlign: 'center', marginTop: -8 },
    verifyBtn: {
      backgroundColor: theme.color.primary[500],
      borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    },
    verifyBtnDisabled: { opacity: 0.4 },
    verifyBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    resendBtn: { alignItems: 'center', paddingVertical: 4 },
    resendText: { fontSize: 14, color: theme.color.primary[500], fontWeight: '600' },
    resendTextDisabled: { color: theme.color.neutral[500] },
  });
