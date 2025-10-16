import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  IconButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, spacing, typography } from '../../config/theme';
import { Listing } from '../../types';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  compact?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPress,
  onFavorite,
  isFavorite = false,
  compact = false,
}) => {
  const cardWidth = compact ? screenWidth * 0.45 : CARD_WIDTH;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card style={[styles.card, { width: cardWidth }]}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: listing.images[0] || 'https://via.placeholder.com/400' }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {onFavorite && (
            <IconButton
              icon={isFavorite ? 'heart' : 'heart-outline'}
              iconColor={isFavorite ? theme.colors.error : '#fff'}
              size={24}
              style={styles.favoriteButton}
              onPress={onFavorite}
            />
          )}

          {listing.availability?.instantBook && (
            <Chip
              icon="lightning-bolt"
              style={styles.instantBookChip}
              textStyle={styles.instantBookText}
            >
              Instant Book
            </Chip>
          )}

          {listing.host?.badges?.superhost && (
            <View style={styles.superhostBadge}>
              <Icon name="shield-check" size={16} color="#fff" />
              <Text style={styles.superhostText}>Superhost</Text>
            </View>
          )}
        </View>

        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.location} numberOfLines={1}>
              {listing.location.city}, {listing.location.country}
            </Text>
            {listing.stats && (
              <View style={styles.rating}>
                <Icon name="star" size={16} color={theme.colors.secondary} />
                <Text style={styles.ratingText}>
                  {listing.host?.stats?.averageRating?.toFixed(1) || 'New'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>

          <View style={styles.details}>
            <Text style={styles.detailText}>
              {listing.capacity.guests} guests · {listing.capacity.bedrooms} bedrooms · {listing.capacity.beds} beds
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              <Text style={styles.priceAmount}>${listing.pricing.nightly}</Text>
              <Text style={styles.priceUnit}> / night</Text>
            </Text>
            {listing.pricing.cleaning > 0 && (
              <Text style={styles.cleaningFee}>
                + ${listing.pricing.cleaning} cleaning
              </Text>
            )}
          </View>

          {listing.culturalAmenities && listing.culturalAmenities.length > 0 && (
            <View style={styles.culturalTags}>
              {listing.culturalAmenities.slice(0, 2).map((amenity, index) => (
                <Chip
                  key={index}
                  style={styles.culturalChip}
                  textStyle={styles.culturalChipText}
                >
                  {amenity.replace(/_/g, ' ')}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.xs,
    marginVertical: spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: theme.colors.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  instantBookChip: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: theme.colors.secondary,
  },
  instantBookText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '600',
  },
  superhostBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  superhostText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  location: {
    ...typography.caption,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...typography.caption,
    color: theme.colors.onSurface,
    marginLeft: 2,
    fontWeight: '600',
  },
  title: {
    ...typography.body1,
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  details: {
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.caption,
    color: theme.colors.onSurfaceVariant,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  price: {
    flexDirection: 'row',
  },
  priceAmount: {
    ...typography.h6,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  priceUnit: {
    ...typography.body2,
    color: theme.colors.onSurfaceVariant,
  },
  cleaningFee: {
    ...typography.caption,
    color: theme.colors.onSurfaceVariant,
    marginLeft: spacing.sm,
  },
  culturalTags: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  culturalChip: {
    height: 24,
    marginRight: spacing.xs,
    backgroundColor: theme.colors.primaryContainer,
  },
  culturalChipText: {
    fontSize: 10,
    color: theme.colors.primary,
    textTransform: 'capitalize',
  },
});

export default ListingCard;