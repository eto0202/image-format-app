//新しい配列を作成
let fileList = [];

//選択されたファイルリストをファイルデータ配列に追加
export function addFilesToList(newFiles) {
  const files = Array.from(newFiles);

  //mapを使って各ファイルを新しいオブジェクトに変換
  const newfileOject = files.map((file) => ({
    id: Date.now() + Math.random(),
    originalFile: file, // ユーザーが選択したFIleオブジェクト
    originalName: file.name, // 元のファイル名
    status: "pending", // 状態"pending","converting","converted","error"
    convertedDataUrl: null, //変換後のデータURL
    convertedName: null, //変換後のファイル名。元のファイル名+converted
    errorMessage: null,
  }));

  fileList = [...fileList, ...newfileOject];
}

//現在のファイルリストを取得
export function getFileList() {
  return fileList;
}

//ファイルリストを更新
export function setFileList(newFileList) {
  fileList = newFileList;
}
