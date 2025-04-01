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


document.getElementById("imageInput").addEventListener("change", function() {
    const file = this.files[0]; 
    if (!file) return;

    const reader = new FileReader();
    
    // reader.onload = function(event) {
    //     const imgElement = document.getElementById("preview");
    //     imgElement.src = event.target.result;
    //     imgElement.style.display = "block"; 
    // };

    reader.readAsDataURL(file); 
});


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

/**
 * Firestoreコレクションから画像データを取得して、特徴量との最近傍をN件探す
 * @param {number} mean 入力画像の平均値
 * @param {number} variance 入力画像の分散値
 * @param {number} n 取得する最近傍の数 (デフォルト: 5)
 * @return {Promise<Object>} 最も近いN件のデータ（距離順）と整形されたJSONデータ
 */
async function findNearestImageInFirestore_sscript(mean, variance, n = 2) {
  if (typeof mean !== 'number' || typeof variance !== 'number') {
      console.error('invalid parameters: mean=', mean, 'variance=', variance);
      return {
          nearest: null,
          sortedResults: []
      };
  }

  try {
      console.log(`search firestore: mean=${mean}, variance=${variance}, n=${n}`);

      // collection name = 'book_score'
      const collectionRef = collection(db,'reviews');
      // const snapshot = await collectionRef.get();
      // コレクションのドキュメントを取得
    const snapshot = await getDocs(collectionRef);
      if (snapshot.empty) {
          console.log('no data');
          return {
              nearest: null,
              sortedResults: []
          };
      }

      const docsWithDistance = [];

      snapshot.forEach(doc => {
          const data = doc.data();
          const docMean = parseFloat(data.mean);
          const docVar = parseFloat(data.var);
          const distance = Math.sqrt(
              Math.pow(mean - docMean, 2) +
              Math.pow(variance - docVar, 2)
          );

          docsWithDistance.push({
              id: data.bookId,
              title: data.title || 'No Title',
              mean: docMean,
              variance: docVar,
              distance: distance
          });
      });

      // nearest sort & get result
      docsWithDistance.sort((a, b) => a.distance - b.distance);
      const nearestDocs = docsWithDistance.slice(0, n);

      const formattedResults = nearestDocs.map(doc => ({
          id: doc.id,
          title: doc.title
      }));

      console.log(`find ${nearestDocs.length} data:`, nearestDocs);

      // log console
      console.group('similarity results');
      nearestDocs.forEach((doc, index) => {
          console.log(`${index + 1} place: ID=${doc.id}, Title=${doc.title}, Distance=${doc.distance.toFixed(4)}`);
      });
      console.groupEnd();

      console.log('Sorted results in JSON format:');
      console.log(JSON.stringify(formattedResults, null, 2));

      // return jason & nearest
      return {
          nearest: nearestDocs.length > 0 ? nearestDocs[0] : null,
          sortedResults: formattedResults
      };
  } catch (error) {
      console.error('Firestoreからの検索中にエラーが発生しました:', error);
      return {
          nearest: null,
          sortedResults: []
      };
  }
}


let allBooks = []; // 全書籍データを保持する変数

// 全データ取得関数
async function getAllBookScores() {
  try {
    const bookScoreRef = collection(db, "reviews");
    const querySnapshot = await getDocs(bookScoreRef);
    
    allBooks = querySnapshot.docs.map(doc => ({
      id: doc.bookId,
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

function fileToImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function (event) {
      const img = new Image();
      img.onload = () => callback(img);
      img.onerror = () => console.error("Failed to load image");
      img.src = event.target.result;
  };
  reader.onerror = () => console.error("Failed to read file");
  reader.readAsDataURL(file);
}

// 投稿ボタン押下時の処理
document.getElementById("submit").addEventListener("click", async function (event) {
  event.preventDefault();

  // check image2vec function
  if (typeof image2vec !== 'function') {
      console.error('image2vec関数が定義されていません');
      hideLoading();
      return;
  }


  let imageInput = document.getElementById("imageInput");
  let selectedEmotion = document.querySelector('.tab-button.active').getAttribute('data-emotion');
  let imageFile = imageInput.files[0];

  // 画像やタイトルが選択されていない場合はエラーメッセージを表示
  if (!imageFile ) {
      alert("タイトルと画像を選択してください。");
      return;
  }



  // 平均と分散を用いてx, yを計算
  fileToImage(imageFile, async function (img) {
      const embeddingResult = image2vec(img, selectedEmotion);
      console.log('画像と感情から埋め込みベクトルを生成しました:', embeddingResult);
      
      console.log('感情オフセット適用後の座標:', {
        emotion: selectedEmotion,
        normalizedMean: embeddingResult.stats.normalizedMean,
        normalizedVariance: embeddingResult.stats.normalizedVariance,
        // グラフ表示，firestore格納用
        x_mean: embeddingResult.stats.x,
        y_variance: embeddingResult.stats.y
    });
    const searchResult = await findNearestImageInFirestore_sscript(embeddingResult.stats.x, embeddingResult.stats.y, 2,db,collection);
                const nearestImage = searchResult.nearest;
                const sortedResults = searchResult.sortedResults;

                console.log('類似度順のソート結果:', sortedResults);

                await getAllBookScores();
    

            
                // 書籍情報をすべて表示
                await showBooks(sortedResults);
     
  });


});



