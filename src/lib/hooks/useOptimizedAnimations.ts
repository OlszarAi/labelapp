import { useMemo } from 'react';

/**
 * Hook that provides optimized animation settings based on collection size
 * 
 * @param collectionSize - The number of items in the collection
 * @param options - Additional options for customizing optimization thresholds
 * @returns Animation optimization settings
 */
export function useOptimizedAnimations(
  collectionSize: number,
  options?: {
    largeThreshold?: number;
    veryLargeThreshold?: number;
  }
) {
  return useMemo(() => {
    const largeThreshold = options?.largeThreshold || 30;
    const veryLargeThreshold = options?.veryLargeThreshold || 50;
    
    const isLargeCollection = collectionSize > largeThreshold;
    const isVeryLargeCollection = collectionSize > veryLargeThreshold;
    
    // Return animation settings optimized based on collection size
    return {
      isLargeCollection,
      isVeryLargeCollection,
      
      // Container settings
      containerProps: {
        layout: !isLargeCollection,
        transition: {
          duration: isVeryLargeCollection ? 0.1 : isLargeCollection ? 0.2 : 0.6,
          type: "spring",
          stiffness: isLargeCollection ? 200 : 120,
          damping: isLargeCollection ? 25 : 20
        }
      },
      
      // AnimatePresence settings
      presenceProps: {
        mode: isLargeCollection ? "sync" : "popLayout" as "sync" | "popLayout" | "wait"
      },
      
      // Item settings
      getItemProps: (index: number) => ({
        layout: !isLargeCollection,
        layoutId: !isLargeCollection ? `item-${index}` : undefined,
        transition: {
          duration: isVeryLargeCollection ? 0.15 : isLargeCollection ? 0.2 : 0.4,
          delay: isVeryLargeCollection 
            ? 0 
            : isLargeCollection 
              ? Math.min(index * 0.01, 0.2) 
              : index * 0.05,
          ease: isLargeCollection ? "easeOut" : [0.25, 0.1, 0.25, 1.0]
        }
      }),
      
      // Hover animation settings
      hoverProps: {
        scale: isVeryLargeCollection ? 1.005 : isLargeCollection ? 1.01 : 1.03,
        y: isVeryLargeCollection ? -1 : isLargeCollection ? -3 : -7,
        transition: { duration: isLargeCollection ? 0.2 : 0.3 }
      }
    };
  }, [collectionSize, options?.largeThreshold, options?.veryLargeThreshold]);
}
