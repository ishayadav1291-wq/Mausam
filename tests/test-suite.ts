import { POPULAR_CITIES, getWeatherDataForCity } from '../src/data/mockWeatherData.ts';
import { TRANSLATIONS } from '../src/data/translations.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n=============================================');
  console.log('🧪 RUNNING MAUSAM TEST SUITE');
  console.log('=============================================\n');

  // Test 1: Popular Cities list
  console.log('--- 1. City Configuration & Geolocation ---');
  assert(POPULAR_CITIES.length >= 10, `Popular cities contains ${POPULAR_CITIES.length} cities`);
  const mumbai = POPULAR_CITIES.find(c => c.id === 'mumbai');
  const delhi = POPULAR_CITIES.find(c => c.id === 'delhi');
  assert(!!mumbai && mumbai.isCoastal === true, 'Mumbai is identified as a coastal city');
  assert(!!delhi && delhi.isCoastal === false, 'Delhi is identified as non-coastal city');

  // Test 2: Data Generation for coastal vs non-coastal
  console.log('\n--- 2. Persona Data Generation ---');
  const mumbaiFeed = getWeatherDataForCity(mumbai!);
  const delhiFeed = getWeatherDataForCity(delhi!);

  assert(mumbaiFeed.beach.seaCondition !== undefined, 'Mumbai has sea condition & water temperature');
  assert(mumbaiFeed.health.aqi.current > 0, 'Mumbai has AQI metrics');
  assert(delhiFeed.commuter.visibility.distanceMeters > 0, 'Delhi commuter visibility is calculated');
  assert(delhiFeed.agriculture.cropAdvisories.length > 0, 'Delhi agriculture crop advisories generated');
  assert(mumbaiFeed.fitness.activityRatings.length >= 3, 'Fitness activity ratings generated');
  assert(mumbaiFeed.parent.schoolHours.morningDropOff !== undefined, 'Parent school hour safety metrics present');

  // Test 3: Translations
  console.log('\n--- 3. Multi-language Translation Dictionaries ---');
  const languages = ['en', 'hi', 'ta', 'bn'] as const;
  for (const lang of languages) {
    assert(!!TRANSLATIONS[lang], `Translation dictionary exists for ${lang}`);
    assert(!!TRANSLATIONS[lang].offlineBanner, `offlineBanner translated in ${lang}`);
    assert(!!TRANSLATIONS[lang].becauseYouFollow, `becauseYouFollow translated in ${lang}`);
    assert(!!TRANSLATIONS[lang].personas?.health?.name, `Health persona translated in ${lang}: "${TRANSLATIONS[lang].personas.health.name}"`);
  }

  // Test 4: Live HTTP Server Endpoint Integration Tests
  console.log('\n--- 4. Backend HTTP API Endpoints ---');
  const baseUrl = 'http://localhost:3000';
  const endpoints = [
    '/api/health',
    '/api/fitness',
    '/api/beach',
    '/api/traveller',
    '/api/parent',
    '/api/commuter',
    '/api/agriculture',
    '/api/events'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${ep}?city=mumbai`);
      const data = await res.json();
      assert(res.status === 200 && !!data.location, `GET ${ep} returned 200 with location payload`);
    } catch (e: any) {
      assert(false, `GET ${ep} failed: ${e.message}`);
    }
  }

  // Test 5: POST /api/feed
  console.log('\n--- 5. POST /api/feed Aggregator ---');
  try {
    const feedRes = await fetch(`${baseUrl}/api/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: { city: 'Bengaluru' },
        personas: ['health', 'fitness', 'commuter']
      })
    });
    const feedJson = await feedRes.json();
    assert(feedRes.status === 200, 'POST /api/feed returned 200');
    assert(feedJson.cards.length === 3, 'POST /api/feed returned 3 personalized cards');
    assert(feedJson.cards[0].is_primary === true, 'First card marked as primary');
    assert(feedJson.location.city === 'Bengaluru', 'Resolved correct city Bengaluru');
  } catch (e: any) {
    assert(false, `POST /api/feed failed: ${e.message}`);
  }

  // Test 6: POST /api/gemini/maps-weather
  console.log('\n--- 6. POST /api/gemini/maps-weather Grounding ---');
  try {
    const aiRes = await fetch(`${baseUrl}/api/gemini/maps-weather`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'where can I run in Bengaluru',
        location: 'Bengaluru'
      })
    });
    const aiJson = await aiRes.json();
    assert(aiRes.status === 200, 'POST /api/gemini/maps-weather returned 200');
    assert(typeof aiJson.text === 'string' && aiJson.text.length > 10, 'Returned valid guidance text');
    assert(Array.isArray(aiJson.groundingMetadata?.groundingChunks), 'Returned grounding chunks');
  } catch (e: any) {
    assert(false, `POST /api/gemini/maps-weather failed: ${e.message}`);
  }

  console.log('\n=============================================');
  console.log(`TOTAL RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
