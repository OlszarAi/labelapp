// UUID element creation tool for the left sidebar

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { Hash, Plus, RotateCcw, RefreshCw, Copy, Palette } from 'lucide-react';
import { 
  useElementCreation, 
  UUIDElementProperties, 
  DEFAULT_UUID_PROPERTIES,
  COMMON_FONTS 
} from '@/hooks/fabric/useElementCreation';

interface UUIDToolProps {
  canvas: fabric.Canvas | null;
  onElementCreated?: (element: fabric.Text) => void;
}

const UUID_LENGTHS = [
  { value: 8, label: '8 characters', example: 'A1B2C3D4' },
  { value: 16, label: '16 characters', example: 'A1B2C3D4E5F6G7H8' },
  { value: 32, label: '32 characters', example: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6' },
  { value: 36, label: '36 characters (Standard UUID)', example: '550e8400-e29b-41d4-a716-446655440000' },
] as const;

const FORMAT_OPTIONS = [
  { value: 'with-hyphens', label: 'With hyphens', description: 'A1B2-C3D4' },
  { value: 'without-hyphens', label: 'Without hyphens', description: 'A1B2C3D4' },
] as const;

const CHARACTER_SETS = [
  { value: 'alphanumeric', label: 'Alphanumeric (A-Z, 0-9)', description: 'Letters and numbers' },
  { value: 'numbers-only', label: 'Numbers only (0-9)', description: 'Only digits' },
] as const;

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32];

export function UUIDTool({ canvas, onElementCreated }: UUIDToolProps) {
  const { createUUIDElement, generateUUID } = useElementCreation();
  const [properties, setProperties] = useState<UUIDElementProperties>(DEFAULT_UUID_PROPERTIES);
  const [previewUUID, setPreviewUUID] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update property
  const updateProperty = useCallback((key: keyof UUIDElementProperties, value: any) => {
    setProperties(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Generate preview UUID
  const generatePreviewUUID = useCallback(() => {
    const uuid = generateUUID(properties.length, properties.format, properties.characterSet);
    setPreviewUUID(uuid);
  }, [generateUUID, properties.length, properties.format, properties.characterSet]);

  // Update preview when properties change
  useEffect(() => {
    generatePreviewUUID();
  }, [generatePreviewUUID]);

  // Copy UUID to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!previewUUID) return;
    
    try {
      await navigator.clipboard.writeText(previewUUID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy UUID:', error);
    }
  }, [previewUUID]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setProperties(DEFAULT_UUID_PROPERTIES);
  }, []);

  // Get format description with example
  const getFormatExample = useCallback(() => {
    const option = UUID_LENGTHS.find(opt => opt.value === properties.length);
    if (!option) return '';
    
    // Show example based on current format
    if (properties.format === 'without-hyphens') {
      return option.example.replace(/-/g, '');
    }
    return option.example;
  }, [properties.length, properties.format]);

  // Create UUID element
  const handleCreateUUID = useCallback(async () => {
    if (!canvas || isCreating) return;

    setIsCreating(true);
    try {
      const uuidElement = await createUUIDElement(canvas, properties);
      onElementCreated?.(uuidElement);
    } catch (error) {
      console.error('Error creating UUID element:', error);
    } finally {
      setIsCreating(false);
    }
  }, [canvas, createUUIDElement, properties, onElementCreated, isCreating]);

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">UUID Tool</h3>
      </div>

      {/* Length Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Length
        </label>
        <select
          value={properties.length}
          onChange={(e) => updateProperty('length', parseInt(e.target.value) as any)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {UUID_LENGTHS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Example: {getFormatExample()}
        </p>
      </div>

      {/* Format Options */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Format
        </label>
        <div className="space-y-2">
          {FORMAT_OPTIONS.map(option => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value={option.value}
                checked={properties.format === option.value}
                onChange={(e) => updateProperty('format', e.target.value)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="text-sm text-gray-900 dark:text-gray-100">{option.label}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Character Set Options */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Character Set
        </label>
        <div className="space-y-2">
          {CHARACTER_SETS.map(option => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="characterSet"
                value={option.value}
                checked={properties.characterSet === option.value}
                onChange={(e) => updateProperty('characterSet', e.target.value)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="text-sm text-gray-900 dark:text-gray-100">{option.label}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Live Preview
          </label>
          <div className="flex space-x-1">
            <button
              onClick={copyToClipboard}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={generatePreviewUUID}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Generate new UUID"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="relative">
          <div 
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-md 
                     bg-gray-50 dark:bg-gray-700 font-mono text-center break-all"
            style={{
              fontFamily: properties.fontFamily,
              fontSize: `${Math.min(properties.fontSize, 16)}px`,
              color: properties.fill,
            }}
          >
            {previewUUID || 'Generated UUID will appear here'}
          </div>
          {copied && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 
                          bg-green-600 text-white text-xs rounded">
              Copied!
            </div>
          )}
        </div>
      </div>

      {/* Font Controls */}
      <div className="grid grid-cols-2 gap-3">
        {/* Font Family */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Font Family
          </label>
          <select
            value={properties.fontFamily}
            onChange={(e) => updateProperty('fontFamily', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {COMMON_FONTS.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Size
          </label>
          <select
            value={properties.fontSize}
            onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {FONT_SIZES.map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Color
        </label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 
                     rounded bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: properties.fill }}
            />
            <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          {showColorPicker && (
            <input
              type="color"
              value={properties.fill}
              onChange={(e) => updateProperty('fill', e.target.value)}
              className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={generatePreviewUUID}
          className="flex items-center justify-center space-x-2 px-3 py-2 
                   border border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 
                   rounded hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Generate</span>
        </button>
        <button
          onClick={handleCreateUUID}
          disabled={!canvas || isCreating}
          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 
                   bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 
                   text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Adding...' : 'Add UUID'}</span>
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

export default UUIDTool;
