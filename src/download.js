import { saveAs } from "file-saver";
import JSZip from "jszip";

// 変換済みstatus: convertedのファイルからダウンロードURLを生成
export function downloadImage(convertedFile) {
  if (convertedFile.status !== "converted") {
    return;
  } else {
    // a要素を作成
    const a = document.createElement("a");
    a.href = convertedFile.convertedDataUrl;
    a.download = convertedFile.convertedName;
    // a要素のクリックイベントを発生
    a.click();
    document.body.appendChild(a);
  }
}

// 全てダウンロード
export async function downloadFilesAsZip(currentFiles) {
  const zip = new JSZip();
  const filesToZIP = currentFiles.filter((file) => file.status === "converted");

  if (filesToZIP.length === 0) {
    alert("ダウンロード対象のファイルがありません");
    return;
  }

  filesToZIP.forEach((fileInfo) => {
    const base64Data = fileInfo.convertedDataUrl.split(",")[1];
    if (base64Data) {
      zip.file(fileInfo.convertedName, base64Data, { base64: true });
    }
  });

  // zipファイルをblobとして生成
  const zipBlob = await zip.generateAsync({ type: "blob" });

  const zipFileName = `${filesToZIP.length} images`;

  // FileSeverを使ってblobを保存
  saveAs(zipBlob, zipFileName);
}
