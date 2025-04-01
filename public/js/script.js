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
    const searchResult = await findNearestImageInFirestore(embeddingResult.stats.x, embeddingResult.stats.y, 2);
                const nearestImage = searchResult.nearest;
                const sortedResults = searchResult.sortedResults;

                console.log('類似度順のソート結果:', sortedResults);

                await getAllBookScores();
    
                const calculatedBooks = [
                    { id: 1 },
                    { id: 2 },
                    { id: 3 },
                    { id: 4 },
                    { id: 5 }
                ];
            
                // 書籍情報をすべて表示
                await showBooks(sortedResults);
     
  });


});



