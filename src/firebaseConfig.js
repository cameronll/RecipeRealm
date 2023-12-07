import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    'apiKey': "AIzaSyCoBH39W2LsQoBY4_fJAhtJieMlZY_dc-Y",
    'authDomain': "reciperealm-cbc4f.firebaseapp.com",
    'projectId': "reciperealm-cbc4f",
    'storageBucket': "reciperealm-cbc4f.appspot.com",
    'messagingSenderId': "391895316870",
    'appId': "1:391895316870:web:cea5589bb2f86566291407",
    'measurementId': "G-97DKH32RKW",
    'databaseURL': ''
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, storage };
