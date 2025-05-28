/**
 * Keyboard Shortcuts Help Component
 * Displays available keyboard shortcuts in a modal or tooltip
 */

import React from 'react';
import { SHORTCUT_GROUPS, formatShortcut } from '../../lib/keyboard-shortcuts';

interface KeyboardShortcutsHelpProps {
  className?: string;
  showGroups?: (keyof typeof SHORTCUT_GROUPS)[];
  compact?: boolean;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  className = '',
  showGroups,
  compact = false
}) => {
  const groupsToShow = showGroups || Object.keys(SHORTCUT_GROUPS) as (keyof typeof SHORTCUT_GROUPS)[];

  if (compact) {
    return (
      <div className={`keyboard-shortcuts-help-compact ${className}`}>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          {groupsToShow.slice(0, 3).map(groupName => (
            <div key={groupName} className="flex flex-wrap gap-2">
              {SHORTCUT_GROUPS[groupName].slice(0, 2).map(({ key, description }) => (
                <span key={key} className="inline-flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                    {formatShortcut(key)}
                  </kbd>
                  <span className="text-xs">{description.split(' ')[0]}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`keyboard-shortcuts-help ${className}`}>
      <div className="space-y-6">
        {groupsToShow.map(groupName => (
          <div key={groupName} className="shortcut-group">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {groupName}
            </h3>
            <div className="space-y-2">
              {SHORTCUT_GROUPS[groupName].map(({ key, description }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {description}
                  </span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm font-mono rounded border border-gray-300 dark:border-gray-600">
                    {formatShortcut(key)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
