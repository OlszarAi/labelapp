/**
 * Scrolls to a specific element with smooth behavior and offset
 * @param elementId ID of element to scroll to
 * @param offset Optional pixel offset from the top
 */
export const elementConfigScroll = (elementId: string, offset: number = 50): void => {
  // Prevent execution during SSR
  if (typeof window === 'undefined') return;
  
  setTimeout(() => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, 100); // Small delay to ensure the element is rendered
};

/**
 * Scrolls to a specific element with reference
 * @param elementRef React ref object for the element to scroll to
 * @param offset Optional pixel offset from the top
 */
export const scrollToElementRef = (
  elementRef: React.RefObject<HTMLElement>,
  offset: number = 50
): void => {
  // Prevent execution during SSR
  if (typeof window === 'undefined') return;
  
  if (elementRef.current) {
    const elementPosition = elementRef.current.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

/**
 * Detects if an element is in the viewport
 * @param element HTML element to check
 * @param offset Optional pixel offset to consider the element in view
 * @returns boolean indicating if element is in viewport
 */
export const isElementInViewport = (
  element: HTMLElement,
  offset: number = 0
): boolean => {
  // Prevent execution during SSR
  if (typeof window === 'undefined') return false;
  
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top + offset <= window.innerHeight &&
    rect.bottom >= offset &&
    rect.left <= window.innerWidth &&
    rect.right >= 0
  );
};