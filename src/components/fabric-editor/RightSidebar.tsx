/**
 * Advanced Right Sidebar Component
 * Comprehensive properties panel with dual functionality for canvas and object controls
 * 
 * Performance Optimizations:
 * - React.memo wrapping for preventing unnecessary re-renders
 * - useCallback for stable function references (event handlers)
 * - useMemo for expensive calculations (computed values, arrays)
 * - Memoized sub-components (CollapsibleSection, NumberInput, Toggle)
 * - Optimized state updates and event handling
 * 
 * Features:
 * - Canvas properties: size, grid, rulers, zoom controls
 * - Object properties: position, appearance, text formatting
 * - Layer management and object manipulation
 * - Real-time updates with validation
 * - Advanced color picker integration
 * - Professional UI with dark mode support
 */

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { fabric } from 'fabric';
import ColorPickerTab from '../labels/ColorPickerTab';
import { 
  GridConfiguration, 
  RulerConfiguration, 
  BackgroundPatternType, 
  CanvasSizePreset,
  AlignmentType,
  GridType
} from '../../types/canvas';

interface RightSidebarProps {
  // Selected objects
  selectedObjects?: fabric.Object[];
  
  // Canvas properties
  canvasWidth?: number;
  canvasHeight?: number;
  canvasBackgroundColor?: string;
  
  // Enhanced grid settings
  gridConfig?: GridConfiguration;
  
  // Enhanced ruler settings
  rulerConfig?: RulerConfiguration;
  
  // Background pattern
  backgroundPattern?: BackgroundPatternType | null;
  
  // Zoom
  zoom?: number;
  
  // Event handlers
  onCanvasSizeChange?: (width: number, height: number) => void;
  onCanvasBackgroundChange?: (color: string) => void;
  onGridConfigChange?: (config: Partial<GridConfiguration>) => void;
  onRulerConfigChange?: (config: Partial<RulerConfiguration>) => void;
  onBackgroundPatternChange?: (type: BackgroundPatternType | null, options?: any) => void;
  onZoomChange?: (zoom: number) => void;
  onFitToViewport?: () => void;
  onZoomToFit?: () => void;
  
  // Object manipulation handlers
  onObjectPropertyChange?: (objectId: string, property: string, value: any) => void;
  onObjectLayerChange?: (objectId: string, action: 'front' | 'back' | 'forward' | 'backward') => void;
  onObjectLock?: (objectId: string, locked: boolean) => void;
  onObjectDelete?: (objectId: string) => void;
  onObjectDuplicate?: (objectId: string) => void;
  
  // Enhanced alignment handlers
  onObjectAlign?: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onObjectDistribute?: (distribution: 'horizontal' | 'vertical') => void;
  onSmartSpacing?: (direction: 'horizontal' | 'vertical') => void;
  onCanvasAlign?: (alignment: 'center' | 'edges') => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedObjects = [],
  canvasWidth = 800,
  canvasHeight = 600,
  canvasBackgroundColor = '#ffffff',
  gridConfig = {
    enabled: true,
    type: 'lines',
    size: 20,
    subdivisions: 5,
    color: '#e5e5e5',
    opacity: 0.5,
    majorLineColor: '#d1d5db',
    minorLineColor: '#e5e7eb',
    majorLineOpacity: 0.8,
    minorLineOpacity: 0.4,
    majorLineWidth: 1,
    minorLineWidth: 0.5,
    snapToGrid: false,
    snapToSubGrid: false,
    snapTolerance: 5,
    adaptiveZoom: true,
    showOrigin: false,
    originColor: '#ef4444',
    showLabels: false,
    labelInterval: 5
  },
  rulerConfig = {
    enabled: true,
    units: 'px',
    precision: 1,
    color: '#374151',
    backgroundColor: '#f9fafb',
    fontSize: 10,
    tickColor: '#6b7280',
    majorTickLength: 10,
    minorTickLength: 5,
    labelOffset: 2,
    showGuides: true,
    guidesColor: '#3b82f6',
    guidesOpacity: 0.5,
    snapToGuides: true,
    guidesTolerance: 3,
    enableMeasurement: false,
    measurementColor: '#ef4444',
    measurementTextColor: '#1f2937',
    measurementLineWidth: 1,
    showMultipleUnits: false,
    secondaryUnit: 'mm'
  },
  backgroundPattern = null,
  zoom = 1,
  onCanvasSizeChange,
  onCanvasBackgroundChange,
  onGridConfigChange,
  onRulerConfigChange,
  onBackgroundPatternChange,
  onZoomChange,
  onFitToViewport,
  onZoomToFit,
  onObjectPropertyChange,
  onObjectLayerChange,
  onObjectLock,
  onObjectDelete,
  onObjectDuplicate,
  onObjectAlign,
  onObjectDistribute,
  onSmartSpacing,
  onCanvasAlign
}) => {
  const [activeSection, setActiveSection] = useState(selectedObjects.length > 0 ? 'object' : 'canvas');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false);
  const [lastAspectRatio, setLastAspectRatio] = useState(canvasWidth / canvasHeight);

  // Memoized computed values for performance
  const hasSelection = useMemo(() => selectedObjects.length > 0, [selectedObjects.length]);
  const isMultiSelection = useMemo(() => selectedObjects.length > 1, [selectedObjects.length]);
  const singleObject = useMemo(() => 
    selectedObjects.length === 1 ? selectedObjects[0] : null, 
    [selectedObjects]
  );

  // Update active section when selection changes
  useEffect(() => {
    if (hasSelection && activeSection === 'canvas') {
      setActiveSection('object');
    }
  }, [hasSelection, activeSection]);

  // Update aspect ratio when canvas size changes
  useEffect(() => {
    setLastAspectRatio(canvasWidth / canvasHeight);
  }, [canvasWidth, canvasHeight]);

  // Toggle section collapse - memoized for performance
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(sectionId)) {
        newCollapsed.delete(sectionId);
      } else {
        newCollapsed.add(sectionId);
      }
      return newCollapsed;
    });
  }, []);

  // Get common property for multi-selection - memoized
  const getCommonProperty = useCallback((property: string): any => {
    if (selectedObjects.length === 0) return undefined;
    if (selectedObjects.length === 1) {
      const obj = selectedObjects[0] as any;
      return property.includes('.') 
        ? property.split('.').reduce((o, k) => o?.[k], obj)
        : obj[property];
    }
    
    const firstValue = (selectedObjects[0] as any)[property];
    const allSame = selectedObjects.every(obj => (obj as any)[property] === firstValue);
    return allSame ? firstValue : undefined;
  }, [selectedObjects]);

  // Handle object property changes with real-time updates - memoized
  const handleObjectPropertyChange = useCallback((property: string, value: any) => {
    selectedObjects.forEach(obj => {
      const objId = (obj as any).id || obj.get?.('id');
      if (objId && onObjectPropertyChange) {
        onObjectPropertyChange(objId, property, value);
      }
    });
  }, [selectedObjects, onObjectPropertyChange]);

  // Handle canvas size with aspect ratio lock - memoized
  const handleCanvasSizeChange = useCallback((dimension: 'width' | 'height', value: number) => {
    if (aspectRatioLocked) {
      if (dimension === 'width') {
        const newHeight = Math.round(value / lastAspectRatio);
        onCanvasSizeChange?.(value, newHeight);
      } else {
        const newWidth = Math.round(value * lastAspectRatio);
        onCanvasSizeChange?.(newWidth, value);
      }
    } else {
      if (dimension === 'width') {
        onCanvasSizeChange?.(value, canvasHeight);
      } else {
        onCanvasSizeChange?.(canvasWidth, value);
      }
    }
  }, [aspectRatioLocked, lastAspectRatio, onCanvasSizeChange, canvasHeight, canvasWidth]);

  // Canvas presets - memoized for performance
  const canvasPresets = useMemo(() => [
    { name: 'A4 Portrait', width: 595, height: 842 },
    { name: 'A4 Landscape', width: 842, height: 595 },
    { name: 'Letter Portrait', width: 612, height: 792 },
    { name: 'Letter Landscape', width: 792, height: 612 },
    { name: 'Square Small', width: 400, height: 400 },
    { name: 'Square Large', width: 800, height: 800 },
    { name: 'Wide Banner', width: 1200, height: 400 },
    { name: 'Social Media', width: 1080, height: 1080 }
  ], []);

  // Zoom presets - memoized for performance
  const zoomPresets = useMemo(() => [
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.5 },
    { label: '75%', value: 0.75 },
    { label: '100%', value: 1 },
    { label: '125%', value: 1.25 },
    { label: '150%', value: 1.5 },
    { label: '200%', value: 2 },
    { label: '300%', value: 3 }
  ], []);

  // Object type detection - memoized for performance
  const getObjectType = useCallback((obj: fabric.Object): string => {
    if (obj.type === 'i-text' || obj.type === 'text') return 'text';
    if (obj.type === 'image') return 'image';
    if (obj.type === 'rect') return 'rectangle';
    if (obj.type === 'circle') return 'circle';
    if (obj.type === 'line') return 'line';
    if (obj.type === 'group') return 'group';
    return obj.type || 'object';
  }, []);

  // Collapsible section component - memoized for performance
  const CollapsibleSection: React.FC<{
    id: string;
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }> = memo(({ id, title, children, defaultOpen = true }) => {
    const isOpen = !collapsedSections.has(id);
    
    useEffect(() => {
      if (!defaultOpen && !collapsedSections.has(id)) {
        setCollapsedSections(prev => new Set(prev).add(id));
      }
    }, [id, defaultOpen]);

    const handleToggle = useCallback(() => {
      toggleSection(id);
    }, [id]);

    return (
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleToggle}
          className="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
        >
          <span>{title}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {isOpen && (
          <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {children}
          </div>
        )}
      </div>
    );
  });
  
  CollapsibleSection.displayName = 'CollapsibleSection';

  // Number input component - memoized for performance
  const NumberInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  }> = memo(({ label, value, onChange, min, max, step = 1, unit }) => {
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    }, [onChange]);

    return (
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {unit && <span className="text-gray-500">({unit})</span>}
        </label>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
    );
  });
  
  NumberInput.displayName = 'NumberInput';

  // Toggle component - memoized for performance
  const Toggle: React.FC<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    description?: string;
  }> = memo(({ label, checked, onChange, description }) => {
    const handleToggle = useCallback(() => {
      onChange(!checked);
    }, [checked, onChange]);

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  });
  
  Toggle.displayName = 'Toggle';

  // Button group component
  const ButtonGroup: React.FC<{
    options: { value: string; label: string; icon?: string }[];
    value?: string;
    onChange: (value: string) => void;
  }> = ({ options, value, onChange }) => (
    <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
            value === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
          } ${index > 0 ? 'border-l border-gray-300 dark:border-gray-600' : ''}`}
        >
          {option.icon && <span className="mr-1">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Properties</h2>
        
        {/* Section tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveSection('canvas')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeSection === 'canvas'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Canvas
            </span>
          </button>
          <button
            onClick={() => setActiveSection('object')}
            disabled={!hasSelection}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeSection === 'object' && hasSelection
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : hasSelection 
                  ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v1.2c0 .7.3 1.3.8 1.7l.3.2c.8.6 1.9.6 2.7 0l.3-.2c.5-.4.8-1 .8-1.7V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4H7z" />
              </svg>
              Object {hasSelection && `(${selectedObjects.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'canvas' ? (
          /* Canvas Properties */
          <div>
            <CollapsibleSection id="canvas-size" title="Canvas Size">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lock Aspect Ratio</span>
                  <button
                    onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                    className={`p-1 rounded ${aspectRatioLocked ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    🔗
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput
                    label="Width"
                    value={canvasWidth}
                    onChange={(value) => handleCanvasSizeChange('width', value)}
                    min={100}
                    max={5000}
                    unit="px"
                  />
                  <NumberInput
                    label="Height"
                    value={canvasHeight}
                    onChange={(value) => handleCanvasSizeChange('height', value)}
                    min={100}
                    max={5000}
                    unit="px"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {canvasPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => onCanvasSizeChange?.(preset.width, preset.height)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection id="canvas-background" title="Background">
              <ColorPickerTab
                color={canvasBackgroundColor}
                onChange={onCanvasBackgroundChange || (() => {})}
                presetColors={[
                  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd',
                  '#6c757d', '#495057', '#343a40', '#212529', '#000000'
                ]}
              />
            </CollapsibleSection>

            <CollapsibleSection id="grid-settings" title="Enhanced Grid Settings">
              <div className="space-y-4">
                <Toggle
                  label="Show Grid"
                  checked={gridConfig.enabled}
                  onChange={() => onGridConfigChange?.({ enabled: !gridConfig.enabled })}
                  description="Display grid lines on canvas"
                />
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Grid Type</label>
                  <select
                    value={gridConfig.type}
                    onChange={(e) => onGridConfigChange?.({ type: e.target.value as GridType })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lines">Lines</option>
                    <option value="dots">Dots</option>
                    <option value="cross">Cross</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                
                <NumberInput
                  label="Grid Size"
                  value={gridConfig.size}
                  onChange={(value) => onGridConfigChange?.({ size: value })}
                  min={5}
                  max={100}
                  unit="px"
                />
                
                <NumberInput
                  label="Subdivisions"
                  value={gridConfig.subdivisions}
                  onChange={(value) => onGridConfigChange?.({ subdivisions: value })}
                  min={1}
                  max={10}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={gridConfig.opacity}
                      onChange={(e) => onGridConfigChange?.({ opacity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                    <input
                      type="color"
                      value={gridConfig.color}
                      onChange={(e) => onGridConfigChange?.({ color: e.target.value })}
                      className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
                
                <Toggle
                  label="Snap to Grid"
                  checked={gridConfig.snapToGrid}
                  onChange={() => onGridConfigChange?.({ snapToGrid: !gridConfig.snapToGrid })}
                  description="Snap objects to grid points"
                />
                
                <Toggle
                  label="Show Origin"
                  checked={gridConfig.showOrigin}
                  onChange={() => onGridConfigChange?.({ showOrigin: !gridConfig.showOrigin })}
                  description="Highlight the origin point (0,0)"
                />
                
                <Toggle
                  label="Adaptive Zoom"
                  checked={gridConfig.adaptiveZoom}
                  onChange={() => onGridConfigChange?.({ adaptiveZoom: !gridConfig.adaptiveZoom })}
                  description="Hide minor grid at low zoom levels"
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection id="rulers" title="Enhanced Rulers">
              <div className="space-y-4">
                <Toggle
                  label="Show Rulers"
                  checked={rulerConfig.enabled}
                  onChange={() => onRulerConfigChange?.({ enabled: !rulerConfig.enabled })}
                  description="Display rulers around canvas"
                />
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Unit</label>
                  <ButtonGroup
                    options={[
                      { value: 'px', label: 'px' },
                      { value: 'mm', label: 'mm' },
                      { value: 'cm', label: 'cm' },
                      { value: 'in', label: 'in' },
                      { value: 'pt', label: 'pt' }
                    ]}
                    value={rulerConfig.units}
                    onChange={(unit) => onRulerConfigChange?.({ units: unit as any })}
                  />
                </div>
                
                <NumberInput
                  label="Precision"
                  value={rulerConfig.precision}
                  onChange={(value) => onRulerConfigChange?.({ precision: value })}
                  min={0}
                  max={3}
                />
                
                <Toggle
                  label="Show Guides"
                  checked={rulerConfig.showGuides}
                  onChange={() => onRulerConfigChange?.({ showGuides: !rulerConfig.showGuides })}
                  description="Show ruler guide lines"
                />
                
                <Toggle
                  label="Snap to Guides"
                  checked={rulerConfig.snapToGuides}
                  onChange={() => onRulerConfigChange?.({ snapToGuides: !rulerConfig.snapToGuides })}
                  description="Snap objects to guide lines"
                />
                
                <Toggle
                  label="Distance Measurement"
                  checked={rulerConfig.enableMeasurement}
                  onChange={() => onRulerConfigChange?.({ enableMeasurement: !rulerConfig.enableMeasurement })}
                  description="Enable click-and-drag distance measurement"
                />
                
                <Toggle
                  label="Multiple Units"
                  checked={rulerConfig.showMultipleUnits}
                  onChange={() => onRulerConfigChange?.({ showMultipleUnits: !rulerConfig.showMultipleUnits })}
                  description="Show measurements in multiple units"
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection id="background-pattern" title="Background Pattern">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Pattern Type</label>
                  <select
                    value={backgroundPattern || 'none'}
                    onChange={(e) => {
                      const value = e.target.value === 'none' ? null : e.target.value as BackgroundPatternType;
                      onBackgroundPatternChange?.(value);
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="dots">Dots</option>
                    <option value="grid">Grid</option>
                    <option value="diagonal">Diagonal</option>
                    <option value="crosshatch">Crosshatch</option>
                    <option value="hexagon">Hexagon</option>
                    <option value="triangular">Triangular</option>
                  </select>
                </div>
                
                {backgroundPattern && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    Pattern options and preview will be available in the canvas controls panel
                  </div>
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection id="zoom-controls" title="Zoom Controls">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zoom Level: {Math.round(zoom * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => onZoomChange?.(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {zoomPresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => onZoomChange?.(preset.value)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        Math.abs(zoom - preset.value) < 0.01
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onFitToViewport?.()}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Fit to View
                  </button>
                  <button
                    onClick={() => onZoomToFit?.()}
                    className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Zoom to Fit
                  </button>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        ) : (
          /* Object Properties */
          <div>
            {!hasSelection ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <p className="text-sm">Select objects to view properties</p>
              </div>
            ) : (
              <>
                {/* Object Info */}
                <CollapsibleSection id="object-info" title={`Selected Objects (${selectedObjects.length})`}>
                  <div className="space-y-2">
                    {selectedObjects.map((obj, index) => {
                      const objType = getObjectType(obj);
                      const objId = (obj as any).id || `object-${index}`;
                      return (
                        <div key={objId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {objType} {selectedObjects.length > 1 && `#${index + 1}`}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onObjectLock?.(objId, !(obj as any).lockMovementX)}
                              className={`p-1 text-xs rounded ${(obj as any).lockMovementX ? 'text-red-600' : 'text-gray-400'}`}
                              title={`${(obj as any).lockMovementX ? 'Unlock' : 'Lock'} object`}
                            >
                              🔒
                            </button>
                            <button
                              onClick={() => onObjectDuplicate?.(objId)}
                              className="p-1 text-xs text-gray-400 hover:text-gray-600"
                              title="Duplicate object"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => onObjectDelete?.(objId)}
                              className="p-1 text-xs text-gray-400 hover:text-red-600"
                              title="Delete object"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleSection>

                {/* Position & Size */}
                <CollapsibleSection id="position-size" title="Position & Size">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <NumberInput
                        label="X Position"
                        value={getCommonProperty('left') || 0}
                        onChange={(value) => handleObjectPropertyChange('left', value)}
                        unit="px"
                      />
                      <NumberInput
                        label="Y Position"
                        value={getCommonProperty('top') || 0}
                        onChange={(value) => handleObjectPropertyChange('top', value)}
                        unit="px"
                      />
                      <NumberInput
                        label="Width"
                        value={getCommonProperty('width') || 0}
                        onChange={(value) => handleObjectPropertyChange('width', value)}
                        min={1}
                        unit="px"
                      />
                      <NumberInput
                        label="Height"
                        value={getCommonProperty('height') || 0}
                        onChange={(value) => handleObjectPropertyChange('height', value)}
                        min={1}
                        unit="px"
                      />
                    </div>
                    
                    <NumberInput
                      label="Rotation"
                      value={getCommonProperty('angle') || 0}
                      onChange={(value) => handleObjectPropertyChange('angle', value)}
                      min={-180}
                      max={180}
                      unit="°"
                    />
                  </div>
                </CollapsibleSection>

                {/* Alignment */}
                <CollapsibleSection id="alignment" title="Alignment">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Align</label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { value: 'left', icon: '⬅️', label: 'Left' },
                          { value: 'center', icon: '↔️', label: 'Center' },
                          { value: 'right', icon: '➡️', label: 'Right' },
                          { value: 'top', icon: '⬆️', label: 'Top' },
                          { value: 'middle', icon: '↕️', label: 'Middle' },
                          { value: 'bottom', icon: '⬇️', label: 'Bottom' }
                        ].map((align) => (
                          <button
                            key={align.value}
                            onClick={() => onObjectAlign?.(align.value as any)}
                            className="p-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title={align.label}
                          >
                            {align.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {isMultiSelection && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Distribute</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => onObjectDistribute?.('horizontal')}
                            className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            Horizontal
                          </button>
                          <button
                            onClick={() => onObjectDistribute?.('vertical')}
                            className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            Vertical
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>

                {/* Layer Controls */}
                <CollapsibleSection id="layer-controls" title="Layer Controls">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { action: 'front', label: 'To Front', icon: '⬆️' },
                      { action: 'back', label: 'To Back', icon: '⬇️' },
                      { action: 'forward', label: 'Forward', icon: '↗️' },
                      { action: 'backward', label: 'Backward', icon: '↙️' }
                    ].map((layer) => (
                      <button
                        key={layer.action}
                        onClick={() => {
                          selectedObjects.forEach(obj => {
                            const objId = (obj as any).id || obj.get?.('id');
                            if (objId) {
                              onObjectLayerChange?.(objId, layer.action as any);
                            }
                          });
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <span>{layer.icon}</span>
                        {layer.label}
                      </button>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Appearance */}
                <CollapsibleSection id="appearance" title="Appearance">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Fill Color</label>
                      <ColorPickerTab
                        color={getCommonProperty('fill') || '#000000'}
                        onChange={(color) => handleObjectPropertyChange('fill', color)}
                        presetColors={[
                          '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
                          '#ff0000', '#ff8800', '#ffff00', '#88ff00', '#00ff00', '#00ff88',
                          '#00ffff', '#0088ff', '#0000ff', '#8800ff', '#ff00ff', '#ff0088'
                        ]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Stroke Color</label>
                      <ColorPickerTab
                        color={getCommonProperty('stroke') || '#000000'}
                        onChange={(color) => handleObjectPropertyChange('stroke', color)}
                        presetColors={[
                          '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
                          '#ff0000', '#ff8800', '#ffff00', '#88ff00', '#00ff00', '#00ff88',
                          '#00ffff', '#0088ff', '#0000ff', '#8800ff', '#ff00ff', '#ff0088'
                        ]}
                      />
                    </div>
                    
                    <NumberInput
                      label="Stroke Width"
                      value={getCommonProperty('strokeWidth') || 0}
                      onChange={(value) => handleObjectPropertyChange('strokeWidth', value)}
                      min={0}
                      max={50}
                      unit="px"
                    />
                    
                    <NumberInput
                      label="Opacity"
                      value={Math.round((getCommonProperty('opacity') || 1) * 100)}
                      onChange={(value) => handleObjectPropertyChange('opacity', value / 100)}
                      min={0}
                      max={100}
                      unit="%"
                    />
                  </div>
                </CollapsibleSection>

                {/* Text Properties */}
                {singleObject && (singleObject.type === 'i-text' || singleObject.type === 'text') && (
                  <CollapsibleSection id="text-properties" title="Text Properties">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Font Family</label>
                        <select
                          value={getCommonProperty('fontFamily') || 'Arial'}
                          onChange={(e) => handleObjectPropertyChange('fontFamily', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          {['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Trebuchet MS', 'Verdana'].map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      
                      <NumberInput
                        label="Font Size"
                        value={getCommonProperty('fontSize') || 16}
                        onChange={(value) => handleObjectPropertyChange('fontSize', value)}
                        min={8}
                        max={200}
                        unit="px"
                      />
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Text Align</label>
                        <ButtonGroup
                          options={[
                            { value: 'left', label: 'Left', icon: '⬅️' },
                            { value: 'center', label: 'Center', icon: '↔️' },
                            { value: 'right', label: 'Right', icon: '➡️' }
                          ]}
                          value={getCommonProperty('textAlign') || 'left'}
                          onChange={(value) => handleObjectPropertyChange('textAlign', value)}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleObjectPropertyChange('fontWeight', getCommonProperty('fontWeight') === 'bold' ? 'normal' : 'bold')}
                          className={`px-3 py-2 text-sm font-bold rounded transition-colors ${
                            getCommonProperty('fontWeight') === 'bold'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          B
                        </button>
                        <button
                          onClick={() => handleObjectPropertyChange('fontStyle', getCommonProperty('fontStyle') === 'italic' ? 'normal' : 'italic')}
                          className={`px-3 py-2 text-sm italic rounded transition-colors ${
                            getCommonProperty('fontStyle') === 'italic'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          I
                        </button>
                        <button
                          onClick={() => handleObjectPropertyChange('underline', !getCommonProperty('underline'))}
                          className={`px-3 py-2 text-sm underline rounded transition-colors ${
                            getCommonProperty('underline')
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          U
                        </button>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* Alignment Tools */}
                {hasSelection && (
                  <CollapsibleSection id="alignment-tools" title="Alignment & Distribution">
                    <div className="space-y-4">
                      {/* Object Alignment */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Align Objects</label>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => onObjectAlign?.('left')}
                            className="p-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Align Left"
                          >
                            ⬅️
                          </button>
                          <button
                            onClick={() => onObjectAlign?.('center')}
                            className="p-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Align Center"
                          >
                            ↔️
                          </button>
                          <button
                            onClick={() => onObjectAlign?.('right')}
                            className="p-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Align Right"
                          >
                            ➡️
                          </button>
                          <button
                            onClick={() => onObjectAlign?.('top')}
                            className="p-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Align Top"
                          >
                            ⬆️
                          </button>
                          <button
                            onClick={() => onObjectAlign?.('middle')}
                            className="p-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Align Middle"
                          >
                            ↕️
                          </button>
                          <button
                            onClick={() => onObjectAlign?.('bottom')}
                            className="p-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Align Bottom"
                          >
                            ⬇️
                          </button>
                        </div>
                      </div>

                      {/* Distribution */}
                      {selectedObjects.length > 2 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Distribute Objects</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => onObjectDistribute?.('horizontal')}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                              Horizontally
                            </button>
                            <button
                              onClick={() => onObjectDistribute?.('vertical')}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                              Vertically
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Smart Spacing */}
                      {selectedObjects.length > 1 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Smart Spacing</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => onSmartSpacing?.('horizontal')}
                              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                            >
                              Match H-Space
                            </button>
                            <button
                              onClick={() => onSmartSpacing?.('vertical')}
                              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                            >
                              Match V-Space
                            </button>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Automatically detect and apply consistent spacing between objects
                          </div>
                        </div>
                      )}

                      {/* Canvas Alignment */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Align to Canvas</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => onCanvasAlign?.('center')}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            Center Canvas
                          </button>
                          <button
                            onClick={() => onCanvasAlign?.('edges')}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            Align to Edges
                          </button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap the component with memo for performance optimization
export default memo(RightSidebar);
