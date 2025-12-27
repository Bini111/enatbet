import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LANGUAGES, LanguageCode } from '../i18n';
import { useLanguage } from '../i18n/LanguageProvider';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onClose,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const handleSelectLanguage = async (lang: LanguageCode) => {
    if (lang === language) {
      onClose();
      return;
    }
    
    setIsChanging(true);
    await setLanguage(lang);
    setIsChanging(false);
    onClose();
  };

  const languageList = Object.entries(LANGUAGES).map(([code, info]) => ({
    code: code as LanguageCode,
    ...info,
  }));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('languages.select')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={languageList}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.languageItem,
                  item.code === language && styles.languageItemSelected,
                ]}
                onPress={() => handleSelectLanguage(item.code)}
                disabled={isChanging}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <View style={styles.languageInfo}>
                  <Text style={styles.nativeName}>{item.nativeName}</Text>
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                {item.code === language && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

// Globe button to trigger language selector
export const LanguageButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.globeButton} onPress={onPress}>
      <Text style={styles.globeIcon}>🌐</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 20,
    color: '#6B7280',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageItemSelected: {
    backgroundColor: '#F5F3FF',
  },
  flag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  name: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  globeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeIcon: {
    fontSize: 24,
  },
});

export default LanguageSelector;
