# 3D Tarot Web Application - Project Status

## Project Overview
Modern 3D Tarot application built with Three.js and TypeScript, featuring interactive card readings and multiplayer support.

## Project Structure
```
/
├── index.html          # Entry point
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts     # Vite build configuration
├── PROJECT_STATUS.md   # Project documentation
└── src/
    ├── main.ts        # Application entry point
    ├── core/          # Core application logic
    │   ├── SceneManager.ts     # Three.js scene handling
    │   └── CardManager.ts      # Card system management
    ├── entities/      # 3D object definitions
    │   └── Card.ts    # Card entity definition
    ├── state/         # Application state management
    │   └── StateManager.ts     # Central state handling
    ├── types/         # TypeScript type definitions
    │   └── SpreadLayout.ts     # Layout type definitions
    └── ui/            # User interface components
        └── UIManager.ts        # UI management system

```

## Coding Standards

### File Naming
- Use PascalCase for class files: `CardManager.ts`
- Use camelCase for utility files: `imageUtils.ts`
- Use kebab-case for configuration files: `vite-config.ts`

### Class Structure
```typescript
// Standard class template
export class ClassName {
  private static instance: ClassName; // For singletons
  private members: Type;

  constructor() {
    // Initialize
  }

  public initialize(): void {
    // Setup
  }

  public update(): void {
    // Update logic
  }
}
```

### Type Definitions
```typescript
// Interface naming
interface IClassName {
  property: Type;
}

// Type naming
type TypeName = {
  property: Type;
};
```

### Import Order
1. External libraries
2. Core components
3. Entity definitions
4. Type definitions
5. Utility functions

[Previous content remains the same...]

## Current Status
🚀 Development Phase - Core Functionality

[Rest of the previous content remains the same...]

## Version Control Practices
- Feature branches named: `feature/feature-name`
- Bug fix branches named: `fix/bug-description`
- Commit messages follow conventional commits:
  - feat: New feature
  - fix: Bug fix
  - docs: Documentation
  - refactor: Code refactoring
  - style: Formatting
  - test: Testing

## Documentation Requirements
- All new features require documentation updates
- Code comments for complex logic
- Type definitions for all interfaces
- README updates for new features
- JSDoc comments for public methods

## Testing Strategy
- Unit tests for utilities
- Integration tests for managers
- Performance tests for 3D operations
- UI component testing

## Performance Guidelines
- Texture optimization before loading
- Proper disposal of Three.js objects
- Event listener cleanup
- Memory management best practices

[Rest of the previous content remains the same...]