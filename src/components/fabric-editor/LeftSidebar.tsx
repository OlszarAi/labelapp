// Left sidebar with element creation tools and templates

"use client";

import React, { useState } from 'react';
import { 
  Type, 
  QrCode, 
  Hash, 
  Square, 
  Circle, 
  Image, 
  FileText,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  Palette,
  Layers
} from 'lucide-react';

export interface LeftSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  theme: 'light' | 'dark';
}

interface ToolSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  expanded: boolean;
  tools: Tool[];
}

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  shortcut?: string;
  onClick: () => void;
}

/**
 * Left sidebar with element creation tools, templates, and assets
 */
export function LeftSidebar({
  collapsed,
  onToggleCollapse,
  onClose,
  theme,
}: LeftSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['elements', 'templates'])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Tool handlers (to be implemented with actual functionality)
  const handleAddText = () => console.log('Add text element');
  const handleAddQRCode = () => console.log('Add QR code element');
  const handleAddUUID = () => console.log('Add UUID element');
  const handleAddRectangle = () => console.log('Add rectangle shape');
  const handleAddCircle = () => console.log('Add circle shape');
  const handleAddImage = () => console.log('Add image element');

  const toolSections: ToolSection[] = [
    {
      id: 'elements',
      title: 'Elements',
      icon: Layers,
      expanded: expandedSections.has('elements'),
      tools: [
        {
          id: 'text',
          name: 'Text',
          icon: Type,
          description: 'Add text element',
          shortcut: 'T',
          onClick: handleAddText,
        },
        {
          id: 'qrcode',
          name: 'QR Code',
          icon: QrCode,
          description: 'Add QR code',
          shortcut: 'Q',
          onClick: handleAddQRCode,
        },
        {
          id: 'uuid',
          name: 'UUID',
          icon: Hash,
          description: 'Add unique identifier',
          shortcut: 'U',
          onClick: handleAddUUID,
        },
        {
          id: 'rectangle',
          name: 'Rectangle',
          icon: Square,
          description: 'Add rectangle shape',
          shortcut: 'R',
          onClick: handleAddRectangle,
        },
        {
          id: 'circle',
          name: 'Circle',
          icon: Circle,
          description: 'Add circle shape',
          shortcut: 'C',
          onClick: handleAddCircle,
        },
        {
          id: 'image',
          name: 'Image',
          icon: Image,
          description: 'Add image element',
          shortcut: 'I',
          onClick: handleAddImage,
        },
      ],
    },
    {
      id: 'templates',
      title: 'Templates',
      icon: FileText,
      expanded: expandedSections.has('templates'),
      tools: [
        {
          id: 'business-card',
          name: 'Business Card',
          icon: Square,
          description: 'Standard business card template',
          onClick: () => console.log('Load business card template'),
        },
        {
          id: 'product-label',
          name: 'Product Label',
          icon: Square,
          description: 'Product labeling template',
          onClick: () => console.log('Load product label template'),
        },
        {
          id: 'shipping-label',
          name: 'Shipping Label',
          icon: Square,
          description: 'Shipping label template',
          onClick: () => console.log('Load shipping label template'),
        },
      ],
    },
    {
      id: 'assets',
      title: 'Assets',
      icon: FolderOpen,
      expanded: expandedSections.has('assets'),
      tools: [
        {
          id: 'colors',
          name: 'Color Palette',
          icon: Palette,
          description: 'Saved colors and themes',
          onClick: () => console.log('Open color palette'),
        },
        {
          id: 'images',
          name: 'Images',
          icon: Image,
          description: 'Uploaded images and assets',
          onClick: () => console.log('Open image library'),
        },
      ],
    },
  ];

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
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Collapsed Tool Icons */}
        <div className="flex-1 flex flex-col items-center py-4 space-y-2 overflow-y-auto">
          {toolSections.map(section => (
            <div key={section.id} className="w-full">
              <div className="flex justify-center mb-2">
                <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
              {section.tools.slice(0, 3).map(tool => {
                const IconComponent = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={tool.onClick}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-1 mx-auto"
                    title={`${tool.name}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Tools</h2>
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Collapse sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {toolSections.map(section => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div key={section.id} className="mb-4">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <SectionIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-sm">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="mt-2 space-y-1">
                    {section.tools.map(tool => {
                      const ToolIcon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={tool.onClick}
                          className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                          title={tool.description}
                        >
                          <div className="flex-shrink-0">
                            <ToolIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{tool.name}</span>
                              {tool.shortcut && (
                                <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded border">
                                  {tool.shortcut}
                                </kbd>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {tool.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Quick shortcuts:</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">T</kbd> Text</div>
            <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Q</kbd> QR Code</div>
            <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">R</kbd> Rectangle</div>
            <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">C</kbd> Circle</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;
