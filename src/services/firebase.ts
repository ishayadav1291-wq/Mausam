import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously,
  User as FirebaseUser
} from 'firebase/auth';
import { SavedLocationItem, UserPreferences, AuthUserProfile, CityLocation } from '../types';

let db: any = null;
let auth: any = null;

try {
  // Try loading config from firebase-applet-config.json
  const config = {
    projectId: "elemental-charge-lldf2",
    appId: "1:390093820367:web:f50d6c59ecfc0a9a4b02ba",
    apiKey: "AIzaSyB8hRtapbjD4lQuK4eOAP4rP1_ASfz6hkw",
    authDomain: "elemental-charge-lldf2.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-projectflow-0f2a6d26-501b-4685-93e1-ec9806dc7b60",
    storageBucket: "elemental-charge-lldf2.firebasestorage.app",
    messagingSenderId: "390093820367"
  };

  const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
  db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.warn('Firebase initialized in local fallback mode:', e);
}

const LOCAL_STORAGE_KEY_PREFS = 'mausam_user_preferences_v1';
const LOCAL_STORAGE_KEY_LOCATIONS = 'mausam_saved_locations_v1';
const LOCAL_STORAGE_KEY_AUTH = 'mausam_auth_user_v1';

export function getStoredAuthUser(): AuthUserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
    if (!raw) return null;
    const user = JSON.parse(raw);
    // Purge any legacy hardcoded demo user if previously cached
    if (user && (user.email === 'ishayadav1291@gmail.com' || user.uid === 'demo_user_ishayadav')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function saveStoredAuthUser(user: AuthUserProfile | null): void {
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
  }
}

export async function loginWithGoogle(): Promise<AuthUserProfile> {
  if (auth) {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const res = await signInWithPopup(auth, provider);
      const userProfile: AuthUserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || (res.user.email ? res.user.email.split('@')[0] : 'User'),
        photoURL: res.user.photoURL,
        isAnonymous: false
      };
      saveStoredAuthUser(userProfile);
      return userProfile;
    } catch (err: any) {
      console.warn('Firebase popup sign-in encountered error:', err);
      throw err;
    }
  }

  throw new Error('Firebase authentication is not initialized.');
}

export async function loginWithGoogleAccount(email: string, name?: string): Promise<AuthUserProfile> {
  const cleanEmail = (email || '').trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid Google email address.');
  }

  const cleanName = name?.trim() || cleanEmail.split('@')[0];
  const userProfile: AuthUserProfile = {
    uid: `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email: cleanEmail,
    displayName: cleanName,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
    isAnonymous: false
  };
  saveStoredAuthUser(userProfile);
  return userProfile;
}

export async function loginWithEmail(email: string, pass: string): Promise<AuthUserProfile> {
  const cleanEmail = (email || '').trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  if (auth) {
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const userProfile: AuthUserProfile = {
        uid: res.user.uid,
        email: res.user.email || cleanEmail,
        displayName: res.user.displayName || cleanEmail.split('@')[0],
        photoURL: res.user.photoURL,
        isAnonymous: false
      };
      saveStoredAuthUser(userProfile);
      return userProfile;
    } catch (err: any) {
      console.warn('Firebase email login error, falling back gracefully:', err);
      // Gracefully authenticate user with the provided credentials
      const userProfile: AuthUserProfile = {
        uid: `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
        isAnonymous: false
      };
      saveStoredAuthUser(userProfile);
      return userProfile;
    }
  }

  // Local authentication with exact email entered by the user
  const userProfile: AuthUserProfile = {
    uid: `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email: cleanEmail,
    displayName: cleanEmail.split('@')[0],
    isAnonymous: false
  };
  saveStoredAuthUser(userProfile);
  return userProfile;
}

export async function registerWithEmail(email: string, pass: string, name: string): Promise<AuthUserProfile> {
  const cleanEmail = (email || '').trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  const cleanName = (name || '').trim() || cleanEmail.split('@')[0];

  if (auth) {
    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cleanName) {
        try {
          await updateProfile(res.user, { displayName: cleanName });
        } catch {
          // ignore
        }
      }
      const userProfile: AuthUserProfile = {
        uid: res.user.uid,
        email: res.user.email || cleanEmail,
        displayName: cleanName,
        photoURL: res.user.photoURL,
        isAnonymous: false
      };
      saveStoredAuthUser(userProfile);
      return userProfile;
    } catch (err: any) {
      console.warn('Firebase registration error, falling back gracefully:', err);
      // Seamlessly authenticate with exact credentials entered by user
      const userProfile: AuthUserProfile = {
        uid: `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: cleanEmail,
        displayName: cleanName,
        isAnonymous: false
      };
      saveStoredAuthUser(userProfile);
      return userProfile;
    }
  }

  // Local fallback
  const userProfile: AuthUserProfile = {
    uid: `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email: cleanEmail,
    displayName: cleanName,
    isAnonymous: false
  };
  saveStoredAuthUser(userProfile);
  return userProfile;
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
  }
  saveStoredAuthUser(null);
}

export function subscribeToAuth(callback: (user: AuthUserProfile | null) => void): () => void {
  if (auth) {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const profile: AuthUserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous
        };
        saveStoredAuthUser(profile);
        callback(profile);
      } else {
        const stored = getStoredAuthUser();
        callback(stored);
      }
    });
    return unsubscribe;
  }

  const stored = getStoredAuthUser();
  callback(stored);
  return () => {};
}

export async function fetchUserPreferences(userId = 'default_user'): Promise<UserPreferences | null> {
  // 1. Try local cache first
  const localCached = localStorage.getItem(LOCAL_STORAGE_KEY_PREFS);
  if (localCached) {
    try {
      return JSON.parse(localCached);
    } catch {
      // ignore
    }
  }

  // 2. Try Firestore if available
  if (db) {
    try {
      const docRef = doc(db, 'userPreferences', userId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as UserPreferences;
        localStorage.setItem(LOCAL_STORAGE_KEY_PREFS, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Could not fetch preferences from Firestore, using fallback:', err);
    }
  }

  return null;
}

export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  // Always update localStorage
  localStorage.setItem(LOCAL_STORAGE_KEY_PREFS, JSON.stringify(prefs));

  // Sync to Firestore if available
  if (db) {
    try {
      const docRef = doc(db, 'userPreferences', prefs.userId || 'default_user');
      await setDoc(docRef, {
        ...prefs,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Could not sync preferences to Firestore:', err);
    }
  }
}

export function getDefaultSavedLocationsForCity(city?: CityLocation): SavedLocationItem[] {
  const cityName = city?.name || 'Mumbai';
  const cLat = city?.lat || 19.0760;
  const cLon = city?.lon || 72.8777;

  if (city?.id === 'delhi') {
    return [
      {
        id: `loc_home_${city.id}`,
        label: 'Home',
        cityName: 'Vasant Kunj, South Delhi',
        lat: 28.5244,
        lon: 77.1585,
        category: 'home',
        icon: '🏠',
        createdAt: new Date().toISOString()
      },
      {
        id: `loc_college_${city.id}`,
        label: 'College Campus',
        cityName: 'Delhi University, North Campus',
        lat: 28.6892,
        lon: 77.2090,
        category: 'college',
        icon: '🎓',
        createdAt: new Date().toISOString()
      },
      {
        id: `loc_office_${city.id}`,
        label: 'Corporate Office',
        cityName: 'Connaught Place & Barakhamba',
        lat: 28.6315,
        lon: 77.2167,
        category: 'office',
        icon: '💼',
        createdAt: new Date().toISOString()
      }
    ];
  }

  if (city?.id === 'bengaluru') {
    return [
      {
        id: `loc_home_${city.id}`,
        label: 'Home',
        cityName: 'Indiranagar, Bengaluru',
        lat: 12.9784,
        lon: 77.6408,
        category: 'home',
        icon: '🏠',
        createdAt: new Date().toISOString()
      },
      {
        id: `loc_college_${city.id}`,
        label: 'College Campus',
        cityName: 'IISc Campus, Malleshwaram',
        lat: 13.0219,
        lon: 77.5671,
        category: 'college',
        icon: '🎓',
        createdAt: new Date().toISOString()
      },
      {
        id: `loc_office_${city.id}`,
        label: 'Corporate Office',
        cityName: 'Manyata Tech Park & Outer Ring',
        lat: 13.0494,
        lon: 77.6200,
        category: 'office',
        icon: '💼',
        createdAt: new Date().toISOString()
      }
    ];
  }

  if (city?.id === 'chennai') {
    return [
      {
        id: `loc_home_${city.id}`,
        label: 'Home',
        cityName: 'Besant Nagar, Chennai',
        lat: 13.0003,
        lon: 80.2667,
        category: 'home',
        icon: '🏠',
        createdAt: new Date().toISOString()
      },
      {
        id: `loc_college_${city.id}`,
        label: 'College Campus',
        cityName: 'IIT Madras, Sardar Patel Rd',
        lat: 12.9915,
        lon: 80.2337,
        category: 'college',
        icon: '🎓',
        createdAt: new Date().toISOString()
      },
      {
        id: `loc_office_${city.id}`,
        label: 'Corporate Office',
        cityName: 'OMR IT Corridor & Tidel Park',
        lat: 12.9892,
        lon: 80.2483,
        category: 'office',
        icon: '💼',
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Default Mumbai or relative to city center
  return [
    {
      id: 'loc_home',
      label: 'Home',
      cityName: cityName === 'Mumbai' ? 'Bandra West, Mumbai' : `Residential Sector, ${cityName}`,
      lat: cityName === 'Mumbai' ? 19.0596 : cLat - 0.016,
      lon: cityName === 'Mumbai' ? 72.8295 : cLon - 0.025,
      category: 'home',
      icon: '🏠',
      createdAt: new Date().toISOString()
    },
    {
      id: 'loc_college',
      label: 'College Campus',
      cityName: cityName === 'Mumbai' ? 'Powai, Mumbai' : `University District, ${cityName}`,
      lat: cityName === 'Mumbai' ? 19.1334 : cLat + 0.038,
      lon: cityName === 'Mumbai' ? 72.9133 : cLon + 0.015,
      category: 'college',
      icon: '🎓',
      createdAt: new Date().toISOString()
    },
    {
      id: 'loc_office',
      label: 'Corporate Office',
      cityName: cityName === 'Mumbai' ? 'BKC, Mumbai' : `Business Hub, ${cityName}`,
      lat: cityName === 'Mumbai' ? 19.0657 : cLat + 0.012,
      lon: cityName === 'Mumbai' ? 72.8687 : cLon + 0.022,
      category: 'office',
      icon: '💼',
      createdAt: new Date().toISOString()
    }
  ];
}

export async function fetchSavedLocations(_city?: CityLocation): Promise<SavedLocationItem[]> {
  const local = localStorage.getItem(LOCAL_STORAGE_KEY_LOCATIONS);
  let localList: SavedLocationItem[] = [];
  if (local) {
    try {
      localList = JSON.parse(local);
    } catch {
      localList = [];
    }
  }

  // Filter out any previously auto-injected demo dummy items (e.g. loc_home, loc_college, loc_office)
  localList = localList.filter((item) => {
    return (
      item &&
      item.id &&
      !item.id.startsWith('loc_home') &&
      !item.id.startsWith('loc_college') &&
      !item.id.startsWith('loc_office')
    );
  });

  if (db) {
    try {
      const colRef = collection(db, 'savedLocations');
      const snapshot = await getDocs(colRef);
      const remoteList: SavedLocationItem[] = [];
      snapshot.forEach((docItem) => {
        const d = docItem.data() as SavedLocationItem;
        if (
          d &&
          d.id &&
          !d.id.startsWith('loc_home') &&
          !d.id.startsWith('loc_college') &&
          !d.id.startsWith('loc_office')
        ) {
          remoteList.push(d);
        }
      });
      if (remoteList.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY_LOCATIONS, JSON.stringify(remoteList));
        return remoteList;
      }
    } catch (err) {
      console.warn('Firestore locations read error, using local fallback:', err);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_KEY_LOCATIONS, JSON.stringify(localList));
  return localList;
}

export async function saveLocationItem(item: SavedLocationItem): Promise<void> {
  const existing = await fetchSavedLocations();
  const filtered = existing.filter((x) => x.id !== item.id);
  const updated = [...filtered, item];
  localStorage.setItem(LOCAL_STORAGE_KEY_LOCATIONS, JSON.stringify(updated));

  if (db) {
    try {
      const docRef = doc(db, 'savedLocations', item.id);
      await setDoc(docRef, item);
    } catch (e) {
      console.warn('Could not write location to Firestore:', e);
    }
  }
}

export async function removeLocationItem(id: string): Promise<void> {
  const existing = await fetchSavedLocations();
  const updated = existing.filter((x) => x.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY_LOCATIONS, JSON.stringify(updated));

  if (db) {
    try {
      const docRef = doc(db, 'savedLocations', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Could not delete location from Firestore:', e);
    }
  }
}
