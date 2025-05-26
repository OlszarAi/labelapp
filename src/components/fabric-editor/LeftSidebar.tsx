/**
 * Left Sidebar Component
 * Element creation toolbar with tabbed interface
 */

import React, { useState } from 'react';
import { fabric } from 'fabric';
import TextTool from './elements/TextTool';
import GraphicsTool from './elements/GraphicsTool';
import QRCodeTool from './elements/QRCodeTool';
import UUIDTool from './elements/UUIDTool';

interface LeftSidebarProps {
  canvas: fabric.Canvas | null;
  onElementAdd?: (element: fabric.Object) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ canvas, onElementAdd }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'graphics' | 'qr' | 'uuid'>('text');

  const tabs = [
    { id: 'text', name: 'Tekst', icon: 'T' },
    { id: 'graphics', name: 'Kształty', icon: '○' },
    { id: 'qr', name: 'QR Code', icon: '⚏' },
    { id: 'uuid', name: 'UUID', icon: '#' },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'text':
        return <TextTool canvas={canvas} onTextAdd={onElementAdd} />;
      case 'graphics':
        return <GraphicsTool canvas={canvas} onShapeAdd={onElementAdd} />;
      case 'qr':
        return <QRCodeTool canvas={canvas} onQRCodeAdd={onElementAdd} />;
      case 'uuid':
        return <UUIDTool canvas={canvas} onUUIDAdd={onElementAdd} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-none p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Narzędzia</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Wybierz element do dodania na etykietę
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">{tab.icon}</span>
                <span className="text-xs">{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default LeftSidebar;
