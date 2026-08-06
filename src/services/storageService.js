import { supabase } from '../lib/supabase';
import { BUCKETS } from '../config/constants';
import { compressImageToWebP } from '../utils/imageCompressor';

export const storageService = {
  async uploadCoverImage(imageInput, customFileName) {
    if (!imageInput) return '';

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
      webpFile = imageInput;
    }

    if (!supabase) {
      if (typeof imageInput === 'string') return imageInput;
      return URL.createObjectURL(webpFile);
    }

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

      const { data: publicUrlData } = supabase.storage
        .from(BUCKETS.COVERS)
        .getPublicUrl(data.path || filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('[storageService] Upload failed:', err);
      if (typeof imageInput === 'string') return imageInput;
      return URL.createObjectURL(webpFile);
    }
  }
};

export default storageService;
