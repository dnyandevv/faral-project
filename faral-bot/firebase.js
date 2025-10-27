// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";

// Replace with your own Firebase Realtime Database URL
const firebaseConfig = {
  databaseURL: "https://shyamaju-manjiridasi-default-rtdb.firebaseio.com/"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get a reference to the database
export const db = getDatabase(app);

// Export helper functions for pushing data
export { ref, push };
