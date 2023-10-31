// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
//import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
//import firebase from 'firebase/compat/app';
//import 'firebase/compat/auth';



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
/** 
const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: '/signedIn',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    ],
  };

  function SignInScreen() {
    return (
      <div>
        <h1>My App</h1>
        <p>Please sign-in:</p>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
      </div>
    );
  }**/



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { app, auth, db };
//export default SignInScreen