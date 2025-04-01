

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
      const { normalizedMean, normalizedVariance, x: x_mean, y: y_variance } = embeddingResult.stats;
      console.log('感情オフセット適用後の座標:', {
        emotion: selectedEmotion,
        normalizedMean: embeddingResult.stats.normalizedMean,
        normalizedVariance: embeddingResult.stats.normalizedVariance,
        // グラフ表示，firestore格納用
        x_mean: embeddingResult.stats.x,
        y_variance: embeddingResult.stats.y
    });
    const searchResult = await findNearestImageInFirestore(x_mean, y_variance, 2);
                const nearestImage = searchResult.nearest;
                const sortedResults = searchResult.sortedResults;

                console.log('類似度順のソート結果:', sortedResults);


     
  });


});



