import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { MapPin, ArrowLeft, Filter, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEFAULT_SEARCH_QUERY } from '../config/env';
import { PlaceCard } from '../components/PlaceCard';
import { usePlaceSearch } from '../services/places';

export default function PlacesScreen({ route, navigation }: any) {
  const initialQuery = route.params?.initialQuery || DEFAULT_SEARCH_QUERY;
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);

  const { places, loading, error } = usePlaceSearch(submittedQuery);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.safeArea}>
        {/* Superior Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.searchPill}>
            <Search size={16} color="rgba(255,255,255,0.4)" />
            <Text style={styles.searchPlaceholder}>{submittedQuery}</Text>
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.kicker}>Discovery Mode</Text>
          <Text style={styles.discoverText}>
            Explore <Text style={styles.highlightText}>{submittedQuery}</Text>
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
               <MapPin size={12} color="#FF8C42" />
               <Text style={styles.statText}>{places.length} Results Found</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.statSub}>Curated by Rihla AI</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#FF8C42" />
            <Text style={styles.loadingText}>Scouting the best spots...</Text>
          </View>
        ) : (
          <FlatList
            data={places}
            keyExtractor={(item) => item.placeId || `${item.name}-${item.address}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <PlaceCard place={item} />}
            ListHeaderComponent={() => <View style={{height: 10}} />}
            ListFooterComponent={() => <View style={{height: 40}} />}
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <View style={styles.emptyIconContainer}>
                   <MapPin size={40} color="rgba(255,255,255,0.1)" />
                </View>
                <Text style={styles.emptyText}>No results found for "{submittedQuery}"</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.retryText}>Try another city</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchPlaceholder: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,140,66,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,140,66,0.3)',
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  kicker: {
    color: '#FF8C42',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  discoverText: {
    fontSize: 34,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  highlightText: {
    color: '#FF8C42',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FF8C42',
  },
  retryText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 14,
  },
});
