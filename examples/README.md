# Examples

This folder contains example code demonstrating how to use the `resttemplate-ts` library.

## Prerequisites

Ensure you have installed the project dependencies at the root level:

```bash
npm install
```

## Running the Examples

You can run the examples using `ts-node` (which should be installed if you have global typescript support, or use `npx ts-node`).

### Basic Usage

The `basic_usage.ts` script demonstrates:
- Fetching a resource (GET)
- Creating a resource (POST)
- Basic error handling

Run with:

```bash
npx ts-node examples/basic_usage.ts
```

## Directory Structure

- `dto/`: Contains Data Transfer Object definitions decorated with `jackson-js`.
- `basic_usage.ts`: Main entry point for the demo.
