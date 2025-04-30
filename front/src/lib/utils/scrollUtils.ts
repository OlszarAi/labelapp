/**
 * Funkcja do płynnego przewijania do elementu w panelu konfiguracji
 * 
 * @param elementId - ID elementu DOM do którego chcemy przewinąć
 * @param offset - Dodatkowy offset przewijania (domyślnie 50px)
 */
export const elementConfigScroll = (elementId: string, offset: number = 50): void => {
  setTimeout(() => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      
      // Znajdź kontener przewijania (panel boczny)
      const scrollContainer = element.closest('.overflow-y-auto');
      
      if (scrollContainer) {
        // Przewiń do elementu z offsetem
        scrollContainer.scrollTo({
          top: absoluteElementTop - scrollContainer.getBoundingClientRect().top - offset,
          behavior: 'smooth'
        });
      }
    }
  }, 100); // Małe opóźnienie, aby upewnić się, że element jest już wyrenderowany
};