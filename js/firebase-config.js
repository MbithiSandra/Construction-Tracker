// Firebase settings. These keys are safe to be public. The Firestore rules protect the data.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAUUGsdFpXI89n1h-rYiK0hMSWDHTn2pmE",
  authDomain: "construction-tracker-46159.firebaseapp.com",
  projectId: "construction-tracker-46159",
  storageBucket: "construction-tracker-46159.firebasestorage.app",
  messagingSenderId: "262570520450",
  appId: "1:262570520450:web:ea8a0ebd0248c809c2299b"
};

// The family. Emails must match Firebase exactly. Never put passwords here.
window.FAMILY = [
  { key: "sandra", name: "Sandra", email: "sandra@mjengo.family" },
  { key: "mum",    name: "Mum",    email: "mum@mjengo.family" },
  { key: "dad",    name: "Dad",    email: "dad@mjengo.family" }
];

// true hides the whole site until someone logs in.
// If you set true, also change the read rule in Firestore to: if isFamily();
window.FAMILY_ONLY = true;