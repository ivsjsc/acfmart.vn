// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwC9zPd5ucjua62yjiD5yylonreuXE_TA",
  authDomain: "ecommerce-acf.firebaseapp.com",
  projectId: "ecommerce-acf",
  storageBucket: "ecommerce-acf.firebasestorage.app",
  messagingSenderId: "748453055972",
  appId: "1:748453055972:web:23848e85ceaab378e84bf1",
  measurementId: "G-769E7G0QSE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
export default app;
