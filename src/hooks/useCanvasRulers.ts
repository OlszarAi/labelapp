/**
 * Canvas Rulers Hook
 * Professional ruler functionality with measurements, grid snapping, and mouse tracking
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fabric } from 'fabric';

export interface RulerGuide {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number; // In canvas units
  color?: string;
  isVisible: boolean;
  isLocked: boolean;
}

export interface RulerMeasurement {
  start: { x: number; y: number };
  end: { x: number; y: number };
  distance: number;
  angle: number;
  unit: string;
}

interface UseCanvasRulersOptions {
  canvas?: fabric.Canvas | null;
  unit?: 'px' | 'mm' | 'cm' | 'in';
  showGuides?: boolean;
  snapToGuides?: boolean;
  guideTolerance?: number;
}

interface UseCanvasRulersReturn {
  // Mouse tracking
  mousePosition: { x: number | null; y: number | null };
  
  // Guides management
  guides: RulerGuide[];
  addGuide: (orientation: 'horizontal' | 'vertical', position: number) => void;
  removeGuide: (id: string) => void;
  updateGuide: (id: string, updates: Partial<RulerGuide>) => void;
  clearGuides: () => void;
  
  // Measurements
  activeMeasurement: RulerMeasurement | null;
  measurements: RulerMeasurement[];
  startMeasurement: (point: { x: number; y: number }) => void;
  updateMeasurement: (point: { x: number; y: number }) => void;
  finishMeasurement: () => void;
  clearMeasurements: () => void;
  
  // Utility functions
  snapToGuides: (point: { x: number; y: number }) => { x: number; y: number };
  getVisibleGuides: (viewport: { left: number; top: number; right: number; bottom: number }) => RulerGuide[];
  formatDistance: (distance: number, precision?: number) => string;
  
  // Event handlers
  handleMouseMove: (e: MouseEvent) => void;
  handleCanvasMouseDown: (e: fabric.IEvent) => void;
  handleCanvasMouseMove: (e: fabric.IEvent) => void;
  handleCanvasMouseUp: (e: fabric.IEvent) => void;
}

// Unit conversion factors to pixels (assuming 96 DPI)
const UNIT_FACTORS = {
  px: 1,
  mm: 96 / 25.4,
  cm: 96 / 2.54,
  in: 96
};

export const useCanvasRulers = ({
  canvas = null,
  unit = 'px',
  showGuides = true,
  snapToGuides: enableSnapToGuides = true,
  guideTolerance = 5
}: UseCanvasRulersOptions = {}): UseCanvasRulersReturn => {
  
  const [mousePosition, setMousePosition] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null
  });
  
  const [guides, setGuides] = useState<RulerGuide[]>([]);
  const [activeMeasurement, setActiveMeasurement] = useState<RulerMeasurement | null>(null);
  const [measurements, setMeasurements] = useState<RulerMeasurement[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);

  // Generate unique ID for guides and measurements
  const generateId = useCallback(() => {
    return `ruler_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add a new guide
  const addGuide = useCallback((orientation: 'horizontal' | 'vertical', position: number) => {
    const newGuide: RulerGuide = {
      id: generateId(),
      orientation,
      position,
      color: '#3b82f6',
      isVisible: true,
      isLocked: false
    };
    
    setGuides(prev => [...prev, newGuide]);
  }, [generateId]);

  // Remove a guide
  const removeGuide = useCallback((id: string) => {
    setGuides(prev => prev.filter(guide => guide.id !== id));
  }, []);

  // Update a guide
  const updateGuide = useCallback((id: string, updates: Partial<RulerGuide>) => {
    setGuides(prev => prev.map(guide => 
      guide.id === id ? { ...guide, ...updates } : guide
    ));
  }, []);

  // Clear all guides
  const clearGuides = useCallback(() => {
    setGuides([]);
  }, []);

  // Snap point to guides
  const snapToGuides = useCallback((point: { x: number; y: number }) => {
    if (!enableSnapToGuides || guides.length === 0) return point;

    let snappedX = point.x;
    let snappedY = point.y;

    // Check horizontal guides (snap Y coordinate)
    for (const guide of guides) {
      if (guide.orientation === 'horizontal' && guide.isVisible && !guide.isLocked) {
        if (Math.abs(point.y - guide.position) <= guideTolerance) {
          snappedY = guide.position;
          break;
        }
      }
    }

    // Check vertical guides (snap X coordinate)
    for (const guide of guides) {
      if (guide.orientation === 'vertical' && guide.isVisible && !guide.isLocked) {
        if (Math.abs(point.x - guide.position) <= guideTolerance) {
          snappedX = guide.position;
          break;
        }
      }
    }

    return { x: snappedX, y: snappedY };
  }, [guides, enableSnapToGuides, guideTolerance]);

  // Get visible guides within viewport
  const getVisibleGuides = useCallback((viewport: { left: number; top: number; right: number; bottom: number }) => {
    return guides.filter(guide => {
      if (!guide.isVisible) return false;
      
      if (guide.orientation === 'horizontal') {
        return guide.position >= viewport.top && guide.position <= viewport.bottom;
      } else {
        return guide.position >= viewport.left && guide.position <= viewport.right;
      }
    });
  }, [guides]);

  // Format distance with unit
  const formatDistance = useCallback((distance: number, precision = 1) => {
    const factor = UNIT_FACTORS[unit];
    const unitDistance = distance / factor;
    return `${unitDistance.toFixed(precision)}${unit}`;
  }, [unit]);

  // Calculate distance and angle between two points
  const calculateMeasurement = useCallback((start: { x: number; y: number }, end: { x: number; y: number }): RulerMeasurement => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    return {
      start,
      end,
      distance,
      angle,
      unit
    };
  }, [unit]);

  // Start a new measurement
  const startMeasurement = useCallback((point: { x: number; y: number }) => {
    const snappedPoint = snapToGuides(point);
    setActiveMeasurement({
      start: snappedPoint,
      end: snappedPoint,
      distance: 0,
      angle: 0,
      unit
    });
    setIsMeasuring(true);
  }, [snapToGuides, unit]);

  // Update active measurement
  const updateMeasurement = useCallback((point: { x: number; y: number }) => {
    if (!activeMeasurement) return;
    
    const snappedPoint = snapToGuides(point);
    const updatedMeasurement = calculateMeasurement(activeMeasurement.start, snappedPoint);
    setActiveMeasurement(updatedMeasurement);
  }, [activeMeasurement, snapToGuides, calculateMeasurement]);

  // Finish current measurement
  const finishMeasurement = useCallback(() => {
    if (!activeMeasurement) return;
    
    // Only save if there's actual distance
    if (activeMeasurement.distance > 1) {
      setMeasurements(prev => [...prev, activeMeasurement]);
    }
    
    setActiveMeasurement(null);
    setIsMeasuring(false);
  }, [activeMeasurement]);

  // Clear all measurements
  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
    setActiveMeasurement(null);
    setIsMeasuring(false);
  }, []);

  // Handle mouse move on container
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvas) return;

    const canvasElement = canvas.getElement();
    const rect = canvasElement.getBoundingClientRect();
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    
    // Convert screen coordinates to canvas coordinates
    const x = (e.clientX - rect.left - vpt[4]) / vpt[0];
    const y = (e.clientY - rect.top - vpt[5]) / vpt[3];
    
    setMousePosition({ x, y });
  }, [canvas]);

  // Handle canvas mouse down for measurements
  const handleCanvasMouseDown = useCallback((e: fabric.IEvent) => {
    if (!canvas || !e.pointer) return;

    // Check if measurement mode is active (could be controlled by external state)
    // For now, we'll use Shift+Click to start measurements
    const originalEvent = e.e as MouseEvent;
    if (originalEvent.shiftKey) {
      originalEvent.preventDefault();
      startMeasurement(e.pointer);
    }
  }, [canvas, startMeasurement]);

  // Handle canvas mouse move for active measurements
  const handleCanvasMouseMove = useCallback((e: fabric.IEvent) => {
    if (!canvas || !e.pointer || !isMeasuring) return;
    
    updateMeasurement(e.pointer);
  }, [canvas, isMeasuring, updateMeasurement]);

  // Handle canvas mouse up
  const handleCanvasMouseUp = useCallback((e: fabric.IEvent) => {
    if (!canvas || !isMeasuring) return;
    
    finishMeasurement();
  }, [canvas, isMeasuring, finishMeasurement]);

  // Set up canvas event listeners
  useEffect(() => {
    if (!canvas) return;

    canvas.on('mouse:down', handleCanvasMouseDown);
    canvas.on('mouse:move', handleCanvasMouseMove);
    canvas.on('mouse:up', handleCanvasMouseUp);

    return () => {
      canvas.off('mouse:down', handleCanvasMouseDown);
      canvas.off('mouse:move', handleCanvasMouseMove);
      canvas.off('mouse:up', handleCanvasMouseUp);
    };
  }, [canvas, handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp]);

  // Render guides on canvas
  useEffect(() => {
    if (!canvas || !showGuides) return;

    // Clear existing guide objects
    const existingGuides = canvas.getObjects().filter((obj: any) => obj.isRulerGuide);
    existingGuides.forEach(guide => canvas.remove(guide));

    // Add visible guides
    guides.forEach(guide => {
      if (!guide.isVisible) return;

      const line = new fabric.Line([
        guide.orientation === 'vertical' ? guide.position : 0,
        guide.orientation === 'horizontal' ? guide.position : 0,
        guide.orientation === 'vertical' ? guide.position : canvas.width || 0,
        guide.orientation === 'horizontal' ? guide.position : canvas.height || 0
      ], {
        stroke: guide.color || '#3b82f6',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        isRulerGuide: true
      } as any);

      canvas.add(line);
    });

    canvas.renderAll();

    return () => {
      // Cleanup guides when component unmounts
      const guidesToRemove = canvas.getObjects().filter((obj: any) => obj.isRulerGuide);
      guidesToRemove.forEach(guide => canvas.remove(guide));
    };
  }, [canvas, guides, showGuides]);

  return {
    mousePosition,
    guides,
    addGuide,
    removeGuide,
    updateGuide,
    clearGuides,
    activeMeasurement,
    measurements,
    startMeasurement,
    updateMeasurement,
    finishMeasurement,
    clearMeasurements,
    snapToGuides,
    getVisibleGuides,
    formatDistance,
    handleMouseMove,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp
  };
};
