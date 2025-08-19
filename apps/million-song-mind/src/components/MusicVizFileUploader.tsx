import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';

interface MusicVizFileUploaderProps {
  onFileUpload: (content: string, filename?: string) => void;
  onMultiFileUpload?: (files: { content: string; filename: string }[]) => void;
  isLoading?: boolean;
  compact?: boolean;
}

export const MusicVizFileUploader: React.FC<MusicVizFileUploaderProps> = ({
  onFileUpload,
  onMultiFileUpload,
  isLoading = false,
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (files.length === 1) {
      // Single file - use existing handler
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileUpload(content, file.name);
      };
      reader.readAsText(file);
    } else if (onMultiFileUpload) {
      // Multiple files - process all
      const filePromises = files.map(file => 
        new Promise<{ content: string; filename: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              content: e.target?.result as string,
              filename: file.name
            });
          };
          reader.readAsText(file);
        })
      );

      Promise.all(filePromises).then(onMultiFileUpload);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.tsv,.txt"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={handleButtonClick}
        disabled={isLoading}
        className={compact 
          ? "bg-primary hover:bg-primary/90 text-primary-foreground  text-xs tracking-wider px-3 py-1 h-6 rounded transition-all duration-300"
          : "bg-primary hover:bg-primary/90 text-primary-foreground  text-sm tracking-wider px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        }
      >
        <FolderOpen className={compact ? "w-3 h-3 mr-1" : "w-5 h-5 mr-3"} />
        {isLoading ? (compact ? 'LOADING...' : 'PROCESSING...') : (compact ? 'FILES' : 'SELECT FILES')}
      </Button>
    </div>
  );
};