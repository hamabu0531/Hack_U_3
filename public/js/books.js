// books.js

// 本のリストを返す関数
function getBooks() {
    return [
        { id: 1, title: "The Catcher in the Rye" },
        { id: 2, title: "To Kill a Mockingbird" },
        { id: 3, title: "1984" },
        { id: 4, title: "Pride and Prejudice" },
        { id: 5, title: "Moby-Dick" }
    ];
}

// グローバル変数として関数を定義（HTML からアクセス可能）
window.getBooks = getBooks;
