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

// 個別操作
async function handleActionFile(event) {
  const target = event.target;
  // 状態管理用配列を取得
  const files = fileList.getFileList();
  const targtItem = target.closest(".image-list-item");

  if (!targtItem || target.classList.contains("format-select")) return;

  // datasetから取得したIDは文字列のため数値に変換
  const targetFileID = parseFloat(targtItem.dataset.id);

  // 変換ボタン
  if (target.classList.contains("convert-btn")) {
    // select要素からフォーマット形式を取得
    const format = targtItem.querySelector(".format-select").value;
    // 状態管理用配列から当該ファイルを取得
    const targetFileInfo = files.find((file) => file.id === targetFileID);

    // 配列にファイルが無い場合処理を中断
    if (!targetFileInfo) return;

    // 状態をconvertingに変更しUIを更新
    const updatedFileList = files.map((file) => {
      if (file.id === targetFileID) {
        return {
          ...file,
          status: "converting",
        };
      } else {
        return file;
      }
    });

    // 新しい配列に更新
    fileList.setFileList(updatedFileList);
    updateUI();

    // 変換を実行
    try {
      // awaitを使って変換処理が終わるのを待つ
      const dataUrl = await convert.convertImage(targetFileInfo.originalFile, format);

      // 変換終了後、再度最新のリストを取得して更新。
      // 変換中に他の操作が行われる可能性があるため
      const currentFiles = fileList.getFileList();
      const newFileList = currentFiles.map((file) => {
        if (file.id === targetFileID) {
          // ファイル名の拡張子を変更
          const newName = file.originalName.split(".").slice(0, -1).join(".") + `.${format}`;
          return {
            ...file,
            status: "converted",
            convertedDataUrl: dataUrl,
            convertedName: newName,
          };
        }
        return file;
      });

      // ファイルリストを更新
      fileList.setFileList(newFileList);

      // エラーハンドリング
    } catch (error) {
      const currentFiles = fileList.getFileList();
      const newFileList = currentFiles.map((file) => {
        if (file.id === targetFileID) {
          return {
            ...file,
            status: "error",
            errorMessage: error.message,
          };
        }
        return file;
      });

      // ファイルリストを更新
      fileList.setFileList(newFileList);
    }
  }

  // ダウンロードボタン
  if (target.classList.contains("download-btn")) {
  }
  // 削除ボタン
  if (target.classList.contains("clear-btn")) {
    // idがtargetFileIDと同じではない物をフィルタリング
    const newFileList = files.filter((file) => file.id !== targetFileID);
    // リストを更新
    fileList.setFileList(newFileList);
  }
  // UIを更新
  updateUI();
}

// 一括操作関連
function handleBulkAction(event) {
  // 全てクリア
  if (event.target === dom.clearAllBtn) {
    const newFileList = [];
    fileList.setFileList(newFileList);
  }
  // 全てダウンロード
  if (event.target === dom.downloadAllBtn) {
    // 状態管理用配列を取得
    const files = fileList.getFileList();
  }
  updateUI();
}

// 全て変換
async function handleConvertAllFiles(event) {
  if (event.target === dom.convertAllBtn) {
    // 状態管理用配列を取得
    const currentList = fileList.getFileList();
    // フォーマット形式を取得
    const format = dom.formatAllSelect.value;

    // pendingのファイルを更新してUIを反映
    // pendingが無い場合処理を終了
    const filesToConvert = currentList.filter((file) => file.status === "pending");
    if (filesToConvert.length === 0) {
      return;
    }

    // ファイルのステータスを変更
    const processingFiles = currentList.map((file) =>
      file.status === "pending" ? { ...file, status: "converting" } : file
    );

    //UIを更新
    fileList.setFileList(processingFiles);
    updateUI();

    // 一括変換処理を呼び出す
    const newFileList = await convert.convertAllImage(processingFiles, format);

    // リストを更新
    console.log(newFileList);
    fileList.setFileList(newFileList);
    updateUI();
  }
}

// イベントリスナー関数
function eventListener() {
  dom.imageInput.addEventListener("change", handleFileSelect);
  dom.listContainer.addEventListener("click", handleActionFile);
  dom.bulkAction.addEventListener("click", handleBulkAction);
  dom.convertAllBtn.addEventListener("click", handleConvertAllFiles);
}

// 初期化用の関数
function initialize() {
  eventListener();
  updateUI();
}

// 初期化
initialize();
