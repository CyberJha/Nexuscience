/**
 * Safe Mathematical Calculator Tool
 * Evaluates math expressions securely without arbitrary code execution.
 * Supports standard math operations, powers, and math functions (sqrt, sin, cos, abs, etc.).
 */

export function executeCalculator(expression: string): string {
  try {
    const cleaned = cleanExpression(expression);
    const result = evaluateSafeMath(cleaned);
    
    // Format nicely (integers as integers, floats capped to precision)
    let formattedResult: string;
    if (typeof result === 'number') {
      if (Number.isInteger(result)) {
        formattedResult = result.toString();
      } else {
        formattedResult = Number(result.toFixed(8)).toString();
      }
    } else {
      formattedResult = String(result);
    }

    return `[TOOL USED: calculator]\n\n${formattedResult}`;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return `Error: ${msg}`;
  }
}

function cleanExpression(expr: string): string {
  let cleaned = expr.trim();
  // Strip enclosing quotes or code fences if the model included them
  if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

/**
 * Tokenizes and evaluates arithmetic expressions with support for math.* functions.
 */
function evaluateSafeMath(expression: string): number {
  let expr = expression;

  // Replace constants
  expr = expr.replace(/\bmath\.pi\b|\bpi\b/gi, `${Math.PI}`);
  expr = expr.replace(/\bmath\.e\b|\be\b/gi, `${Math.E}`);

  // Replace power operator ** with ^
  expr = expr.replace(/\*\*/g, '^');

  // Map math functions
  const mathFuncs: Record<string, (x: number) => number> = {
    'math.sqrt': Math.sqrt,
    'sqrt': Math.sqrt,
    'math.abs': Math.abs,
    'abs': Math.abs,
    'math.sin': Math.sin,
    'sin': Math.sin,
    'math.cos': Math.cos,
    'cos': Math.cos,
    'math.tan': Math.tan,
    'tan': Math.tan,
    'math.log': Math.log,
    'log': Math.log,
    'math.exp': Math.exp,
    'exp': Math.exp,
    'math.floor': Math.floor,
    'floor': Math.floor,
    'math.ceil': Math.ceil,
    'ceil': Math.ceil,
    'math.round': Math.round,
    'round': Math.round,
  };

  // Replace function calls iteratively: e.g. math.sqrt(144)
  for (const [name, fn] of Object.entries(mathFuncs)) {
    const escaped = name.replace('.', '\\.');
    const regex = new RegExp(`\\b${escaped}\\s*\\(([^()]+)\\)`, 'gi');
    let safety = 0;
    while (regex.test(expr) && safety++ < 20) {
      expr = expr.replace(regex, (_, inner) => {
        const val = evaluateSafeMath(inner);
        return String(fn(val));
      });
    }
  }

  // Handle math.pow(x, y)
  const powRegex = /\b(?:math\.)?pow\s*\(([^,()]+),\s*([^()]+)\)/gi;
  let powSafety = 0;
  while (powRegex.test(expr) && powSafety++ < 20) {
    expr = expr.replace(powRegex, (_, x, y) => {
      const valX = evaluateSafeMath(x);
      const valY = evaluateSafeMath(y);
      return String(Math.pow(valX, valY));
    });
  }

  // Tokenize the arithmetic expression
  const tokens = tokenize(expr);
  if (tokens.length === 0) {
    throw new Error('Empty mathematical expression');
  }

  return parseExpression(tokens);
}

type TokenType = 'NUMBER' | 'OP' | 'LPAREN' | 'RPAREN';

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    if ('+-*/%^'.includes(char)) {
      // Check for unary minus/plus
      const prev = tokens[tokens.length - 1];
      const isUnary = (char === '-' || char === '+') && (!prev || prev.type === 'OP' || prev.type === 'LPAREN');
      if (isUnary) {
        // Read the number following the unary sign
        let numStr = char;
        i++;
        while (i < input.length && /[0-9.]/.test(input[i])) {
          numStr += input[i];
          i++;
        }
        if (numStr === '-' || numStr === '+') {
          throw new Error(`Invalid unary operator near ${char}`);
        }
        tokens.push({ type: 'NUMBER', value: numStr });
        continue;
      }

      tokens.push({ type: 'OP', value: char });
      i++;
      continue;
    }

    // Number (including decimals and scientific notation like 1e5)
    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(input[i + 1] || ''))) {
      let numStr = '';
      while (i < input.length && /[0-9.eE+-]/.test(input[i])) {
        // Only allow + or - if preceded by e or E
        if ((input[i] === '+' || input[i] === '-') && !/[eE]/.test(input[i - 1] || '')) {
          break;
        }
        numStr += input[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    throw new Error(`Unsupported character or identifier in math expression: "${char}"`);
  }

  return tokens;
}

/**
 * Standard Recursive-Descent Parser for arithmetic expressions:
 * Expression = Term (('+' | '-') Term)*
 * Term       = Factor (('*' | '/' | '%') Factor)*
 * Factor     = Power ('^' Power)*
 * Primary    = NUMBER | '(' Expression ')'
 */
function parseExpression(tokens: Token[]): number {
  let pos = 0;

  function peek(): Token | undefined {
    return tokens[pos];
  }

  function consume(expectedType?: TokenType): Token {
    const t = tokens[pos];
    if (!t) throw new Error('Unexpected end of mathematical expression');
    if (expectedType && t.type !== expectedType) {
      throw new Error(`Expected ${expectedType}, found ${t.type} (${t.value})`);
    }
    pos++;
    return t;
  }

  function parsePrimary(): number {
    const token = peek();
    if (!token) throw new Error('Unexpected end of expression');

    if (token.type === 'NUMBER') {
      consume('NUMBER');
      const val = parseFloat(token.value);
      if (isNaN(val)) throw new Error(`Invalid number: ${token.value}`);
      return val;
    }

    if (token.type === 'LPAREN') {
      consume('LPAREN');
      const val = parseAddSub();
      consume('RPAREN');
      return val;
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  function parsePower(): number {
    let base = parsePrimary();
    while (peek() && peek()!.type === 'OP' && peek()!.value === '^') {
      consume('OP');
      const exp = parsePower(); // right-associative
      base = Math.pow(base, exp);
    }
    return base;
  }

  function parseMulDiv(): number {
    let left = parsePower();
    while (peek() && peek()!.type === 'OP' && ['*', '/', '%'].includes(peek()!.value)) {
      const op = consume('OP').value;
      const right = parsePower();
      if (op === '*') left = left * right;
      else if (op === '/') {
        if (right === 0) throw new Error('Division by zero');
        left = left / right;
      } else if (op === '%') left = left % right;
    }
    return left;
  }

  function parseAddSub(): number {
    let left = parseMulDiv();
    while (peek() && peek()!.type === 'OP' && ['+', '-'].includes(peek()!.value)) {
      const op = consume('OP').value;
      const right = parseMulDiv();
      if (op === '+') left = left + right;
      else if (op === '-') left = left - right;
    }
    return left;
  }

  const result = parseAddSub();
  if (pos < tokens.length) {
    throw new Error(`Unexpected token at position ${pos}: ${tokens[pos].value}`);
  }
  return result;
}
