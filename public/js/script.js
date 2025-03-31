import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc ,getDoc} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
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

// // 特定のbookIdを使用してデータを取得する関数
// async function getBookDetails(bookId) {
//     try {
//       // ドキュメント参照を作成
//       const docRef = doc(db, "book_score", bookId);
      
//       // ドキュメントデータを取得
//       const docSnap = await getDoc(docRef);
      
//       if (docSnap.exists()) {
//         // データが存在する場合、タイトルと画像URLを返す
//         const data = docSnap.data();
//         return { title: data.title, imageUrl: data.imageUrl };
//       } else {
//         console.error("Document does not exist");
//         return null;
//       }
//     } catch (error) {
//       console.error("Error fetching document:", error);
//       return null;
//     }
//   }
  
//   // 使用例
//   getBookDetails("QkQdpyv86VJYHJDCgipx").then((book) => {
//     if (book) {
//       document.getElementById("title").textContent = book.title;
//       document.getElementById("image").src = book.imageUrl;
//     }
//   });

//   // book_scoreコレクションのすべてのドキュメントを取得する関数
// async function getAllBookScores() {
//     try {
//       // コレクション参照を作成
//       const bookScoreRef = collection(db, "book_score");
      
//       // ドキュメントをすべて取得
//       const querySnapshot = await getDocs(bookScoreRef);
      
//       // ドキュメントデータを配列に格納
//       const books = [];
//       querySnapshot.forEach((doc) => {
//         books.push({ id: doc.id, ...doc.data() });
//       });
      
//       console.log(books); // デバッグ用：すべてのデータをコンソールに出力
      
//       // HTMLに表示
//       const listElement = document.getElementById("book-list");
//       books.forEach((book) => {
//         const listItem = document.createElement("li");
//         listItem.textContent = `Title: ${book.title}, Image URL: ${book.imageUrl}`;
//         listElement.appendChild(listItem);
//       });
//     } catch (error) {
//       console.error("Error fetching documents:", error);
//     }
//   }
  
//   // 使用例
//   getAllBookScores();




let allBooks = []; // 全書籍データを保持する変数

// 全データ取得関数
async function getAllBookScores() {
  try {
    const bookScoreRef = collection(db, "book_score");
    const querySnapshot = await getDocs(bookScoreRef);
    
    allBooks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('全データ取得完了:', allBooks);
    
  } catch (error) {
    console.error("データ取得エラー:", error);
    createErrorMessage('データの取得に失敗しました');
  }
}
// 特定のbookIdで表示する関数
function showBookByBookId(targetBookId) {
    // bookIdを数値に変換
    const parsedBookId = Number(targetBookId);
    
    // 該当書籍を検索
    const targetBook = allBooks.find(book => 
      book.bookId === parsedBookId
    );
  
    if (!targetBook) {
      createErrorMessage(`該当する書籍が見つかりません（bookId: ${targetBookId}）`);
      return;
    }
  
    // 表示クリア
    document.body.innerHTML = '';
  
    // コンテンツ作成
    const container = document.createElement("div");
    container.style.maxWidth = "800px";
    container.style.margin = "40px auto";
    container.style.padding = "20px";
  
    container.innerHTML = `
      <h1 style="color: #333; margin-bottom: 20px">${targetBook.title}</h1>
      <img src="${targetBook.imageUrl}" alt="${targetBook.title}" 
           style="max-width: 300px; display: block; margin-top: 20px;">
      <div style="margin-top: 20px;">
        <p>平均評価: ${targetBook.mean}</p>
        <p>分散: ${targetBook.var}</p>
      </div>
    `;
  
    document.body.appendChild(container);
  }
  
  // 初期処理
  document.addEventListener('DOMContentLoaded', async () => {
    await getAllBookScores();
    
    // 使用例: 表示したいbookIdを指定（例: 2）
    const targetBookId = 1; // ここに取得したいbookIdを入力
    showBookByBookId(targetBookId);
  });
  
  // エラーメッセージ表示関数
  function createErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.color = '#ff4444';
    errorDiv.style.padding = '15px';
    errorDiv.style.border = '1px solid #ffcccc';
    errorDiv.style.margin = '20px';
    document.body.appendChild(errorDiv);
  }


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


