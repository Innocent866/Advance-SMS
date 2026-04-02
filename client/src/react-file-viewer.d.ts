declare module 'react-file-viewer' {
    import * as React from 'react';
    
    export interface FileViewerProps {
        fileType: string;
        filePath: string;
        onError?: (e: any) => void;
        errorComponent?: React.ReactNode;
        unsupportedComponent?: React.ReactNode;
    }
    
    const FileViewer: React.FC<FileViewerProps>;
    export default FileViewer;
}
