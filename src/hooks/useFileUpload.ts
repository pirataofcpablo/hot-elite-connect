
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    setUploading(true);
    
    try {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'video/avi'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado');
      }

      // Validar tamanho (máximo 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Máximo 50MB');
      }

      // Simular upload - converter para base64 para armazenamento local
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Simular delay de upload
      await new Promise(resolve => setTimeout(resolve, 1000));

      return base64;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleFiles = async (files: FileList): Promise<string[]> => {
    const uploadPromises = Array.from(files).map(file => uploadFile(file));
    return Promise.all(uploadPromises);
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    uploading
  };
};
