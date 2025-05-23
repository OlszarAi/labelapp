"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Label } from '@/lib/types/label.types';
import { motion } from 'framer-motion';

interface LabelPreviewProps {
  label: Label;
  className?: string;
  fitContainer?: boolean;
  showBorder?: boolean;
  isInteractive?: boolean;
}

export default function LabelPreview({ 
  label, 
  className = "", 
  fitContainer = false,
  showBorder = true,
  isInteractive = false
}: LabelPreviewProps) {
  // State for hover effect
  const [isHovered, setIsHovered] = useState(false);
  
  // Stałe do konwersji mm na piksele
  const MM_TO_PX_FACTOR = 2; // Niższy współczynnik konwersji dla podglądu (zoptymalizowane)
  
  // Funkcja konwertująca mm na piksele dla podglądu
  const mmToPx = (mm: number): number => {
    return mm * MM_TO_PX_FACTOR;
  };

  // Funkcja wybierająca optymalny kontrast tekstu
  const getContrastColor = (bgColor?: string): string => {
    if (!bgColor || bgColor === 'transparent') return '#333333';
    
    // Uproszczony algorytm dla kontrastu - dla podglądu wystarczy
    if (bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#333333' : '#ffffff';
    }
    
    return '#333333';
  };

  // Określenie stosunku szerokości do wysokości
  const aspectRatio = label.width / label.height;

  // Obliczenie szerokości i wysokości w pikselach
  const widthPx = mmToPx(label.width);
  const heightPx = mmToPx(label.height);

  const WrapperComponent = isInteractive ? motion.div : 'div';

  return (
    <WrapperComponent 
      className={`relative ${showBorder ? 'border border-gray-300 dark:border-gray-700' : ''} 
        bg-white dark:bg-gray-800 overflow-hidden ${className} 
        ${fitContainer ? 'w-full h-full' : ''} 
        transition-all duration-300`}
      style={{
        width: fitContainer ? '100%' : `${widthPx}px`,
        height: fitContainer ? '100%' : `${heightPx}px`,
        maxWidth: '100%',
        maxHeight: '100%',
        aspectRatio: fitContainer ? `${aspectRatio}` : 'auto',
        position: 'relative',
        boxShadow: isHovered 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          : '0 4px 12px rgba(0, 0, 0, 0.08)'
      }}
      onMouseEnter={isInteractive ? () => setIsHovered(true) : undefined}
      onMouseLeave={isInteractive ? () => setIsHovered(false) : undefined}
      whileHover={isInteractive ? { 
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.3, ease: "easeOut" }
      } : undefined}
    >
      {/* Optional hover overlay for interactive mode */}
      {isInteractive && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-indigo-500/0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isHovered ? 0.1 : 0,
            background: isHovered 
              ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1), rgba(99,102,241,0.1))'
              : 'none' 
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Renderujemy elementy etykiety */}
      {label.elements.map((element) => {
        // Obliczamy współczynnik skalowania dla trybu dopasowania do kontenera
        const scaleFactorX = fitContainer ? 1 : 1;
        const scaleFactorY = fitContainer ? 1 : 1;
        
        const posX = mmToPx(element.x) * scaleFactorX;
        const posY = mmToPx(element.y) * scaleFactorY;
        const textColor = element.color || '#333333';
        
        switch (element.type) {
          case 'qrCode':
            const qrSize = mmToPx(element.width || 20) * Math.min(scaleFactorX, scaleFactorY);
            return (
              <motion.div 
                key={element.id}
                className="absolute"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  width: `${qrSize}px`,
                  height: `${qrSize}px`,
                }}
                whileHover={isInteractive ? { scale: 1.05 } : undefined}
              >
                <div className="bg-white p-1 h-full w-full flex items-center justify-center rounded-sm shadow-sm">
                  <QRCodeSVG
                    value={element.value || "https://example.com"}
                    size={Math.max(10, qrSize - 4)}
                    bgColor={"#ffffff"}
                    fgColor={element.color || "#333333"}
                    level={"L"}
                    includeMargin={false}
                  />
                </div>
              </motion.div>
            );

          case 'uuidText':
            return (
              <motion.div 
                key={element.id}
                className="absolute truncate"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  fontSize: `${element.fontSize || 6}px`,
                  fontFamily: (element.properties as any)?.fontFamily || 'monospace',
                  fontWeight: (element.properties as any)?.bold ? 'bold' : 'normal',
                  fontStyle: (element.properties as any)?.italic ? 'italic' : 'normal',
                  textDecoration: (element.properties as any)?.strikethrough ? 'line-through' : 'none',
                  maxWidth: `${mmToPx(label.width - element.x) * scaleFactorX}px`,
                  color: textColor
                }}
                whileHover={isInteractive ? { scale: 1.03 } : undefined}
              >
                {element.value}
              </motion.div>
            );
            
          case 'company':
            return (
              <motion.div 
                key={element.id}
                className="absolute truncate"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  fontSize: `${element.fontSize || 8}px`,
                  fontFamily: (element.properties as any)?.fontFamily || 'Arial',
                  fontWeight: (element.properties as any)?.bold ? 'bold' : 'normal',
                  fontStyle: (element.properties as any)?.italic ? 'italic' : 'normal',
                  textDecoration: (element.properties as any)?.strikethrough ? 'line-through' : 'none',
                  maxWidth: `${mmToPx(label.width - element.x) * scaleFactorX}px`,
                  color: textColor
                }}
                whileHover={isInteractive ? { scale: 1.03 } : undefined}
              >
                {element.value}
              </motion.div>
            );
            
          case 'product':
            return (
              <motion.div 
                key={element.id}
                className="absolute truncate"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  fontSize: `${element.fontSize || 7}px`,
                  fontFamily: (element.properties as any)?.fontFamily || 'Arial',
                  fontWeight: (element.properties as any)?.bold ? 'bold' : 'normal',
                  fontStyle: (element.properties as any)?.italic ? 'italic' : 'normal',
                  textDecoration: (element.properties as any)?.strikethrough ? 'line-through' : 'none',
                  maxWidth: `${mmToPx(label.width - element.x) * scaleFactorX}px`,
                  color: textColor
                }}
                whileHover={isInteractive ? { scale: 1.03 } : undefined}
              >
                {element.value}
              </motion.div>
            );
          
          case 'barcode':
            return (
              <motion.div 
                key={element.id}
                className="absolute truncate flex items-center justify-center"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  width: `${mmToPx(element.width || 30) * scaleFactorX}px`,
                  height: `${mmToPx(element.height || 10) * scaleFactorY}px`,
                  backgroundColor: '#ffffff',
                  padding: '1px',
                  borderRadius: '2px'
                }}
                whileHover={isInteractive ? { scale: 1.03 } : undefined}
              >
                <div className="text-xs text-center">Barcode:{element.value || "12345678"}</div>
              </motion.div>
            );
            
          default:
            return null;
        }
      })}
      
      {/* Dodaj efekt nakładki przy braku elementów */}
      {label.elements.length === 0 && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm font-medium"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
        >
          Pusta etykieta
        </motion.div>
      )}
    </WrapperComponent>
  );
}