/**
 * UUID Generator
 * UUID generation utilities
 */

export interface UUIDOptions {
  format?: 'full' | 'short' | 'numbers' | 'custom' | 'uppercase' | 'lowercase';
  length?: number;
  includeHyphens?: boolean;
  prefix?: string;
  suffix?: string;
}

export const generateUUID = (options?: UUIDOptions): string => {
  const {
    format = 'full',
    length = 8,
    includeHyphens = true,
    prefix = '',
    suffix = ''
  } = options || {};

  // Generate base UUID
  let uuid = '';
  
  switch (format) {
    case 'full':
      // Generate standard UUID v4
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      if (!includeHyphens) {
        uuid = uuid.replace(/-/g, '');
      }
      break;
    case 'short':
      // Generate short UUID (8 characters)
      uuid = Math.random().toString(36).substr(2, 8).toUpperCase();
      break;
    case 'numbers':
      // Generate numeric UUID
      uuid = Array.from({length: length}, () => Math.floor(Math.random() * 10)).join('');
      break;
    case 'custom':
      // Generate custom length alphanumeric
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      uuid = Array.from({length: length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      if (includeHyphens && length > 4) {
        // Add hyphens every 4 characters
        uuid = uuid.replace(/(.{4})/g, '$1-').slice(0, -1);
      }
      break;
    case 'uppercase':
      uuid = Math.random().toString(36).substr(2, length || 8).toUpperCase();
      break;
    case 'lowercase':
      uuid = Math.random().toString(36).substr(2, length || 8).toLowerCase();
      break;
  }

  return `${prefix}${uuid}${suffix}`;
};

export const formatUUID = (uuid: string, options?: UUIDOptions): string => {
  const { includeHyphens = true, prefix = '', suffix = '' } = options || {};
  
  let formatted = uuid;
  
  if (includeHyphens && !uuid.includes('-') && uuid.length >= 8) {
    // Add hyphens every 4 characters
    formatted = uuid.replace(/(.{4})/g, '$1-').slice(0, -1);
  } else if (!includeHyphens && uuid.includes('-')) {
    // Remove hyphens
    formatted = uuid.replace(/-/g, '');
  }
  
  return `${prefix}${formatted}${suffix}`;
};

export const validateUUID = (uuid: string): boolean => {
  if (!uuid || uuid.trim().length === 0) {
    return false;
  }

  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  // Check if it's a valid UUID v4
  if (uuidRegex.test(uuid)) {
    return true;
  }
  
  // Check if it's a custom format (alphanumeric)
  const customRegex = /^[0-9a-zA-Z\-]+$/;
  return customRegex.test(uuid);
};

export const getUUIDLength = (format: UUIDOptions['format'] = 'full', customLength?: number): number => {
  switch (format) {
    case 'full':
      return 36; // With hyphens
    case 'short':
      return 8;
    case 'numbers':
      return customLength || 6;
    case 'custom':
      return customLength || 8;
    case 'uppercase':
    case 'lowercase':
      return customLength || 8;
    default:
      return 8;
  }
};
