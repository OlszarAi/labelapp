/**
 * Keyboard Shortcuts Utilities
 * Helper functions and constants for keyboard shortcuts
 */

// Platform detection
export const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
export const modifierKey = isMac ? 'Cmd' : 'Ctrl';

// Shortcut key combinations
export const SHORTCUTS = {
  // History
  UNDO: isMac ? 'Cmd+Z' : 'Ctrl+Z',
  REDO: isMac ? 'Cmd+Shift+Z' : 'Ctrl+Y',
  
  // Clipboard
  COPY: isMac ? 'Cmd+C' : 'Ctrl+C',
  PASTE: isMac ? 'Cmd+V' : 'Ctrl+V',
  DUPLICATE: isMac ? 'Cmd+D' : 'Ctrl+D',
  
  // Selection
  SELECT_ALL: isMac ? 'Cmd+A' : 'Ctrl+A',
  DESELECT: 'Esc',
  DELETE: 'Del',
  
  // Movement
  MOVE_UP: '↑',
  MOVE_DOWN: '↓',
  MOVE_LEFT: '←',
  MOVE_RIGHT: '→',
  MOVE_FAST: 'Shift + Arrow',
  
  // Zoom
  ZOOM_IN: isMac ? 'Cmd+Plus' : 'Ctrl+Plus',
  ZOOM_OUT: isMac ? 'Cmd+Minus' : 'Ctrl+Minus',
  FIT_TO_SCREEN: isMac ? 'Cmd+0' : 'Ctrl+0',
  
  // Pan
  PAN: 'Space + Drag',
  
  // View
  TOGGLE_GRID: 'G',
  TOGGLE_RULERS: 'R',
  
  // Tools
  TEXT_TOOL: 'T',
  QR_CODE_TOOL: 'Q',
  UUID_TOOL: 'U',
  
  // Help
  SHOW_HELP: '?'
} as const;

// Shortcut descriptions
export const SHORTCUT_DESCRIPTIONS = {
  [SHORTCUTS.UNDO]: 'Undo last action',
  [SHORTCUTS.REDO]: 'Redo last undone action',
  [SHORTCUTS.COPY]: 'Copy selected objects',
  [SHORTCUTS.PASTE]: 'Paste copied objects',
  [SHORTCUTS.DUPLICATE]: 'Duplicate selected objects',
  [SHORTCUTS.SELECT_ALL]: 'Select all objects',
  [SHORTCUTS.DESELECT]: 'Deselect all objects',
  [SHORTCUTS.DELETE]: 'Delete selected objects',
  [SHORTCUTS.MOVE_UP]: 'Move selected objects up',
  [SHORTCUTS.MOVE_DOWN]: 'Move selected objects down',
  [SHORTCUTS.MOVE_LEFT]: 'Move selected objects left',
  [SHORTCUTS.MOVE_RIGHT]: 'Move selected objects right',
  [SHORTCUTS.MOVE_FAST]: 'Move selected objects 10px',
  [SHORTCUTS.ZOOM_IN]: 'Zoom in',
  [SHORTCUTS.ZOOM_OUT]: 'Zoom out',
  [SHORTCUTS.FIT_TO_SCREEN]: 'Fit canvas to screen',
  [SHORTCUTS.PAN]: 'Pan canvas view',
  [SHORTCUTS.TOGGLE_GRID]: 'Toggle grid visibility',
  [SHORTCUTS.TOGGLE_RULERS]: 'Toggle ruler visibility',
  [SHORTCUTS.TEXT_TOOL]: 'Activate text tool',
  [SHORTCUTS.QR_CODE_TOOL]: 'Activate QR code tool',
  [SHORTCUTS.UUID_TOOL]: 'Activate UUID tool',
  [SHORTCUTS.SHOW_HELP]: 'Show keyboard shortcuts help'
} as const;

// Helper functions
export const formatShortcut = (shortcut: string): string => {
  return shortcut
    .replace('Cmd', '⌘')
    .replace('Ctrl', '⌃')
    .replace('Shift', '⇧')
    .replace('Alt', '⌥')
    .replace('Plus', '+')
    .replace('Minus', '-')
    .replace('Del', '⌫')
    .replace('Esc', '⎋')
    .replace('Space', '␣');
};

export const getShortcutTooltip = (action: string, description?: string): string => {
  const shortcut = SHORTCUTS[action as keyof typeof SHORTCUTS];
  const desc = description || SHORTCUT_DESCRIPTIONS[shortcut as keyof typeof SHORTCUT_DESCRIPTIONS];
  
  if (!shortcut || !desc) return '';
  
  return `${desc} (${formatShortcut(shortcut)})`;
};

// Shortcut groups for help/documentation
export const SHORTCUT_GROUPS = {
  'History': [
    { key: SHORTCUTS.UNDO, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.UNDO] },
    { key: SHORTCUTS.REDO, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.REDO] }
  ],
  'Clipboard': [
    { key: SHORTCUTS.COPY, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.COPY] },
    { key: SHORTCUTS.PASTE, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.PASTE] },
    { key: SHORTCUTS.DUPLICATE, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.DUPLICATE] }
  ],
  'Selection': [
    { key: SHORTCUTS.SELECT_ALL, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.SELECT_ALL] },
    { key: SHORTCUTS.DESELECT, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.DESELECT] },
    { key: SHORTCUTS.DELETE, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.DELETE] }
  ],
  'Movement': [
    { key: SHORTCUTS.MOVE_UP, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.MOVE_UP] },
    { key: SHORTCUTS.MOVE_DOWN, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.MOVE_DOWN] },
    { key: SHORTCUTS.MOVE_LEFT, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.MOVE_LEFT] },
    { key: SHORTCUTS.MOVE_RIGHT, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.MOVE_RIGHT] },
    { key: SHORTCUTS.MOVE_FAST, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.MOVE_FAST] }
  ],
  'Zoom & View': [
    { key: SHORTCUTS.ZOOM_IN, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.ZOOM_IN] },
    { key: SHORTCUTS.ZOOM_OUT, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.ZOOM_OUT] },
    { key: SHORTCUTS.FIT_TO_SCREEN, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.FIT_TO_SCREEN] },
    { key: SHORTCUTS.PAN, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.PAN] },
    { key: SHORTCUTS.TOGGLE_GRID, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.TOGGLE_GRID] },
    { key: SHORTCUTS.TOGGLE_RULERS, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.TOGGLE_RULERS] }
  ],
  'Tools': [
    { key: SHORTCUTS.TEXT_TOOL, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.TEXT_TOOL] },
    { key: SHORTCUTS.QR_CODE_TOOL, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.QR_CODE_TOOL] },
    { key: SHORTCUTS.UUID_TOOL, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.UUID_TOOL] }
  ],
  'Help': [
    { key: SHORTCUTS.SHOW_HELP, description: SHORTCUT_DESCRIPTIONS[SHORTCUTS.SHOW_HELP] }
  ]
} as const;
