import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Slider from "@react-native-community/slider";

type RouteParams = {
  Filters: {
    currentFilters?: FilterState;
    onApply?: (filters: FilterState) => void;
  };
};

export interface FilterState {
  priceMin: number;
  priceMax: number;
  propertyTypes: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  guestsMin: number;
  amenities: string[];
  instantBook: boolean | null;
  superhost: boolean;
  sortBy: "relevance" | "price_low" | "price_high" | "rating" | "newest";
}

const DEFAULT_FILTERS: FilterState = {
  priceMin: 0,
  priceMax: 500,
  propertyTypes: [],
  bedrooms: null,
  bathrooms: null,
  guestsMin: 1,
  amenities: [],
  instantBook: null,
  superhost: false,
  sortBy: "relevance",
};

const PROPERTY_TYPES = [
  { id: "entire_home", label: "Entire home", icon: "home" },
  { id: "private_room", label: "Private room", icon: "bed" },
  { id: "shared_room", label: "Shared room", icon: "people" },
  { id: "apartment", label: "Apartment", icon: "business" },
  { id: "villa", label: "Villa", icon: "home" },
  { id: "condo", label: "Condo", icon: "albums" },
  { id: "traditional", label: "Traditional home", icon: "leaf" },
];

const AMENITIES = [
  { id: "wifi", label: "WiFi", icon: "wifi" },
  { id: "kitchen", label: "Kitchen", icon: "restaurant" },
  { id: "parking", label: "Free parking", icon: "car" },
  { id: "ac", label: "Air conditioning", icon: "snow" },
  { id: "washer", label: "Washer", icon: "water" },
  { id: "dryer", label: "Dryer", icon: "sunny" },
  { id: "tv", label: "TV", icon: "tv" },
  { id: "pool", label: "Pool", icon: "water" },
  { id: "gym", label: "Gym", icon: "fitness" },
  { id: "hotTub", label: "Hot tub", icon: "thermometer" },
  { id: "patio", label: "Patio/Balcony", icon: "leaf" },
  { id: "workspace", label: "Workspace", icon: "desktop" },
  { id: "pets", label: "Pets allowed", icon: "paw" },
];

const SORT_OPTIONS = [
  { id: "relevance", label: "Most Relevant" },
  { id: "price_low", label: "Price: Low to High" },
  { id: "price_high", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
  { id: "newest", label: "Newest Listings" },
];

export default function FiltersScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "Filters">>();
  const { currentFilters, onApply } = route.params || {};

  const [filters, setFilters] = useState<FilterState>(
    currentFilters || DEFAULT_FILTERS
  );
  const [showSortModal, setShowSortModal] = useState(false);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const togglePropertyType = (typeId: string) => {
    setFilters((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(typeId)
        ? prev.propertyTypes.filter((t) => t !== typeId)
        : [...prev.propertyTypes, typeId],
    }));
  };

  const toggleAmenity = (amenityId: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    if (onApply) {
      onApply(filters);
    }
    navigation.goBack();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priceMin > 0 || filters.priceMax < 500) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.bedrooms !== null) count++;
    if (filters.bathrooms !== null) count++;
    if (filters.guestsMin > 1) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.instantBook !== null) count++;
    if (filters.superhost) count++;
    if (filters.sortBy !== "relevance") count++;
    return count;
  };

  const renderCounter = (
    label: string,
    value: number | null,
    onDecrease: () => void,
    onIncrease: () => void,
    minValue: number = 0
  ) => (
    <View style={styles.counterContainer}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counter}>
        <TouchableOpacity
          style={[
            styles.counterBtn,
            (value === null || value <= minValue) && styles.counterBtnDisabled,
          ]}
          onPress={onDecrease}
          disabled={value === null || value <= minValue}
        >
          <Ionicons
            name="remove"
            size={20}
            color={value === null || value <= minValue ? "#CCC" : "#666"}
          />
        </TouchableOpacity>
        <Text style={styles.counterValue}>
          {value === null ? "Any" : value}
        </Text>
        <TouchableOpacity style={styles.counterBtn} onPress={onIncrease}>
          <Ionicons name="add" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sort By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <TouchableOpacity
            style={styles.sortSelector}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.sortValue}>
              {SORT_OPTIONS.find((o) => o.id === filters.sortBy)?.label}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range (per night)</Text>
          <View style={styles.priceInputs}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Min</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceTextInput}
                  value={filters.priceMin.toString()}
                  onChangeText={(text) =>
                    updateFilter("priceMin", parseInt(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
            <View style={styles.priceDivider}>
              <Text style={styles.priceDividerText}>—</Text>
            </View>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Max</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceTextInput}
                  value={filters.priceMax.toString()}
                  onChangeText={(text) =>
                    updateFilter("priceMax", parseInt(text) || 500)
                  }
                  keyboardType="numeric"
                  placeholder="500"
                />
              </View>
            </View>
          </View>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={500}
              step={10}
              value={filters.priceMin}
              onValueChange={(value) => updateFilter("priceMin", value)}
              minimumTrackTintColor="#D4A373"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#D4A373"
            />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={500}
              step={10}
              value={filters.priceMax}
              onValueChange={(value) => updateFilter("priceMax", value)}
              minimumTrackTintColor="#E5E7EB"
              maximumTrackTintColor="#D4A373"
              thumbTintColor="#D4A373"
            />
          </View>
        </View>

        {/* Property Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Type</Text>
          <View style={styles.propertyTypesGrid}>
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.propertyTypeItem,
                  filters.propertyTypes.includes(type.id) &&
                    styles.propertyTypeItemActive,
                ]}
                onPress={() => togglePropertyType(type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={
                    filters.propertyTypes.includes(type.id) ? "#D4A373" : "#666"
                  }
                />
                <Text
                  style={[
                    styles.propertyTypeLabel,
                    filters.propertyTypes.includes(type.id) &&
                      styles.propertyTypeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rooms & Guests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rooms & Guests</Text>
          <View style={styles.countersGrid}>
            {renderCounter(
              "Bedrooms",
              filters.bedrooms,
              () =>
                updateFilter(
                  "bedrooms",
                  filters.bedrooms === 1 ? null : (filters.bedrooms || 2) - 1
                ),
              () => updateFilter("bedrooms", (filters.bedrooms || 0) + 1),
              1
            )}
            {renderCounter(
              "Bathrooms",
              filters.bathrooms,
              () =>
                updateFilter(
                  "bathrooms",
                  filters.bathrooms === 1 ? null : (filters.bathrooms || 2) - 1
                ),
              () => updateFilter("bathrooms", (filters.bathrooms || 0) + 1),
              1
            )}
            {renderCounter(
              "Guests",
              filters.guestsMin,
              () => updateFilter("guestsMin", Math.max(1, filters.guestsMin - 1)),
              () => updateFilter("guestsMin", filters.guestsMin + 1),
              1
            )}
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {AMENITIES.map((amenity) => (
              <TouchableOpacity
                key={amenity.id}
                style={[
                  styles.amenityItem,
                  filters.amenities.includes(amenity.id) &&
                    styles.amenityItemActive,
                ]}
                onPress={() => toggleAmenity(amenity.id)}
              >
                <Ionicons
                  name={amenity.icon as any}
                  size={20}
                  color={
                    filters.amenities.includes(amenity.id) ? "#D4A373" : "#666"
                  }
                />
                <Text
                  style={[
                    styles.amenityLabel,
                    filters.amenities.includes(amenity.id) &&
                      styles.amenityLabelActive,
                  ]}
                >
                  {amenity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Booking Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Options</Text>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() =>
              updateFilter(
                "instantBook",
                filters.instantBook === true ? null : true
              )
            }
          >
            <View style={styles.optionInfo}>
              <Ionicons name="flash" size={24} color="#D4A373" />
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>Instant Book</Text>
                <Text style={styles.optionHint}>
                  Book without waiting for host approval
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.checkbox,
                filters.instantBook === true && styles.checkboxActive,
              ]}
            >
              {filters.instantBook === true && (
                <Ionicons name="checkmark" size={16} color="#FFF" />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => updateFilter("superhost", !filters.superhost)}
          >
            <View style={styles.optionInfo}>
              <Ionicons name="star" size={24} color="#FFB800" />
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>Superhost</Text>
                <Text style={styles.optionHint}>
                  Stay with experienced, highly rated hosts
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.checkbox,
                filters.superhost && styles.checkboxActive,
              ]}
            >
              {filters.superhost && (
                <Ionicons name="checkmark" size={16} color="#FFF" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>
            Show Results
            {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()} filters)`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.sortOption}
                onPress={() => {
                  updateFilter("sortBy", option.id as FilterState["sortBy"]);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    filters.sortBy === option.id && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {filters.sortBy === option.id && (
                  <Ionicons name="checkmark" size={22} color="#D4A373" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  resetText: {
    fontSize: 15,
    color: "#D4A373",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#FFF",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  sortSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 14,
  },
  sortValue: {
    fontSize: 15,
    color: "#1F2937",
  },
  priceInputs: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  priceInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#6B7280",
    marginRight: 4,
  },
  priceTextInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
  },
  priceDivider: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  priceDividerText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  sliderContainer: {
    marginTop: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  propertyTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  propertyTypeItem: {
    alignItems: "center",
    justifyContent: "center",
    width: "30%",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "transparent",
  },
  propertyTypeItemActive: {
    backgroundColor: "#FDF8F3",
    borderColor: "#D4A373",
  },
  propertyTypeLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  propertyTypeLabelActive: {
    color: "#D4A373",
    fontWeight: "500",
  },
  countersGrid: {
    gap: 16,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterLabel: {
    fontSize: 15,
    color: "#1F2937",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 4,
  },
  counterBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnDisabled: {
    opacity: 0.5,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    minWidth: 50,
    textAlign: "center",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  amenityItemActive: {
    backgroundColor: "#FDF8F3",
    borderWidth: 1,
    borderColor: "#D4A373",
  },
  amenityLabel: {
    fontSize: 14,
    color: "#666",
  },
  amenityLabelActive: {
    color: "#D4A373",
    fontWeight: "500",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  optionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  optionHint: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#D4A373",
    borderColor: "#D4A373",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  applyButton: {
    backgroundColor: "#D4A373",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sortOptionText: {
    fontSize: 16,
    color: "#1F2937",
  },
  sortOptionTextActive: {
    color: "#D4A373",
    fontWeight: "600",
  },
});
