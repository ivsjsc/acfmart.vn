import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBwC9zPd5ucjua62yjiD5yylonreuXE_TA",
  authDomain: "ecommerce-acf.firebaseapp.com",
  projectId: "ecommerce-acf",
  storageBucket: "ecommerce-acf.firebasestorage.app",
  messagingSenderId: "748453055972",
  appId: "1:748453055972:web:23848e85ceaab378e84bf1",
  measurementId: "G-769E7G0QSE"
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
