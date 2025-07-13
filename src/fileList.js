// @ts-check
/**
 * ファイル情報オブジェクト
 * @typedef {object} FileInfo
 * @property {number} id - ファイルID
 * @property {File} originalFile - 元のFileオブジェクト
 * @property {string} originalName - 元のファイル名
 * @property {"pending"|"converting"|"converted"|"error"} status - ファイルの現在の状態
 * @property {string|null} convertedDataUrl - 変換後のデータURL
 * @property {string|null} convertedName - 変換後のファイル名
 * @property {string|null} errorMessage - エラーメッセージ
 */

/**
 * ファイル情報リスト
 * @type {FileInfo[]}
 */
let fileList = [];

/**
 * 新しく選択されたFileのリストを、管理用のオブジェクト配列に変換し、既存リストに追加。
 * @param {FileList} newSelectedFiles - input要素から取得したFileListオブジェクト。
 */
export function addFilesToList(newSelectedFiles) {
  const files = Array.from(newSelectedFiles);

  /**
   * @type {FileInfo[]}
   */
  const newfileOjects = files.map((file) => ({
    id: Date.now() + Math.random(),
    originalFile: file,
    originalName: file.name,
    status: "pending",
    convertedDataUrl: null,
    convertedName: null,
    errorMessage: null,
  }));

  fileList = [...fileList, ...newfileOjects];
}

/**
 * 現在のファイル情報リストを取得する
 * @returns {FileInfo[]} ファイル情報オブジェトの配列
 */
export function getFileList() {
  return fileList;
}

/**
 * ファイル情報リストを新しい配列で上書きする。
 * @param {FileInfo[]} newFileList - 新しいファイル情報オブジェクトの配列
 */
export function setFileList(newFileList) {
  fileList = newFileList;
}
