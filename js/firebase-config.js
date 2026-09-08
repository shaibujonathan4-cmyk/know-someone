const firebaseConfig = {
  apiKey: "AIzaSyCuIwbsn71gBbHe2mScOeEZFu-z8qegSnQ",
  authDomain: "know-someone-f08a3.firebaseapp.com",
  projectId: "know-someone-f08a3",
  storageBucket: "know-someone-f08a3.firebasestorage.app",
  messagingSenderId: "1010235911327",
  appId: "1:1010235911327:web:35f2dc5ac038a0223546aa"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();