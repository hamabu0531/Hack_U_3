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
const storage = getStorage(app);

// ローカルで実行中の場合は、エミュレータを使う
const isEmulating = window.location.hostname === 'localhost'
if (isEmulating) {
    const storage = getStorage()
    connectStorageEmulator(storage, 'localhost', 9199)
}

// ここまでFirestoreのセッティング


// データ処理関数
async function addReviewToFirestore(bookId, title, imageUrl, average, variance) {
    try {
        const docRef = await addDoc(collection(db, "reviews"), {
            bookId: bookId,
            title: title,
            imageUrl: imageUrl,
            average: average,
            variance: variance,
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

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
    button.addEventListener('click', function () {
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
document.getElementById("submit").addEventListener("click", async function (event) {
    event.preventDefault();

    let title = document.getElementById("title").value;
    let imageInput = document.getElementById("image");
    let imageFile = imageInput.files[0];

    // 画像やタイトルが選択されていない場合はエラーメッセージを表示
    if (!imageFile || !title) {
        alert("タイトルと画像を選択してください。");
        return;
    }

    // 画像のスコアを計算する関数を呼ぶ

    // Storageに格納
    const imageUrl = await addImageToStorage(imageFile);

    // Firestoreに格納
    addReviewToFirestore(10, title, imageUrl, 0, 0);

    // 画面を更新
    document.getElementById("submitted-container").style.display = "block";
    document.getElementById("posting-container").style.display = "none";
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

// 画像選択時の処理
document.getElementById("image").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgElement = document.getElementById("preview"); // preview 要素を取得
            imgElement.style.display = "block"; // プレビューを表示
            imgElement.src = e.target.result; // src を更新
        };
        reader.readAsDataURL(file);
    }
});
