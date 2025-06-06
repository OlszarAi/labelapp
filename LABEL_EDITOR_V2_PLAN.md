# Label Editor v2 Implementation Plan

## Overview
Create a new, high-performance label editor to replace the current implementation that doesn't perform well. The new editor will be integrated within existing projects (labelapp/labelapp_backend) and utilize proven solutions from CANVA_CLONE reference. This is a completely separate editor with its own data structure and backend services.

## Important Notes
- **Project Integration**: New editor v2 will be within existing labelapp and labelapp_backend projects
- **Complete Separation**: No shared code with old editor - completely independent implementation
- **CANVA_CLONE Reference**: Leverage existing proven frontend/backend solutions from `/CANVA_CLONE/`
- **Old Editor Migration**: Move/rename old editor files to avoid conflicts during development

## Architecture Overview

### Frontend (Next.js) - Within labelapp project
- **New Editor Path**: `/editor-v2/` integrated within existing project structure
- **Technology Stack**: Next.js 14+, TypeScript, Fabric.js, Tailwind CSS (adapt from CANVA_CLONE)
- **State Management**: React Context API with custom hooks (based on CANVA_CLONE patterns)
- **File Structure**: Modular component architecture with clear separation from old editor

### Backend (Node.js) - Within labelapp_backend project
- **New API Structure**: Completely separate from existing label APIs
- **Data Models**: New database schema for v2 editor (different from current labels)
- **Services Architecture**: Based on CANVA_CLONE server structure
- **Authentication**: Integrate with existing auth system but separate endpoints

## File Structure Plan

```
src/
├── app/
│   └── editor-v2/
│       ├── page.tsx                 # Main editor page
│       └── [projectId]/
│           └── page.tsx             # Project-specific editor
├── components/
│   └── editor-v2/                   # New editor components
│       ├── canvas/
│       │   ├── CanvasContainer.tsx  # Main canvas wrapper
│       │   ├── FabricCanvas.tsx     # Fabric.js integration
│       │   └── ViewportControls.tsx # Zoom, pan controls
│       ├── sidebar/
│       │   ├── PropertiesPanel.tsx  # Element properties
│       │   ├── LayersPanel.tsx      # Layer management
│       │   └── TemplatesPanel.tsx   # Template library
│       ├── toolbar/
│       │   ├── MainToolbar.tsx      # Primary tools
│       │   └── QuickActions.tsx     # Quick action buttons
│       ├── export/
│       │   └── ExportDialog.tsx     # Export options
│       └── shared/
│           ├── Ruler.tsx            # Canvas rulers
│           ├── Grid.tsx             # Grid overlay
│           └── Minimap.tsx          # Canvas minimap
├── hooks/
│   └── editor-v2/
│       ├── useCanvas.ts             # Canvas state management
│       ├── useViewport.ts           # Viewport controls
│       ├── useHistory.ts            # Undo/redo functionality
│       └── useExport.ts             # Export functionality
└── lib/
    └── editor-v2/
        ├── canvas/
        │   ├── fabric-config.ts     # Fabric.js configuration
        │   ├── canvas-utils.ts      # Canvas utilities
        │   └── viewport.ts          # Viewport management
        ├── elements/
        │   ├── text-element.ts      # Text element handling
        │   ├── shape-element.ts     # Shape element handling
        │   └── image-element.ts     # Image element handling
        └── export/
            ├── pdf-export.ts        # PDF export logic
            └── image-export.ts      # Image export logic
```

## Backend Structure Plan (labelapp_backend)

```
src/
├── controllers/
│   └── v2/                          # V2 Editor controllers
│       ├── designController.ts      # Design CRUD operations
│       ├── templateController.ts    # Template management
│       ├── exportController.ts      # Export functionality
│       └── elementsController.ts    # Canvas elements management
├── services/
│   └── v2/                          # V2 Editor services
│       ├── designService.ts         # Design business logic
│       ├── templateService.ts       # Template operations
│       ├── exportService.ts         # Export processing
│       ├── fabricService.ts         # Fabric.js server utilities
│       └── storageService.ts        # File storage management
├── models/
│   └── v2/                          # V2 Editor data models
│       ├── Design.ts                # Main design model
│       ├── Template.ts              # Template model
│       ├── Element.ts               # Canvas element model
│       └── Project.ts               # Project model (extends existing)
├── routes/
│   └── v2/                          # V2 Editor routes
│       ├── designRoutes.ts          # Design endpoints
│       ├── templateRoutes.ts        # Template endpoints
│       ├── exportRoutes.ts          # Export endpoints
│       └── elementsRoutes.ts        # Elements endpoints
├── middleware/
│   └── v2/                          # V2 specific middleware
│       ├── designAuth.ts            # Design access control
│       ├── validation.ts            # Request validation
│       └── rateLimit.ts             # API rate limiting
└── utils/
    └── v2/                          # V2 Editor utilities
        ├── fabricUtils.ts           # Server-side Fabric.js utilities
        ├── exportUtils.ts           # Export processing utilities
        ├── templateUtils.ts         # Template processing
        └── fileUtils.ts             # File handling utilities
```

## Database Schema Plan (New Tables)

```sql
-- V2 Editor specific tables (separate from existing labels)
CREATE TABLE v2_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    canvas_data JSONB NOT NULL,           -- Fabric.js canvas JSON
    thumbnail_url VARCHAR(500),
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE v2_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    canvas_data JSONB NOT NULL,
    thumbnail_url VARCHAR(500),
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE v2_design_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES v2_designs(id) ON DELETE CASCADE,
    element_type VARCHAR(50) NOT NULL,    -- 'text', 'shape', 'image', etc.
    element_data JSONB NOT NULL,          -- Fabric.js object data
    layer_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE v2_design_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES v2_designs(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,     -- 'create', 'update', 'delete'
    canvas_snapshot JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Old Editor Migration Plan

Before starting implementation, migrate old editor files to avoid conflicts:

```
# Move old editor files to legacy namespace
src/components/labels/ → src/components/labels-legacy/
src/app/editor/ → src/app/editor-legacy/
src/hooks/editor/ → src/hooks/editor-legacy/
src/lib/editor/ → src/lib/editor-legacy/

# Update imports in existing files to use legacy paths
# Keep old API endpoints unchanged for backward compatibility
```

## CANVA_CLONE Integration Strategy

### Frontend Components to Adapt
```
From: /CANVA_CLONE/client/src/components/editor/
- canvas/index.js → CanvasContainer.tsx
- sidebar/ → PropertiesPanel.tsx, LayersPanel.tsx
- toolbar/ → MainToolbar.tsx
- properties/ → Property-specific components

From: /CANVA_CLONE/client/src/fabric/
- fabric-utils.js → canvas-utils.ts
- fabric-config.js → fabric-config.ts
```

### Backend Services to Adapt
```
From: /CANVA_CLONE/server/design-service/
- Design CRUD operations
- Canvas data processing
- Export functionality

From: /CANVA_CLONE/server/upload-service/
- File upload handling
- Image processing
- Storage management
```

## Implementation Tasks

### Phase 0: Project Setup & Migration

**Task 0.1: Old Editor Migration**
- Move old editor files to legacy namespace
- Update imports in existing components
- Ensure no breaking changes to current functionality

**AI Prompt for Task 0.1:**
```
Migrate the old label editor files to avoid conflicts with the new v2 editor:
1. Move all editor-related files from /src/components/labels/ to /src/components/labels-legacy/
2. Move /src/app/editor/ to /src/app/editor-legacy/
3. Update all import statements in the existing codebase to use the new legacy paths
4. Ensure no functionality is broken during the migration
5. Create a migration summary document listing all moved files
6. Test that the existing editor still works after the migration
DO NOT modify the actual editor logic, only move files and update imports.
```

**Task 0.2: Clean Directory Structure**
- Create new directory structure for v2 editor
- Set up TypeScript configurations
- Copy and adapt CANVA_CLONE base structure

**AI Prompt for Task 0.2:**
```
Create the complete directory structure for the new label editor v2 within the existing labelapp project:
1. Create all frontend folders as defined in the file structure plan
2. Create all backend folders in labelapp_backend as defined in the backend structure plan
3. Copy and adapt the basic structure from CANVA_CLONE client/server
4. Set up proper TypeScript configurations for the new modules
5. Create basic placeholder files with proper exports and imports
6. Ensure complete separation from the legacy editor
7. Set up proper module boundaries and dependencies
Reference the CANVA_CLONE structure but adapt it to our TypeScript/Next.js setup.
```

### Phase 1: Core Canvas Implementation

**Task 1.1: Fabric.js Canvas Setup**
- Initialize Fabric.js canvas with proper configuration
- Implement canvas container with responsive sizing
- Add basic event listeners for canvas interactions

**AI Prompt for Task 1.1:**
```
Implement the core Fabric.js canvas setup based on the CANVA_CLONE reference at /CANVA_CLONE/client/src/components/editor/canvas/index.js. Create the CanvasContainer.tsx and FabricCanvas.tsx components. The canvas should:
1. Initialize with proper Fabric.js configuration
2. Handle responsive sizing
3. Set up basic event listeners (object:added, object:modified, etc.)
4. Include custom bounding box styling
5. Use TypeScript with proper types for Fabric.js objects
```

**Task 1.2: Viewport Implementation**
- Implement zoom functionality (mouse wheel, controls)
- Add pan functionality (Alt+drag, middle mouse)
- Create viewport state management

**AI Prompt for Task 1.2:**
```
Create the viewport system for the new editor by combining the best practices from both the current labelapp editor and the CANVA_CLONE reference. Implement:
1. Zoom controls with mouse wheel and buttons (10% to 500% range)
2. Pan functionality with Alt+drag and middle mouse button
3. Fit-to-screen and actual size functions
4. Smooth zoom transitions
5. Viewport state management with React hooks
6. Integration with the Fabric.js canvas
Reference the current implementation in /src/components/labels/LabelCanvas.tsx for existing patterns.
```

**Task 1.3: Canvas Utilities**
- Port and adapt fabric utilities from CANVA_CLONE
- Implement element creation helpers
- Add canvas state management utilities

**AI Prompt for Task 1.3:**
```
Create comprehensive canvas utilities by adapting the fabric utilities from /CANVA_CLONE/client/src/fabric/fabric-utils.js. Implement:
1. Element creation utilities (text, shapes, images)
2. Canvas state management helpers
3. Object positioning and alignment utilities
4. Layer management functions
5. Selection and grouping utilities
6. Export the utilities with proper TypeScript types
Ensure compatibility with the new editor architecture.
```

### Phase 2: UI Components

**Task 2.1: Main Toolbar**
- Create primary toolbar with essential tools
- Implement tool selection and state management
- Add responsive design for different screen sizes

**AI Prompt for Task 2.1:**
```
Design and implement a modern, responsive main toolbar for the label editor. The toolbar should include:
1. Tool selection buttons (select, text, shapes, images)
2. Quick actions (undo, redo, delete)
3. View controls (zoom in/out, fit to screen)
4. Export button
5. Modern UI design with Tailwind CSS
6. Responsive layout that works on desktop and tablet
7. Proper state management for active tools
8. Integration with the canvas component
```

**Task 2.2: Properties Panel**
- Create dynamic properties panel based on selected elements
- Implement form controls for element properties
- Add real-time property updates

**AI Prompt for Task 2.2:**
```
Create a comprehensive properties panel that dynamically shows relevant controls based on the selected canvas element. Implement:
1. Text properties (font, size, color, alignment, formatting)
2. Shape properties (fill, stroke, dimensions, position)
3. Image properties (opacity, filters, cropping controls)
4. Layout properties (position, rotation, layer order)
5. Real-time updates that reflect changes immediately on canvas
6. Modern form controls with proper validation
7. Collapsible sections for better organization
8. TypeScript interfaces for all property types
```

**Task 2.3: Sidebar Navigation**
- Implement collapsible sidebar with multiple panels
- Add layers panel for element management
- Create templates panel for quick access

**AI Prompt for Task 2.3:**
```
Create a comprehensive sidebar system with multiple panels:
1. Layers Panel - hierarchical view of all canvas elements with drag-to-reorder, visibility toggles, and lock controls
2. Templates Panel - grid of pre-designed label templates with preview and one-click application
3. Properties Panel integration from Task 2.2
4. Collapsible sidebar with smooth animations
5. Panel switching with tab navigation
6. Search functionality for templates
7. Modern UI with proper spacing and visual hierarchy
8. Responsive design that works on different screen sizes
```

### Phase 3: Advanced Features

**Task 3.1: History System (Undo/Redo)**
- Implement command pattern for undo/redo
- Add keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Create history state management

**AI Prompt for Task 3.1:**
```
Implement a robust undo/redo system using the command pattern:
1. Create command classes for all canvas operations (add, delete, modify, move)
2. History stack management with configurable size limit
3. Keyboard shortcuts (Ctrl+Z for undo, Ctrl+Y/Ctrl+Shift+Z for redo)
4. Integration with Fabric.js canvas events
5. Visual indicators for undo/redo availability
6. Batch operations for complex changes
7. Clear history on new project load
8. TypeScript interfaces for command structure
```

**Task 3.2: Grid and Rulers**
- Implement canvas grid overlay
- Add rulers for precise positioning
- Create snap-to-grid functionality

**AI Prompt for Task 3.2:**
```
Create a professional grid and ruler system:
1. Configurable grid overlay with customizable spacing and opacity
2. Horizontal and vertical rulers with measurement units
3. Snap-to-grid functionality with toggle control
4. Smart guides that appear when aligning objects
5. Grid and ruler visibility toggles
6. Different grid types (dots, lines, squares)
7. Ruler measurements that update based on zoom level
8. Integration with viewport transformations
Reference existing ruler implementation in the current editor for patterns.
```

**Task 3.3: Export System**
- Implement PDF export with high quality
- Add PNG/JPG export options
- Create export preview and settings

**AI Prompt for Task 3.3:**
```
Create a comprehensive export system:
1. High-quality PDF export with vector graphics preservation
2. PNG/JPG export with configurable DPI and quality
3. Export preview dialog with size and format options
4. Batch export for multiple labels
5. Background removal options for PNG exports
6. Custom page sizes and margins for PDF
7. Progress indicator for export operations
8. Error handling and user feedback
9. Integration with the backend export service
Use the existing PDF export functionality in /src/services/pdf/ as reference.
```

### Phase 4: Backend Integration

**Task 4.1: API Service Layer**
- Create API client for label operations
- Implement project management integration
- Add real-time saving functionality

**AI Prompt for Task 4.1:**
```
Create a comprehensive API service layer for the new editor:
1. Label CRUD operations (create, read, update, delete)
2. Project management integration with existing backend
3. Auto-save functionality with debounced updates
4. Conflict resolution for concurrent edits
5. Error handling and retry mechanisms
6. TypeScript interfaces for all API responses
7. Integration with existing backend at /labelapp_backend/
8. Authentication integration with existing middleware
9. Optimistic updates for better user experience
```

**Task 4.2: Template System**
- Create template management backend service
- Implement template categories and search
- Add user template saving functionality

**AI Prompt for Task 4.2:**
```
Design and implement a template system by adapting CANVA_CLONE server solutions:

Backend Implementation (Reference: /CANVA_CLONE/server/):
1. Adapt design-service for template CRUD operations with database storage
2. Implement template categories and hierarchical organization 
3. Template search with filters (category, tags, size) based on CANVA_CLONE patterns
4. User custom template saving and sharing functionality
5. Template versioning and updates using CANVA_CLONE's approach
6. Bulk template operations for efficiency
7. Integrate with existing labelapp_backend authentication
8. Use the v2 database schema for template storage

Frontend Integration (Reference: /CANVA_CLONE/client/src/components/):
1. Template browser with grid layout and previews (adapt CANVA_CLONE template components)
2. Search and filter functionality from CANVA_CLONE patterns
3. One-click template application to canvas using CANVA_CLONE methods
4. Template saving from current canvas state
5. Template management interface for users
6. Integration with the main editor workflow
7. Leverage CANVA_CLONE's template loading and caching strategies
```

### Phase 5: Performance & Polish

**Task 5.1: Performance Optimization**
- Implement canvas virtualization for large projects
- Add lazy loading for templates and images
- Optimize Fabric.js rendering performance

**AI Prompt for Task 5.1:**
```
Optimize the editor performance for production use:
1. Canvas virtualization to handle large numbers of objects
2. Lazy loading for template thumbnails and large images
3. Fabric.js performance optimizations (object caching, rendering optimizations)
4. Memory management for undo/redo history
5. Debounced updates for real-time property changes
6. Image compression and optimization for uploads
7. Progressive loading for complex templates
8. Performance monitoring and metrics collection
9. Bundle size optimization and code splitting
```

**Task 5.2: User Experience Enhancements**
- Add keyboard shortcuts for common operations
- Implement drag-and-drop functionality
- Create onboarding and help system

**AI Prompt for Task 5.2:**
```
Enhance the user experience with modern interactions:
1. Comprehensive keyboard shortcuts (selection, copying, moving, scaling)
2. Drag-and-drop for templates, images, and elements
3. Context menus with right-click actions
4. Tooltips and help text for all tools and features
5. Interactive onboarding tour for new users
6. Accessible design following WCAG guidelines
7. Touch support for tablet devices
8. Loading states and skeleton screens
9. Error boundaries and graceful error handling
10. User preferences and settings persistence
```

**Task 5.3: Testing & Documentation**
- Create comprehensive test suite
- Add component documentation
- Implement end-to-end testing

**AI Prompt for Task 5.3:**
```
Create a comprehensive testing and documentation strategy:
Testing:
1. Unit tests for all utility functions and hooks
2. Component tests for UI components using React Testing Library
3. Integration tests for canvas operations and API calls
4. End-to-end tests for complete user workflows
5. Performance tests for canvas rendering and large projects
6. Accessibility tests for compliance verification

Documentation:
1. Component documentation with Storybook
2. API documentation for backend services
3. User guide for editor features and workflows
4. Developer documentation for extending the editor
5. Deployment guide and environment setup
6. Troubleshooting guide for common issues
```

## Migration Strategy

### Phase 6: Migration & Deployment

**Task 6.1: Data Migration**
- Create migration scripts for existing labels
- Implement backward compatibility
- Add migration validation

**AI Prompt for Task 6.1:**
```
Create a safe migration strategy from the old editor to v2:
1. Data migration scripts to convert existing label formats
2. Backward compatibility layer for reading old label data
3. Migration validation to ensure data integrity
4. Rollback mechanisms in case of issues
5. Batch migration tools for large datasets
6. Progress tracking and reporting for migrations
7. Testing tools to validate migrated labels
8. Documentation for the migration process
```

**Task 6.2: Deployment Strategy**
- Implement feature flags for gradual rollout
- Create A/B testing framework
- Add monitoring and analytics

**AI Prompt for Task 6.2:**
```
Design a safe deployment and rollout strategy:
1. Feature flags to enable v2 editor for specific users/projects
2. A/B testing framework to compare editor performance
3. Gradual rollout plan (beta users → power users → all users)
4. Monitoring dashboard for editor usage and performance
5. Error tracking and alerting for production issues
6. User feedback collection and analysis tools
7. Rollback procedures if issues are discovered
8. Analytics to measure editor adoption and success metrics
```

## Technical Specifications

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Targets
- Initial load time: < 2 seconds
- Canvas interactions: < 16ms (60 FPS)
- Export time: < 5 seconds for typical labels
- Memory usage: < 100MB for typical projects

### API Requirements
- RESTful APIs with JSON responses
- Authentication via JWT tokens
- Rate limiting and request validation
- Comprehensive error handling
- API versioning for backward compatibility

## Success Metrics

1. **Performance**: 50% reduction in canvas interaction latency
2. **User Experience**: 90% user satisfaction score
3. **Reliability**: 99.9% uptime and error-free operations
4. **Adoption**: 80% user migration within 3 months
5. **Productivity**: 25% reduction in label creation time

## Timeline Estimation

- **Phase 0-1**: 2-3 weeks (Core canvas and viewport)
- **Phase 2**: 2-3 weeks (UI components and panels)
- **Phase 3**: 2-3 weeks (Advanced features)
- **Phase 4**: 2 weeks (Backend integration)
- **Phase 5**: 2 weeks (Performance and polish)
- **Phase 6**: 1-2 weeks (Migration and deployment)

**Total Estimated Time**: 11-16 weeks

## Risk Mitigation

1. **Technical Risks**: Regular prototyping and proof-of-concepts
2. **Performance Risks**: Early performance testing and optimization
3. **Migration Risks**: Thorough testing with production data
4. **User Adoption Risks**: Gradual rollout with user feedback
5. **Compatibility Risks**: Comprehensive browser and device testing

## Next Steps

1. Review and approve this implementation plan
2. Set up development environment and tooling
3. Begin Phase 0 with old editor migration
4. Start with Task 0.2 (Directory structure with CANVA_CLONE adaptation)
5. Regular progress reviews and plan adjustments

## CANVA_CLONE Solutions Summary

### Ready-to-Use Frontend Components
- **Canvas System**: `/CANVA_CLONE/client/src/components/editor/canvas/` - Complete Fabric.js setup
- **Sidebar Components**: `/CANVA_CLONE/client/src/components/editor/sidebar/` - Properties and layers panels
- **Toolbar System**: `/CANVA_CLONE/client/src/components/editor/toolbar/` - Tool selection and actions
- **Fabric Utilities**: `/CANVA_CLONE/client/src/fabric/` - Canvas utilities and configuration
- **Export System**: Canvas export functionality already implemented

### Ready-to-Use Backend Services
- **Design Service**: `/CANVA_CLONE/server/design-service/` - Complete CRUD operations for designs
- **Upload Service**: `/CANVA_CLONE/server/upload-service/` - File handling and image processing
- **API Gateway**: `/CANVA_CLONE/server/api-gateway/` - Request routing and middleware
- **Database Models**: Design and template data structures
- **Export Processing**: Server-side export functionality

### Integration Strategy
1. **Copy & Adapt**: Start with CANVA_CLONE components and adapt to TypeScript/labelapp structure
2. **Maintain Separation**: Keep v2 editor completely separate from existing label editor
3. **Leverage Existing Auth**: Use labelapp's authentication system for v2 editor
4. **Database Integration**: Extend existing projects to support v2 designs
5. **Progressive Enhancement**: Build upon proven CANVA_CLONE patterns

---

*This plan serves as a comprehensive guide for implementing the new label editor v2. Each task includes specific AI prompts that leverage CANVA_CLONE solutions and can be used to generate the required code and implementations.*
