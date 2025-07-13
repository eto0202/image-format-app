// @ts-check
/**
 * @typedef {import('./fileList.js').FileInfo} FileInfo*/
/**
 * 画像のフォーマット形式を変換する
 * @param {File} file - Fileオブジェト
 * @param {string} format - フォーマット形式
 * @returns {Promise<string>} - 変換後のデータURLを解決するPromise
 */
export function convertImage(file, format) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("選択されたファイルは画像ではありません"));
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        // 透明度を持つ画像をJPEGに変換する場合の背景色指定
        if (format === "jpeg" || format === "bmp") {
          // @ts-ignore
          ctx.fillStyle = "#fff";
          // @ts-ignore
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // @ts-ignore
        ctx.drawImage(img, 0, 0);
        // MIMEタイプを生成。bmpの場合はimage/bmpを使う
        const mimeType = `image/${format === "bmp" ? "bmp" : format}`;
        // JPEG、WEBPの品質を指定
        const quality = 1;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error("画像の読み込みに失敗しました"));
      };

      // @ts-ignore
      img.src = readerEvent.target.result;
    };

    reader.onerror = () => {
      reject(new Error("ファイルの読み込みに失敗しました"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 全てのファイルを変換する
 * @param {FileInfo[]} filesToConvert - 変換対象のファイル情報オブジェト配列
 * @param {"jpeg"|"png"|"webp"|"bmp"} format - フォーマット形式
 * @returns {Promise<FileInfo[]>} - 新しいファイル情報オブジェクトの配列を返すPromise。
 */
export async function convertAllImage(filesToConvert, format) {
  const conversionPromises = filesToConvert.map(async (fileInfo) => {
    if (fileInfo.status !== "converting") {
      return fileInfo;
    }
    try {
      const dataUrl = await convertImage(fileInfo.originalFile, format);
      return {
        ...fileInfo,
        status: "converted",
        convertedDataUrl: dataUrl,
        convertedName: fileInfo.originalName.split(".").slice(0, -1).join(".") + `.${format}`,
      };
    } catch (error) {
      return {
        ...fileInfo,
        status: "error",
        errorMessage: error.message,
      };
    }
  });

  // @ts-ignore
  return Promise.all(conversionPromises);
}
