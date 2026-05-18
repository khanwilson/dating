import { AppText } from 'components/text/AppText';
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import { Country, COUNTRIES, toFlagEmoji } from './countryData';

const MODAL_HEIGHT = Dimensions.get('window').height * 0.65;

interface Props {
  visible: boolean;
  selected: Country;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

function CountryRow({
  item,
  isSelected,
  onPress,
  theme,
}: {
  item: Country;
  isSelected: boolean;
  onPress: () => void;
  theme: ITheme;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, isSelected && { backgroundColor: `${theme.color.primary[500]}18` }]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <AppText style={styles.flag}>{toFlagEmoji(item.code)}</AppText>
      <AppText style={[styles.countryName, { color: theme.color.textColor.white }]} numberOfLines={1}>
        {item.name}
      </AppText>
      <AppText style={[styles.dialCode, { color: isSelected ? theme.color.primary[400] : theme.color.neutral[400] }]}>
        ({item.dialCode})
      </AppText>
    </TouchableOpacity>
  );
}

const MemoCountryRow = memo(CountryRow);

export function CountryPickerModal({ visible, selected, onSelect, onClose }: Props) {
  const theme = useAppTheme();
  const panelStyles = useMemo(() => createStyles(theme), [theme]);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dialCode.includes(q),
    );
  }, [query]);

  const handleSelect = useCallback(
    (country: Country) => {
      onSelect(country);
      setQuery('');
    },
    [onSelect],
  );

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  const renderItem = useCallback(
    ({ item }: { item: Country }) => (
      <MemoCountryRow
        item={item}
        isSelected={item.code === selected.code}
        onPress={() => handleSelect(item)}
        theme={theme}
      />
    ),
    [selected.code, handleSelect, theme],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable style={panelStyles.backdrop} onPress={handleClose} />

      <View style={[panelStyles.panel, { height: MODAL_HEIGHT }]}>
        <View style={panelStyles.handle} />

        <AppText style={[panelStyles.title, { color: theme.color.textColor.white }]}>
          Select country code
        </AppText>

        <View style={[panelStyles.searchWrapper, { borderColor: theme.color.neutral[600] }]}>
          <TextInput
            style={[panelStyles.searchInput, { color: theme.color.textColor.white }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search country or code..."
            placeholderTextColor={theme.color.neutral[500]}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={panelStyles.listContent}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  flag: { fontSize: 24, width: 32, textAlign: 'center' },
  countryName: { flex: 1, fontSize: 15, fontWeight: '500' },
  dialCode: { fontSize: 14 },
});

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    panel: {
      backgroundColor: theme.color.neutral[800],
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 12,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.color.neutral[600],
      alignSelf: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 16,
    },
    searchWrapper: {
      marginHorizontal: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    searchInput: { fontSize: 15, height: 28 },
    listContent: { paddingBottom: 24 },
  });
