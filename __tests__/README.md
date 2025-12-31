# PathWise API Tests

This directory contains unit and integration tests for the PathWise API endpoints.

## Test Structure

```
__tests__/
├── api/
│   ├── generate-roadmap.test.ts
│   ├── submit-assessment.test.ts
│   └── generate-pre-assessment.test.ts (TODO)
└── README.md
```

## Running Tests

### Install Jest and dependencies

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npm install --save-dev @types/jest ts-jest
```

### Initialize Jest configuration

```bash
npx ts-jest config:init
```

### Run tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- generate-roadmap.test.ts
```

## Test Coverage Goals

- ✅ Authentication and authorization
- ✅ Input validation
- ✅ Error handling and logging
- ✅ Rate limiting
- ✅ Idempotency
- ✅ Database persistence
- ✅ LLM integration
- ✅ Correlation ID tracking

## Mocking Strategy

### Supabase

```typescript
jest.mock('@/lib/supabase-server', () => ({
  supabaseServer: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
  getAuthenticatedUser: jest.fn(),
}))
```

### LLM APIs

```typescript
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(),
}))
```

### Next.js Request/Response

```typescript
import { NextRequest } from 'next/server'

const request = new NextRequest('http://localhost:3000/api/endpoint', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer mock_token',
  },
  body: JSON.stringify({ /* data */ }),
})
```

## Test Implementation Status

- [x] Test skeleton created for /api/generate-roadmap
- [x] Test skeleton created for /api/submit-assessment
- [ ] Implement mocks for Supabase
- [ ] Implement mocks for LLM APIs
- [ ] Complete test implementations
- [ ] Add integration tests
- [ ] Add end-to-end tests

## Notes

- All tests should be independent and not rely on external services
- Use mocks for database and API calls
- Test both success and failure scenarios
- Verify correlation IDs are included in responses
- Check that errors are properly logged

## TODO

1. Install testing dependencies
2. Configure Jest for Next.js + TypeScript
3. Implement mocks for all external dependencies
4. Complete test implementations
5. Achieve >80% code coverage for API routes
6. Add integration tests that test multiple endpoints together
7. Document testing best practices
