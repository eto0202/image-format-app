import * as dom from "./dom.js";
import * as fileList from "./fileList.js";
import * as convert from "./convert.js";
import * as download from "./download.js";
import { renderFileList } from "./ui.js";

// @ts-check
/**
 * @typedef {import('./fileList.js').FileInfo} FileInfo
 */
/**
 * 現在のファイルリストを更新し、UIを再描画する
 */
function updateUI() {
  const currentList = fileList.getFileList();

  renderFileList(dom.listContainer, currentList);

  if (currentList.length === 0) {
    dom.emptyMessage.classList.remove("hidden");
    dom.listContainer.classList.add("hidden");
  } else {
    dom.emptyMessage.classList.add("hidden");
    dom.listContainer.classList.remove("hidden");
  }
}

/**
 * ファイル選択時に実行され、UI更新、inputを空にする
 * @param {Event} event - イベントオブジェト
 * @param {HTMLInputElement} event.target - イベントを発生させたinput要素
 * @returns {void}
 */
function handleFileSelect(event) {
  const files = event.target.files;
  if (files.length === 0) {
    return;
  }

  fileList.addFilesToList(files);

  updateUI();

  event.target.value = "";
}

/**
 * 各ファイル情報オブジェクトのステータスを更新し、UIを更新
 * @param {number} targetFileID - datasetから取得したファイルID
 * @param {'pending'|'converting'|'converted'|'error'} status - 変更先のステータス
 * @param {{}} [data={}] - 変更するプロパティ。省略可能。
 */
function updateStatus(targetFileID, status, data = {}) {
  const currentFiles = fileList.getFileList();
  const newFileList = currentFiles.map((file) =>
    file.id === targetFileID ? { ...file, status, ...data } : file
  );
  fileList.setFileList(newFileList);
  updateUI();
}

/**
 * 変換、ダウンロード、削除の個別操作を行う。
 * イベント移譲を利用しており、クリックされた要素に応じて処理を分岐する。
 * @param {MouseEvent} event - クリックイベントオブジェト
 * @returns {void}
 */
async function handleActionFile(event) {
  /** @type {HTMLElement}*/
  const target = event.target;
  const files = fileList.getFileList();
  const targtItem = target.closest(".image-list-item");

  if (!targtItem || target.classList.contains("format-select")) return;

  const targetFileID = parseFloat(targtItem.dataset.id);

  const format = targtItem.querySelector(".format-select").value;

  // 変換ボタンの処理
  if (target.classList.contains("convert-btn")) {
    if (format === "title") {
      alert("formatを選択してください");
      return;
    }

    const targetFileInfo = files.find((file) => file.id === targetFileID);

    if (!targetFileInfo || targetFileInfo.status !== "pending") return;

    updateStatus(targetFileID, "converting");

    try {
      const dataUrl = await convert.convertImage(targetFileInfo.originalFile, format);
      const newName = targetFileInfo.originalName.split(".").slice(0, -1).join(".") + `.${format}`;

      updateStatus(targetFileID, "converted", {
        convertedDataUrl: dataUrl,
        convertedName: newName,
      });
    } catch (error) {
      updateStatus(targetFileID, "error", { errorMessage: error.message });
    }
    return;
  }

  // ダウンロードボタンの処理
  if (target.classList.contains("download-btn")) {
    const convertedFile = files.find((file) => file.id === targetFileID);
    download.downloadImage(convertedFile);
    return;
  }

  // 削除ボタンの処理
  if (target.classList.contains("clear-btn")) {
    const filteredFile = files.filter((file) => file.id !== targetFileID);

    fileList.setFileList(filteredFile);
  }

  updateUI();
}

/**
 * 削除、ダウンロード、変換を一括で行う
 * イベント移譲を利用しており、クリックされた要素に応じて処理を分岐する。
 * @param {MouseEvent} event クリックイベントオブジェクト
 * @returns {Promise<void>}
 */
async function handleBulkAction(event) {
  // 削除ボタンの処理
  if (event.target === dom.clearAllBtn) {
    const newFileList = [];
    fileList.setFileList(newFileList);
    updateUI();
  }

  // ダウンロードボタンの処理
  if (event.target === dom.downloadAllBtn) {
    const currentFiles = fileList.getFileList();
    const convertedFiles = currentFiles.filter((file) => file.status === "converted");
    download.downloadFilesAsZip(convertedFiles);
  }

  // 変換ボタンの処理
  if (event.target === dom.convertAllBtn) {
    const currentList = fileList.getFileList();
    const format = dom.formatInputForm.formatSelect.value;

    const pendingFiles = currentList.filter((file) => file.status === "pending");
    if (pendingFiles.length === 0) {
      return;
    }

    const filesToConvert = currentList.map((file) =>
      file.status === "pending" ? { ...file, status: "converting" } : file
    );

    fileList.setFileList(filesToConvert);
    updateUI();

    const convertedFiles = await convert.convertAllImage(filesToConvert, format);

    fileList.setFileList(convertedFiles);
    updateUI();
  }
}

/**
 * 各HTML要素にイベントを設定
 */
function eventListener() {
  dom.imageInput.addEventListener("change", handleFileSelect);
  dom.listContainer.addEventListener("click", handleActionFile);
  dom.mainContents.addEventListener("click", handleBulkAction);
}

/**
 * 初期化を行う
 */
function initialize() {
  eventListener();
  updateUI();
}

initialize();
