import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { TextInput, Button, ProgressBar, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, CancellationPolicy, HOUSE_RULES_OPTIONS } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateListingStep4'>;
  route: RouteProp<RootStackParamList, 'CreateListingStep4'>;
};

const CANCELLATION_POLICIES: { 
  key: CancellationPolicy; 
  label: string; 
  description: string;
  refund: string;
}[] = [
  {
    key: 'flexible',
    label: 'Flexible',
    description: 'Full refund up to 24 hours before check-in',
    refund: '100% refund if cancelled 24+ hours before',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    description: 'Full refund up to 5 days before check-in',
    refund: '100% refund if cancelled 5+ days before',
  },
  {
    key: 'strict',
    label: 'Strict',
    description: '50% refund up to 7 days before check-in',
    refund: '50% refund if cancelled 7+ days before',
  },
  {
    key: 'super_strict',
    label: 'Super Strict',
    description: '50% refund up to 30 days before check-in',
    refund: '50% refund if cancelled 30+ days before',
  },
];

const CHECK_IN_TIMES = [
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
  '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', 'Flexible',
];

const CHECK_OUT_TIMES = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', 'Flexible',
];

export default function CreateListingStep4Screen({ navigation, route }: Props) {
  const { listingData } = route.params;

  const [formData, setFormData] = useState({
    currency: listingData?.currency || 'USD' as 'USD' | 'ETB',
    pricePerNight: listingData?.pricePerNight?.toString() || '',
    cleaningFee: listingData?.cleaningFee?.toString() || '0',
    weeklyDiscount: listingData?.weeklyDiscount?.toString() || '0',
    monthlyDiscount: listingData?.monthlyDiscount?.toString() || '0',
    minimumStay: listingData?.minimumStay?.toString() || '1',
    maximumStay: listingData?.maximumStay?.toString() || '30',
    checkInTime: listingData?.checkInTime || '3:00 PM',
    checkOutTime: listingData?.checkOutTime || '11:00 AM',
    instantBook: listingData?.instantBook ?? true,
    cancellationPolicy: listingData?.cancellationPolicy || 'moderate' as CancellationPolicy,
    houseRules: listingData?.houseRules || [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleHouseRule = (ruleId: string) => {
    const current = formData.houseRules;
    if (current.includes(ruleId)) {
      updateField('houseRules', current.filter(id => id !== ruleId));
    } else {
      updateField('houseRules', [...current, ruleId]);
    }
  };

  const formatCurrency = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return formData.currency === 'USD' ? `$${num.toFixed(2)}` : `${num.toFixed(2)} ETB`;
  };

  const calculateEstimatedEarnings = (): { nightly: number; weekly: number; monthly: number } => {
    const price = parseFloat(formData.pricePerNight) || 0;
    const cleaning = parseFloat(formData.cleaningFee) || 0;
    const weeklyDisc = parseFloat(formData.weeklyDiscount) || 0;
    const monthlyDisc = parseFloat(formData.monthlyDiscount) || 0;
    const platformFee = 0.10; // 10% platform fee

    const nightly = (price + cleaning) * (1 - platformFee);
    const weekly = ((price * 7 * (1 - weeklyDisc / 100)) + cleaning) * (1 - platformFee);
    const monthly = ((price * 30 * (1 - monthlyDisc / 100)) + cleaning) * (1 - platformFee);

    return { nightly, weekly, monthly };
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const price = parseFloat(formData.pricePerNight);
    if (!formData.pricePerNight || isNaN(price)) {
      newErrors.pricePerNight = 'Please enter a nightly price';
    } else if (price < 1) {
      newErrors.pricePerNight = 'Price must be at least 1';
    } else if (price > 10000) {
      newErrors.pricePerNight = 'Price cannot exceed 10,000';
    }

    const cleaning = parseFloat(formData.cleaningFee);
    if (isNaN(cleaning) || cleaning < 0) {
      newErrors.cleaningFee = 'Please enter a valid cleaning fee';
    }

    const weeklyDisc = parseFloat(formData.weeklyDiscount);
    if (isNaN(weeklyDisc) || weeklyDisc < 0 || weeklyDisc > 50) {
      newErrors.weeklyDiscount = 'Discount must be between 0-50%';
    }

    const monthlyDisc = parseFloat(formData.monthlyDiscount);
    if (isNaN(monthlyDisc) || monthlyDisc < 0 || monthlyDisc > 70) {
      newErrors.monthlyDiscount = 'Discount must be between 0-70%';
    }

    const minStay = parseInt(formData.minimumStay);
    if (isNaN(minStay) || minStay < 1) {
      newErrors.minimumStay = 'Minimum stay must be at least 1 night';
    }

    const maxStay = parseInt(formData.maximumStay);
    if (isNaN(maxStay) || maxStay < minStay) {
      newErrors.maximumStay = 'Maximum stay must be greater than minimum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      navigation.navigate('CreateListingStep5', {
        listingData: {
          ...listingData,
          currency: formData.currency,
          pricePerNight: parseFloat(formData.pricePerNight),
          cleaningFee: parseFloat(formData.cleaningFee) || 0,
          weeklyDiscount: parseFloat(formData.weeklyDiscount) || 0,
          monthlyDiscount: parseFloat(formData.monthlyDiscount) || 0,
          minimumStay: parseInt(formData.minimumStay) || 1,
          maximumStay: parseInt(formData.maximumStay) || 30,
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
          instantBook: formData.instantBook,
          cancellationPolicy: formData.cancellationPolicy,
          houseRules: formData.houseRules,
        },
      });
    }
  };

  const handleBack = () => {
    navigation.navigate('CreateListingStep3', {
      listingData: {
        ...listingData,
        currency: formData.currency,
        pricePerNight: parseFloat(formData.pricePerNight) || 0,
        cleaningFee: parseFloat(formData.cleaningFee) || 0,
        weeklyDiscount: parseFloat(formData.weeklyDiscount) || 0,
        monthlyDiscount: parseFloat(formData.monthlyDiscount) || 0,
        minimumStay: parseInt(formData.minimumStay) || 1,
        maximumStay: parseInt(formData.maximumStay) || 30,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        instantBook: formData.instantBook,
        cancellationPolicy: formData.cancellationPolicy,
        houseRules: formData.houseRules,
      },
    });
  };

  const earnings = calculateEstimatedEarnings();
  const currencySymbol = formData.currency === 'USD' ? '$' : 'ETB ';

  // Selection Modal Component
  const SelectionModal = ({
    visible,
    onClose,
    title,
    data,
    selectedValue,
    onSelect,
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    data: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
  }) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  selectedValue === item && styles.modalItemSelected,
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedValue === item && styles.modalItemTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {selectedValue === item && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            style={styles.modalList}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <Text style={styles.stepText}>Step 4 of 5</Text>
          <Text style={styles.stepTitle}>Pricing & Rules</Text>
          <ProgressBar progress={0.8} color="#6366F1" style={styles.progressBar} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Currency Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currency</Text>
            <View style={styles.currencyToggle}>
              <TouchableOpacity
                style={[
                  styles.currencyOption,
                  formData.currency === 'USD' && styles.currencyOptionSelected,
                ]}
                onPress={() => updateField('currency', 'USD')}
              >
                <Text style={styles.currencyFlag}>🇺🇸</Text>
                <Text
                  style={[
                    styles.currencyLabel,
                    formData.currency === 'USD' && styles.currencyLabelSelected,
                  ]}
                >
                  USD ($)
                </Text>
                <Text style={styles.currencyHint}>For diaspora</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.currencyOption,
                  formData.currency === 'ETB' && styles.currencyOptionSelected,
                ]}
                onPress={() => updateField('currency', 'ETB')}
              >
                <Text style={styles.currencyFlag}>🇪🇹</Text>
                <Text
                  style={[
                    styles.currencyLabel,
                    formData.currency === 'ETB' && styles.currencyLabelSelected,
                  ]}
                >
                  ETB (Birr)
                </Text>
                <Text style={styles.currencyHint}>For locals</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>

            {/* Nightly Rate */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nightly Rate *</Text>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencyPrefix}>{currencySymbol}</Text>
                <TextInput
                  value={formData.pricePerNight}
                  onChangeText={(text) => updateField('pricePerNight', text.replace(/[^0-9.]/g, ''))}
                  mode="outlined"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  style={styles.priceInput}
                  error={!!errors.pricePerNight}
                />
                <Text style={styles.perNight}>/night</Text>
              </View>
              {errors.pricePerNight && (
                <Text style={styles.errorText}>{errors.pricePerNight}</Text>
              )}
            </View>

            {/* Cleaning Fee */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cleaning Fee</Text>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencyPrefix}>{currencySymbol}</Text>
                <TextInput
                  value={formData.cleaningFee}
                  onChangeText={(text) => updateField('cleaningFee', text.replace(/[^0-9.]/g, ''))}
                  mode="outlined"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  style={styles.priceInput}
                  error={!!errors.cleaningFee}
                />
                <Text style={styles.perNight}>one-time</Text>
              </View>
              {errors.cleaningFee && (
                <Text style={styles.errorText}>{errors.cleaningFee}</Text>
              )}
            </View>

            {/* Discounts */}
            <View style={styles.discountRow}>
              <View style={styles.discountItem}>
                <Text style={styles.inputLabel}>Weekly Discount</Text>
                <View style={styles.discountInputWrapper}>
                  <TextInput
                    value={formData.weeklyDiscount}
                    onChangeText={(text) => updateField('weeklyDiscount', text.replace(/[^0-9]/g, ''))}
                    mode="outlined"
                    placeholder="0"
                    keyboardType="number-pad"
                    style={styles.discountInput}
                    error={!!errors.weeklyDiscount}
                  />
                  <Text style={styles.percentSign}>%</Text>
                </View>
              </View>
              <View style={styles.discountItem}>
                <Text style={styles.inputLabel}>Monthly Discount</Text>
                <View style={styles.discountInputWrapper}>
                  <TextInput
                    value={formData.monthlyDiscount}
                    onChangeText={(text) => updateField('monthlyDiscount', text.replace(/[^0-9]/g, ''))}
                    mode="outlined"
                    placeholder="0"
                    keyboardType="number-pad"
                    style={styles.discountInput}
                    error={!!errors.monthlyDiscount}
                  />
                  <Text style={styles.percentSign}>%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Estimated Earnings */}
          <View style={styles.earningsBox}>
            <Text style={styles.earningsTitle}>💰 Estimated Earnings (after 10% platform fee)</Text>
            <View style={styles.earningsGrid}>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>Per Night</Text>
                <Text style={styles.earningsValue}>
                  {currencySymbol}{earnings.nightly.toFixed(2)}
                </Text>
              </View>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>Per Week</Text>
                <Text style={styles.earningsValue}>
                  {currencySymbol}{earnings.weekly.toFixed(2)}
                </Text>
              </View>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>Per Month</Text>
                <Text style={styles.earningsValue}>
                  {currencySymbol}{earnings.monthly.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Stay Duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stay Duration</Text>
            <View style={styles.stayRow}>
              <View style={styles.stayItem}>
                <Text style={styles.inputLabel}>Minimum Nights</Text>
                <TextInput
                  value={formData.minimumStay}
                  onChangeText={(text) => updateField('minimumStay', text.replace(/[^0-9]/g, ''))}
                  mode="outlined"
                  placeholder="1"
                  keyboardType="number-pad"
                  style={styles.stayInput}
                  error={!!errors.minimumStay}
                />
              </View>
              <View style={styles.stayItem}>
                <Text style={styles.inputLabel}>Maximum Nights</Text>
                <TextInput
                  value={formData.maximumStay}
                  onChangeText={(text) => updateField('maximumStay', text.replace(/[^0-9]/g, ''))}
                  mode="outlined"
                  placeholder="30"
                  keyboardType="number-pad"
                  style={styles.stayInput}
                  error={!!errors.maximumStay}
                />
              </View>
            </View>
          </View>

          {/* Check-in/out Times */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Check-in & Check-out</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={styles.inputLabel}>Check-in After</Text>
                <TouchableOpacity
                  style={styles.timeSelector}
                  onPress={() => setShowCheckInModal(true)}
                >
                  <Text style={styles.timeSelectorText}>{formData.checkInTime}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.inputLabel}>Check-out Before</Text>
                <TouchableOpacity
                  style={styles.timeSelector}
                  onPress={() => setShowCheckOutModal(true)}
                >
                  <Text style={styles.timeSelectorText}>{formData.checkOutTime}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Instant Book */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>⚡ Instant Book</Text>
                <Text style={styles.toggleDescription}>
                  Allow guests to book without waiting for your approval
                </Text>
              </View>
              <Switch
                value={formData.instantBook}
                onValueChange={(value) => updateField('instantBook', value)}
                color="#6366F1"
              />
            </View>
          </View>

          {/* Cancellation Policy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Policy</Text>
            <TouchableOpacity
              style={styles.policySelector}
              onPress={() => setShowCancellationModal(true)}
            >
              <View style={styles.policySelectorContent}>
                <Text style={styles.policySelectorLabel}>
                  {CANCELLATION_POLICIES.find(p => p.key === formData.cancellationPolicy)?.label}
                </Text>
                <Text style={styles.policySelectorDescription}>
                  {CANCELLATION_POLICIES.find(p => p.key === formData.cancellationPolicy)?.refund}
                </Text>
              </View>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* House Rules */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>House Rules</Text>
            <Text style={styles.sectionHint}>
              Select rules that apply to your property
            </Text>
            <View style={styles.rulesGrid}>
              {HOUSE_RULES_OPTIONS.map((rule) => (
                <TouchableOpacity
                  key={rule.id}
                  style={[
                    styles.ruleChip,
                    formData.houseRules.includes(rule.id) && styles.ruleChipSelected,
                  ]}
                  onPress={() => toggleHouseRule(rule.id)}
                >
                  <Text style={styles.ruleIcon}>{rule.icon}</Text>
                  <Text
                    style={[
                      styles.ruleLabel,
                      formData.houseRules.includes(rule.id) && styles.ruleLabelSelected,
                    ]}
                  >
                    {rule.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.backButton}
            textColor="#6B7280"
          >
            Back
          </Button>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.nextButton}
            buttonColor="#6366F1"
          >
            Next: Review
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* Modals */}
      <SelectionModal
        visible={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title="Check-in Time"
        data={CHECK_IN_TIMES}
        selectedValue={formData.checkInTime}
        onSelect={(value) => updateField('checkInTime', value)}
      />

      <SelectionModal
        visible={showCheckOutModal}
        onClose={() => setShowCheckOutModal(false)}
        title="Check-out Time"
        data={CHECK_OUT_TIMES}
        selectedValue={formData.checkOutTime}
        onSelect={(value) => updateField('checkOutTime', value)}
      />

      {/* Cancellation Policy Modal */}
      <Modal
        visible={showCancellationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCancellationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancellation Policy</Text>
              <TouchableOpacity onPress={() => setShowCancellationModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={CANCELLATION_POLICIES}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.policyItem,
                    formData.cancellationPolicy === item.key && styles.policyItemSelected,
                  ]}
                  onPress={() => {
                    updateField('cancellationPolicy', item.key);
                    setShowCancellationModal(false);
                  }}
                >
                  <View style={styles.policyItemContent}>
                    <Text style={styles.policyItemLabel}>{item.label}</Text>
                    <Text style={styles.policyItemDescription}>{item.description}</Text>
                    <Text style={styles.policyItemRefund}>{item.refund}</Text>
                  </View>
                  {formData.cancellationPolicy === item.key && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  progressHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  stepText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionHint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  // Currency Toggle
  currencyToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  currencyOptionSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  currencyFlag: {
    fontSize: 28,
    marginBottom: 8,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  currencyLabelSelected: {
    color: '#6366F1',
  },
  currencyHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  // Input Groups
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  perNight: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    marginTop: 4,
  },
  // Discounts
  discountRow: {
    flexDirection: 'row',
    gap: 16,
  },
  discountItem: {
    flex: 1,
  },
  discountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  percentSign: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  // Earnings Box
  earningsBox: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 28,
  },
  earningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 12,
  },
  earningsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningsItem: {
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 12,
    color: '#047857',
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
  },
  // Stay Duration
  stayRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stayItem: {
    flex: 1,
  },
  stayInput: {
    backgroundColor: '#FFFFFF',
  },
  // Time Selection
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeItem: {
    flex: 1,
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  timeSelectorText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Policy Selector
  policySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  policySelectorContent: {
    flex: 1,
  },
  policySelectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  policySelectorDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  // House Rules
  rulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ruleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  ruleChipSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  ruleIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  ruleLabel: {
    fontSize: 14,
    color: '#374151',
  },
  ruleLabelSelected: {
    color: '#6366F1',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalClose: {
    fontSize: 20,
    color: '#6B7280',
    padding: 4,
  },
  modalList: {
    paddingBottom: 40,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  modalItemText: {
    fontSize: 16,
    color: '#111827',
  },
  modalItemTextSelected: {
    color: '#6366F1',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 20,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  // Policy Item
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  policyItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  policyItemContent: {
    flex: 1,
  },
  policyItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  policyItemDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  policyItemRefund: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  backButton: {
    flex: 1,
    borderColor: '#D1D5DB',
  },
  nextButton: {
    flex: 2,
  },
});
