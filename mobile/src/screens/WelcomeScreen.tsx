import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Search, MapPin, Compass, User, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const BG_IMAGES = [
  'https://images.unsplash.com/photo-1548013146-72479768b921?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1559586119-9f79b007936a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1528659549306-03c513dfd59e?auto=format&fit=crop&w=1200&q=80',
];

export default function WelcomeScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    Keyboard.dismiss();
    navigation.navigate('Places', { initialQuery: search || 'Casablanca' });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ImageBackground
          source={{ uri: BG_IMAGES[bgIndex] }}
          style={styles.background}
          key={bgIndex}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
            style={styles.overlay}
          />
          
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <View style={styles.header}>
                <Text style={styles.logo}>RIHLA</Text>
                
                <View style={styles.headerRight}>
                  <View style={styles.navPillWrapper}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                      style={styles.navPill}
                    >
                      <TouchableOpacity style={styles.navItemActive}>
                        <MapPin size={16} color="#1b1a18" />
                        <Text style={styles.navTextActive}>Home</Text>
                      </TouchableOpacity>

                    </LinearGradient>
                  </View>


                </View>
              </View>

              <View style={styles.heroContent}>
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeKicker}>Your next journey begins</Text>
                  <Text style={styles.welcomeText}>Where to next?</Text>
                </View>
                


                <View style={styles.searchCardContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)']}
                    style={styles.searchCard}
                  >
                    <View style={styles.searchWrapper}>
                      <TextInput
                        placeholder="Search Places or Activities..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={handleSearch}
                      />
                      <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                        <LinearGradient
                          colors={['#FF8C42', '#F15A24']}
                          style={styles.searchButtonGradient}
                        >
                          <Search size={22} color="white" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.quickSearchRow}>
                      {['Marrakech', 'Casablanca', 'Tangier'].map((city) => (
                        <TouchableOpacity 
                          key={city} 
                          onPress={() => {
                            Keyboard.dismiss();
                            navigation.navigate('Places', { initialQuery: city });
                          }}
                        >
                          <View style={styles.cityBadge}>
                            <Text style={styles.cityBadgeText}>{city}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </LinearGradient>
                </View>

                <TouchableOpacity style={styles.aiPlannerBtn} onPress={() => navigation.navigate('Planner')} activeOpacity={0.9}>
                  <LinearGradient colors={['rgba(255,140,66,0.3)', 'rgba(241,90,36,0.1)']} style={styles.aiPlannerGradient}>
                    <Sparkles size={16} color="#FF8C42" />
                    <Text style={styles.aiPlannerText}>AI Trip Planner</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomBar}>
                <View style={styles.indicatorActive} />
                <View style={styles.indicatorInactive} />
                <View style={styles.indicatorInactive} />
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logo: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navPillWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navPill: {
    flexDirection: 'row',
    padding: 4,
    alignItems: 'center',
    gap: 12,
  },
  navItem: {
    padding: 6,
  },
  navItemActive: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navTextActive: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeKicker: {
    color: '#FF8C42',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 8,
  },
  welcomeText: {
    color: 'white',
    fontSize: width > 400 ? 52 : 44,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 56,
    letterSpacing: -1,
  },

  searchCardContainer: {
    width: '100%',
    maxWidth: 500,
  },
  searchCard: {
    padding: 12,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  searchWrapper: {
    height: 64,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  searchButton: {
    width: 52,
    height: 52,
    borderRadius: 22,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSearchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingBottom: 8,
  },
  cityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cityBadgeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 20,
  },
  indicatorActive: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF8C42',
  },
  indicatorInactive: {
    width: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  aiPlannerBtn: {
    marginTop: 16,
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,140,66,0.3)',
  },
  aiPlannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  aiPlannerText: {
    color: '#FF8C42',
    fontSize: 14,
    fontWeight: '800',
  },
});
