/**
 * Ruler Component
 * Professional canvas rulers with precise measurements and zoom awareness
 */

import React, { useMemo } from 'react';

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  length: number; // Canvas dimension in pixels
  zoom: number;
  offset: number; // Viewport offset
  unit: 'px' | 'mm' | 'cm' | 'in';
  mousePosition?: { x: number | null; y: number | null };
  className?: string;
  style?: React.CSSProperties;
}

// Unit conversion factors to pixels (assuming 96 DPI)
const UNIT_FACTORS = {
  px: 1,
  mm: 96 / 25.4,
  cm: 96 / 2.54,
  in: 96
};

const Ruler: React.FC<RulerProps> = ({
  orientation,
  length,
  zoom,
  offset,
  unit = 'px',
  mousePosition,
  className = '',
  style = {}
}) => {
  // Calculate tick marks and labels
  const { ticks, minorTicks } = useMemo(() => {
    const factor = UNIT_FACTORS[unit];
    const scaledLength = length * zoom;
    const visibleStart = -offset / zoom;
    const visibleEnd = visibleStart + (scaledLength / zoom);
    
    // Determine optimal tick spacing based on zoom
    let baseSpacing = 50; // Base spacing in pixels
    if (zoom < 0.25) baseSpacing = 200;
    else if (zoom < 0.5) baseSpacing = 100;
    else if (zoom < 1) baseSpacing = 50;
    else if (zoom < 2) baseSpacing = 25;
    else if (zoom < 4) baseSpacing = 10;
    else baseSpacing = 5;
    
    // Convert to current unit
    const unitSpacing = baseSpacing / factor;
    
    // Generate major ticks
    const majorTicks: Array<{ position: number; label: string }> = [];
    const minorTicksArray: Array<{ position: number }> = [];
    
    const startTick = Math.floor(visibleStart / unitSpacing) * unitSpacing;
    const endTick = Math.ceil(visibleEnd / unitSpacing) * unitSpacing;
    
    for (let tick = startTick; tick <= endTick; tick += unitSpacing) {
      const pixelPosition = tick * factor * zoom + offset;
      
      if (pixelPosition >= -10 && pixelPosition <= scaledLength + 10) {
        majorTicks.push({
          position: pixelPosition,
          label: formatLabel(tick, unit)
        });
        
        // Add minor ticks between major ticks
        for (let i = 1; i < 5; i++) {
          const minorTick = tick + (unitSpacing / 5) * i;
          const minorPosition = minorTick * factor * zoom + offset;
          
          if (minorPosition >= -10 && minorPosition <= scaledLength + 10) {
            minorTicksArray.push({ position: minorPosition });
          }
        }
      }
    }
    
    return { ticks: majorTicks, minorTicks: minorTicksArray };
  }, [length, zoom, offset, unit]);
  
  // Mouse position indicator
  const mouseIndicator = useMemo(() => {
    if (!mousePosition) return null;
    
    const pos = orientation === 'horizontal' ? mousePosition.x : mousePosition.y;
    if (pos === null) return null;
    
    const pixelPosition = pos * zoom + offset;
    const unitValue = pos / UNIT_FACTORS[unit];
    
    return {
      position: pixelPosition,
      label: formatLabel(unitValue, unit, true)
    };
  }, [mousePosition, orientation, zoom, offset, unit]);

  const rulerSize = orientation === 'horizontal' ? length * zoom : length * zoom;
  const rulerStyle: React.CSSProperties = {
    width: orientation === 'horizontal' ? rulerSize : 24,
    height: orientation === 'vertical' ? rulerSize : 24,
    ...style
  };

  return (
    <div 
      className={`ruler ruler-${orientation} ${className}`}
      style={rulerStyle}
    >
      <svg
        width={orientation === 'horizontal' ? rulerSize : 24}
        height={orientation === 'vertical' ? rulerSize : 24}
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        {/* Background */}
        <rect
          width="100%"
          height="100%"
          fill="rgb(229, 231, 235)"
          className="dark:fill-neutral-700"
        />
        
        {/* Major tick marks */}
        {ticks.map((tick, index) => (
          <g key={`major-${index}`}>
            <line
              x1={orientation === 'horizontal' ? tick.position : 0}
              y1={orientation === 'horizontal' ? 16 : tick.position}
              x2={orientation === 'horizontal' ? tick.position : 24}
              y2={orientation === 'horizontal' ? 24 : tick.position}
              stroke="rgb(75, 85, 99)"
              strokeWidth="1"
              className="dark:stroke-neutral-400"
            />
            <text
              x={orientation === 'horizontal' ? tick.position : 12}
              y={orientation === 'horizontal' ? 12 : tick.position - 2}
              fontSize="9"
              fill="rgb(75, 85, 99)"
              className="dark:fill-neutral-400"
              textAnchor="middle"
              dominantBaseline={orientation === 'horizontal' ? 'central' : 'auto'}
              transform={orientation === 'vertical' ? `rotate(-90, 12, ${tick.position - 2})` : undefined}
            >
              {tick.label}
            </text>
          </g>
        ))}
        
        {/* Minor tick marks */}
        {minorTicks.map((tick, index) => (
          <line
            key={`minor-${index}`}
            x1={orientation === 'horizontal' ? tick.position : 0}
            y1={orientation === 'horizontal' ? 20 : tick.position}
            x2={orientation === 'horizontal' ? tick.position : 12}
            y2={orientation === 'horizontal' ? 24 : tick.position}
            stroke="rgb(156, 163, 175)"
            strokeWidth="0.5"
            className="dark:stroke-neutral-500"
          />
        ))}
        
        {/* Mouse position indicator */}
        {mouseIndicator && (
          <g>
            <line
              x1={orientation === 'horizontal' ? mouseIndicator.position : 0}
              y1={orientation === 'horizontal' ? 0 : mouseIndicator.position}
              x2={orientation === 'horizontal' ? mouseIndicator.position : 24}
              y2={orientation === 'horizontal' ? 24 : mouseIndicator.position}
              stroke="rgb(239, 68, 68)"
              strokeWidth="1"
              className="dark:stroke-red-400"
            />
            <circle
              cx={orientation === 'horizontal' ? mouseIndicator.position : 12}
              cy={orientation === 'horizontal' ? 12 : mouseIndicator.position}
              r="2"
              fill="rgb(239, 68, 68)"
              className="dark:fill-red-400"
            />
            {/* Position tooltip */}
            <g>
              <rect
                x={orientation === 'horizontal' ? mouseIndicator.position - 15 : 26}
                y={orientation === 'horizontal' ? -2 : mouseIndicator.position - 8}
                width="30"
                height="12"
                fill="rgb(31, 41, 55)"
                className="dark:fill-neutral-900"
                rx="2"
              />
              <text
                x={orientation === 'horizontal' ? mouseIndicator.position : 41}
                y={orientation === 'horizontal' ? 5 : mouseIndicator.position - 1}
                fontSize="8"
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {mouseIndicator.label}
              </text>
            </g>
          </g>
        )}
        
        {/* Border */}
        <rect
          width="100%"
          height="100%"
          fill="none"
          stroke="rgb(209, 213, 219)"
          strokeWidth="1"
          className="dark:stroke-neutral-600"
        />
      </svg>
    </div>
  );
};

// Helper function to format labels
function formatLabel(value: number, unit: string, precise = false): string {
  if (precise) {
    return `${value.toFixed(1)}${unit}`;
  }
  
  if (Math.abs(value) < 1) {
    return `${value.toFixed(1)}${unit}`;
  }
  
  return `${Math.round(value)}${unit}`;
}

export default Ruler;
