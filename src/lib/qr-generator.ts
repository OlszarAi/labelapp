/**
 * QR Code Generator
 * QR code generation utilities with advanced features
 */

import * as QRCode from 'qrcode';

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
  border?: {
    width?: number;
    color?: string;
    style?: 'solid' | 'dashed' | 'dotted';
  };
  logo?: {
    src?: string;
    width?: number;
    height?: number;
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  background?: {
    gradient?: {
      type?: 'linear' | 'radial';
      colors?: string[];
      direction?: string;
    };
    pattern?: 'dots' | 'lines' | 'grid';
  };
}

export interface QRCodeGenerationResult {
  dataUrl: string;
  blob?: Blob;
  canvas?: HTMLCanvasElement;
  metadata: {
    size: number;
    errorLevel: string;
    capacity: number;
    dataLength: number;
    timestamp: number;
  };
}

// Helper function to apply custom styling to QR code canvas
const applyCustomStyling = async (
  canvas: HTMLCanvasElement,
  styling: {
    border?: QRCodeOptions['border'];
    logo?: QRCodeOptions['logo'];
    background?: QRCodeOptions['background'];
  }
): Promise<void> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  const { border, logo, background } = styling;

  // Apply background effects
  if (background?.gradient) {
    applyGradientBackground(ctx, canvas, background.gradient);
  }

  // Apply border
  if (border) {
    applyBorder(ctx, canvas, border);
  }

  // Apply logo overlay
  if (logo?.src) {
    await applyLogoOverlay(ctx, canvas, logo);
  }
};

// Apply gradient background
const applyGradientBackground = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  gradient: NonNullable<QRCodeOptions['background']>['gradient']
): void => {
  if (!gradient) return;

  let grad: CanvasGradient;
  
  if (gradient.type === 'radial') {
    grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
  } else {
    grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  }

  if (gradient.colors) {
    gradient.colors.forEach((color, index) => {
      grad.addColorStop(index / (gradient.colors!.length - 1), color);
    });
  }

  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
};

// Apply border to canvas
const applyBorder = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  border: NonNullable<QRCodeOptions['border']>
): void => {
  const { width = 2, color = '#000000', style = 'solid' } = border;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  
  if (style === 'dashed') {
    ctx.setLineDash([5, 5]);
  } else if (style === 'dotted') {
    ctx.setLineDash([2, 2]);
  }
  
  ctx.strokeRect(width / 2, width / 2, canvas.width - width, canvas.height - width);
  ctx.setLineDash([]); // Reset line dash
};

// Apply logo overlay
const applyLogoOverlay = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  logo: NonNullable<QRCodeOptions['logo']>
): Promise<void> => {
  if (!logo.src) return;

  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = logo.src!;
  });

  const logoWidth = logo.width || 50;
  const logoHeight = logo.height || 50;
  
  let x = 0, y = 0;
  
  switch (logo.position) {
    case 'center':
      x = (canvas.width - logoWidth) / 2;
      y = (canvas.height - logoHeight) / 2;
      break;
    case 'top-left':
      x = 10;
      y = 10;
      break;
    case 'top-right':
      x = canvas.width - logoWidth - 10;
      y = 10;
      break;
    case 'bottom-left':
      x = 10;
      y = canvas.height - logoHeight - 10;
      break;
    case 'bottom-right':
      x = canvas.width - logoWidth - 10;
      y = canvas.height - logoHeight - 10;
      break;
    default:
      x = (canvas.width - logoWidth) / 2;
      y = (canvas.height - logoHeight) / 2;
  }

  // Create white background for logo visibility
  ctx.fillStyle = 'white';
  ctx.fillRect(x - 5, y - 5, logoWidth + 10, logoHeight + 10);
  
  ctx.drawImage(img, x, y, logoWidth, logoHeight);
};

export const generateQRCode = async (
  text: string, 
  options?: QRCodeOptions
): Promise<QRCodeGenerationResult> => {
  const {
    errorCorrectionLevel = 'M',
    width = 256,
    height = 256,
    margin = 1,
    color = { dark: '#000000', light: '#FFFFFF' },
    type = 'image/png',
    quality = 0.92,
    border,
    logo,
    background
  } = options || {};

  try {
    // Generate base QR code
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, text, {
      errorCorrectionLevel,
      width,
      margin,
      color
    });

    // Apply custom styling if specified
    if (border || logo || background) {
      await applyCustomStyling(canvas, { border, logo, background });
    }

    // Convert to data URL
    const dataUrl = canvas.toDataURL(type, quality);
    
    // Create blob for file operations
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), type, quality);
    });

    return {
      dataUrl,
      blob,
      canvas,
      metadata: {
        size: width,
        errorLevel: errorCorrectionLevel,
        capacity: getQRCodeCapacity(errorCorrectionLevel),
        dataLength: text.length,
        timestamp: Date.now()
      }
    };
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

// Additional utility functions for QR codes

export const getSizeRecommendation = (text: string, printDPI: number = 300): number => {
  const size = estimateQRSize(text);
  const baseSizes = {
    small: 128,
    medium: 256,
    large: 512
  };
  
  // Scale for print DPI (300 DPI is standard print resolution)
  const scaleFactor = printDPI / 72; // 72 DPI is screen resolution
  return Math.round(baseSizes[size] * scaleFactor);
};

export const validateQRCodeForPrint = (text: string, size: number, dpi: number): {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
} => {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Check size for print quality
  if (size < 100 && dpi >= 300) {
    warnings.push('QR code may be too small for high-quality printing');
    recommendations.push('Increase size to at least 100px for 300 DPI printing');
  }
  
  // Check text length
  if (text.length > 100) {
    warnings.push('Long text may create dense QR code that\'s hard to scan');
    recommendations.push('Consider using shorter text or URL shortener');
  }
  
  // Check for URLs
  if (text.startsWith('http')) {
    recommendations.push('Consider using HTTPS for secure connections');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations
  };
};

export const generateQRCodePresets = () => {
  return {
    web: {
      errorCorrectionLevel: 'M' as const,
      width: 256,
      color: { dark: '#000000', light: '#FFFFFF' }
    },
    print: {
      errorCorrectionLevel: 'H' as const,
      width: 600,
      color: { dark: '#000000', light: '#FFFFFF' }
    },
    mobile: {
      errorCorrectionLevel: 'L' as const,
      width: 128,
      color: { dark: '#000000', light: '#FFFFFF' }
    },
    business: {
      errorCorrectionLevel: 'Q' as const,
      width: 300,
      color: { dark: '#1a1a1a', light: '#ffffff' },
      border: { width: 2, color: '#333333', style: 'solid' as const }
    }
  };
};

export const detectQRCodeDataType = (text: string): 'url' | 'email' | 'phone' | 'wifi' | 'text' => {
  if (text.match(/^https?:\/\//)) return 'url';
  if (text.match(/^mailto:/)) return 'email';
  if (text.match(/^tel:/)) return 'phone';
  if (text.startsWith('WIFI:')) return 'wifi';
  if (text.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'email';
  if (text.match(/^[\+]?[1-9][\d]{3,14}$/)) return 'phone';
  return 'text';
};

export const createWiFiQRCode = (
  ssid: string, 
  password: string, 
  security: 'WEP' | 'WPA' | 'nopass' = 'WPA',
  hidden: boolean = false
): string => {
  return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
};

export const createVCardQRCode = (contact: {
  name: string;
  phone?: string;
  email?: string;
  organization?: string;
  url?: string;
}): string => {
  let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
  vcard += `FN:${contact.name}\n`;
  if (contact.phone) vcard += `TEL:${contact.phone}\n`;
  if (contact.email) vcard += `EMAIL:${contact.email}\n`;
  if (contact.organization) vcard += `ORG:${contact.organization}\n`;
  if (contact.url) vcard += `URL:${contact.url}\n`;
  vcard += 'END:VCARD';
  return vcard;
};
