// 画像のフォーファット変換を行う非同期関数
export function convertImage(file, format) {
  return new Promise((resolve, reject) => {
    // ファイル形式のバリデーション
    if (!file.type.startsWith("image/")) {
      return reject(new Error("選択されたファイルは画像ではありません"));
    }
    const reader = new FileReader();
    // ファイルを読み込む
    reader.onload = (readerEvent) => {
      const img = new Image();
      // 画像を読み込む
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        // 透明度を持つ画像をJPEGに変換する場合の背景色指定
        if (format === "jpeg" || format === "bmp") {
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        // MIMEタイプを生成。bmpの場合はimage/bmpを使う
        const mimeType = `image/${format === "bmp" ? "bmp" : format}`;
        // JPEG、WEBPの品質を指定
        const quality = 1;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      // エラーハンドリング
      img.onerror = () => {
        reject(new Error("画像の読み込みに失敗しました"));
      };
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => {
      reject(new Error("ファイルの読み込みに失敗しました"));
    };
    reader.readAsDataURL(file);
  });
}

// ファイルリスト全てを変換
export async function convertAllImage(newFileList, format) {
  // convertingだけをフィルタリング
  const targetToConvert = newFileList.filter((file) => file.status === "converting");
  // 変換対象外のファイル
  const other = newFileList.filter((file) => file.status !== "converting");

  // 変換対象のファイルに対して、変換用Promiseを作成
  const conversionPromises = targetToConvert.map(async (file) => {
    try {
      const dataUrl = await convertImage(file.originalFile, format);

      // 変換成功後、変換済みとして新しいオブジェクトを返す
      return {
        ...file,
        status: "converted",
        convertedDataUrl: dataUrl,
        convertedName: file.originalName.split(".").slice(0, -1).join(".") + `.${format}`,
      };
    } catch (error) {
      // status: ""error"ステータスが更新されたオブジェクトを返す
      return {
        ...file,
        status: "error",
        errorMessage: error.message,
      };
    }
  });

  // 全ての変換処理が終わるのを待つ
  const convertedResult = await Promise.all(conversionPromises);

  // 変換対象外と変換結果を結合
  return [...other, ...convertedResult];
}
