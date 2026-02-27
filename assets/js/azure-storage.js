/* ========================================
   SAGAR BAGS - Azure Blob Storage Helper
   ======================================== */

const AzureStorage = {
  accountName: 'sagarbags',
  containerName: 'product-images',

  // Get the base URL for the container
  getBaseUrl() {
    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}`;
  },

  // Generate a unique filename
  generateFileName(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop().toLowerCase();
    return `${timestamp}_${random}.${extension}`;
  },

  // Upload image to Azure Blob Storage
  async uploadImage(file, sasToken) {
    try {
      const fileName = this.generateFileName(file.name);

      // Remove leading ? if present in sasToken
      const cleanToken = sasToken.startsWith('?') ? sasToken.substring(1) : sasToken;
      const blobUrl = `${this.getBaseUrl()}/${fileName}?${cleanToken}`;

      console.log('Uploading to:', blobUrl.split('?')[0]);

      const response = await fetch(blobUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'x-ms-version': '2022-11-02',
          'Content-Type': file.type || 'image/jpeg'
        },
        body: file
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Azure error response:', errorText);
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // Return the public URL (without SAS token)
      const publicUrl = `${this.getBaseUrl()}/${fileName}`;
      console.log('Image uploaded:', publicUrl);
      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload multiple images
  async uploadImages(files, sasToken) {
    const results = [];
    for (const file of files) {
      const result = await this.uploadImage(file, sasToken);
      results.push(result);
    }
    return results;
  },

  // Delete image from Azure Blob Storage
  async deleteImage(imageUrl, sasToken) {
    try {
      const blobUrl = `${imageUrl}?${sasToken}`;
      const response = await fetch(blobUrl, {
        method: 'DELETE',
        headers: {
          'x-ms-delete-snapshots': 'include'
        }
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  },

  // Validate image file
  validateImage(file, maxSizeMB = 5) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = maxSizeMB * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: `File too large. Maximum size is ${maxSizeMB}MB.` };
    }

    return { valid: true };
  },

  // Compress image before upload (optional)
  async compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

console.log('Azure Storage helper initialized');
