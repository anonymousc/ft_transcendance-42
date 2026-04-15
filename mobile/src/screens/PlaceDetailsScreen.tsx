import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Linking, StatusBar, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Star, Globe, Clock, Bookmark, Share2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function PlaceDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { place } = route.params;

  const mainImage = place.photoUrl || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800';

  const openMaps = async () => {
    await Linking.openURL(place.mapsUrl);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        <View style={styles.imageContainer}>
          <Image source={{ uri: mainImage }} style={styles.image} />
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,1)']}
            style={styles.gradient}
          />
          
          <SafeAreaView style={styles.headerControls}>
            <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            

          </SafeAreaView>
        </View>


        <View style={styles.contentContainer}>

          <View style={styles.tagRow}>
            {place.types.map((type: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{type.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </View>


          <Text style={styles.title}>{place.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Star size={14} fill="#FF8C42" color="#FF8C42" />
              <Text style={styles.ratingText}>{place.rating || 'New'}</Text>
            </View>
            <Text style={styles.reviewsText}>
              ({place.userRatingsTotal ? `${place.userRatingsTotal} reviews` : 'No reviews yet'})
            </Text>
          </View>


          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <View style={styles.iconBox}>
                <MapPin size={20} color="#FF8C42" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{place.address}</Text>
              </View>
            </View>
            
            <View style={styles.infoCard}>
              <View style={styles.iconBox}>
                <Clock size={20} color="#FF8C42" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>Open Now • Closes at 10 PM</Text>
              </View>
            </View>
          </View>


          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.description}>
            Experience the beauty and culture of {place.name}. Located centrally at {place.address}, it is a premier destination offering unforgettable memories for travelers. Make sure to visit during the golden hours for the best photographic moments!
          </Text>




          <View style={{ height: 100 }} />
        </View>
      </ScrollView>


      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
          <LinearGradient
            colors={['#FF8C42', '#F15A24']}
            style={styles.mapButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Globe size={20} color="white" />
            <Text style={styles.mapButtonText}>Get Directions</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    width: width,
    height: height * 0.45,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 24,
    marginTop: -40,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(255,140,66,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,140,66,0.3)',
  },
  tagText: {
    color: '#FF8C42',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 14,
  },
  reviewsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  infoSection: {
    gap: 16,
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,140,66,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  infoValue: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  description: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 32,
  },
  gallery: {
    gap: 12,
    paddingBottom: 20,
  },
  galleryImage: {
    width: 140,
    height: 140,
    borderRadius: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  mapButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  mapButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});
