/**
 * Form Auto-Fill Service for Google Forms Integration
 * Handles mapping seller registration data to Google Forms fields
 */

import { GoogleFormsService, GoogleFormField } from './googleFormsService';
import { SellerApplication } from '../types/sellerTypes';

export interface FormFieldMapping {
  formFieldId: string;
  formFieldTitle: string;
  sourceField: keyof SellerApplication | string;
  transform?: (value: any) => any;
  required: boolean;
}

export interface AutoFillConfig {
  formId: string;
  mappings: FormFieldMapping[];
  fileUploadMappings: Record<string, string>; // formFieldId -> sourceField
}

/**
 * Auto-Fill Service Class
 */
export class FormAutoFillService {
  private googleFormsService: GoogleFormsService;
  private config: AutoFillConfig;

  constructor(googleFormsService: GoogleFormsService, config: AutoFillConfig) {
    this.googleFormsService = googleFormsService;
    this.config = config;
  }

  /**
   * Map seller application data to Google Forms format
   */
  async mapFormData(applicationData: SellerApplication): Promise<Record<string, any>> {
    try {
      // Get form structure to validate mappings
      const formFields = await this.googleFormsService.getFormStructure();
      
      const mappedData: Record<string, any> = {};
      const errors: string[] = [];

      // Process each mapping
      for (const mapping of this.config.mappings) {
        try {
          const sourceValue = this.getSourceValue(applicationData, mapping.sourceField);
          const transformedValue = mapping.transform ? mapping.transform(sourceValue) : sourceValue;
          
          // Find the corresponding form field
          const formField = formFields.find(field => 
            field.id === mapping.formFieldId || 
            field.title === mapping.formFieldTitle
          );

          if (formField) {
            mappedData[formField.id] = transformedValue;
          } else {
            console.warn(`Form field not found: ${mapping.formFieldTitle} (${mapping.formFieldId})`);
          }
        } catch (error) {
          errors.push(`Error mapping field ${mapping.formFieldTitle}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        console.warn('Mapping warnings:', errors);
      }

      return mappedData;
    } catch (error) {
      console.error('Error mapping form data:', error);
      throw error;
    }
  }

  /**
   * Map file uploads to Google Forms format
   */
  mapFileUploads(applicationData: SellerApplication, files: Record<string, File>): Record<string, File> {
    const fileUploads: Record<string, File> = {};

    for (const [formFieldId, sourceField] of Object.entries(this.config.fileUploadMappings)) {
      const file = files[sourceField];
      if (file) {
        fileUploads[formFieldId] = file;
      }
    }

    return fileUploads;
  }

  /**
   * Get value from source object using dot notation
   */
  private getSourceValue(data: any, sourceField: string): any {
    if (sourceField.includes('.')) {
      return sourceField.split('.').reduce((obj, key) => obj?.[key], data);
    }
    return data[sourceField];
  }

  /**
   * Auto-fill and submit form
   */
  async autoFillAndSubmit(
    applicationData: SellerApplication,
    files: Record<string, File>
  ): Promise<any> {
    try {
      // Map form data
      const formData = await this.mapFormData(applicationData);
      
      // Map file uploads
      const fileUploads = this.mapFileUploads(applicationData, files);
      
      // Submit form
      const response = await this.googleFormsService.submitForm(formData, fileUploads);
      
      return response;
    } catch (error) {
      console.error('Error in auto-fill and submit:', error);
      throw error;
    }
  }

  /**
   * Validate mapped data against form requirements
   */
  async validateMappedData(applicationData: SellerApplication): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const formFields = await this.googleFormsService.getFormStructure();
      const mappedData = await this.mapFormData(applicationData);
      
      return this.googleFormsService.validateFormData(mappedData, formFields);
    } catch (error) {
      console.error('Error validating mapped data:', error);
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`]
      };
    }
  }

  /**
   * Get field mappings for preview
   */
  getFieldMappings(): FormFieldMapping[] {
    return this.config.mappings;
  }

  /**
   * Update field mapping
   */
  updateMapping(formFieldId: string, newMapping: Partial<FormFieldMapping>): void {
    const mappingIndex = this.config.mappings.findIndex(m => m.formFieldId === formFieldId);
    if (mappingIndex !== -1) {
      this.config.mappings[mappingIndex] = {
        ...this.config.mappings[mappingIndex],
        ...newMapping
      };
    }
  }

  /**
   * Add new field mapping
   */
  addMapping(mapping: FormFieldMapping): void {
    this.config.mappings.push(mapping);
  }

  /**
   * Remove field mapping
   */
  removeMapping(formFieldId: string): void {
    this.config.mappings = this.config.mappings.filter(m => m.formFieldId !== formFieldId);
  }
}

/**
 * Default field mappings for seller registration
 */
export const DEFAULT_SELLER_REGISTRATION_MAPPINGS: FormFieldMapping[] = [
  // Personal Information
  {
    formFieldId: 'personal_full_name',
    formFieldTitle: 'Họ và tên đầy đủ',
    sourceField: 'fullName',
    required: true
  },
  {
    formFieldId: 'personal_email',
    formFieldTitle: 'Email',
    sourceField: 'email',
    required: true
  },
  {
    formFieldId: 'personal_phone',
    formFieldTitle: 'Số điện thoại',
    sourceField: 'phone',
    required: true
  },
  {
    formFieldId: 'personal_address',
    formFieldTitle: 'Địa chỉ thường trú',
    sourceField: 'address',
    required: true
  },

  // Shop Information
  {
    formFieldId: 'shop_name',
    formFieldTitle: 'Tên cửa hàng',
    sourceField: 'shopName',
    required: true
  },
  {
    formFieldId: 'shop_description',
    formFieldTitle: 'Mô tả cửa hàng',
    sourceField: 'shopDescription',
    required: true
  },
  {
    formFieldId: 'shop_category',
    formFieldTitle: 'Danh mục kinh doanh chính',
    sourceField: 'shopCategory',
    required: true
  },

  // Business Information
  {
    formFieldId: 'tax_code',
    formFieldTitle: 'Mã số thuế',
    sourceField: 'taxCode',
    required: false
  },
  {
    formFieldId: 'bank_name',
    formFieldTitle: 'Tên ngân hàng',
    sourceField: 'bankName',
    required: true
  },
  {
    formFieldId: 'bank_account',
    formFieldTitle: 'Số tài khoản ngân hàng',
    sourceField: 'bankAccount',
    required: true
  },

  // Application Information
  {
    formFieldId: 'application_id',
    formFieldTitle: 'Mã hồ sơ',
    sourceField: 'applicationId',
    required: false
  },
  {
    formFieldId: 'submission_date',
    formFieldTitle: 'Ngày nộp hồ sơ',
    sourceField: 'submittedAt',
    transform: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    required: false
  },
  {
    formFieldId: 'google_email',
    formFieldTitle: 'Tài khoản Google',
    sourceField: 'googleEmail',
    required: true
  }
];

/**
 * Default file upload mappings for seller registration
 */
export const DEFAULT_SELLER_FILE_UPLOAD_MAPPINGS: Record<string, string> = {
  'file_acf_form': 'acfFormFile',
  'file_vneid_screenshot': 'vneidScreenshot',
  'file_id_card': 'idCardFile',
  'file_business_license': 'businessLicense',
  'file_distribution_contract': 'distributionContract',
  'file_quality_certificate': 'qualityCertificate',
  'file_shop_logo': 'shopLogo'
};

/**
 * Default auto-fill configuration for seller registration
 */
export const DEFAULT_SELLER_AUTOFILL_CONFIG: AutoFillConfig = {
  formId: process.env.REACT_APP_GOOGLE_FORM_ID || '',
  mappings: DEFAULT_SELLER_REGISTRATION_MAPPINGS,
  fileUploadMappings: DEFAULT_SELLER_FILE_UPLOAD_MAPPINGS
};

/**
 * Utility functions for common transformations
 */
export const FormTransformers = {
  /**
   * Format date for Vietnamese locale
   */
  formatDate: (value: string | Date): string => {
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  /**
   * Format phone number
   */
  formatPhone: (value: string): string => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as Vietnamese phone number
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    
    return value;
  },

  /**
   * Format tax code
   */
  formatTaxCode: (value: string): string => {
    // Remove spaces and dashes
    return value.replace(/[\s-]/g, '').toUpperCase();
  },

  /**
   * Format bank account
   */
  formatBankAccount: (value: string): string => {
    // Remove spaces
    return value.replace(/\s/g, '');
  },

  /**
   * Truncate text to max length
   */
  truncate: (maxLength: number) => (value: string): string => {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength - 3) + '...';
  },

  /**
   * Convert boolean to Yes/No
   */
  booleanToYesNo: (value: boolean): string => {
    return value ? 'Có' : 'Không';
  },

  /**
   * Join array with separator
   */
  joinArray: (separator: string = ', ') => (value: any[]): string => {
    return Array.isArray(value) ? value.join(separator) : String(value);
  }
};
