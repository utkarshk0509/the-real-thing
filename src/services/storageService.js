import { supabase } from '../lib/supabase';
import { BUCKETS } from '../config/constants';
import { compressImageToWebP } from '../utils/imageCompressor';

export const storageService = {
  /**
   * Compresses input image to WebP format and uploads it to Supabase Storage.
   * @param {File|Blob|string} imageInput - Raw file or data string
   * @param {string} [customFileName] - Optional target filename
   * @returns {Promise<string>} Public URL of the uploaded image
   */
  async uploadCoverImage(imageInput, customFileName) {
    if (!imageInput) return '';

    // Step 1: Compress to WebP via HTML5 Canvas
    let webpFile;
    try {
      webpFile = await compressImageToWebP(imageInput, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
        filename: customFileName || `cover_${Date.now()}.webp`
      });
    } catch (err) {
      console.warn('[storageService] WebP compression fallback:', err);
      // If input is already a File/Blob, proceed with it directly
      webpFile = imageInput;
    }

    // If no Supabase connection, return local preview Data URL
    if (!supabase) {
      if (typeof imageInput === 'string') return imageInput;
      return URL.createObjectURL(webpFile);
    }

    // Step 2: Upload WebP file to Supabase Storage 'covers' bucket
    const fileName = customFileName || `banner_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.webp`;
    const filePath = `banners/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from(BUCKETS.COVERS)
        .upload(filePath, webpFile, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.warn('[storageService] Storage upload error:', error.message);
        throw error;
      }

      // Step 3: Get public CDN URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKETS.COVERS)
        .getPublicUrl(data.path || filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('[storageService] Upload failed:', err);
      // Fallback: If upload fails, if input is string return string or create object URL
      if (typeof imageInput === 'string') return imageInput;
      return URL.createObjectURL(webpFile);
    }
  }
};

export default storageService;
