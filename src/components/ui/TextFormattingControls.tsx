// Text formatting controls for label elements
"use client";

interface TextFormattingControlsProps {
  elementId: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  fontFamily?: string;
  fontSize?: number;
  updateElementProperty: (id: string, property: string, value: any) => void;
}

export default function TextFormattingControls({
  elementId,
  bold = false,
  italic = false,
  strikethrough = false,
  fontFamily = "Arial",
  fontSize,
  updateElementProperty
}: TextFormattingControlsProps) {
  // Available font families
  const fontFamilies = [
    "Arial",
    "Helvetica", 
    "Times New Roman", 
    "Courier New", 
    "Georgia", 
    "Trebuchet MS", 
    "Verdana"
  ];

  return (
    <div className="mt-4 border-t dark:border-gray-700 pt-3">
      <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2 font-medium">Formatowanie tekstu</label>
      
      {/* Text style buttons */}
      <div className="flex space-x-1 mb-3">
        <button
          type="button"
          onClick={() => updateElementProperty(elementId, 'properties.bold', !bold)}
          className={`p-1.5 rounded-md ${
            bold 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          } hover:bg-blue-50 dark:hover:bg-blue-900/50`}
          title="Pogrubienie"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button
          type="button"
          onClick={() => updateElementProperty(elementId, 'properties.italic', !italic)}
          className={`p-1.5 rounded-md ${
            italic 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          } hover:bg-blue-50 dark:hover:bg-blue-900/50`}
          title="Kursywa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M11.54 3.47a.75.75 0 0 1 .79-.47h5.25a.75.75 0 0 1 0 1.5h-2.006l-2.266 12h1.756a.75.75 0 0 1 0 1.5H9.838a.75.75 0 0 1 0-1.5h2.006l2.266-12H12.33a.75.75 0 0 1-.79-.53Z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button
          type="button"
          onClick={() => updateElementProperty(elementId, 'properties.strikethrough', !strikethrough)}
          className={`p-1.5 rounded-md ${
            strikethrough 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          } hover:bg-blue-50 dark:hover:bg-blue-900/50`}
          title="Przekreślenie"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3.75 12a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Font family selection */}
      <div className="mb-3">
        <label className="block text-xs text-gray-700 dark:text-gray-400 mb-1">Czcionka</label>
        <select
          value={fontFamily}
          onChange={(e) => updateElementProperty(elementId, 'properties.fontFamily', e.target.value)}
          className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
        >
          {fontFamilies.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      {/* Font size control */}
      <div>
        <label className="block text-xs text-gray-700 dark:text-gray-400 mb-1">Rozmiar czcionki</label>
        <input
          type="number"
          min="6"
          max="72"
          value={fontSize || 12}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            // Update fontSize - the updateElementProperty function will handle
            // synchronizing with properties.fontSize
            updateElementProperty(elementId, 'fontSize', newSize);
          }}
          className="py-1 px-2 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
        />
      </div>
    </div>
  );
}
18