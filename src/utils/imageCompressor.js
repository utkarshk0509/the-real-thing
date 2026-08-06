export const compressImageToWebP = (input, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    filename = 'cover.webp'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl = null;
    if (typeof input === 'string') {
      img.src = input;
    } else if (input instanceof Blob || input instanceof File) {
      objectUrl = URL.createObjectURL(input);
      img.src = objectUrl;
    } else {
      return reject(new Error('Invalid image input provided for compression.'));
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get canvas 2d context for image compression.'));
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Canvas WebP blob creation failed.'));
          }

          const webpName = filename.replace(/\.[^/.]+$/, '') + '.webp';
          const compressedFile = new File([blob], webpName, {
            type: 'image/webp',
            lastModified: Date.now()
          });

          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for WebP compression: ' + err.message));
    };
  });
};
