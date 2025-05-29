"use client";

import React from 'react';
import FabricEditorLayout from '@/components/fabric-editor/FabricEditorLayout';

export default function TestFabricLayoutPage() {
  return (
    <div className="h-screen">
      <FabricEditorLayout 
        projectId="test-project"
        canvasId="test-canvas"
      />
    </div>
  );
}
