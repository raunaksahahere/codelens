export const LANGS = {
  python: {
    name: 'Python',
    ext: '.py',
    cssVar: '--py',
    tagline: 'Interpreted with the CPython PVM',
    overview: 'Python is a great starting point for understanding bytecode, runtime frames, and how an interpreter executes a program.',
    stages: ['Source', 'Tokenize', 'AST', 'Bytecode', 'Execute', 'Output'],
    pipelineSteps: ['tokenize', 'ast', 'transform', 'execute', 'output'],
    stepTitles: [
      '1 - Tokenize',
      '2 - Parse (AST)',
      '3 - Bytecode',
      '4 - Execute (PVM)',
      '5 - Output',
    ],
    stepSubs: [
      'Source -> Token Stream',
      'Tokens -> Abstract Syntax Tree',
      'AST -> CPython Bytecode (.pyc)',
      'Python Virtual Machine runs bytecode',
      'Program results',
    ],
    starter: `# Hello World in Python
print("Hello, World!")

# Variables and arithmetic
x = 10
y = 20
print("Sum:", x + y)

# Loop
for i in range(5):
    print("Count:", i)

# Function
def greet(name):
    print("Hello,", name)

greet("Raunak")
`,
  },
  java: {
    name: 'Java',
    ext: '.java',
    cssVar: '--java',
    tagline: 'Compiled to JVM bytecode',
    overview: 'Java shows how source code becomes portable bytecode, and how the JVM verifies and executes that bytecode at runtime.',
    stages: ['Source', 'javac', '.class', 'JVM', 'Execute', 'Output'],
    pipelineSteps: ['tokenize', 'ast', 'transform', 'execute', 'output'],
    stepTitles: [
      '1 - Tokenize',
      '2 - Parse (AST)',
      '3 - Compile (.class)',
      '4 - JVM Execute',
      '5 - Output',
    ],
    stepSubs: [
      'Source -> Token Stream',
      'Tokens -> Abstract Syntax Tree',
      'AST -> JVM Bytecode',
      'Java Virtual Machine runs bytecode',
      'Program results',
    ],
    starter: `// Hello World in Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");

        // Variables
        int x = 10;
        int y = 20;
        System.out.println("Sum: " + (x + y));

        // Loop
        for (int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}
`,
  },
  c: {
    name: 'C',
    ext: '.c',
    cssVar: '--clang',
    tagline: 'Compiled to native machine code',
    overview: 'C helps beginners see what native execution looks like, from tokens and syntax trees to assembly, registers, and stack frames.',
    stages: ['Source', 'Preprocess', 'Compile', 'Assemble', 'Link', 'Output'],
    pipelineSteps: ['tokenize', 'ast', 'transform', 'execute', 'output'],
    stepTitles: [
      '1 - Tokenize',
      '2 - Parse (AST)',
      '3 - Compile (x86-64 ASM)',
      '4 - Execute (CPU)',
      '5 - Output',
    ],
    stepSubs: [
      'Source -> Token Stream',
      'Tokens -> Abstract Syntax Tree',
      'AST -> x86-64 Assembly -> Binary',
      'CPU executes native instructions',
      'Program results',
    ],
    starter: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");

    /* Variables */
    int x = 10;
    int y = 20;
    printf("Sum: %d\\n", x + y);

    /* Loop */
    for (int i = 0; i < 5; i++) {
        printf("Count: %d\\n", i);
    }

    return 0;
}
`,
  },
  cpp: {
    name: 'C++',
    ext: '.cpp',
    cssVar: '--cpp',
    tagline: 'Compiled to a linked native binary',
    overview: 'C++ builds on native execution like C, while also exposing beginners to extra compile-time features such as overloading and name mangling.',
    stages: ['Source', 'Preprocess', 'Mangle', 'Compile', 'Link', 'Output'],
    pipelineSteps: ['tokenize', 'ast', 'transform', 'execute', 'output'],
    stepTitles: [
      '1 - Tokenize',
      '2 - Parse (AST)',
      '3 - Compile + Link',
      '4 - Execute (CPU)',
      '5 - Output',
    ],
    stepSubs: [
      'Source -> Token Stream',
      'Tokens -> Abstract Syntax Tree',
      'C++ mangling + x86-64 ASM -> Binary',
      'CPU executes native instructions',
      'Program results',
    ],
    starter: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;

    // Variables
    int x = 10;
    int y = 20;
    cout << "Sum: " << (x + y) << endl;

    // Loop
    for (int i = 0; i < 5; i++) {
        cout << "Count: " << i << endl;
    }

    return 0;
}
`,
  },
}

export const THEMES = [
  { id: 'dark', label: 'Dark', dot: ['#0a0c12', '#252a3a'] },
  { id: 'light', label: 'Light', dot: ['#f0f0ea', '#c8c7be'] },
  { id: 'terminal', label: 'Terminal', dot: ['#010801', '#006600'] },
  { id: 'nord', label: 'Nord', dot: ['#1e2430', '#7eb8d0'] },
]
