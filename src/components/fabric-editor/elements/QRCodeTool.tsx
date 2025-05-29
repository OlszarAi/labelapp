// QR Code element creation tool for the left sidebar

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { QrCode, Plus, RotateCcw, Palette, RefreshCw, Eye, EyeOff } from 'lucide-react';
import QRCode from 'qrcode';
import { 
  useElementCreation, 
  QRCodeElementProperties, 
  DEFAULT_QRCODE_PROPERTIES,
  QRCODE_TEMPLATES 
} from '@/hooks/fabric/useElementCreation';

interface QRCodeToolProps {
  canvas: fabric.Canvas | null;
  onElementCreated?: (element: fabric.Image) => void;
}

const QR_SIZES = [50, 75, 100, 125, 150, 200, 250, 300];
const ERROR_LEVELS = [
  { value: 'L', label: 'Low (~7%)', description: 'Suitable for clean environments' },
  { value: 'M', label: 'Medium (~15%)', description: 'Default choice' },
  { value: 'Q', label: 'Quartile (~25%)', description: 'Good for outdoor use' },
  { value: 'H', label: 'High (~30%)', description: 'Maximum error correction' },
] as const;

export function QRCodeTool({ canvas, onElementCreated }: QRCodeToolProps) {
  const { createQRCodeElement } = useElementCreation();
  const [properties, setProperties] = useState<QRCodeElementProperties>(DEFAULT_QRCODE_PROPERTIES);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [showColorPickers, setShowColorPickers] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Update property
  const updateProperty = useCallback((key: keyof QRCodeElementProperties, value: any) => {
    setProperties(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Generate preview QR code
  const generatePreview = useCallback(async () => {
    try {
      if (!properties.value.trim()) {
        setPreviewDataUrl('');
        return;
      }

      const dataUrl = await QRCode.toDataURL(properties.value, {
        width: Math.min(properties.size, 200), // Limit preview size
        margin: 1,
        color: {
          dark: properties.foregroundColor,
          light: properties.backgroundColor,
        },
        errorCorrectionLevel: properties.errorCorrectionLevel,
      });
      setPreviewDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code preview:', error);
      setPreviewDataUrl('');
    }
  }, [properties]);

  // Update preview when properties change
  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  // Apply template
  const applyTemplate = useCallback((template: { name: string; value: string }) => {
    updateProperty('value', template.value);
  }, [updateProperty]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setProperties(DEFAULT_QRCODE_PROPERTIES);
  }, []);

  // Toggle colors (invert foreground/background)
  const toggleColors = useCallback(() => {
    setProperties(prev => ({
      ...prev,
      foregroundColor: prev.backgroundColor,
      backgroundColor: prev.foregroundColor,
    }));
  }, []);

  // Create QR code element
  const handleCreateQRCode = useCallback(async () => {
    if (!canvas || isCreating || !properties.value.trim()) return;

    setIsCreating(true);
    try {
      const qrElement = await createQRCodeElement(canvas, properties);
      onElementCreated?.(qrElement);
    } catch (error) {
      console.error('Error creating QR code element:', error);
    } finally {
      setIsCreating(false);
    }
  }, [canvas, createQRCodeElement, properties, onElementCreated, isCreating]);

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">QR Code Tool</h3>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title={showPreview ? 'Hide preview' : 'Show preview'}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Content Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content (URL/Text)
        </label>
        <textarea
          value={properties.value}
          onChange={(e) => updateProperty('value', e.target.value)}
          placeholder="Enter URL, text, or data for QR code..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
          rows={3}
        />
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Live Preview
          </label>
          <div className="flex justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
            {previewDataUrl ? (
              <img 
                src={previewDataUrl} 
                alt="QR Code Preview" 
                className="max-w-[150px] max-h-[150px] border border-gray-300 dark:border-gray-500"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-500 rounded">
                <QrCode className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Size Control */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Size: {properties.size}px
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min={QR_SIZES[0]}
            max={QR_SIZES[QR_SIZES.length - 1]}
            value={properties.size}
            onChange={(e) => updateProperty('size', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{QR_SIZES[0]}px</span>
            <span>{QR_SIZES[QR_SIZES.length - 1]}px</span>
          </div>
        </div>
      </div>

      {/* Error Correction Level */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Error Correction
        </label>
        <select
          value={properties.errorCorrectionLevel}
          onChange={(e) => updateProperty('errorCorrectionLevel', e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {ERROR_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {level.label} - {level.description}
            </option>
          ))}
        </select>
      </div>

      {/* Color Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Colors
          </label>
          <div className="flex space-x-1">
            <button
              onClick={() => setShowColorPickers(!showColorPickers)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Toggle color pickers"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={toggleColors}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Swap colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Foreground Color */}
          <div className="space-y-1">
            <label className="block text-xs text-gray-600 dark:text-gray-400">Foreground</label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                style={{ backgroundColor: properties.foregroundColor }}
                onClick={() => setShowColorPickers(!showColorPickers)}
              />
              {showColorPickers && (
                <input
                  type="color"
                  value={properties.foregroundColor}
                  onChange={(e) => updateProperty('foregroundColor', e.target.value)}
                  className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
              )}
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-1">
            <label className="block text-xs text-gray-600 dark:text-gray-400">Background</label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                style={{ backgroundColor: properties.backgroundColor }}
                onClick={() => setShowColorPickers(!showColorPickers)}
              />
              {showColorPickers && (
                <input
                  type="color"
                  value={properties.backgroundColor}
                  onChange={(e) => updateProperty('backgroundColor', e.target.value)}
                  className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Quick Templates
        </label>
        <div className="grid grid-cols-2 gap-1">
          {QRCODE_TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => applyTemplate(template)}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 
                       rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-left"
              title={template.value}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={handleCreateQRCode}
          disabled={!canvas || isCreating || !properties.value.trim()}
          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 
                   bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                   text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Creating...' : 'Add QR Code'}</span>
        </button>
        <button
          onClick={resetToDefaults}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                   rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          title="Reset to defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default QRCodeTool;
