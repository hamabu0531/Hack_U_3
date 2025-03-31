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
async function showBooks(calculatedBooks) {
    const bookListContainer = document.getElementById("book-list");

    if (!bookListContainer) {
        console.error("表示先の要素が見つかりません。HTML内に <div id='book-list'></div> を追加してください。");
        return;
    }

    // コンテナをクリア
    bookListContainer.innerHTML = '';

    calculatedBooks.forEach(calculatedBook => {
        // allBooksから該当書籍を検索
        const targetBook = allBooks.find(book => book.bookId === calculatedBook.id);

        if (!targetBook) {
            console.error(`該当書籍が存在しません（ID: ${calculatedBook.id}）`);
            return;
        }

        // 書籍カード作成
        const container = document.createElement("div");
        container.className = "book-item";

        // HTMLコンテンツを設定
        container.innerHTML = `
            <h2 class="book-title">${targetBook.title}</h2>
            <img src="${targetBook.imageUrl}" alt="${targetBook.title}" class="book-image">
            <p>Book ID: ${targetBook.bookId}</p>
        `;

        // HTMLに追加
        bookListContainer.appendChild(container);
    });
}



// ここから、グラフ表示

let allcoordinate = []; // 全書籍データを保持する変数

// 全データ取得関数
async function getAllCoordinate() {
  try {
    const bookScoreRef = collection(db, "reviews");
    const querySnapshot = await getDocs(bookScoreRef);
    
    allcoordinate = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('全データ取得完了:', allcoordinate);
    
  } catch (error) {
    console.error("データ取得エラー:", error);
    createErrorMessage('データの取得に失敗しました');
  }
}

// 初期処理
document.addEventListener('DOMContentLoaded', async () => {
    await getAllBookScores();
    
    const calculatedBooks = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 }
    ];

    // 書籍情報をすべて表示
    await showBooks(calculatedBooks);
    await getAllCoordinate();
    // x と y の値をそれぞれ抽出
    const xValues = allcoordinate.map(book => book.x);
    const yValues = allcoordinate.map(book => book.y);
   
    const canvas = document.getElementById('scatterChart');

    // left-containerの幅を取得してCanvas要素に適用
    const leftContainerWidth = document.getElementById('left-container').offsetWidth;
    canvas.width = leftContainerWidth;
    canvas.height = leftContainerWidth; // 縦の大きさを横幅と同じに設定
    // 結果をコンソールに表示
    console.log("x values:", xValues);
    console.log("y values:", yValues);


// スケールの計算
    const padding = 0.05; // パディングを追加して余白を確保
    const xMin = Math.min(...xValues) - padding;
    const xMax = Math.max(...xValues) + padding;
    const yMin = Math.min(...yValues) - padding;
    const yMax = Math.max(...yValues) + padding;

// データポイントの作成
const data = allcoordinate.map((book) => ({
    x: book.x,
    y: book.y,
    title: book.title,      // タイトルを追加
    imageUrl: book.imageUrl // 画像URLを追加
  }));

// Chart.jsでグラフを描画
const ctx = canvas.getContext('2d');

const chart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "ポイント",
          data: data,
          backgroundColor: "blue",
          pointRadius: 10,
      
        },
      ],
    },
    options: {
      scales: {
        x: {
          min: 0,
          max: 1,
          grid: { display: true },
        },
        y: {
          min: 0,
          max: 1,
          grid: { display: true },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "ポイントの散布図 (X軸とY軸は0〜1)",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const item = context.dataset.data[context.dataIndex];
              return [`タイトル: ${item.title}`, `画像URL: ${item.imageUrl}`];
            },
          },
        },
        annotation: {
          annotations: {
            verticalLine: {
              type: "line",
              scaleID: "x",
              xMin: 0.5,
              xMax: 0.5,
              yMin: 0,
              yMax: 1,
              borderColor: "red",
              borderWidth: 2,
              label: {
                content: "X=0.5",
                enabled: true,
                position: "top",
              },
            },
            horizontalLine: {
              type: "line",
              scaleID: "y",
              xMin: 0,
              xMax: 1,
              yMin: 0.5,
              yMax: 0.5,
              borderColor: "black",
              borderWidth: 2,
              label: {
                content: "Y=0.5",
                enabled: true,
                position: "right",
              },
            },
          },
        },
      },
    },
  });
  
  // マウスホバー時に画像とタイトルを表示する機能
// JavaScript修正
// マウスホバー時に画像とタイトルを表示する機能
// JavaScript修正
// マウスホバー時に画像とタイトルを表示する機能
canvas.addEventListener("mousemove", (e) => {
    const points = chart.getElementsAtEventForMode(e, 'nearest', {intersect: true}, false);
    const previewContent = document.getElementById("previewContent");
    const preview = document.getElementById("imagePreview");
  
    if (points.length) {
      const item = data[points[0].index];
      
      // プレビュー内容を更新
      previewContent.innerHTML = `
        <h4>${item.title}</h4>
        <img src="${item.imageUrl}" 
             alt="${item.title}" 
             style="max-width:${Math.min(leftContainerWidth * 0.4, 300)}px">
      `;
      previewContent.style.opacity = '1'; // 画像とタイトルを表示
      preview.style.opacity = '1'; // プレビューを表示
    } else {
      previewContent.style.opacity = '0'; // 画像とタイトルを非表示
      preview.style.opacity = '0'; // プレビューを非表示
    }
  });

// マウスがポイントに乗っている間は画像を表示し続ける
canvas.addEventListener("mouseenter", (e) => {
    const points = chart.getElementsAtEventForMode(e, 'nearest', {intersect: true}, false);
    if (points.length) {
      const item = data[points[0].index];
      const preview = document.getElementById("imagePreview");
      const previewContent = document.getElementById("previewContent");
      
      // プレビュー内容を更新
      previewContent.innerHTML = `
        <h4>${item.title}</h4>
        <img src="${item.imageUrl}" 
             alt="${item.title}" 
             style="max-width:${Math.min(leftContainerWidth * 0.4, 300)}px">
      `;
      
      // プレビューの位置調整
      const offsetX = 20;
      const offsetY = 20;
      const maxRight = window.innerWidth - preview.offsetWidth - 10;
      
      preview.style.left = `${Math.min(e.clientX + offsetX, maxRight)}px`;
      preview.style.top = `${e.clientY + offsetY}px`;
      preview.style.display = 'block';
      preview.style.opacity = '1';
    }
  });

// マウスがポイントから離れたときの処理
canvas.addEventListener("mouseleave", () => {
    const preview = document.getElementById("imagePreview");
    preview.style.opacity = '1';
    // setTimeout(() => preview.style.display = 'none', 300);
  });

// left-containerにマウスが触れたときの処理
document.getElementById("left-container").addEventListener("mouseenter", () => {
    const preview = document.getElementById("imagePreview");
    preview.style.opacity = '1'; // プレビューを表示
    // setTimeout(() => preview.style.display = 'none', 300);
});

// left-containerからマウスが離れたときの処理
document.getElementById("left-container").addEventListener("mouseleave", () => {
    const preview = document.getElementById("imagePreview");
    preview.style.opacity = '1'; // プレビューを非表示
    // setTimeout(() => preview.style.display = 'none', 300);
});

    });


// エラーメッセージ表示関数
function createErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.color = '#ff4444';
    errorDiv.style.padding = '15px';
    errorDiv.style.border = '1px solid #ffcccc';
    errorDiv.style.margin = '20px';

    const bookListContainer = document.getElementById("book-list");
    
    if (bookListContainer) {
        bookListContainer.appendChild(errorDiv);
    } else {
        document.body.appendChild(errorDiv);
    }
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


