# CodeLens

CodeLens is a beginner-friendly learning tool that shows what happens between writing code and seeing output.

Instead of treating programming like a black box, CodeLens helps learners understand the full journey:

- source code
- tokens
- abstract syntax tree (AST)
- bytecode or native compilation output
- execution
- final output

This makes CodeLens useful for students, first-time programmers, and anyone who wants to understand how programming languages actually work under the hood.

## Why CodeLens exists

Many beginners can copy syntax without really understanding what the computer is doing.
CodeLens exists to bridge that gap.

With CodeLens, learners can:

- compare how Python, Java, C, and C++ behave differently
- understand the difference between interpreters, virtual machines, and native binaries
- see how a tiny code change affects parsing, execution, and output
- experiment safely with starter programs before writing larger programs

## What the app includes

- a landing page that explains the learning journey before opening the editor
- a larger and more readable workspace layout
- a visual pipeline for tokenizing, parsing, transforming, executing, and showing output
- starter programs for Python, Java, C, and C++
- multiple themes for different reading preferences

## Tech stack

- React 18
- Vite
- Plain CSS

## Run CodeLens locally

### Prerequisites

- Node.js 20 or newer
- npm

### Install and start

```bash
npm install
npm run dev
```

Vite will print a local development URL in the terminal, usually `http://localhost:5173`.

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
  components/      UI building blocks such as the landing page, editor, console, and pipeline
  engine/          The interpreter, pipeline builder, and syntax highlighter logic
  languages/       Language-specific configuration and starter code
  styles/          Main application styling
  App.jsx          App flow and top-level state
  main.jsx         React entry point
```

## How to use CodeLens

1. Open the landing page and choose a language.
2. Read the short intro to understand what the pipeline will show.
3. Edit the starter code in the workspace.
4. Press `Run code` or use `Ctrl+Enter`.
5. Move through each pipeline stage to understand how the program is processed.
6. Change one small part of the code and run it again to compare the result.

## Best way for beginners to learn with it

- start with Python if you want the gentlest introduction
- try Java next to understand bytecode and the JVM
- use C and C++ to see native compilation and CPU-oriented execution
- make one change at a time so the pipeline differences are easier to notice

## Future improvement ideas

- add more languages
- add lesson mode with guided exercises
- add step-by-step quizzes for each pipeline stage
- let users save and share examples

CodeLens is designed to make programming feel understandable, not intimidating.
