# Fabric.js Label Editor Rebuild Plan

## Overview

Complete rebuild of the current DOM-based label editor to use Fabric.js for enhanced performance, better object manipulation, and modern development patterns. This plan is inspired by the adrianhajdin/figma_clone repository and adapts its best practices for our label design needs.

## Current State Analysis

### Existing DOM-Based Editor Issues
- Manual drag/drop implementation (1047+ lines in LabelEditor.tsx)
- Complex zoom and pan logic with transform calculations
- No native undo/redo functionality
- Limited object manipulation capabilities
- Performance issues with large numbers of elements
- Difficult to maintain and extend

### Fabric.js Benefits
- Native object manipulation (drag, resize, rotate)
- Built-in undo/redo system
- Superior canvas performance
- Better event handling
- Extensible object system
- Real-time collaboration support

## Architecture Overview

### Frontend Structure
```
src/
├── components/
│   ├── fabric-editor/
│   │   ├── FabricCanvas.tsx          # Main canvas component
│   │   ├── Toolbar.tsx               # Tool selection
│   │   ├── PropertiesPanel.tsx       # Object properties
│   │   ├── LayersPanel.tsx           # Object layers
│   │   └── ElementLibrary.tsx        # Predefined elements
│   └── ui/
│       ├── Button.tsx                # (existing)
│       ├── Input.tsx                 # (existing)
│       └── Select.tsx                # (existing)
├── hooks/
│   ├── useFabricCanvas.ts            # Canvas management
│   ├── useKeyboardShortcuts.ts       # Shortcuts handler
│   └── useCanvasHistory.ts           # Undo/redo system
├── lib/
│   ├── fabric-utils.ts               # Fabric.js utilities
│   └── canvas-objects.ts             # Custom object types
└── types/
    ├── fabric.ts                     # Fabric.js type extensions
    └── canvas.ts                     # Canvas-specific types
```

### Backend Structure
```
src/
├── models/
│   ├── FabricCanvas.ts               # New canvas model
│   ├── FabricObject.ts               # Canvas objects
│   └── CanvasHistory.ts              # History/versions
├── controllers/
│   ├── fabricCanvasController.ts     # Canvas CRUD
│   └── migrationController.ts        # Migration from old format
├── services/
│   ├── canvasSerializer.ts           # Canvas serialization
│   └── migrationService.ts           # Data migration
└── routes/
    ├── fabricCanvas.ts
    └── migration.ts
```

## Implementation Phases

---

## Phase 1: Project Setup & Dependencies (2 hours)

### Task 1.1: Install Fabric.js Dependencies
**Estimated Time:** 30 minutes

**Prompt:**
```
Install and configure Fabric.js dependencies for the label editor rebuild:

Frontend packages:
- fabric: ^5.3.0
- @types/fabric: ^5.3.0
- uuid: ^9.0.0
- @types/uuid: ^9.0.0

Update package.json files and ensure TypeScript configurations support Fabric.js types.
```

### Task 1.2: Create Base Fabric Canvas Component
**Estimated Time:** 1 hour

**Prompt:**
```
Create a basic Fabric.js canvas component at src/components/fabric-editor/FabricCanvas.tsx:

Requirements:
- Initialize Fabric.js canvas with proper dimensions
- Handle canvas mounting/unmounting
- Basic zoom and pan functionality
- Canvas background with grid (optional)
- Proper TypeScript typing
- Canvas resize handling
- Basic object selection styling

Reference the current LabelEditor.tsx zoom and pan logic but implement using Fabric.js native methods.
```

### Task 1.3: Setup Fabric Types and Utilities
**Estimated Time:** 30 minutes

**Prompt:**
```
Create TypeScript definitions and utility functions:

Files to create:
1. src/types/fabric.ts - Extend Fabric.js types for our needs
2. src/types/canvas.ts - Canvas-specific interfaces
3. src/lib/fabric-utils.ts - Common Fabric.js helper functions

Include types for:
- Custom object properties (id, metadata, locked state)
- Canvas state interface
- Tool types (select, text, rectangle, circle, etc.)

Utility functions for:
- Object serialization/deserialization
- Canvas state management
- Coordinate transformations
```

---

## Phase 2: Core Canvas Engine (4 hours)

### Task 2.1: Canvas Management Hook
**Estimated Time:** 1.5 hours

**Prompt:**
```
Create src/hooks/useFabricCanvas.ts hook for canvas state management:

Features:
- Canvas initialization and cleanup
- Object creation methods (text, shapes, images)
- Object selection and deselection
- Canvas zoom and pan with limits
- Canvas size management
- Object deletion and duplication
- Canvas serialization/deserialization

The hook should return:
- canvas instance
- selected objects
- zoom level
- canvas dimensions
- methods for object manipulation
- canvas state (loading, error, etc.)

Reference current LabelEditor.tsx methods but adapt for Fabric.js patterns.
```

### Task 2.2: Keyboard Shortcuts System
**Estimated Time:** 1 hour

**Prompt:**
```
Create src/hooks/useKeyboardShortcuts.ts for keyboard handling:

Shortcuts to implement:
- Ctrl+Z/Cmd+Z: Undo
- Ctrl+Y/Cmd+Y: Redo
- Delete/Backspace: Delete selected objects
- Ctrl+C/Cmd+C: Copy
- Ctrl+V/Cmd+V: Paste
- Ctrl+D/Cmd+D: Duplicate
- Ctrl+A/Cmd+A: Select all
- Escape: Deselect all
- Arrow keys: Move selected objects
- Ctrl+Plus/Minus: Zoom in/out
- Space+drag: Pan canvas

The hook should:
- Prevent default browser behavior appropriately
- Handle multiple object selection
- Work with canvas focus state
- Be easily extensible for new shortcuts
```

### Task 2.3: Canvas History System (Undo/Redo)
**Estimated Time:** 1.5 hours

**Prompt:**
```
Create src/hooks/useCanvasHistory.ts for undo/redo functionality:

Features:
- Track canvas state changes
- Maintain history stack with size limits
- Undo/redo operations
- History compression for performance
- Ignore minor changes (cursor movement, selection)
- Clear history when needed

Implementation details:
- Use Fabric.js canvas serialization
- Debounce state captures
- Handle large canvas states efficiently
- Integrate with keyboard shortcuts
- Provide history metadata (action type, timestamp)

The hook should work seamlessly with object modifications, additions, and deletions.
```

---

## Phase 3: UI Components & Panels (3 hours)

### Task 3.1: Toolbar Component
**Estimated Time:** 1 hour

**Prompt:**
```
Create src/components/fabric-editor/Toolbar.tsx with tool selection:

Tools to include:
- Select tool (default)
- Text tool
- Rectangle tool
- Circle/Ellipse tool
- Line tool
- Freehand drawing (if needed)
- Image upload tool
- Zoom controls

Features:
- Visual tool selection state
- Tool-specific cursors
- Keyboard shortcuts display
- Responsive design
- Icon-based interface with tooltips

Style similar to modern design tools (Figma/Sketch) with clean, minimal interface.
```

### Task 3.2: Properties Panel
**Estimated Time:** 1.5 hours

**Prompt:**
```
Create src/components/fabric-editor/PropertiesPanel.tsx for object properties:

Properties to edit:
- Position (x, y coordinates)
- Size (width, height with aspect ratio lock)
- Rotation angle
- Colors (fill, stroke)
- Stroke width and style
- Opacity/transparency
- Text properties (font, size, alignment)
- Layer order (bring to front/back)
- Lock/unlock objects

Features:
- Different panels for different object types
- Real-time property updates
- Input validation and constraints
- Color picker integration
- Numeric input with units
- Property reset options

Show/hide based on current selection, with smooth transitions.
```

### Task 3.3: Layers Panel
**Estimated Time:** 30 minutes

**Prompt:**
```
Create src/components/fabric-editor/LayersPanel.tsx for object management:

Features:
- List all canvas objects in hierarchical order
- Drag and drop to reorder layers
- Show/hide objects (visibility toggle)
- Lock/unlock objects
- Object renaming
- Object type icons
- Selection highlighting

UI should be similar to layer panels in design software with:
- Compact list design
- Clear visual hierarchy
- Easy interaction patterns
- Smooth animations for reordering
```

---

## Phase 4: Advanced Features (2.5 hours)

### Task 4.1: Custom Fabric Objects
**Estimated Time:** 2 hours

**Prompt:**
```
Create src/lib/canvas-objects.ts with custom Fabric.js object types:

Custom objects needed:
1. LabelText - Enhanced text with label-specific properties
2. LabelImage - Image handling with constraints
3. LabelShape - Custom shapes for labels (arrows, symbols)
4. TemplateGroup - Grouped objects that move together

Each custom object should:
- Extend appropriate Fabric.js base classes
- Include custom properties (id, metadata, constraints)
- Have custom serialization methods
- Support label-specific behaviors
- Include validation logic

Also create factory functions for easy object creation and registration with Fabric.js.
```

### Task 4.2: Canvas Export and Import
**Estimated Time:** 30 minutes

**Prompt:**
```
Create canvas export/import functionality in src/lib/fabric-utils.ts:

Export formats:
- JSON (for saving/loading)
- PNG/JPEG (for image export)
- SVG (for vector export)
- PDF (for printing)

Import formats:
- JSON (restore canvas state)
- Images (PNG, JPEG, SVG)
- Legacy format migration

Features:
- High-quality exports with custom DPI
- Preserve all object properties
- Handle large canvas exports
- Progress indicators for large operations
- Error handling and validation
```

---

## Phase 5: Backend Integration (3 hours)

### Task 5.1: New Database Models
**Estimated Time:** 1 hour

**Prompt:**
```
Create new Prisma models in prisma/schema.prisma for Fabric.js support:

Models needed:
1. FabricCanvas
   - id, projectId, labelId
   - canvasData (JSON)
   - version, createdAt, updatedAt
   - width, height, backgroundColor

2. FabricObject
   - id, canvasId
   - objectData (JSON)
   - objectType, zIndex
   - createdAt, updatedAt

3. CanvasHistory
   - id, canvasId, userId
   - snapshot (JSON)
   - action, timestamp

Keep existing models unchanged for backward compatibility.
```

### Task 5.2: Fabric Canvas Controller
**Estimated Time:** 2 hours

**Prompt:**
```
Create src/controllers/fabricCanvasController.ts with endpoints:

Endpoints:
- POST /api/fabric/canvas - Create new canvas
- GET /api/fabric/canvas/:id - Get canvas data
- PUT /api/fabric/canvas/:id - Update canvas
- DELETE /api/fabric/canvas/:id - Delete canvas
- GET /api/fabric/canvas/:id/history - Get canvas history
- POST /api/fabric/canvas/:id/restore/:versionId - Restore version

Features:
- Canvas data validation
- Version management
- Automatic history snapshots
- Performance optimizations for large canvases
- Error handling and logging
- Access control and permissions
```

---

## Phase 6: Canvas Features & Migration (4 hours)

### Task 6.1: Data Migration System
**Estimated Time:** 2 hours

**Prompt:**
```
Create src/services/migrationService.ts to migrate existing labels:

Migration tasks:
1. Analyze current DOM-based label structure
2. Convert elements to Fabric.js objects
3. Preserve positioning, styling, and properties
4. Handle edge cases and validation
5. Create rollback mechanisms

Create migration endpoints:
- POST /api/migration/analyze/:labelId - Analyze migration needs
- POST /api/migration/migrate/:labelId - Perform migration
- POST /api/migration/rollback/:labelId - Rollback migration
- GET /api/migration/status/:labelId - Check migration status

The migration should be:
- Non-destructive (keep original data)
- Resumable if interrupted
- Well-logged for debugging
- Testable with validation
```

### Task 6.2: Advanced Canvas Features
**Estimated Time:** 1.5 hours

**Prompt:**
```
Implement advanced canvas features in existing components:

Features to add:
1. Grid and snap functionality
   - Configurable grid size
   - Snap to grid toggle
   - Smart guides for alignment

2. Image handling improvements
   - Drag and drop image uploads
   - Image cropping and filters
   - Background image support

3. Text enhancements
   - Rich text formatting
   - Font management
   - Text along paths

4. Selection improvements
   - Multi-select with bounding box
   - Group/ungroup operations
   - Alignment tools

Integrate these features into existing toolbar and properties panels.
```

### Task 6.3: Performance Optimization
**Estimated Time:** 30 minutes

**Prompt:**
```
Optimize canvas performance for large labels:

Optimizations:
1. Object virtualization for large canvas
2. Lazy loading of images and complex objects
3. Canvas rendering optimizations
4. Memory management for history
5. Debounced save operations

Performance monitoring:
- Canvas rendering time tracking
- Memory usage monitoring
- User interaction responsiveness
- Network request optimization

Implement performance budgets and warnings for large canvases.
```

---

## Phase 7: UX Enhancements (3 hours)

### Task 7.1: Responsive Design & Mobile Support
**Estimated Time:** 1.5 hours

**Prompt:**
```
Make the Fabric.js editor responsive and mobile-friendly:

Responsive features:
- Collapsible panels for small screens
- Touch-friendly controls and interactions
- Adaptive toolbar layout
- Mobile-optimized zoom and pan
- Touch gestures for multi-select

Mobile considerations:
- Touch event handling for Fabric.js
- Virtual keyboard accommodation
- Simplified UI for mobile
- Performance optimization for mobile devices

Test on various screen sizes and devices.
```

### Task 7.2: Accessibility & Usability
**Estimated Time:** 1 hour

**Prompt:**
```
Implement accessibility features:

Accessibility features:
- Keyboard navigation for all tools
- Screen reader support with ARIA labels
- High contrast mode support
- Focus indicators and management
- Alternative text for canvas objects

Usability improvements:
- Loading states and progress indicators
- Error messages and recovery options
- Tooltips and help text
- Onboarding for new users
- Contextual help system

Follow WCAG 2.1 AA guidelines.
```

### Task 7.3: Animation & Polish
**Estimated Time:** 30 minutes

**Prompt:**
```
Add smooth animations and visual polish:

Animations:
- Smooth transitions for panel opening/closing
- Object creation and deletion animations
- Selection feedback animations
- Loading animations
- Toast notifications for actions

Visual polish:
- Consistent spacing and typography
- Professional color scheme
- Icon consistency
- Hover states and interactions
- Visual feedback for all actions

Keep animations subtle and performance-conscious.
```

---

## Phase 8: Testing & Quality Assurance (3 hours)

### Task 8.1: Unit and Integration Tests
**Estimated Time:** 2 hours

**Prompt:**
```
Create comprehensive test suite:

Test coverage needed:
1. Canvas hook tests (useFabricCanvas)
2. Object creation and manipulation tests
3. History system tests (undo/redo)
4. Collaboration features tests
5. Migration logic tests
6. API endpoint tests

Testing tools:
- Jest for unit tests
- React Testing Library for component tests
- Cypress for E2E tests
- WebSocket testing for collaboration

Create test utilities for:
- Mock canvas setup
- Test data generation
- Fabric.js object mocking
- Collaboration simulation
```

### Task 8.2: Performance Testing & Optimization
**Estimated Time:** 1 hour

**Prompt:**
```
Performance testing and optimization:

Performance tests:
- Large canvas rendering performance
- Memory usage with many objects
- Collaboration performance with multiple users
- Mobile performance testing
- Network request optimization

Optimization tasks:
- Bundle size analysis and reduction
- Canvas rendering optimization
- Memory leak detection and fixes
- API response time optimization
- Image loading and caching improvements

Set up performance monitoring and alerting.
```

---

## Phase 9: Deployment & Documentation (2 hours)

### Task 9.1: Production Deployment
**Estimated Time:** 1 hour

**Prompt:**
```
Prepare for production deployment:

Deployment tasks:
1. Environment configuration for production
2. Database migration scripts
3. Docker containerization updates
4. CI/CD pipeline modifications
5. Monitoring and logging setup

Production considerations:
- WebSocket scaling and load balancing
- Canvas data backup strategies
- Performance monitoring setup
- Error tracking and alerting
- Rollback procedures

Create deployment checklist and runbook.
```

### Task 9.2: Documentation & User Guide
**Estimated Time:** 1 hour

**Prompt:**
```
Create comprehensive documentation:

Documentation needed:
1. Technical documentation
   - Architecture overview
   - API documentation
   - Component documentation
   - Deployment guide

2. User documentation
   - Feature overview
   - Keyboard shortcuts reference
   - Migration guide from old editor
   - Troubleshooting guide

3. Developer documentation
   - Contributing guidelines
   - Code style guide
   - Testing procedures
   - Extension points

Format documentation in Markdown with clear examples and screenshots.
```

---

## Migration Strategy

### Parallel Implementation Approach
1. **Phase 1-4**: Build new Fabric.js editor alongside existing DOM editor
2. **Phase 5**: Create backend support while maintaining existing API
3. **Phase 6**: Implement migration tools and test with sample data
4. **Phase 7-8**: Polish and test extensively
5. **Phase 9**: Gradual rollout with fallback to old editor

### Data Migration Plan
1. **Analysis Phase**: Identify all existing label structures
2. **Conversion Phase**: Convert DOM elements to Fabric.js objects
3. **Validation Phase**: Ensure visual and functional parity
4. **Testing Phase**: Extensive testing with real user data
5. **Rollout Phase**: Gradual migration with user consent

### Risk Mitigation
- Keep existing editor functional during transition
- Implement comprehensive rollback mechanisms
- Extensive testing with real user data
- Gradual feature rollout with user feedback
- Performance monitoring and optimization

## Success Metrics

### Technical Metrics
- Canvas rendering performance (target: <100ms for 1000 objects)
- Memory usage optimization (target: 50% reduction vs DOM approach)
- Bundle size management (target: <500KB added for Fabric.js)
- Test coverage (target: >90% for critical paths)

### User Experience Metrics
- Migration success rate (target: >99%)
- User satisfaction with new features
- Task completion time improvements
- Error rate reduction
- Mobile usability improvements

## Estimated Timeline

**Total Development Time: ~26.5 hours** (reduced from 30 hours by removing collaboration features)

- Phase 1: 2 hours (Setup)
- Phase 2: 4 hours (Core Engine)
- Phase 3: 3 hours (UI Components)
- Phase 4: 2.5 hours (Advanced Features - without collaboration)
- Phase 5: 3 hours (Backend - without collaboration)
- Phase 6: 4 hours (Migration)
- Phase 7: 3 hours (UX)
- Phase 8: 3 hours (Testing)
- Phase 9: 2 hours (Deployment)

**Recommended Sprint Structure:**
- Sprint 1: Phases 1-2 (Foundation)
- Sprint 2: Phases 3-4 (Core Features)
- Sprint 3: Phases 5-6 (Backend & Migration)
- Sprint 4: Phases 7-9 (Polish & Deploy)

---

*This plan provides a comprehensive roadmap for rebuilding the label editor with Fabric.js while maintaining backward compatibility and ensuring a smooth transition for existing users.*