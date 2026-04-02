import api from './api';

const fileService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteFile: async (fileUrl) => {
    const response = await api.delete('/files', {
      data: { url: fileUrl },
    });
    return response.data;
  },

  getDownloadUrl: (url, filename) => {
    if (!url) return '';
    try {
      // If it's a Cloudinary URL, we can force attachment by adding fl_attachment
      if (url.includes('cloudinary.com')) {
        const parts = url.split('/upload/');
        if (parts.length === 2) {
          // Cloudinary specific transformation for attachment
          const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          return `${parts[0]}/upload/fl_attachment:${safeName}/${parts[1]}`;
        }
      }
      return url;
    } catch (e) {
      console.error('Error processing download URL:', e);
      return url;
    }
  }
};

export default fileService;
