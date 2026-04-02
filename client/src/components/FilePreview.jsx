import React from 'react';

const FilePreview = ({ file }) => {
  if (!file || !file.url) return null;

  const mimeType = file.mimeType || "";

  if (mimeType.startsWith("image/")) {
    return <img src={file.url} style={{ width: "100%" }} alt={file.title} />;
  }

  if (mimeType === "application/pdf") {
    return (
      <a 
        href={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
      >
        View PDF
      </a>
    );
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return (
      <a 
        href={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
      >
        View Document
      </a>
    );
  }

  return (
    <a 
      href={file.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
    >
      Open File
    </a>
  );
};

export default FilePreview;
