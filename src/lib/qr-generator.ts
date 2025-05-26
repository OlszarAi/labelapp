/**
 * QR Code Generator
 * QR code generation utilities
 */

import QRCode from 'qrcode';

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  type?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number;
}

export const generateQRCode = async (text: string, options?: QRCodeOptions): Promise<string> => {
  const {
    errorCorrectionLevel = 'M',
    width = 256,
    height = 256,
    margin = 1,
    color = { dark: '#000000', light: '#FFFFFF' },
    type = 'image/png',
    quality = 0.92
  } = options || {};

  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel,
      width,
      margin,
      color
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const validateQRCodeText = (text: string): boolean => {
  if (!text || text.trim().length === 0) {
    return false;
  }

  // Check length limits based on QR code capacity
  if (text.length > 4296) { // Maximum for alphanumeric
    return false;
  }

  return true;
};

export const getQRCodeCapacity = (errorLevel: 'L' | 'M' | 'Q' | 'H' = 'M'): number => {
  const capacities = {
    'L': 4296, // Low
    'M': 3391, // Medium
    'Q': 2420, // Quartile
    'H': 1852  // High
  };
  
  return capacities[errorLevel];
};

export const estimateQRSize = (text: string): 'small' | 'medium' | 'large' => {
  const length = text.length;
  
  if (length <= 50) return 'small';
  if (length <= 200) return 'medium';
  return 'large';
};
