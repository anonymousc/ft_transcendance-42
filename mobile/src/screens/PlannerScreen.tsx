import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Sparkles, MapPin, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GOOGLE_PLACES_API_KEY } from '../config/env';
import { generateTripItinerary } from '../services/planner';

export default function PlannerScreen() {
  const navigation = useNavigation<any>();
  const [city, setCity] = useState('Marrakech');
  const [days, setDays] = useState('3');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!city || !days) return;
    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const searchRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(city + ' points of interest tourist attractions restaurants')}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const searchData = await searchRes.json();
      
      if (!searchData.results || searchData.results.length === 0) {
        throw new Error('Could not find places for this city.');
      }

      const parsedPlaces = searchData.results.map((item: any) => ({
        placeId: item.place_id,
        name: item.name,
        types: item.types || [],
        rating: item.rating,
        userRatingsTotal: item.user_ratings_total,
        address: item.formatted_address,
        photoUrl: item.photos?.[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${item.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : null,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}&query_place_id=${item.place_id}`,
      }));


      const itinerary = await generateTripItinerary(city, parseInt(days), parsedPlaces);
      setPlan(itinerary);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Travel Planner</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {!plan && (
            <View style={styles.formCard}>
              <View style={styles.logoWrap}>
                <Sparkles size={32} color="#FF8C42" />
              </View>
              <Text style={styles.formTitle}>Design your ideal trip</Text>
              <Text style={styles.formSubtitle}>Powered by Rihla AI + Gemini {"&"} Google Places</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Where to?</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="E.g., Casablanca"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>How many days?</Text>
                <TextInput
                  style={styles.input}
                  value={days}
                  onChangeText={setDays}
                  placeholder="E.g., 3"
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={loading}>
                <LinearGradient colors={['#FF8C42', '#F15A24']} style={styles.btnGradient}>
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Sparkles size={18} color="white" />
                      <Text style={styles.generateTxt}>Generate Itinerary</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {plan && (
            <View style={styles.planContainer}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planSummary}>{plan.summary}</Text>

              {plan.days.map((day: any, i: number) => (
                <View key={i} style={styles.dayCard}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayNum}>Day {day.day}</Text>
                    <Text style={styles.dayTheme}>{day.theme}</Text>
                  </View>
                  
                  {day.activities.map((act: any, j: number) => (
                    <View key={j} style={styles.activityRow}>
                      <View style={styles.timeCol}>
                        <Text style={styles.time}>{act.time}</Text>
                        <View style={styles.timelineLine} />
                      </View>
                      <View style={styles.activityBox}>
                        <Text style={styles.actName}>{act.name}</Text>
                        <Text style={styles.actDesc}>{act.description}</Text>
                        <View style={styles.actMeta}>
                          <MapPin size={12} color="#FF8C42" />
                          <Text style={styles.actAddress} numberOfLines={1}>{act.address}</Text>
                        </View>
                        <View style={styles.actMeta}>
                          <Clock size={12} color="rgba(255,255,255,0.5)" />
                          <Text style={styles.actDuration}>{act.duration_minutes} min</Text>
                        </View>
                       {act.tips && (
                          <View style={styles.tipBox}>
                            <Text style={styles.tipText}>💡 {act.tips}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ))}

              {plan.tips && plan.tips.length > 0 && (
                <View style={styles.tipsSection}>
                  <Text style={styles.tipsTitle}>Pro Tips</Text>
                  {plan.tips.map((tip: string, k: number) => (
                    <Text key={k} style={styles.tipRow}>• {tip}</Text>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.resetBtn} onPress={() => setPlan(null)}>
                <Text style={styles.resetTxt}>Plan Another Trip</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center'
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  scroll: { padding: 20, paddingBottom: 60 },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  logoWrap: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,140,66,0.1)',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16,
  },
  formTitle: { color: 'white', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  formSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.5)', height: 50, borderRadius: 14,
    paddingHorizontal: 16, color: 'white', fontSize: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  generateBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  btnGradient: {
    flexDirection: 'row', height: 54, alignItems: 'center', justifyContent: 'center', gap: 8
  },
  generateTxt: { color: 'white', fontSize: 16, fontWeight: '800' },
  errorText: { color: '#ff4444', marginBottom: 16, textAlign: 'center' },
  

  planContainer: { gap: 20 },
  planTitle: { color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  planSummary: { color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 22 },
  dayCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 10,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 20 },
  dayNum: { color: '#FF8C42', fontSize: 22, fontWeight: '900' },
  dayTheme: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600', paddingBottom: 3 },
  activityRow: { flexDirection: 'row', gap: 16 },
  timeCol: { alignItems: 'center', width: 44 },
  time: { color: 'white', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  activityBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 16, borderRadius: 16, marginBottom: 16 },
  actName: { color: 'white', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  actDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 18, marginBottom: 12 },
  actMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  actAddress: { color: '#FF8C42', fontSize: 12 },
  actDuration: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  tipBox: { marginTop: 10, backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8 },
  tipText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontStyle: 'italic' },
  
  tipsSection: { backgroundColor: 'rgba(255,140,66,0.1)', padding: 20, borderRadius: 20, marginTop: 10 },
  tipsTitle: { color: '#FF8C42', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  tipRow: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 22, marginBottom: 6 },
  
  resetBtn: {
    padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', marginTop: 20
  },
  resetTxt: { color: 'white', fontSize: 16, fontWeight: '700' }
});
