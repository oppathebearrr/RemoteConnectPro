import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  Folder, 
  File, 
  RefreshCw,
  Search,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Demo file structure for the file transfer panel
const demoFiles = [
  { id: 1, name: 'Documents', type: 'folder', size: '-', modified: '2025-03-12 14:23' },
  { id: 2, name: 'Downloads', type: 'folder', size: '-', modified: '2025-03-14 09:17' },
  { id: 3, name: 'Pictures', type: 'folder', size: '-', modified: '2025-03-10 11:45' },
  { id: 4, name: 'project_report.docx', type: 'file', size: '2.3 MB', modified: '2025-03-14 16:02' },
  { id: 5, name: 'presentation.pptx', type: 'file', size: '4.7 MB', modified: '2025-03-13 10:34' },
  { id: 6, name: 'budget_2025.xlsx', type: 'file', size: '1.2 MB', modified: '2025-03-15 08:45' },
  { id: 7, name: 'screenshot.png', type: 'file', size: '850 KB', modified: '2025-03-14 15:22' },
  { id: 8, name: 'notes.txt', type: 'file', size: '12 KB', modified: '2025-03-14 17:30' },
];

interface FileTransferPanelProps {
  isVisible: boolean;
  onClose: () => void;
  sessionId: string;
}

const FileTransferPanel: React.FC<FileTransferPanelProps> = ({
  isVisible,
  onClose,
  sessionId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [showTransferInfo, setShowTransferInfo] = useState(false);

  // For demo purposes only - filter files based on search term
  const filteredFiles = demoFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (id: number) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter(fileId => fileId !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
    }
  };

  const handleUpload = () => {
    // Demo upload function
    setIsUploading(true);
    setShowTransferInfo(true);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setTransferProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setTimeout(() => {
          setShowTransferInfo(false);
          setTransferProgress(0);
        }, 1500);
      }
    }, 500);
  };

  const handleDownload = () => {
    if (selectedFiles.length === 0) return;

    // Demo download function
    setIsDownloading(true);
    setShowTransferInfo(true);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      setTransferProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsDownloading(false);
        setTimeout(() => {
          setShowTransferInfo(false);
          setTransferProgress(0);
          setSelectedFiles([]);
        }, 1500);
      }
    }, 400);
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-xl flex flex-col z-30 border-l">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium text-lg">File Transfer</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            disabled={isUploading || isDownloading}
            onClick={handleUpload}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            disabled={selectedFiles.length === 0 || isUploading || isDownloading}
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search files..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center p-3 bg-gray-50 border-b">
        <Button variant="ghost" size="sm" className="px-2">
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        <Separator orientation="vertical" className="mx-2 h-5" />
        <div className="text-sm text-gray-600 truncate flex-1">
          <span className="font-mono">{currentPath}</span>
        </div>
      </div>
      
      {showTransferInfo && (
        <div className="p-3 bg-blue-50 border-b">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">
              {isUploading ? 'Uploading...' : 'Downloading...'}
            </span>
            <span className="text-sm">{transferProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${transferProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1">
        <div className="p-1">
          {filteredFiles.map((file) => (
            <div 
              key={file.id}
              className={`flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer ${
                selectedFiles.includes(file.id) ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleFileSelect(file.id)}
            >
              {file.type === 'folder' ? (
                <Folder className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
              ) : (
                <File className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="text-sm font-medium truncate">{file.name}</span>
                  {file.type === 'folder' && (
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                  )}
                </div>
                <div className="flex text-xs text-gray-500">
                  <span className="mr-2">{file.size}</span>
                  <span>{file.modified}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedFiles.length > 0 ? (
              <span>{selectedFiles.length} items selected</span>
            ) : (
              <span>{filteredFiles.length} items</span>
            )}
          </div>
          
          <Badge variant="outline" className="text-xs">
            Demo Mode
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default FileTransferPanel;