import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, connectStorageEmulator, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// Firebase を初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ローカルで実行中の場合は、エミュレータを使う
const isEmulating = window.location.hostname === 'localhost'
if (isEmulating) {
    const storage = getStorage()
    connectStorageEmulator(storage, 'localhost', 9199)
}

// ここまでFirestoreのセッティング

// 関数
async function addImageToStorage(imageFile) {

    if (imageFile) {
        const uniqueId = crypto.randomUUID();
        const storageRef = ref(storage, `images/${uniqueId}.png`);
        await uploadBytes(storageRef, imageFile).then((snapshot) => {
            console.log('Uploaded a blob or file!');
        }).catch((error) => {
            console.error("Error uploading file: ", error);
        });

        const imageUrl = await getDownloadURL(storageRef);
        return imageUrl;
    }
}

async function addReviewToFirestore(bookId, title, imageUrl, x, y, emotion) {
    try {
        const docRef = await addDoc(collection(db, "reviews"), {
            bookId: bookId,
            title: title,
            imageUrl: imageUrl,
            x: x,
            y: y,
            emotion: emotion
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

async function getBookId() {
    // bookIdをfirestoreの最大値+1で初期化
    let bookId = 0;
    const reviewsRef = collection(db, "reviews");
    const reviewsQuery = await getDocs(reviewsRef);
    if (!reviewsQuery.empty) {
        reviewsQuery.forEach((doc) => {
            const data = doc.data();
            if (data.bookId > bookId) {
                bookId = data.bookId;
            }
        });
    }
    bookId++;
    return bookId;
}



document.addEventListener('DOMContentLoaded', async () => {
    // JSON ファイルから画像リストを取得
    const jsonResponse = await fetch('./dummydata/sample.json');
    const jsonData = await jsonResponse.json();

    const imageList = jsonData.images || []; // 画像リストを取得

    const imageFolder = "./dummydata/image/"; // 画像フォルダのパス

    for (const imageData of imageList) {
        const imagePath = imageFolder + imageData.path;

        try {
            const response = await fetch(imagePath);
            const imageBlob = await response.blob();

            // Storageに格納
            const imageUrl = await addImageToStorage(imageBlob);

            // bookIdを取得
            const bookId = await getBookId();

            addReviewToFirestore(bookId, imageData.title, imageUrl, imageData.x, imageData.y, imageData.emotion);
            console.log(`Processed ${imageData.title} and added to Firestore: ${imageUrl}`);
        } catch (error) {
            console.error(`Error processing ${imageData.title}:`, error);
        }
    }
});

