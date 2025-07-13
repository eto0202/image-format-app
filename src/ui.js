import * as dom from "./dom.js";

// @ts-check
/**
 * @typedef {import('./fileList.js').FileInfo} FileInfo
*/
/**
 * ファイル情報オブジェトをもとにli要素を生成
 * @param {FileInfo} fileinfo - ファイル情報オブジェト
 * @returns {HTMLElement} li要素
 */
function createFilelistItem(fileinfo) {
  // テンプレートからDOMを複製
  const clone = dom.template.content.cloneNode(true);
  const li = clone.querySelector(".custom-li");
  li.dataset.id = fileinfo.id;
  li.querySelector(".file-name").textContent = fileinfo.originalName;

  const statusAria = li.querySelector(".status-aria");
  const statusDisplay = li.querySelector(".status-display");
  const convertedName = li.querySelector(".converted-name");
  const convertBtnDisplay = li.querySelector(".convert-btn");
  const downloadBtnDisplay = li.querySelector(".download-btn");

  /**
   * 表示設定オブジェト
   * @type {{pending, converting, converted, error}}
   */
  const statusConfig = {
    pending: {
      text: "待機中",
      showConvert: true,
      showDownload: false,
      color: "#898f97",
    },
    converting: {
      text: "変換中",
      showConvert: false,
      showDownload: false,
      color: "#898f97",
    },
    converted: { text: "変換完了", showConvert: false, showDownload: true, color: "#3a68b8" },
    error: {
      text: "エラー",
      showConvert: false,
      showDownload: false,
      isError: true,
      color: "#b10000",
    },
  };

  /**
   * 表示設定オブジェトから現在のステータスに応じた設定を取得。存在しない場合はデフォルト設定。
   * @type {{text: string, showConvert: boolean, showDownload: boolean}} */
  const config = statusConfig[fileinfo.status] || {
    text: "",
    showConvert: true,
    showDownload: false,
  };

  // 設定をもとにUIを更新
  statusAria.style.setProperty("--status-color", `${config.color}`);
  statusDisplay.textContent = config.text;
  convertedName.textContent = fileinfo.convertedName;
  convertedName.classList.toggle("hidden");

  if (config.isError) {
    statusDisplay.title = fileinfo.errorMessage;
    statusDisplay.classList.add("error");
  }

  // 各ボタンの表示を更新
  convertBtnDisplay.classList.toggle("hidden", !config.showConvert);
  downloadBtnDisplay.classList.toggle("hidden", !config.showDownload);

  return li;
}

/**
 * 指定されたコンテナに、ファイル情報オブジェト配列をもとにUIを描画する。
 * 呼び出されるたびにコンテナを空にする。
 * @param {HTMLElement} containerElement - li要素の追加先のコンテナ
 * @param {FileInfo[]} fileList - ファイル情報オブジェト配列
 * @returns {void}
 */
export function renderFileList(containerElement, fileList) {
  containerElement.replaceChildren();

  const fragment = document.createDocumentFragment();
  fileList.forEach((file) => {
    const li = createFilelistItem(file);
    fragment.appendChild(li);
  });

  containerElement.appendChild(fragment);
}
