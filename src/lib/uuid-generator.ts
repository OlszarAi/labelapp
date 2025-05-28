/**
 * UUID Generator
 * UUID generation utilities with advanced features
 */

export interface UUIDOptions {
  format?: 'v4' | 'short' | 'numbers' | 'custom' | 'uppercase' | 'lowercase' | 'alphanumeric';
  length?: 8 | 16 | 32 | 64;
  includeHyphens?: boolean;
  prefix?: string;
  suffix?: string;
  customCharset?: string;
  excludeSimilar?: boolean; // Exclude similar looking characters (0, O, 1, l, etc.)
}

export interface UUIDGenerationResult {
  uuid: string;
  metadata: {
    format: string;
    length: number;
    charset: string;
    timestamp: number;
    checksum?: string;
  };
}

// Helper function to generate checksum
const generateChecksum = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

export const generateUUID = (options?: UUIDOptions): UUIDGenerationResult => {
  const {
    format = 'v4',
    length = 8,
    includeHyphens = true,
    prefix = '',
    suffix = '',
    customCharset,
    excludeSimilar = false
  } = options || {};

  let uuid = '';
  let charset = '';
  
  // Define character sets
  const defaultCharsets = {
    alphanumeric: excludeSimilar ? '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: excludeSimilar ? '23456789' : '0123456789',
    hex: '0123456789ABCDEF'
  };
  
  switch (format) {
    case 'v4':
      // Generate standard UUID v4
      uuid = crypto.randomUUID();
      charset = 'UUID v4 standard';
      if (!includeHyphens) {
        uuid = uuid.replace(/-/g, '');
      }
      break;
      
    case 'short':
      // Generate short UUID (8 characters)
      charset = defaultCharsets.alphanumeric;
      uuid = Array.from({length: 8}, () => 
        charset[Math.floor(Math.random() * charset.length)]
      ).join('');
      break;
      
    case 'numbers':
      // Generate numeric UUID
      charset = defaultCharsets.numbers;
      uuid = Array.from({length: length}, () => 
        charset[Math.floor(Math.random() * charset.length)]
      ).join('');
      break;
      
    case 'custom':
    case 'alphanumeric':
      // Generate custom length alphanumeric
      charset = customCharset || defaultCharsets.alphanumeric;
      uuid = Array.from({length: length}, () => 
        charset[Math.floor(Math.random() * charset.length)]
      ).join('');
      
      if (includeHyphens && length > 4) {
        // Add hyphens every 4 characters
        uuid = uuid.replace(/(.{4})/g, '$1-').slice(0, -1);
      }
      break;
      
    case 'uppercase':
      charset = defaultCharsets.alphanumeric;
      uuid = Array.from({length: length}, () => 
        charset[Math.floor(Math.random() * charset.length)]
      ).join('').toUpperCase();
      break;
      
    case 'lowercase':
      charset = defaultCharsets.alphanumeric.toLowerCase();
      uuid = Array.from({length: length}, () => 
        charset[Math.floor(Math.random() * charset.length)]
      ).join('');
      break;
  }

  const finalUuid = `${prefix}${uuid}${suffix}`;
  
  return {
    uuid: finalUuid,
    metadata: {
      format,
      length: finalUuid.length,
      charset: charset,
      timestamp: Date.now(),
      checksum: generateChecksum(finalUuid)
    }
  };
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

export const getUUIDLength = (format: UUIDOptions['format'] = 'v4', customLength?: number): number => {
  switch (format) {
    case 'v4':
      return 36; // With hyphens
    case 'short':
      return 8;
    case 'numbers':
      return customLength || 6;
    case 'custom':
    case 'alphanumeric':
      return customLength || 8;
    case 'uppercase':
    case 'lowercase':
      return customLength || 8;
    default:
      return 8;
  }
};

// Additional utility functions for UUID generation

export const generateBatchUUIDs = (
  count: number, 
  options?: UUIDOptions
): UUIDGenerationResult[] => {
  const results: UUIDGenerationResult[] = [];
  const usedUuids = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let result: UUIDGenerationResult;
    let attempts = 0;
    
    // Ensure uniqueness within the batch
    do {
      result = generateUUID(options);
      attempts++;
    } while (usedUuids.has(result.uuid) && attempts < 100);
    
    if (attempts < 100) {
      usedUuids.add(result.uuid);
      results.push(result);
    }
  }
  
  return results;
};

export const createQRLinkedUUID = (
  uuidOptions?: UUIDOptions,
  baseUrl?: string
): { uuid: string; qrText: string; metadata: any } => {
  const result = generateUUID(uuidOptions);
  const qrText = baseUrl ? `${baseUrl}/${result.uuid}` : result.uuid;
  
  return {
    uuid: result.uuid,
    qrText,
    metadata: {
      ...result.metadata,
      isLinked: true,
      baseUrl: baseUrl || null
    }
  };
};

export const validateUUIDFormat = (
  uuid: string, 
  expectedFormat: UUIDOptions['format']
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!uuid || uuid.trim().length === 0) {
    errors.push('UUID cannot be empty');
    return { isValid: false, errors };
  }
  
  switch (expectedFormat) {
    case 'v4':
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidV4Regex.test(uuid)) {
        errors.push('Invalid UUID v4 format');
      }
      break;
      
    case 'numbers':
      if (!/^[0-9]+$/.test(uuid)) {
        errors.push('UUID should contain only numbers');
      }
      break;
      
    case 'alphanumeric':
    case 'custom':
      if (!/^[0-9a-zA-Z\-]+$/.test(uuid)) {
        errors.push('UUID should contain only alphanumeric characters and hyphens');
      }
      break;
  }
  
  return { isValid: errors.length === 0, errors };
};

export const getUUIDPresets = () => {
  return {
    short: {
      format: 'short' as const,
      length: 8,
      includeHyphens: false,
      excludeSimilar: true
    },
    tracking: {
      format: 'numbers' as const,
      length: 12,
      includeHyphens: false,
      prefix: 'TRK'
    },
    secure: {
      format: 'v4' as const,
      includeHyphens: true
    },
    display: {
      format: 'alphanumeric' as const,
      length: 16,
      includeHyphens: true,
      excludeSimilar: true
    },
    compact: {
      format: 'uppercase' as const,
      length: 6,
      includeHyphens: false,
      excludeSimilar: true
    }
  };
};

export const estimateUUIDComplexity = (options: UUIDOptions): {
  entropy: number;
  collisionProbability: number;
  recommendation: string;
} => {
  const { format = 'v4', length = 8, excludeSimilar = false, customCharset } = options;
  
  let charsetSize = 0;
  
  switch (format) {
    case 'v4':
      charsetSize = 16; // Hex characters
      break;
    case 'numbers':
      charsetSize = excludeSimilar ? 8 : 10; // 0-9 or 2-9
      break;
    case 'alphanumeric':
    case 'custom':
      if (customCharset) {
        charsetSize = customCharset.length;
      } else {
        charsetSize = excludeSimilar ? 30 : 36; // 0-9, A-Z
      }
      break;
    default:
      charsetSize = 36;
  }
  
  const effectiveLength = format === 'v4' ? 32 : length; // v4 has 32 hex chars
  const entropy = Math.log2(Math.pow(charsetSize, effectiveLength));
  const collisionProbability = 1 / Math.pow(charsetSize, effectiveLength);
  
  let recommendation = '';
  if (entropy < 40) {
    recommendation = 'Low entropy - consider longer length or larger charset';
  } else if (entropy < 80) {
    recommendation = 'Moderate entropy - suitable for most applications';
  } else {
    recommendation = 'High entropy - excellent for security-critical applications';
  }
  
  return { entropy, collisionProbability, recommendation };
};
