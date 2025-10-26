---
title: Installation
description: Install ResourceBox in your TypeScript project
---

## Requirements

- **Node.js** 22.x or higher
- **TypeScript** 5.7 or higher
- **pnpm** (recommended) or npm

## Install via pnpm

```bash
pnpm add @gftdcojp/resourcebox
```

## Install via npm

```bash
npm install @gftdcojp/resourcebox
```

## TypeScript Configuration

ResourceBox requires certain TypeScript compiler options for optimal type safety:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022"]
  }
}
```

Key settings:
- `strict: true` - Enable all strict type checking options
- `exactOptionalPropertyTypes: true` - Distinguish between `property?: T` and `property: T | undefined`

## Verify Installation

Create a simple test file to verify your installation:

```typescript title="test.ts"
import { Onto, Resource } from '@gftdcojp/resourcebox';

const foaf = Onto.FOAF;

const PersonResource = Resource.Object({
  name: Resource.String({
    property: foaf("name"),
    required: true
  })
});

console.log('ResourceBox is installed correctly!');
```

Run it:

```bash
pnpm tsx test.ts
# or
node --loader tsx test.ts
```

## Next Steps

- Follow the [Quick Start Guide](/quick-start/) to build your first application
- Read about the [Design Philosophy](/philosophy/)
- Explore the [API Reference](/onto/overview/)

