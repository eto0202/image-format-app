import * as dom from "./dom.js";
import * as fileList from "./fileList.js";
import * as convert from "./convert.js";
import { renderFileList } from "./ui.js";

// データの変更
// データとUIの同期。最新のデータをUIに反映
// UIコンポーネントの表示制御

// UIを更新する
function updateUI() {
  // 状態管理用配列を取得
  const currentList = fileList.getFileList();
  // listContainerに現在の配列を反映
  renderFileList(dom.listContainer, currentList);

  // 配列の中身に応じてlistContainerの表示を切り替える
  if (currentList.length === 0) {
    dom.emptyMessage.classList.remove("hidden");
    dom.listContainer.classList.add("hidden");
  } else {
    dom.emptyMessage.classList.add("hidden");
    dom.listContainer.classList.remove("hidden");
  }
}

// ファイルが選択されたときにaddFilesToList()を実行
function handleFileSelect(event) {
  // input要素で選択されたファイルリストを取得
  const files = event.target.files;
  // 一つも選択されなかった場合
  if (files.length === 0) {
    return;
  }

  // 状態管理用リストにファイルを追加
  fileList.addFilesToList(files);

  // UIを更新。状態管理用配列をもとにimage-list-containerに要素が生成される
  updateUI();

  // inputの値をリセット
  files.value = "";
}

// 削除ボタンが押されたときにclearFile()を実行
function handleRemoveFile(event) {
  const targtItem = event.target.closest(".image-list-item");
  // datasetから取得したIDは文字列
  const targetFileID = targtItem.dataset.id;
  // targetFileIDは文字列のため、数値に変換してremoveFileに渡す
  fileList.removeFile(parseFloat(targetFileID));
  updateUI();
}

// イベントリスナー関数
function eventListener() {
  dom.imageInput.addEventListener("change", handleFileSelect);
  dom.listContainer.addEventListener("click", handleRemoveFile);
}

// 初期化用の関数
function initialize() {
  eventListener();
  updateUI();
}

// 初期化
initialize();
