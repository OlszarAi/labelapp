// Right sidebar with properties panels

"use client";

import React, { useState } from 'react';
import { 
  X, 
  Menu,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { CanvasProperties } from '@/components/fabric-editor/properties/CanvasProperties';
import { ElementProperties } from '@/components/fabric-editor/properties/ElementProperties';
import { TextProperties } from '@/components/fabric-editor/properties/TextProperties';
import { useElementProperties } from '@/hooks/fabric/useElementProperties';

export interface RightSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  theme: 'light' | 'dark';
  canvas?: fabric.Canvas | null;
}

/**
 * Right sidebar with canvas properties, object properties, and text properties
 */
export function RightSidebar({
  collapsed,
  onToggleCollapse,
  onClose,
  theme,
  canvas,
}: RightSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['canvas', 'object'])
  );

  // Use the properties hook
  const {
    selectedObjects,
    canvasProperties,
    getObjectProperties,
    getTextProperties,
    updateCanvasProperty,
    updateObjectProperty,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    hasSelection,
    hasMultipleSelection,
    selectedObjectTypes,
  } = useElementProperties({
    canvas: canvas || null,
    enableRealTimeUpdates: true,
  });

  const isDark = theme === 'dark';

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleCanvasFitToScreen = () => {
    if (canvas) {
      canvas.setZoom(1);
      canvas.renderAll();
    }
  };

  const handleCanvasResetZoom = () => {
    if (canvas) {
      canvas.setZoom(1);
      canvas.renderAll();
    }
  };

  const handleCanvasExport = (format: 'pdf' | 'png' | 'jpg' | 'svg') => {
    if (!canvas) return;
    
    switch (format) {
      case 'png':
      case 'jpg':
        const dataURL = canvas.toDataURL({
          format: format === 'jpg' ? 'jpeg' : 'png',
          quality: 1,
        });
        const link = document.createElement('a');
        link.download = `canvas.${format}`;
        link.href = dataURL;
        link.click();
        break;
      case 'svg':
        const svgData = canvas.toSVG();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const svgLink = document.createElement('a');
        svgLink.download = 'canvas.svg';
        svgLink.href = svgUrl;
        svgLink.click();
        URL.revokeObjectURL(svgUrl);
        break;
      case 'pdf':
        // PDF export would require additional library like jsPDF
        console.log('PDF export not implemented yet');
        break;
    }
  };

  if (collapsed) {
    return (
      <div className="flex flex-col h-full">
        {/* Collapsed Header */}
        <div className="flex items-center justify-center p-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Expand sidebar"
          >
            <Menu size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
        
        {/* Collapsed content placeholder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xs text-gray-400 transform -rotate-90 whitespace-nowrap">
            Properties
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Properties
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Collapse sidebar"
          >
            <Menu size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Close sidebar"
          >
            <X size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Canvas Properties */}
        <CanvasProperties
          properties={canvasProperties}
          onPropertyChange={updateCanvasProperty}
          onFitToScreen={handleCanvasFitToScreen}
          onResetZoom={handleCanvasResetZoom}
          onExport={handleCanvasExport}
          theme={theme}
          expanded={expandedSections.has('canvas')}
          onToggleExpanded={() => toggleSection('canvas')}
        />

        {/* Object Properties - only show when objects are selected */}
        {hasSelection && (
          <ElementProperties
            properties={getObjectProperties()}
            onPropertyChange={updateObjectProperty}
            onBringToFront={bringToFront}
            onSendToBack={sendToBack}
            onBringForward={bringForward}
            onSendBackward={sendBackward}
            hasMultipleSelection={hasMultipleSelection}
            selectedObjectTypes={selectedObjectTypes}
            theme={theme}
            expanded={expandedSections.has('object')}
            onToggleExpanded={() => toggleSection('object')}
          />
        )}

        {/* Text Properties - only show for text objects */}
        {hasSelection && selectedObjectTypes.some(type => type === 'i-text' || type === 'text') && (
          <TextProperties
            properties={getTextProperties()}
            onPropertyChange={updateObjectProperty}
            hasMultipleSelection={hasMultipleSelection}
            theme={theme}
            expanded={expandedSections.has('text')}
            onToggleExpanded={() => toggleSection('text')}
          />
        )}

        {/* History Section - placeholder for future implementation */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">History</h3>
            <button
              onClick={() => toggleSection('history')}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Toggle history section"
            >
              {expandedSections.has('history') ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {expandedSections.has('history') && (
            <div className="mt-2 space-y-1">
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400">
                History functionality will be implemented with undo/redo integration
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
