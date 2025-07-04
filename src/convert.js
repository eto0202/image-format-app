// 画像の個別変換を行う非同期関数
export async function convertImage(file, format) {
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
export async function convertAllImage(newFileList) {}
