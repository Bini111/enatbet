// src/components/common/MapStatic.tsx
import React from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';

interface MapStaticProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  style?: any;
}

/**
 * Static map fallback for Expo Go preview
 * Uses OpenStreetMap static tile service
 */
export const MapStatic: React.FC<MapStaticProps> = ({
  latitude,
  longitude,
  zoom = 13,
  width = 400,
  height = 300,
  style,
}) => {
  // Using OpenStreetMap Static Map API
  // For production, consider using Google Static Maps API or Mapbox
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  // Alternative: Use a tile server with marker
  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+FF0000(${longitude},${latitude})/${longitude},${latitude},${zoom},0/${width}x${height}?access_token=pk.your_public_token`;

  return (
    <View style={[styles.container, style, { width, height }]}>
      <Image
        source={{ uri: mapUrl }}
        style={styles.map}
        resizeMode="cover"
        onError={() => console.log('[MapStatic] Error loading map')}
      />
      <View style={styles.overlay}>
        <View style={styles.marker} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF385C',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});