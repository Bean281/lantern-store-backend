import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDOV_BMqxBcmgdWBHhiAqWMmNIksJgarwk",
    authDomain: "lanternstore-1c6b0.firebaseapp.com",
    projectId: "lanternstore-1c6b0",
    storageBucket: "lanternstore-1c6b0.firebasestorage.app",
    messagingSenderId: "159377945940",
    appId: "1:159377945940:web:94f928045f574fa8d784c1",
    measurementId: "G-Z91QX5W264"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);
export default app; 