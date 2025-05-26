/**
 * QR Code Tool Component
 * Advanced QR code creation with customization options
 */

import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { useElementCreation } from '../../../hooks/useElementCreation';
import { validateQRCodeText, estimateQRSize, getQRCodeCapacity } from '../../../lib/qr-generator';

interface QRCodeToolProps {
  canvas: fabric.Canvas | null;
  onQRCodeAdd?: (qrCode: fabric.Image) => void;
}

const QRCodeTool: React.FC<QRCodeToolProps> = ({ canvas, onQRCodeAdd }) => {
  const { createQRCode, state } = useElementCreation();
  
  // QR Code configuration
  const [qrText, setQrText] = useState('https://example.com');
  const [qrSize, setQrSize] = useState<'small' | 'medium' | 'large' | 'custom'>('medium');
  const [customSize, setCustomSize] = useState(120);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  
  // Styling options
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#FFFFFF');
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState(2);
  
  // Preview and validation
  const [isValidText, setIsValidText] = useState(true);
  const [textLength, setTextLength] = useState(0);
  const [capacity, setCapacity] = useState(0);

  // Update validation and preview when text changes
  useEffect(() => {
    const valid = validateQRCodeText(qrText);
    setIsValidText(valid);
    setTextLength(qrText.length);
    setCapacity(getQRCodeCapacity(errorLevel));
  }, [qrText, errorLevel]);

  const handleAddQRCode = async () => {
    if (!canvas || !isValidText) return;

    const finalSize = qrSize === 'custom' ? customSize : undefined;
    
    const qrCodeImage = await createQRCode(canvas, qrText, {
      size: qrSize !== 'custom' ? qrSize : 'medium',
      customSize: finalSize,
      errorCorrectionLevel: errorLevel,
      color: {
        dark: darkColor,
        light: lightColor
      },
      borderColor: borderEnabled ? borderColor : undefined,
      borderWidth: borderEnabled ? borderWidth : 0,
      margin: 1
    });

    if (qrCodeImage) {
      onQRCodeAdd?.(qrCodeImage);
    }
  };

  const presetTexts = [
    { label: 'Website URL', value: 'https://example.com', icon: '🌐' },
    { label: 'Email', value: 'mailto:info@example.com', icon: '📧' },
    { label: 'Phone', value: 'tel:+48123456789', icon: '📞' },
    { label: 'SMS', value: 'sms:+48123456789', icon: '💬' },
    { label: 'WiFi Network', value: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;', icon: '📶' },
    { label: 'Location', value: 'geo:52.2297,21.0122', icon: '📍' },
    { label: 'vCard Contact', value: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Company\nTEL:+48123456789\nEMAIL:john@example.com\nEND:VCARD', icon: '👤' }
  ];

  const sizeOptions = [
    { value: 'small' as const, label: 'Small (80px)', pixels: 80 },
    { value: 'medium' as const, label: 'Medium (120px)', pixels: 120 },
    { value: 'large' as const, label: 'Large (160px)', pixels: 160 },
    { value: 'custom' as const, label: 'Custom', pixels: customSize }
  ];

  const colorPresets = [
    { name: 'Black on White', dark: '#000000', light: '#FFFFFF' },
    { name: 'Blue on White', dark: '#1E40AF', light: '#FFFFFF' },
    { name: 'White on Black', dark: '#FFFFFF', light: '#000000' },
    { name: 'Green on Light', dark: '#059669', light: '#F0FDF4' },
    { name: 'Red on Light', dark: '#DC2626', light: '#FEF2F2' }
  ];

  return (
    <div className="qrcode-tool bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 dark:text-blue-400 text-sm">📱</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          QR Code Generator
        </h3>
      </div>

      {/* Error display */}
      {state.error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        </div>
      )}

      {/* Quick templates */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quick Templates
        </label>
        <div className="grid grid-cols-2 gap-2">
          {presetTexts.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setQrText(preset.value)}
              className="flex items-center gap-2 p-2 text-left text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              <span>{preset.icon}</span>
              <span className="text-gray-700 dark:text-gray-300">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          QR Code Content
        </label>
        <textarea
          value={qrText}
          onChange={(e) => setQrText(e.target.value)}
          placeholder="Enter URL, text, or data for QR code..."
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            !isValidText ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          rows={3}
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs ${!isValidText ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {!isValidText ? 'Invalid QR code data' : `${textLength}/${capacity} characters`}
          </span>
          {!isValidText && (
            <span className="text-xs text-red-500">⚠️ Content too long or invalid</span>
          )}
        </div>
      </div>

      {/* Size options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          QR Code Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sizeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setQrSize(option.value)}
              className={`p-2 text-sm rounded-md border transition-colors ${
                qrSize === option.value
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {qrSize === 'custom' && (
          <div className="mt-2">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Custom Size (pixels)
            </label>
            <input
              type="range"
              min={50}
              max={300}
              value={customSize}
              onChange={(e) => setCustomSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>50px</span>
              <span className="font-medium">{customSize}px</span>
              <span>300px</span>
            </div>
          </div>
        )}
      </div>

      {/* Error correction level */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Error Correction Level
        </label>
        <div className="grid grid-cols-4 gap-1">
          {[
            { value: 'L' as const, label: 'L (~7%)', desc: 'Low' },
            { value: 'M' as const, label: 'M (~15%)', desc: 'Medium' },
            { value: 'Q' as const, label: 'Q (~25%)', desc: 'Quartile' },
            { value: 'H' as const, label: 'H (~30%)', desc: 'High' }
          ].map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setErrorLevel(level.value)}
              className={`p-2 text-xs rounded-md border transition-colors ${
                errorLevel === level.value
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
              }`}
              title={level.desc}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color customization */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Colors
        </label>
        
        {/* Color presets */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Color Presets
          </label>
          <div className="flex gap-1 flex-wrap">
            {colorPresets.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setDarkColor(preset.dark);
                  setLightColor(preset.light);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                title={preset.name}
              >
                <div 
                  className="w-3 h-3 rounded border"
                  style={{ backgroundColor: preset.dark }}
                />
                <div 
                  className="w-3 h-3 rounded border"
                  style={{ backgroundColor: preset.light }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Dark Color (Foreground)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={darkColor}
                onChange={(e) => setDarkColor(e.target.value)}
                className="w-10 h-8 rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={darkColor}
                onChange={(e) => setDarkColor(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Light Color (Background)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={lightColor}
                onChange={(e) => setLightColor(e.target.value)}
                className="w-10 h-8 rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={lightColor}
                onChange={(e) => setLightColor(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Border options */}
      <div className="mb-4">
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={borderEnabled}
            onChange={(e) => setBorderEnabled(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Add Border
          </span>
        </label>

        {borderEnabled && (
          <div className="ml-6 space-y-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Border Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-10 h-8 rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Border Width: {borderWidth}px
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={borderWidth}
                onChange={(e) => setBorderWidth(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={handleAddQRCode}
        disabled={!qrText.trim() || !isValidText || state.isCreating}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {state.isCreating ? 'Generating...' : 'Add QR Code'}
      </button>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 Tip: The QR code will contain exactly the text you enter above.
          Verify accuracy before adding to your label.
        </p>
      </div>
    </div>
  );
};

export default QRCodeTool;
