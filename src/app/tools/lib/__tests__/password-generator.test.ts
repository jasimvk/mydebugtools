import { generatePassword, getPasswordPools, hasUsablePools, scorePassword } from '../password-generator';

const baseOptions = {
  length: 20,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  ambiguous: false,
};

describe('password generator', () => {
  it('generates passwords with requested length and character classes', () => {
    const password = generatePassword({
      length: 20,
      lowercase: true,
      uppercase: true,
      numbers: true,
      symbols: true,
      ambiguous: false,
    });

    expect(password).toHaveLength(20);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%^&*]/);
    expect(password).not.toMatch(/[Il1O0]/);
  });

  it('folds ambiguous characters into their own class rather than a separate pool', () => {
    // Ambiguous chars used to be their own pool, so one was seeded into every
    // password and enabling the option alone gave a 5-character alphabet.
    const pools = getPasswordPools({ ...baseOptions, ambiguous: true });

    expect(pools).toHaveLength(4);
    expect(pools.some((pool) => pool === 'Il1O0')).toBe(false);
    expect(pools[0]).toContain('l');
    expect(pools[1]).toEqual(expect.stringContaining('I'));
    expect(pools[2]).toContain('0');
  });

  it('allows ambiguous characters without requiring them', () => {
    const options = { ...baseOptions, length: 12, ambiguous: true };
    const passwords = Array.from({ length: 40 }, () => generatePassword(options));

    expect(passwords.every((password) => password.length === 12)).toBe(true);
    // At least one password should avoid Il1O0 entirely — previously impossible.
    expect(passwords.some((password) => !/[Il1O0]/.test(password))).toBe(true);
  });

  it('refuses to invent character classes when none are selected', () => {
    const none = {
      length: 20,
      lowercase: false,
      uppercase: false,
      numbers: false,
      symbols: false,
      ambiguous: false,
    };

    expect(hasUsablePools(none)).toBe(false);
    // Used to silently fall back to lowercase+uppercase+numbers while the UI
    // showed every class switched off.
    expect(generatePassword(none)).toBe('');
  });

  it('scores longer mixed passwords higher than short simple passwords', () => {
    expect(scorePassword('correct-horse-battery-staple-2026!').score).toBeGreaterThan(scorePassword('abc123').score);
  });
});
