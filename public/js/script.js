

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

  // check image2vec function
  if (typeof image2vec !== 'function') {
      console.error('image2vec関数が定義されていません');
      hideLoading();
      return;
  }

  let title = document.getElementById("title").value;
  let imageInput = document.getElementById("image");
  let selectedEmotion = document.querySelector('.tab-button.active').getAttribute('data-emotion');
  let imageFile = imageInput.files[0];

  // 画像やタイトルが選択されていない場合はエラーメッセージを表示
  if (!imageFile || !title) {
      alert("タイトルと画像を選択してください。");
      return;
  }

  // Storageに格納
  const imageUrl = await addImageToStorage(imageFile);

  // 平均と分散を用いてx, yを計算
  fileToImage(imageFile, async function (img) {
      const image_data = image2vec(img, selectedEmotion);

      const bookId = await getBookId(); // bookIdを取得

      // Firestoreに格納
      addReviewToFirestore(bookId, title, imageUrl, image_data.stats.x, image_data.stats.y, selectedEmotion); // bookId, title, imageUrl, x, y, emotion
  });

  // 画面を更新
  document.getElementById("submitted-container").style.display = "block";
  document.getElementById("posting-container").style.display = "none";
});