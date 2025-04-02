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
          const docMean = parseFloat(data.x);
          const docVar = parseFloat(data.y);
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
function addRedPoint(x, y) {
  // 新しいデータセットを追加
  chart.data.datasets.push({
    data: [{ x: x, y: y }],
    backgroundColor: "red", // 赤色
    pointRadius: 10, // 点のサイズ
  });
  
  // グラフを更新
  chart.update();
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
  imageUrl: book.imageUrl, // 画像URLを追加

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
      {
        label: "x=0.5の直線",
        data: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }],
        borderColor: "black",
        borderWidth: 2,
        showLine: true,
        fill: false,
        pointRadius: 0,
      },
      {
        label: "y=0.5の直線",
        data: [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }],
        borderColor: "black",
        borderWidth: 2,
        showLine: true,
        fill: false,
        pointRadius: 0,
      },
      // {
      //   label: "赤い点", // 新しい点用のデータセット
      //   // data: [{ x: 0.25, y: 0.25 }], // 新しい赤い点の座標
      //   data: [{ 
      //     x: embeddingResult.stats.x, 
      //     y: embeddingResult.stats.y 
      //   }], 
      //   backgroundColor: "red", // 赤色に設定
      //   pointRadius: 10, // 点の大きさ
      // }
    ],
  },
  options: {
    scales: {
      x: {
        type: "linear",
        position: "bottom",
        min: 0,
        max: 1,
        grid: { display: true },
      },
      y: {
        type: "linear",
        position: "left",
        min: 0,
        max: 1,
        grid: { display: true },
      },
    },
    plugins: {

    },
    animation: false, // アニメーションをオフにするとラベルが適切に描画されやすい
  },
  plugins: [{
      id: 'customLabels',
      afterDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.font = "14px Arial";
        ctx.fillStyle = "black";

        // 喜: 左上
        let x1Pos = chart.scales.x.getPixelForValue(0);
        let y1Pos = chart.scales.y.getPixelForValue(1);
        ctx.fillText("喜", x1Pos + 10, y1Pos - 10);

        // 怒: 右上
        let x2Pos = chart.scales.x.getPixelForValue(1);
        let y2Pos = chart.scales.y.getPixelForValue(1);
        ctx.fillText("怒", x2Pos - 20, y2Pos - 10);

        // 哀: 左下
        let x3Pos = chart.scales.x.getPixelForValue(0);
        let y3Pos = chart.scales.y.getPixelForValue(0);
        ctx.fillText("哀", x3Pos + 10, y3Pos + 20);

        // 楽: 右下
        let x4Pos = chart.scales.x.getPixelForValue(1);
        let y4Pos = chart.scales.y.getPixelForValue(0);
        ctx.fillText("楽", x4Pos - 20, y4Pos + 20);

        ctx.restore();
      }
    }]
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



