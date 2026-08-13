export type PasswordOptions = {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  ambiguous: boolean;
};

// Each base class already has its ambiguous members removed; the "ambiguous"
// option adds them back to their own class. Modelling them as a separate pool
// instead meant enabling the option guaranteed an `Il1O0` character in every
// password, and enabling it alone produced passwords from a 5-character alphabet.
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const LOWERCASE_AMBIGUOUS = 'l';
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const UPPERCASE_AMBIGUOUS = 'IO';
const NUMBERS = '23456789';
const NUMBERS_AMBIGUOUS = '01';
const SYMBOLS = '!@#$%^&*';

function randomInt(max: number) {
  if (max <= 0) return 0;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Rejection sampling: a plain `% max` biases the low end of the alphabet,
    // which matters in a tool whose only job is unbiased entropy.
    const limit = Math.floor(0x1_0000_0000 / max) * max;
    const values = new Uint32Array(1);
    let value = 0;
    do {
      crypto.getRandomValues(values);
      value = values[0];
    } while (value >= limit);
    return value % max;
  }
  return Math.floor(Math.random() * max);
}

function shuffle(value: string[]) {
  const copy = [...value];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function getPasswordPools(options: PasswordOptions) {
  const withAmbiguous = (base: string, extra: string) =>
    options.ambiguous ? base + extra : base;

  return [
    options.lowercase ? withAmbiguous(LOWERCASE, LOWERCASE_AMBIGUOUS) : '',
    options.uppercase ? withAmbiguous(UPPERCASE, UPPERCASE_AMBIGUOUS) : '',
    options.numbers ? withAmbiguous(NUMBERS, NUMBERS_AMBIGUOUS) : '',
    options.symbols ? SYMBOLS : '',
  ].filter(Boolean);
}

/** True when at least one character class is selected. */
export function hasUsablePools(options: PasswordOptions) {
  return getPasswordPools(options).length > 0;
}

export function generatePassword(options: PasswordOptions) {
  const length = Math.max(4, Math.min(128, Math.floor(options.length || 16)));
  const pools = getPasswordPools(options);

  // No class selected. This used to silently fall back to lowercase+uppercase+
  // numbers, so the UI showed every box unticked while emitting mixed-class
  // passwords. Callers should gate on `hasUsablePools` and show a validation error.
  if (pools.length === 0) return '';
  const allChars = pools.join('');
  const required = pools.map((pool) => pool[randomInt(pool.length)]);

  while (required.length < length) {
    required.push(allChars[randomInt(allChars.length)]);
  }

  return shuffle(required).join('');
}

export function scorePassword(password: string) {
  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const lengthScore = Math.min(50, password.length * 2);
  const classScore = classes * 12;
  const penalty = /(.)\1{2,}|password|admin|qwerty|123456/i.test(password) ? 20 : 0;
  const score = Math.max(0, Math.min(100, lengthScore + classScore - penalty));
  const label = score >= 80 ? 'Strong' : score >= 55 ? 'Good' : score >= 30 ? 'Weak' : 'Very weak';

  return {
    score,
    label,
    classes,
  };
}
