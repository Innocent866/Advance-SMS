import { useState } from 'react';
import { toast } from 'react-hot-toast';

/**
 * useFileDownload
 * 
 * Universal hook for securely downloading files.
 * First tries the backend proxy (which enforces auth).
 * Falls back to direct link download for external/cloud URLs.
 * 
 * Usage:
 *   const { download, downloading } = useFileDownload();
 *   <button onClick={() => download(fileUrl, 'document.pdf')}>Download</button>
 */
const useFileDownload = () => {
    const [downloading, setDownloading] = useState(false);

    const download = async (fileUrl, filename = 'document') => {
        if (!fileUrl) {
            toast.error('No file URL provided');
            return;
        }

        setDownloading(true);
        try {
            const token = localStorage.getItem('token');
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

            const response = await fetch(
                `${apiBase}/files/download?url=${encodeURIComponent(fileUrl)}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (!response.ok) throw new Error(`Server responded ${response.status}`);

            const blob = await response.blob();

            // Auto-add extension from Content-Type if filename lacks one
            const contentType = response.headers.get('Content-Type') || '';
            let outputFilename = filename;
            if (!outputFilename.includes('.')) {
                if (contentType.includes('pdf')) outputFilename += '.pdf';
                else if (contentType.includes('word') || contentType.includes('openxml')) outputFilename += '.docx';
            }

            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = outputFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);

            toast.success('Download started!');
        } catch (err) {
            // Fallback: direct browser download (works for Cloudinary, Google Drive, etc.)
            console.warn('Proxy download failed, falling back to direct link:', err.message);
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = filename;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Download started!');
        } finally {
            setDownloading(false);
        }
    };

    return { download, downloading };
};

export default useFileDownload;
