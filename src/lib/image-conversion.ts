// 画像変換・処理用のユーティリティ（軽量版）
// クライアントサイドでの画像処理に特化

export interface ImageConversionOptions {
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

// ファイルをCanvasを使ってJPEG/PNG形式に変換
export async function convertImageToFormat(
  file: File, 
  options: ImageConversionOptions = {}
): Promise<File> {
  const {
    format = 'jpeg',
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1920
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // アスペクト比を保持しながらリサイズ
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // 画像を描画
        ctx?.drawImage(img, 0, 0, width, height);

        // 指定フォーマットでBlobとして出力
        const mimeType = `image/${format}`;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('画像の変換に失敗しました'));
              return;
            }

            // 新しいファイル名を生成
            const originalName = file.name.replace(/\.[^.]+$/, '');
            const extension = format === 'jpeg' ? 'jpg' : format;
            const newFileName = `${originalName}_converted.${extension}`;

            const convertedFile = new File([blob], newFileName, {
              type: mimeType,
              lastModified: Date.now()
            });

            console.log('✅ Image conversion successful:', {
              originalSize: file.size,
              convertedSize: convertedFile.size,
              originalType: file.type,
              convertedType: mimeType,
              dimensions: `${width}x${height}`
            });

            resolve(convertedFile);
          },
          mimeType,
          format === 'jpeg' ? quality : undefined
        );
      } catch (error) {
        reject(new Error(`画像変換エラー: ${error}`));
      }
    };

    img.onerror = () => {
      reject(new Error('画像の読み込みに失敗しました'));
    };

    // ファイルをDataURLとして読み込み
    img.src = URL.createObjectURL(file);
  });
}

// カメラで撮影した画像を最適化
export async function optimizeCameraImage(file: File): Promise<File> {
  console.log('📸 Optimizing camera image:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  // すでにJPEGで適切なサイズの場合はそのまま返す
  if (file.type === 'image/jpeg' && file.size < 2 * 1024 * 1024) {
    return file;
  }

  // JPEG形式に変換し、適切なサイズに圧縮
  return await convertImageToFormat(file, {
    format: 'jpeg',
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920
  });
}

// ファイルサイズを人間が読みやすい形式に変換
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ファイルが画像かどうかを判定
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

// サポートするファイル形式のaccept属性を生成
export function generateAcceptAttribute(): Record<string, string[]> {
  return {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic', '.heif', '.gif', '.bmp']
  };
}
