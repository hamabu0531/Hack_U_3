import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, connectStorageEmulator, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

// const firebaseConfig = {
//     apiKey: "xxx",
//     authDomain: "xxx",
//     projectId: "xxx",
//     storageBucket: "xxx",
//     messagingSenderId: "xxx",
//     appId: "xxx",
//     measurementId: "xxx"
// };
const firebaseConfig = {
    apiKey: "AIzaSyCEesf4nWo-NZ2kin2wqoH41v8yRGe2nAA",
    authDomain: "hack-u-3.firebaseapp.com",
    projectId: "hack-u-3",
    storageBucket: "hack-u-3.firebasestorage.app",
    messagingSenderId: "1092046712255",
    appId: "1:1092046712255:web:d5020148df6daaf364850a",
    measurementId: "G-XZPBY1P44Y"
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


async function getBookInfo(bookId) {
    const booksCollection = collection(db, "books"); // "books" コレクションを参照
    try {
        const querySnapshot = await getDocs(booksCollection);
        let bookData = null;
        
        querySnapshot.forEach((doc) => {
            if (doc.data().bookId === bookId) {
                bookData = doc.data();
            }
        });
        
        if (!bookData) {
            console.error("Book not found");
            return;
        }
        
        console.log("Title: ", bookData.title);
        console.log("Image URL: ", bookData.imageUrl);



        // 画像を表示
        const imgElement = document.createElement('img');
        imgElement.src = bookData.imageUrl;
        document.body.appendChild(imgElement);
    } catch (error) {
        console.error("Error fetching book data: ", error);
    }
}

document.getElementById("booksearch").addEventListener("click", () => {
    const bookId = document.getElementById("bookIdInput").value;
    getBookInfo(bookId);
});


document.getElementById("imageInput").addEventListener("change", function() {
    const file = this.files[0]; 
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = function(event) {
        const imgElement = document.getElementById("preview");
        imgElement.src = event.target.result;
        imgElement.style.display = "block"; 
    };

    reader.readAsDataURL(file); 
});


