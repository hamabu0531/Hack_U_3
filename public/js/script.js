function processImage() {
    const input = document.getElementById("imageInput");
    if (input.files.length === 0) {
        alert("画像を選択してください");
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const imgElement = document.getElementById("preview");
        imgElement.src = event.target.result;
        imgElement.style.display = "block";
    };

    reader.readAsDataURL(file); // 画像をBase64として読み込む
}
