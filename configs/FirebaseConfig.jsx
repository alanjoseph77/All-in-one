import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCzHuQT_waKNOV57b3Ld4AL9JvB8e2pVUM",
  authDomain: "gotta-73540.firebaseapp.com",
  databaseURL: "https://gotta-73540-default-rtdb.firebaseio.com",
  projectId: "gotta-73540",
  storageBucket: "gotta-73540.appspot.com",
  messagingSenderId: "654710403581",
  appId: "1:654710403581:web:707bb3e1960bf63301e994",
  measurementId: "G-YYR82LHL22"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);