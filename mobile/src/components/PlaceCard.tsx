import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { Place } from '../services/places';
import { Star, MapPin, Bookmark, Globe, MessageCircle } from 'lucide-react-native';

function RatingStars({ rating }: { rating: number | null }) {
  const stars = [];
  const r = rating || 0;
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star 
        key={i} 
        size={14} 
        fill={i <= r ? "#FF8C42" : "transparent"} 
        stroke={i <= r ? "#FF8C42" : "rgba(255,255,255,0.3)"} 
      />
    );
  }
  return <View style={styles.starsRow}>{stars}<Text style={styles.ratingValue}>{r}</Text></View>;
}

export function PlaceCard({ place }: { place: Place }) {
  const navigation = useNavigation<any>();
  const imageUrl = place.photoUrl || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800';


  const openMaps = async () => {
    await Linking.openURL(place.mapsUrl);
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('PlaceDetails', { place })}
    >
      <View style={styles.textContainer}>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{place.types[0]?.replace('_', ' ') || 'Place'}</Text>
          </View>
          <View style={[styles.tag, styles.tagMustVisit]}>
            <Text style={styles.tagMustVisitText}>Must Visit</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={1}>{place.name}</Text>
        
        <RatingStars rating={place.rating} />

        <Text style={styles.description} numberOfLines={3}>
          {place.address}
        </Text>

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
             <MapPin size={12} color="#FF8C42" />
             <Text style={styles.locationText} numberOfLines={1}>{place.address}</Text>
          </View>
          
          <View style={styles.actions}>

            <TouchableOpacity style={styles.actionItem} onPress={openMaps}>
               <Globe size={14} color="rgba(255,255,255,0.6)" />
               <Text style={styles.actionText}>Maps</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </View>
      
      <View style={styles.borderEffect} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    marginBottom: 20,
    height: 200,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  borderEffect: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FF8C42',
  },
  textContainer: {
    flex: 1.2,
    padding: 15,
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tagMustVisit: {
    backgroundColor: '#FF8C42',
  },
  tagMustVisitText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingValue: {
    color: '#FF8C42',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  description: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10,
    gap: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '500',
  },
  imageContainer: {
    flex: 1,
    height: '100%',
  },
  image: {
    flex: 1,
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
});
