import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjPmd5YozipEK7qs-7SB9Z5zvCtJ5gs24",
  authDomain: "isew-with-gracy.firebaseapp.com",
  projectId: "isew-with-gracy",
  storageBucket: "isew-with-gracy.firebasestorage.app",
  messagingSenderId: "76855493333",
  appId: "1:76855493333:web:c0bf6eca5428b66847d85c",
  adminEmail: "isewwithgracy@gmail.com"
};

const app = initializeApp(firebaseConfig);

window.firebaseConfig = firebaseConfig;
window.firebaseApp = app;