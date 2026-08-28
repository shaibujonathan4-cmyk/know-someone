const firebaseConfig = {
  apiKey: "AIzaSyC5q82ECvpexyypLVuYayLKAGrNIhIheI0",
  authDomain: "know-someone-1f0c1.firebaseapp.com",
  projectId: "know-someone-1f0c1",
  storageBucket: "know-someone-1f0c1.firebasestorage.app",
  messagingSenderId: "1029213386638",
  appId: "1:1029213386638:web:5043bf0a872b79d8ea16df"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();