# page-Two: 3D Tarot

A modern 3D Tarot web application built with Three.js and TypeScript, featuring customizable decks and interactive readings.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Modern web browser with WebGL support

### Environment Setup
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Visit `http://localhost:3000`

## Project Documentation
See [PROJECT_STATUS.md](PROJECT_STATUS.md) for:
- Detailed project structure
- Coding standards
- Implementation status
- Technical architecture
- Development guidelines

## Current Features
- 3D scene with camera controls
- Basic card system
- Lighting setup
- Development environment
- Deck shuffle animation

## In Development
- Custom deck profiles
- Image upload system
- Card drawing mechanics
- Profile management

## Contributing
1. Review PROJECT_STATUS.md for current status
2. Check existing issues and PRs
3. Follow coding standards
4. Update documentation
5. Test thoroughly

## AI Development Guide

### Example Feature Implementation Prompt
When requesting new feature implementation, provide clear context and requirements:

```
Please help implement a deck shuffle animation in our 3D Tarot application. You'll need to:

1. First review these files to understand our structure:
   - src/core/SceneManager.ts (how we handle Three.js setup)
   - src/ui/UIManager.ts (where UI controls are managed)
   - PROJECT_STATUS.md (for coding standards and project structure)

2. Then implement:
   - A rectangular deck mesh in the scene (should look like a stack of cards)
   - A shuffle button in the UI
   - A single 360-degree rotation animation when shuffle is pressed

The deck should be a simple rectangular prism with dimensions similar to a stack of tarot cards (roughly 3:5 ratio, thin depth).

Please maintain our existing patterns for:
   - Scene management (using SceneManager singleton)
   - UI controls (using UIManager)
   - Animation handling
   - TypeScript standards from PROJECT_STATUS.md

Start by checking those files and let me know when you're ready to implement the changes.
```

### Example Code Review Prompt
After implementation, verify code integrity with:

```
Please verify code integrity by:

1. List all modified/created files
2. Check for duplicate class declarations
3. Verify singleton patterns are correct
4. Confirm all imports/exports match
5. Check for any conflicting functionality

Files to check:
- src/core/DeckManager.ts
- src/core/SceneManager.ts
- src/ui/UIManager.ts
- src/main.ts
```

This structured approach ensures:
- Clear requirements
- Proper code review
- Maintained project standards
- Consistent implementation patterns

## License
MIT