import { saveAs } from "file-saver";
import JSZip from "jszip";

// @ts-check
/**
 * @typedef {import('./fileList.js').FileInfo} FileInfo
 */
/**
 * a要素を生成し、クリックイベントを発生させてダウンロードを行う。
 * @param {FileInfo} convertedFile - 変換済みファイル情報オブジェト
 * @returns {void}
 */
export function downloadImage(convertedFile) {
  const a = document.createElement("a");
  a.href = convertedFile.convertedDataUrl;
  a.download = convertedFile.convertedName;

  console.log(a);
}

/**
 * 変換済みファイルをzip形式として圧縮しダウンロード
 * @param {FileInfo[]} convertedFiles
 * @returns {void}
 */
export async function downloadFilesAsZip(convertedFiles) {
  const zip = new JSZip();

  if (convertedFiles.length === 0) {
    alert("変換済みのファイルがありません");
    return;
  }

  convertedFiles.forEach((fileInfo) => {
    const base64Data = fileInfo.convertedDataUrl.split(",")[1];
    if (base64Data) {
      zip.file(fileInfo.convertedName, base64Data, { base64: true });
    }
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const zipFileName = `${convertedFiles.length} images`;

  saveAs(zipBlob, zipFileName);
}
