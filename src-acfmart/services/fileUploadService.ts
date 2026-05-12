/**
 * File Upload Service for Google Forms Integration
 * Handles file validation, compression, and upload preparation
 */

export interface FileValidationRule {
  maxSize: number; // in bytes
  allowedTypes: string[];
  required?: boolean;
  minWidth?: number; // for images
  minHeight?: number; // for images
  maxAspectRatio?: number; // for images
  minAspectRatio?: number; // for images
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    dimensions?: { width: number; height: number };
  };
}

export interface FileUploadConfig {
  rules: Record<string, FileValidationRule>;
  compressionSettings?: {
    imageQuality: number; // 0.1 to 1.0
    maxWidth: number;
    maxHeight: number;
    enableCompression: boolean;
  };
}

/**
 * File Upload Service Class
 */
export class FileUploadService {
  private config: FileUploadConfig;

  constructor(config: FileUploadConfig) {
    this.config = config;
  }

  /**
   * Validate single file against rules
   */
  async validateFile(file: File, fieldName: string): Promise<FileValidationResult> {
    const rule = this.config.rules[fieldName];
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rule) {
      return {
        isValid: true,
        errors: [],
        warnings: ['No validation rules found for field: ' + fieldName]
      };
    }

    // Check file size
    if (file.size > rule.maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum size of ${(rule.maxSize / 1024 / 1024).toFixed(2)}MB`);
    }

    // Check file type
    if (!rule.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${rule.allowedTypes.join(', ')}`);
    }

    // Check image dimensions if it's an image
    if (file.type.startsWith('image/') && (rule.minWidth || rule.minHeight)) {
      try {
        const dimensions = await this.getImageDimensions(file);
        
        if (rule.minWidth && dimensions.width < rule.minWidth) {
          errors.push(`Image width ${dimensions.width}px is less than minimum ${rule.minWidth}px`);
        }

        if (rule.minHeight && dimensions.height < rule.minHeight) {
          errors.push(`Image height ${dimensions.height}px is less than minimum ${rule.minHeight}px`);
        }

        if (rule.maxAspectRatio || rule.minAspectRatio) {
          const aspectRatio = dimensions.width / dimensions.height;
          
          if (rule.maxAspectRatio && aspectRatio > rule.maxAspectRatio) {
            errors.push(`Image aspect ratio ${aspectRatio.toFixed(2)} exceeds maximum ${rule.maxAspectRatio}`);
          }

          if (rule.minAspectRatio && aspectRatio < rule.minAspectRatio) {
            errors.push(`Image aspect ratio ${aspectRatio.toFixed(2)} is less than minimum ${rule.minAspectRatio}`);
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type,
            dimensions
          }
        };
      } catch (error) {
        errors.push(`Failed to read image dimensions: ${error.message}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };
  }

  /**
   * Validate multiple files
   */
  async validateFiles(files: Record<string, File>): Promise<Record<string, FileValidationResult>> {
    const results: Record<string, FileValidationResult> = {};

    for (const [fieldName, file] of Object.entries(files)) {
      results[fieldName] = await this.validateFile(file, fieldName);
    }

    return results;
  }

  /**
   * Compress image if needed
   */
  async compressImage(file: File): Promise<File> {
    if (!this.config.compressionSettings?.enableCompression || !file.type.startsWith('image/')) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { maxWidth, maxHeight, imageQuality } = this.config.compressionSettings!;

        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          imageQuality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Process files (validate and compress)
   */
  async processFiles(files: Record<string, File>): Promise<{
    processedFiles: Record<string, File>;
    validationResults: Record<string, FileValidationResult>;
    hasErrors: boolean;
  }> {
    const processedFiles: Record<string, File> = {};
    const validationResults: Record<string, FileValidationResult> = {};
    let hasErrors = false;

    for (const [fieldName, file] of Object.entries(files)) {
      // Validate file
      const validationResult = await this.validateFile(file, fieldName);
      validationResults[fieldName] = validationResult;

      if (!validationResult.isValid) {
        hasErrors = true;
        continue;
      }

      // Compress image if needed
      let processedFile = file;
      if (file.type.startsWith('image/') && this.config.compressionSettings?.enableCompression) {
        try {
          processedFile = await this.compressImage(file);
        } catch (error) {
          console.warn(`Failed to compress ${file.name}:`, error);
          // Use original file if compression fails
        }
      }

      processedFiles[fieldName] = processedFile;
    }

    return {
      processedFiles,
      validationResults,
      hasErrors
    };
  }

  /**
   * Get image dimensions
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type category
   */
  getFileTypeCategory(mimeType: string): 'image' | 'document' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  }

  /**
   * Generate preview URL for file
   */
  generatePreviewUrl(file: File): string {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return '';
  }

  /**
   * Clean up preview URLs
   */
  cleanupPreviewUrls(urls: string[]): void {
    urls.forEach(url => URL.revokeObjectURL(url));
  }
}

/**
 * Default validation rules for seller registration files
 */
export const SELLER_REGISTRATION_FILE_RULES: Record<string, FileValidationRule> = {
  // ACF Form (PDF required)
  acfFormFile: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf'],
    required: true
  },

  // VNeID Screenshot (Image)
  vneidScreenshot: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    required: true,
    minWidth: 400,
    minHeight: 300
  },

  // ID Card (Image or PDF)
  idCardFile: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    required: true,
    minWidth: 300,
    minHeight: 200
  },

  // Business License (Image or PDF)
  businessLicense: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    required: true,
    minWidth: 300,
    minHeight: 200
  },

  // Distribution Contract (Optional, Image or PDF)
  distributionContract: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    required: false
  },

  // Quality Certificate (Optional, Image or PDF)
  qualityCertificate: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    required: false
  },

  // Shop Logo (Image)
  shopLogo: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    required: false,
    minWidth: 100,
    minHeight: 100,
    maxAspectRatio: 2, // Maximum 2:1 ratio
    minAspectRatio: 0.5 // Minimum 1:2 ratio
  }
};

/**
 * Default compression settings
 */
export const DEFAULT_COMPRESSION_SETTINGS = {
  imageQuality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
  enableCompression: true
};

/**
 * Default configuration for seller registration
 */
export const DEFAULT_SELLER_FILE_UPLOAD_CONFIG: FileUploadConfig = {
  rules: SELLER_REGISTRATION_FILE_RULES,
  compressionSettings: DEFAULT_COMPRESSION_SETTINGS
};

/**
 * Singleton instance for seller registration
 */
export const sellerFileUploadService = new FileUploadService(DEFAULT_SELLER_FILE_UPLOAD_CONFIG);
