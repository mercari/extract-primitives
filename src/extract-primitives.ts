import ts from 'typescript';
import fs from 'fs';

type Nest = Record<string, any>;
const nest = (): Nest => Object.create(null);

interface Options {
  trimQuates?: boolean;
}

// a function which extract values to be replaced with DefinePlugin from `.d.ts` files
export const extractPrimitives = (files: string[], options: Options = {}): Nest => {
  const result = files.reduce<Nest>((acc, file) => {
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, { encoding: 'utf-8' }),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    return source ? extractFromSingleSource(acc, source, options) : acc;
  }, nest());

  removeEmptyNests(result);
  return result;
};

export const extractFromSingleSource = (acc: Nest, source: ts.SourceFile, options: Options) => {
  const queue: ts.Node[] = [...source.statements];
  const enumBodies: ts.ModuleBlock[] = [];

  while (queue.length) {
    const node = queue.shift()!;
    queue.push(...node.getChildren());
    if (!ts.isModuleDeclaration(node)) continue;

    if (node.body && ts.isModuleBlock(node.body)) {
      enumBodies.push(node.body);
    }
  }

  enumBodies.forEach((body) => {
    const names: string[] = [];
    let parent: ts.Node = body.parent;
    while (parent && parent !== source) {
      if (ts.isModuleDeclaration(parent)) names.unshift(parent.name.getText());
      parent = parent.parent;
    }

    const container = names.reduce((curr, name) => {
      return (curr[name] = curr[name] || nest());
    }, acc);

    body.statements.forEach((node) => {
      if (ts.isVariableStatement(node) && node.declarationList.flags & ts.NodeFlags.Const) {
        node.declarationList.declarations.forEach(({ name, type }) => {
          if (type && ts.isLiteralTypeNode(type)) {
            const { literal } = type;
            const key = name.getText();
            if (ts.isStringLiteral(literal)) {
              const raw = literal.getText();
              container[key] = options.trimQuates ? trimQuotes(raw) : raw;
            } else if (ts.isNumericLiteral(literal)) {
              container[key] = Number(literal.getText());
            } else if (literal.kind === ts.SyntaxKind.TrueKeyword) {
              container[key] = true;
            } else if (literal.kind === ts.SyntaxKind.FalseKeyword) {
              container[key] = false;
            }
          }
        });
      }
    });
  });

  return acc;
};

export const trimQuotes = (input: string) => {
  if (single.test(input) || double.test(input)) return input.slice(1, -1);
  return input;
};
const single = /^'.*'$/;
const double = /^".*"$/;

export const removeEmptyNests = (root: Nest) => {
  type Entry = [Nest, string, Nest];
  const queue = [root];
  const stack: Entry[] = [];
  while (queue.length) {
    const parent = queue.shift()!;
    Object.entries(parent).forEach(([key, child]) => {
      // skip if the child has a constructor
      if (typeof child !== 'object' || !child || 'constructor' in child) return;
      stack.push([parent, key, child]);
      queue.push(child);
    });
  }

  while (stack.length) {
    const [parent, key, child] = stack.pop()!;
    if (!Object.keys(child).length) delete parent[key];
  }
};
