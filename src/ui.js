import * as dom from "./dom.js";
import { getFileList } from "./fileList.js";

// 選択されたファイルをもとにli要素を生成
function createFilelistItem(fileinfo) {
  // テンプレートからDOMを複製
  const clone = dom.template.content.cloneNode(true);
  const li = clone.querySelector(".custom-li");
  li.dataset.id = fileinfo.id;
  li.querySelector(".file-name").textContent = fileinfo.originalName;

  // ファイルのステータスに応じた表示内容を決定
  const statusDisplay = li.querySelector(".status-display");
  const fileName = li.querySelector(".file-name");
  const convertBtnDisplay = li.querySelector(".convert-btn");
  const downloadBtnDisplay = li.querySelector(".download-btn");
  // ファイルの状態に応じたUI設定をオブジェクトで定義
  const statusConfig = {
    pending: { text: "待機中", showConvert: true, showDownload: false },
    converting: { text: "変換中", showConvert: false, showDownload: false },
    converted: { text: "変換完了", showConvert: false, showDownload: true },
    error: { text: "エラー", showConvert: false, showDownload: false, isError: true },
  };

  // 現在のステータスに応じた設定を取得。存在しない場合はデフォルト設定
  const config = statusConfig[fileinfo.status] || {
    text: "",
    showConvert: true,
    showDownload: false,
  };

  // 設定をもとにUIを更新
  statusDisplay.textContent = config.text;
  if (config.isError) {
    statusDisplay.title = fileinfo.errorMessage;
    statusDisplay.classList.add("error");
  }
  // 各ボタンの表示を更新
  convertBtnDisplay.classList.toggle("hidden", !config.showConvert);
  downloadBtnDisplay.classList.toggle("hidden", !config.showDownload);

  return li;
}

// ファイルリストを描画する関数
export function renderFileList(containerElement, fileList) {
  // ファイルリストを空にする
  containerElement.replaceChildren();

  const fragment = document.createDocumentFragment();
  fileList.forEach((fileinfo) => {
    const li = createFilelistItem(fileinfo);
    fragment.appendChild(li);
  });

  containerElement.appendChild(fragment);
}
