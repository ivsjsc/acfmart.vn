/**
 * Google Forms API Service for Seller Registration Integration
 * Handles form auto-fill, file uploads, and submission to Google Forms
 */

export interface GoogleFormField {
  id: string;
  title: string;
  type: 'TEXT' | 'PARAGRAPH_TEXT' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'DROP_DOWN' | 'FILE_UPLOAD';
  required: boolean;
  options?: string[];
}

export interface GoogleFormResponse {
  formId: string;
  responseId: string;
  timestamp: string;
  answers: Record<string, any>;
}

export interface FileUploadResult {
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
}

export interface GoogleFormsConfig {
  formId: string;
  apiKey: string;
  clientId?: string;
  redirectUri?: string;
  driveFolderId?: string;
}

/**
 * Google Forms API Service Class
 */
export class GoogleFormsService {
  private config: GoogleFormsConfig;
  private readonly BASE_URL = 'https://forms.googleapis.com/v1';
  private readonly DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

  constructor(config: GoogleFormsConfig) {
    this.config = config;
  }

  /**
   * Get form structure and fields
   */
  async getFormStructure(): Promise<GoogleFormField[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/forms/${this.config.formId}?access_token=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch form structure: ${response.statusText}`);
      }

      const formData = await response.json();
      return this.parseFormFields(formData);
    } catch (error) {
      console.error('Error fetching form structure:', error);
      throw error;
    }
  }

  /**
   * Upload file to Google Drive and return file info
   */
  async uploadFile(file: File, folderId?: string): Promise<FileUploadResult> {
    try {
      const metadata = {
        name: file.name,
        mimeType: file.type,
        parents: folderId ? [folderId] : undefined
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch(
        `${this.DRIVE_UPLOAD_URL}?uploadType=multipart&access_token=${this.config.apiKey}`,
        {
          method: 'POST',
          body: form
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      const fileData = await response.json();
      
      // Make file publicly accessible
      await this.makeFilePublic(fileData.id);

      return {
        fileId: fileData.id,
        fileName: fileData.name,
        mimeType: fileData.mimeType,
        size: fileData.size,
        downloadUrl: `https://drive.google.com/uc?id=${fileData.id}`
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Make uploaded file publicly accessible
   */
  private async makeFilePublic(fileId: string): Promise<void> {
    try {
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?access_token=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone'
          })
        }
      );
    } catch (error) {
      console.error('Error making file public:', error);
      // Don't throw here as the main upload succeeded
    }
  }

  /**
   * Submit form with auto-filled data and file attachments
   */
  async submitForm(
    formData: Record<string, any>,
    fileAttachments?: Record<string, File>
  ): Promise<GoogleFormResponse> {
    try {
      // Get form structure to validate field IDs
      const formFields = await this.getFormStructure();
      
      // Upload files if provided
      const uploadedFiles: Record<string, FileUploadResult> = {};
      if (fileAttachments) {
        for (const [fieldId, file] of Object.entries(fileAttachments)) {
          try {
            uploadedFiles[fieldId] = await this.uploadFile(file);
          } catch (error) {
            console.error(`Failed to upload file for field ${fieldId}:`, error);
            throw new Error(`Failed to upload ${file.name}: ${error.message}`);
          }
        }
      }

      // Prepare form answers
      const answers: Record<string, any> = {};
      
      for (const field of formFields) {
        const value = formData[field.id] || formData[this.sanitizeFieldName(field.title)];
        
        if (value !== undefined && value !== null) {
          if (field.type === 'FILE_UPLOAD' && uploadedFiles[field.id]) {
            answers[field.id] = {
              fileUploadFiles: [{
                fileId: uploadedFiles[field.id].fileId,
                mimeType: uploadedFiles[field.id].mimeType,
                fileName: uploadedFiles[field.id].fileName
              }]
            };
          } else {
            answers[field.id] = {
              textAnswers: {
                answers: [{
                  value: String(value)
                }]
              }
            };
          }
        }
      }

      // Submit the form
      const submissionData = {
        responses: answers
      };

      const response = await fetch(
        `${this.BASE_URL}/forms/${this.config.formId}/responses:submit?access_token=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submissionData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to submit form: ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const result = await response.json();
      
      return {
        formId: this.config.formId,
        responseId: result.responseId,
        timestamp: new Date().toISOString(),
        answers: result.answers || answers
      };
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  }

  /**
   * Get form responses (for admin use)
   */
  async getFormResponses(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/forms/${this.config.formId}/responses?access_token=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch form responses: ${response.statusText}`);
      }

      const data = await response.json();
      return data.responses || [];
    } catch (error) {
      console.error('Error fetching form responses:', error);
      throw error;
    }
  }

  /**
   * Parse form fields from Google Forms API response
   */
  private parseFormFields(formData: any): GoogleFormField[] {
    const fields: GoogleFormField[] = [];
    
    if (formData.items) {
      for (const item of formData.items) {
        const field: GoogleFormField = {
          id: item.itemId || item.questionItem?.question?.questionId,
          title: item.title || item.questionItem?.question?.title,
          type: this.mapFieldType(item.questionItem?.question?.type),
          required: item.questionItem?.question?.required || false
        };

        // Extract options for choice-based questions
        if (item.questionItem?.question?.choiceQuestion) {
          field.options = item.questionItem.question.choiceQuestion.options.map((opt: any) => opt.value);
        }

        fields.push(field);
      }
    }

    return fields;
  }

  /**
   * Map Google Forms field types to our enum
   */
  private mapFieldType(googleType: string): GoogleFormField['type'] {
    const typeMap: Record<string, GoogleFormField['type']> = {
      'SHORT_ANSWER': 'TEXT',
      'PARAGRAPH': 'PARAGRAPH_TEXT',
      'MULTIPLE_CHOICE': 'MULTIPLE_CHOICE',
      'CHECKBOX': 'CHECKBOX',
      'DROP_DOWN': 'DROP_DOWN',
      'FILE_UPLOAD': 'FILE_UPLOAD'
    };

    return typeMap[googleType] || 'TEXT';
  }

  /**
   * Sanitize field name for mapping
   */
  private sanitizeFieldName(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Validate form data against form requirements
   */
  validateFormData(formData: Record<string, any>, formFields: GoogleFormField[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const field of formFields) {
      if (field.required) {
        const value = formData[field.id] || formData[this.sanitizeFieldName(field.title)];
        
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push(`Field "${field.title}" is required`);
        }
      }

      // Validate file uploads
      if (field.type === 'FILE_UPLOAD') {
        const value = formData[field.id] || formData[this.sanitizeFieldName(field.title)];
        
        if (value && !(value instanceof File)) {
          errors.push(`Field "${field.title}" must be a file`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get OAuth2 URL for user authentication
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/forms.body',
      'https://www.googleapis.com/auth/drive.file'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.config.clientId || '',
      redirect_uri: this.config.redirectUri || window.location.origin,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId || '',
          client_secret: '', // This should be handled securely on backend
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri || window.location.origin
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await response.json();
      return tokenData.access_token;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }
}

/**
 * Default configuration for seller registration form
 */
export const SELLER_REGISTRATION_FORM_CONFIG: GoogleFormsConfig = {
  formId: process.env.REACT_APP_GOOGLE_FORM_ID || '1FAIpQLSfEkq0b9Ig_w53jXIjJnYcFk5oEZ8E6XUdhs8luEe0WAHOAUg',
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
  redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
  driveFolderId: process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID || '1_g7W1hSrk7Ybb5ETAsaojhvfiHumOT0PlOQ7a7HiIkYslQMon_QT8sm0Q09oTGw5NTgKwqFQ'
};

/**
 * Singleton instance for seller registration
 */
export const sellerFormService = new GoogleFormsService(SELLER_REGISTRATION_FORM_CONFIG);
