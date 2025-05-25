
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image, Video } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFilesUploaded: (urls: string[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  uploadedFiles?: string[];
  onRemoveFile?: (index: number) => void;
  type: 'thumbnail' | 'media';
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  accept = "image/*,video/*",
  multiple = false,
  maxFiles = 10,
  uploadedFiles = [],
  onRemoveFile,
  type
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMultipleFiles, uploading } = useFileUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const urls = await uploadMultipleFiles(files);
      onFilesUploaded(urls);
      
      toast({
        title: "Upload concluído!",
        description: `${files.length} arquivo(s) enviado(s) com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getFileType = (url: string) => {
    if (url.startsWith('data:video/')) return 'video';
    return 'image';
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button 
        type="button"
        onClick={triggerFileSelect}
        disabled={uploading || (multiple && uploadedFiles.length >= maxFiles)}
        className="w-full btn-secondary"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? 'Enviando...' : 
         type === 'thumbnail' ? 'Escolher Thumbnail' : 
         'Adicionar Foto/Vídeo'}
      </Button>

      {uploadedFiles.length > 0 && (
        <div className={`grid gap-2 ${type === 'thumbnail' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
          {uploadedFiles.map((url, index) => (
            <div key={index} className="relative group">
              {getFileType(url) === 'video' ? (
                <div className="relative w-full h-24 bg-hotelite-gray rounded border border-gray-700 flex items-center justify-center">
                  <Video className="h-8 w-8 text-gray-400" />
                  <video 
                    src={url} 
                    className="absolute inset-0 w-full h-full object-cover rounded opacity-50"
                    muted
                  />
                </div>
              ) : (
                <div className="relative w-full h-24">
                  <img 
                    src={url} 
                    alt={`Upload ${index + 1}`} 
                    className="w-full h-full object-cover rounded border border-gray-700"
                  />
                </div>
              )}
              
              {onRemoveFile && (
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {multiple && (
        <p className="text-sm text-gray-400">
          {uploadedFiles.length}/{maxFiles} arquivos enviados
        </p>
      )}
    </div>
  );
};

export default FileUpload;
