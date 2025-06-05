// src/firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 下記の値は Firebase コンソールの設定から取得
const firebaseConfig = {
    apiKey: "AIzaSyCUOnzX-oVTZxASW2a2BoNp3FVJk0Ssplw",
    authDomain: "recipe-65e60.firebaseapp.com",
    projectId: "recipe-65e60",
    storageBucket: "recipe-65e60.firebasestorage.app",
    messagingSenderId: "467741230098",
    appId: "1:467741230098:web:ff7c8ca08db5c3625bc4cb"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);