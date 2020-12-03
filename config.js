import  firebase from 'firebase'
require('@firebase/firestore');
require('firebase/auth');
var firebaseConfig = {
  apiKey: "AIzaSyBIcpj2h9H2F7qwy7WU7QdtVHNiQ-SvPkA",
  authDomain: "wily-3c36f.firebaseapp.com",
  databaseURL: "https://wily-3c36f.firebaseio.com",
  projectId: "wily-3c36f",
  storageBucket: "wily-3c36f.appspot.com",
  messagingSenderId: "310688018482",
  appId: "1:310688018482:web:7dd6bca86e86585c6b4c2b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();