import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, connectStorageEmulator, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "xxx",
    authDomain: "xxx",
    projectId: "xxx",
    storageBucket: "xxx",
    messagingSenderId: "xxx",
    appId: "xxx",
    measurementId: "xxx"
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
async function addReviewToFirestore(bookId, title, imageScore, emotion) {
    try {
        const docRef = await addDoc(collection(db, "reviews"), {
            bookId: bookId,
            title: title,
            score: imageScore,
            emotion: emotion,
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

async function addImageToStorage(imageFile) {
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

async function deleteAllReviews() {
    try {
        const querySnapshot = await getDocs(collection(db, "reviews"));
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log("すべてのレビューを削除しました");
    } catch (error) {
        console.error("削除中にエラーが発生しました:", error);
    }
}

async function getImageFromStorage(imageName) {
    const storage = getStorage(app);
    const imageRef = ref(storage, `images/${imageName}`); // 画像の参照を取得

    try {
        // ダウンロードURLを取得
        const url = await getDownloadURL(imageRef);
        console.log("画像URL: ", url);

        // URLを使って画像を表示
        const imgElement = document.createElement('img');
        imgElement.src = url;
        document.body.appendChild(imgElement);  // 画像をページに追加
    } catch (error) {
        console.error("Error fetching image: ", error);
    }
}


// 各種イベントリスナー

// タブボタン押下時の処理
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function() {
        // すべてのタブボタンからactiveクラスを削除
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        
        // クリックされたボタンにactiveクラスを追加
        this.classList.add('active');
        
        // 選択された感情を取得
        let selectedEmotion = this.getAttribute('data-emotion');
        console.log("Selected Emotion: ", selectedEmotion);
    });
});

// 投稿ボタン押下時の処理
document.getElementById("submit").addEventListener("click", function(event) {
    event.preventDefault();
    
    let title = document.getElementById("title").value;
    let imageInput = document.getElementById("image");
    let selectedTab = document.querySelector('.tab-button.active').getAttribute('data-emotion');
    let imageFile = imageInput.files[0];

    // 画像のスコアを計算する関数を呼ぶ

    // Firestoreに格納
    addReviewToFirestore(10, title, [0, 1, 1], selectedTab);

    // Storageに格納
    addImageToStorage(imageFile);
});

// 削除ボタン押下時の処理
document.getElementById("deleteCollection").addEventListener("click", async (event) => {
    event.preventDefault();
    if (confirm("本当にすべてのレビューを削除しますか？")) {
        await deleteAllReviews();
    }
});

// 画像取得ボタン押下時の処理
document.getElementById("showImage").addEventListener("click", async (event) => {
    event.preventDefault();
    getImageFromStorage(document.getElementById("image").files[0].name);
});