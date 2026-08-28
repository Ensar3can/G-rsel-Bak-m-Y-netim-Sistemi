const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.78;
/** localStorage için güvenli üst sınır (yaklaşık 280 KB). */
export const MAX_PHOTO_DATA_URL_LENGTH = 380_000;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Görsel okunamadı.'));
    img.src = src;
  });
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
}

export async function prepareDemoPhoto(file: File): Promise<{ dataUrl: string; name: string }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Yalnızca görsel dosyalar yüklenebilir.');
  }

  const original = await readFile(file);
  const image = await loadImage(original);
  const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Görsel işlenemedi.');
  ctx.fillStyle = '#0B1220';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  if (!dataUrl.startsWith('data:image/jpeg') || dataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
    throw new Error('Görsel çok büyük. Daha küçük bir fotoğraf deneyin.');
  }

  const base = file.name.replace(/\.[^.]+$/, '') || 'saha-foto';
  return { dataUrl, name: `${base}.jpg` };
}
