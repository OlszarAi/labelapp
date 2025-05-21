"use client";

import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ColorPickerTab from './ColorPickerTab';

interface LabelElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  size?: number;
  value?: string;
  color?: string;
  uuidLength?: number;
}

interface LabelSettings {
  width: number;
  height: number;
  unit: string;
  elements: LabelElement[];
}

interface EditorSidebarProps {
  labelSettings: LabelSettings;
  setLabelSettings: (settings: LabelSettings) => void;
  selectedElementId: string | null;
}

// Function to generate UUIDs with customizable length
const generateCustomUuid = (length: number = 36): string => {
  const fullUuid = uuidv4();
  if (length >= 36) return fullUuid;
  return fullUuid.replace(/-/g, '').substring(0, length);
};

export default function EditorSidebar({
  labelSettings,
  setLabelSettings,
  selectedElementId
}: EditorSidebarProps) {
  // Referencje do sekcji w panelu bocznym do przewijania
  const qrCodeSectionRef = useRef<HTMLDivElement>(null);
  const uuidTextSectionRef = useRef<HTMLDivElement>(null);
  const companySectionRef = useRef<HTMLDivElement>(null);
  const productSectionRef = useRef<HTMLDivElement>(null);

  // Funkcja do aktualizacji rozmiarów etykiety
  const updateLabelSize = (field: string, value: any) => {
    setLabelSettings({
      ...labelSettings,
      [field]: value
    });
  };

  // Funkcja do dodawania nowych elementów do etykiety
  const addElement = (type: string) => {
    const newElement = {
      id: uuidv4(),
      type,
      x: 10,
      y: 10,
    };

    // Dodaj specyficzne właściwości w zależności od typu elementu
    switch (type) {
      case 'qrCode':
        Object.assign(newElement, {
          width: 25,
          value: 'https://example.com'
        });
        break;
      case 'uuidText':
        Object.assign(newElement, {
          size: 10,
          value: generateCustomUuid(),
          uuidLength: 36 // Default length is 36 (full UUID)
        });
        break;
      case 'company':
        Object.assign(newElement, {
          size: 14,
          value: 'Nazwa firmy'
        });
        break;
      case 'product':
        Object.assign(newElement, {
          size: 12,
          value: 'Nazwa produktu'
        });
        break;
    }

    setLabelSettings({
      ...labelSettings,
      elements: [...labelSettings.elements, newElement]
    });
  };

  // Funkcja do aktualizacji właściwości elementu
  const updateElementProperty = (id: string, property: string, value: any) => {
    const updatedElements = labelSettings.elements.map((element: LabelElement) => {
      if (element.id === id) {
        return {
          ...element,
          [property]: value
        };
      }
      return element;
    });

    setLabelSettings({
      ...labelSettings,
      elements: updatedElements
    });
  };

  // Funkcja do aktualizacji długości UUID i regenerowania jego wartości
  const updateUuidLength = (id: string, length: number) => {
    const updatedElements = labelSettings.elements.map((element: LabelElement) => {
      if (element.id === id) {
        return {
          ...element,
          uuidLength: length,
          value: generateCustomUuid(length)
        };
      }
      return element;
    });

    setLabelSettings({
      ...labelSettings,
      elements: updatedElements
    });
  };

  // Funkcja do regenerowania UUID z zachowaniem długości
  const regenerateUuid = (id: string) => {
    const element = labelSettings.elements.find((el: LabelElement) => el.id === id);
    if (!element) return;

    const length = element.uuidLength || 36;
    updateElementProperty(id, 'value', generateCustomUuid(length));
  };

  // Funkcja do usuwania elementu
  const removeElement = (id: string) => {
    const updatedElements = labelSettings.elements.filter((element: LabelElement) => element.id !== id);
    setLabelSettings({
      ...labelSettings,
      elements: updatedElements
    });
  };

  // Popularne predefiniowane kolory
  const predefinedColors = [
    '#333333', // domyślny ciemnoszary
    '#000000', // czarny
    '#D32F2F', // czerwony
    '#1976D2', // niebieski
    '#388E3C', // zielony
    '#7B1FA2', // fioletowy
    '#F57C00', // pomarańczowy
    '#5D4037', // brązowy
  ];

  // Efekt do przewijania do odpowiedniej sekcji po wybraniu elementu
  useEffect(() => {
    if (!selectedElementId) return;

    const selectedElement = labelSettings.elements.find((el: LabelElement) => el.id === selectedElementId);
    if (!selectedElement) return;

    // Przewijanie do odpowiedniej sekcji w zależności od typu elementu
    switch (selectedElement.type) {
      case 'qrCode':
        qrCodeSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'uuidText':
        uuidTextSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'company':
        companySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'product':
        productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
    }
  }, [selectedElementId, labelSettings.elements]);

  // Znajdź wybrany element, jeśli istnieje
  const selectedElement = selectedElementId
    ? labelSettings.elements.find((el: LabelElement) => el.id === selectedElementId)
    : null;

  return (
    <div className="relative flex flex-col h-full max-h-full">
      {/* Logo */}
      <div className="px-6 pt-4 flex items-center">
        <a className="flex-none rounded-xl text-xl inline-block font-semibold dark:focus:opacity-80" href="/">
          <span className="text-blue-600 dark:text-white">Label Generator</span>
        </a>
      </div>

      {/* Panel opcji */}
      <div className="h-full overflow-y-auto p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
        <div className="space-y-6">
          {/* Rozmiar etykiety */}
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Rozmiar etykiety</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="width" className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Szerokość</label>
                <input
                  type="number"
                  id="width"
                  value={labelSettings.width}
                  onChange={(e) => updateLabelSize('width', Number(e.target.value))}
                  className="py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:focus:ring-gray-600"
                />
              </div>
              
              <div>
                <label htmlFor="height" className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Wysokość</label>
                <input
                  type="number"
                  id="height"
                  value={labelSettings.height}
                  onChange={(e) => updateLabelSize('height', Number(e.target.value))}
                  className="py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:focus:ring-gray-600"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="unit" className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Jednostka</label>
              <select
                id="unit"
                value={labelSettings.unit}
                onChange={(e) => updateLabelSize('unit', e.target.value)}
                className="py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:focus:ring-gray-600"
              >
                <option value="mm">mm</option>
                <option value="cm">cm</option>
              </select>
            </div>
          </div>

          {/* Elementy etykiety */}
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Elementy etykiety</h3>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addElement('qrCode')}
                className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-neutral-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                </svg>
                QR Code
              </button>
              
              <button
                type="button"
                onClick={() => addElement('uuidText')}
                className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-neutral-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                UUID Text
              </button>

              <button
                type="button"
                onClick={() => addElement('company')}
                className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-neutral-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
                Firma
              </button>

              <button
                type="button"
                onClick={() => addElement('product')}
                className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-neutral-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                </svg>
                Produkt
              </button>
            </div>
          </div>

          {/* QR Code Options */}
          <div
            ref={qrCodeSectionRef}
            className={`bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm ${
              selectedElement && selectedElement.type === 'qrCode'
                ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                : ''
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">QR Code</h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => addElement('qrCode')}
                  className="py-1 px-2 inline-flex justify-center items-center gap-1 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-xs dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-neutral-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {labelSettings.elements.filter((el: LabelElement) => el.type === 'qrCode').length > 0 ? (
              <div className="space-y-4">
                {labelSettings.elements
                  .filter((el: LabelElement) => el.type === 'qrCode')
                  .map((element: LabelElement) => (
                    <div
                      key={element.id}
                      className={`p-3 border rounded-md ${
                        selectedElementId === element.id
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-sm text-gray-800 dark:text-white">
                          QR Code {element.value ? `: ${element.value}` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeElement(element.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">X</label>
                          <input
                            type="number"
                            value={element.x}
                            onChange={(e) => updateElementProperty(element.id, 'x', Number(e.target.value))}
                            className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Y</label>
                          <input
                            type="number"
                            value={element.y}
                            onChange={(e) => updateElementProperty(element.id, 'y', Number(e.target.value))}
                            className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Rozmiar</label>
                        <input
                          type="number"
                          value={element.width}
                          onChange={(e) => updateElementProperty(element.id, 'width', Number(e.target.value))}
                          className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                        />
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Zawartość QR</label>
                        <input
                          type="text"
                          value={element.value}
                          onChange={(e) => updateElementProperty(element.id, 'value', e.target.value)}
                          className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                        />
                      </div>
                      
                      <div className="mt-3">
                        <ColorPickerTab
                          color={element.color || '#333333'}
                          onChange={(color) => updateElementProperty(element.id, 'color', color)}
                          presetColors={predefinedColors}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Kliknij przycisk "+", aby dodać kod QR do etykiety.
              </p>
            )}
          </div>

          {/* UUID Text Options */}
          <div
            ref={uuidTextSectionRef}
            className={`bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm ${
              selectedElement && selectedElement.type === 'uuidText'
                ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                : ''
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">UUID Text</h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => addElement('uuidText')}
                  className="py-1 px-2 inline-flex justify-center items-center gap-1 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-xs dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-neutral-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {labelSettings.elements.filter((el: LabelElement) => el.type === 'uuidText').length > 0 ? (
              <div className="space-y-4">
                {labelSettings.elements
                  .filter((el: LabelElement) => el.type === 'uuidText')
                  .map((element: LabelElement) => (
                    <div
                      key={element.id}
                      className={`p-3 border rounded-md ${
                        selectedElementId === element.id
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-sm text-gray-800 dark:text-white truncate max-w-[200px]">
                          UUID: {element.value?.substring(0, 8) || ''}...
                        </span>
                        <button
                          type="button"
                          onClick={() => removeElement(element.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">X</label>
                          <input
                            type="number"
                            value={element.x}
                            onChange={(e) => updateElementProperty(element.id, 'x', Number(e.target.value))}
                            className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Y</label>
                          <input
                            type="number"
                            value={element.y}
                            onChange={(e) => updateElementProperty(element.id, 'y', Number(e.target.value))}
                            className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Rozmiar czcionki</label>
                        <input
                          type="number"
                          value={element.size}
                          onChange={(e) => updateElementProperty(element.id, 'size', Number(e.target.value))}
                          className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                        />
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Długość UUID</label>
                        <div className="flex">
                          <select
                            value={element.uuidLength || 36}
                            onChange={(e) => updateUuidLength(element.id, Number(e.target.value))}
                            className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                          >
                            <option value="8">8 znaków</option>
                            <option value="12">12 znaków</option>
                            <option value="16">16 znaków</option>
                            <option value="20">20 znaków</option>
                            <option value="32">32 znaki</option>
                            <option value="36">Pełny UUID (36)</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">UUID</label>
                        <div className="flex">
                          <input
                            type="text"
                            value={element.value}
                            onChange={(e) => updateElementProperty(element.id, 'value', e.target.value)}
                            className="py-1 px-2 block w-full border-gray-200 rounded-l-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                          />
                          <button
                            type="button"
                            onClick={() => regenerateUuid(element.id)}
                            className="py-1 px-2 inline-flex justify-center items-center gap-1 rounded-r-md border border-l-0 font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-xs dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-neutral-900"
                            title="Regenerate UUID"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <ColorPickerTab
                          color={element.color || '#333333'}
                          onChange={(color) => updateElementProperty(element.id, 'color', color)}
                          presetColors={predefinedColors}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Kliknij przycisk "+", aby dodać tekst UUID do etykiety.
              </p>
            )}
          </div>

          {/* Company Options */}
          <div
            ref={companySectionRef}
            className={`bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm ${
              selectedElement && selectedElement.type === 'company'
                ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                : ''
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Firma</h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => addElement('company')}
                  className="py-1 px-2 inline-flex justify-center items-center gap-1 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-xs dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-neutral-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {labelSettings.elements.filter((el: LabelElement) => el.type === 'company').length > 0 ? (
              <div className="space-y-4">
                {labelSettings.elements
                  .filter((el: LabelElement) => el.type === 'company')
                  .map((element: LabelElement) => (
                    <div
                      key={element.id}
                      className={`p-3 border rounded-md ${
                        selectedElementId === element.id
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-sm text-gray-800 dark:text-white">
                          {element.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeElement(element.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">X</label>
                          <input
                            type="number"
                            value={element.x}
                            onChange={(e) => updateElementProperty(element.id, 'x', Number(e.target.value))}
                            className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Y</label>
                          <input
                            type="number"
                            value={element.y}
                            onChange={(e) => updateElementProperty(element.id, 'y', Number(e.target.value))}
                            className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Rozmiar czcionki</label>
                        <input
                          type="number"
                          value={element.size}
                          onChange={(e) => updateElementProperty(element.id, 'size', Number(e.target.value))}
                          className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                        />
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Nazwa firmy</label>
                        <input
                          type="text"
                          value={element.value}
                          onChange={(e) => updateElementProperty(element.id, 'value', e.target.value)}
                          className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                        />
                      </div>

                      <div className="mt-3">
                        <ColorPickerTab
                          color={element.color || '#333333'}
                          onChange={(color) => updateElementProperty(element.id, 'color', color)}
                          presetColors={predefinedColors}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Kliknij przycisk "+", aby dodać nazwę firmy do etykiety.
              </p>
            )}
          </div>

          {/* Product Options */}
          <div
            ref={productSectionRef}
            className={`bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm ${
              selectedElement && selectedElement.type === 'product'
                ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                : ''
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Produkt</h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => addElement('product')}
                  className="py-1 px-2 inline-flex justify-center items-center gap-1 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-xs dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-neutral-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {labelSettings.elements.filter((el: LabelElement) => el.type === 'product').length > 0 ? (
              <div className="space-y-4">
                {labelSettings.elements
                  .filter((el: LabelElement) => el.type === 'product')
                  .map((element: LabelElement) => (
                    <div
                      key={element.id}
                      className={`p-3 border rounded-md ${
                        selectedElementId === element.id
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-sm text-gray-800 dark:text-white">
                          {element.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeElement(element.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">X</label>
                          <input
                            type="number"
                            value={element.x}
                            onChange={(e) => updateElementProperty(element.id, 'x', Number(e.target.value))}
                            className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Y</label>
                          <input
                            type="number"
                            value={element.y}
                            onChange={(e) => updateElementProperty(element.id, 'y', Number(e.target.value))}
                            className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Rozmiar czcionki</label>
                        <input
                          type="number"
                          value={element.size}
                          onChange={(e) => updateElementProperty(element.id, 'size', Number(e.target.value))}
                          className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                        />
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Nazwa produktu</label>
                        <input
                          type="text"
                          value={element.value}
                          onChange={(e) => updateElementProperty(element.id, 'value', e.target.value)}
                          className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                        />
                      </div>

                      <div className="mt-3">
                        <ColorPickerTab
                          color={element.color || '#333333'}
                          onChange={(color) => updateElementProperty(element.id, 'color', color)}
                          presetColors={predefinedColors}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Kliknij przycisk "+", aby dodać nazwę produktu do etykiety.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}