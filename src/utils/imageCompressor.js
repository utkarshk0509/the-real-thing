/**
 * Utility to compress image files to WebP format using HTML5 Canvas
 * Significantly reduces image payload sizes before uploading to Supabase Storage.
 */

/**
 * Compresses an image File or Data URL string to a WebP File object.
 * @param {File|string} input - Image File object or Data URL / Blob URL string
 * @param {Object} options - Compression options
 * @param {number} [options.maxWidth=1200] - Max width in pixels
 * @param {number} [options.maxHeight=1200] - Max height in pixels
 * @param {number} [options.quality=0.82] - WebP quality (0.0 to 1.0)
 * @param {string} [options.filename='cover.webp'] - Output file name
 * @returns {Promise<File>} WebP compressed File object
 */
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

      // Scale dimensions proportionally if they exceed max limits
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

      // Smooth scaling settings
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
