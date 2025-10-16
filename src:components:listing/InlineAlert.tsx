// src/components/common/InlineAlert.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface InlineAlertProps {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onDismiss?: () => void;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  message,
  type = 'info',
  icon,
  onDismiss,
}) => {
  const iconName = icon || getDefaultIcon(type);
  const colors = getColors(type);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`${type} alert: ${message}`}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={20}
        color={colors.text}
        style={styles.icon}
      />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.dismissButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
        >
          <MaterialCommunityIcons
            name="close"
            size={18}
            color={colors.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const getDefaultIcon = (type: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (type) {
    case 'warning':
      return 'alert';
    case 'error':
      return 'alert-circle';
    case 'success':
      return 'check-circle';
    default:
      return 'information';
  }
};

const getColors = (type: string) => {
  switch (type) {
    case 'warning':
      return { background: '#fff3cd', text: '#856404', border: '#ffc107' };
    case 'error':
      return { background: '#f8d7da', text: '#721c24', border: '#f44336' };
    case 'success':
      return { background: '#d4edda', text: '#155724', border: '#4caf50' };
    default:
      return { background: '#d1ecf1', text: '#0c5460', border: '#17a2b8' };
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
});