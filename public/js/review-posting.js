import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, connectStorageEmulator } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEesf4nWo-NZ2kin2wqoH41v8yRGe2nAA",
    authDomain: "hack-u-3.firebaseapp.com",
    projectId: "hack-u-3",
    storageBucket: "hack-u-3.firebasestorage.app",
    messagingSenderId: "1092046712255",
    appId: "1:1092046712255:web:4f03f0bd97ae3f6464850a",
    measurementId: "G-801CZ8LVZY"
};

// Firebase を初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ローカルで実行中の場合は、エミュレータを使う
const isEmulating = window.location.hostname === 'localhost'
if (isEmulating) {
  const storage = getStorage()
  connectStorageEmulator(storage, 'localhost', 9199)
}

// ここまでFirestoreのセッティング


// データ処理関数
async function addReviewToFirestore(title, imageScore) {
    try {
        const docRef = await addDoc(collection(db, "reviews"), {
            title: title,
            score: imageScore,
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

async function addReviewToStorage(imageFile) {
        const storage = getStorage(app);

        if (imageFile) {
            const storageRef = ref(storage, `images/${imageFile.name}`);
            uploadBytes(storageRef, imageFile).then((snapshot) => {
                console.log('Uploaded a blob or file!');
            }).catch((error) => {
                console.error("Error uploading file: ", error);
            });
        }
}



// 各種イベントリスナー

// 投稿ボタン押下時の処理
document.getElementById("reviewForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    let title = document.getElementById("title").value;
    let review = document.getElementById("review").value;
    let imageInput = document.getElementById("image");
    let imageFile = imageInput.files[0];

    // 画像のスコアを計算する関数を呼ぶ

    // Firestoreに格納
    addReviewToFirestore(title, [0, 1, 1]);

    // Storageに格納
    addReviewToStorage(imageFile);
});