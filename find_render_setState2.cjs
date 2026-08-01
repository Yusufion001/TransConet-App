const fs = require('fs');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const files = glob.sync('src/**/*.tsx').concat(glob.sync('src/**/*.ts'));

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  try {
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    traverse(ast, {
      CallExpression(path) {
        if (
          path.node.callee.type === 'Identifier' &&
          path.node.callee.name.startsWith('set')
        ) {
          // Check if this call is inside a React component body, but not inside a function or effect
          let isInsideComponent = false;
          let isInsideFunctionOrEffect = false;
          
          let parent = path.parentPath;
          while (parent) {
            if (parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionExpression') {
              isInsideFunctionOrEffect = true;
            }
            if (parent.type === 'FunctionDeclaration' && parent.node.id && parent.node.id.name.match(/^[A-Z]/)) {
              isInsideComponent = true;
            }
            if (parent.type === 'VariableDeclarator' && parent.parentPath.parentPath && parent.parentPath.parentPath.type === 'Program') {
              // top level arrow function
               if (parent.node.id && parent.node.id.name && parent.node.id.name.match(/^[A-Z]/)) {
                 isInsideComponent = true;
               }
            }
            parent = parent.parentPath;
          }
          
          if (isInsideComponent && !isInsideFunctionOrEffect) {
            console.log(`Found direct setState in render: ${file} - ${path.node.callee.name}`);
          }
        }
      }
    });
  } catch (e) {
    // console.log(`Error parsing ${file}: ${e.message}`);
  }
});
