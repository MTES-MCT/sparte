import { formatNumber, formatDateTime, pluralize } from './formatUtils';

describe('formatUtils', () => {
    describe('formatNumber', () => {
        describe('Basic formatting with automatic decimals', () => {
            it('should format zero with no decimals', () => {
                const result = formatNumber({ number: 0 });
                expect(result).toBe('0');
            });

            it('should format numbers >= 100 with no decimals', () => {
                expect(formatNumber({ number: 100 })).toBe('100');
                expect(formatNumber({ number: 1234 })).toBe('1\u202F234'); // U+00A0 = non-breaking space
                expect(formatNumber({ number: 1234567 })).toBe('1\u202F234\u202F567');
            });

            it('should format numbers [10, 100) with 1 decimal', () => {
                expect(formatNumber({ number: 10 })).toBe('10,0');
                expect(formatNumber({ number: 50.567 })).toBe('50,6');
                expect(formatNumber({ number: 99.99 })).toBe('100,0');
            });

            it('should format numbers [1, 10) with 2 decimals', () => {
                expect(formatNumber({ number: 1 })).toBe('1,00');
                expect(formatNumber({ number: 5.678 })).toBe('5,68');
                expect(formatNumber({ number: 9.999 })).toBe('10,00');
            });

            it('should format numbers (0, 1) with 3 decimals', () => {
                expect(formatNumber({ number: 0.1 })).toBe('0,100');
                expect(formatNumber({ number: 0.5678 })).toBe('0,568');
                expect(formatNumber({ number: 0.9999 })).toBe('1,000');
            });

            it('should handle negative numbers with automatic decimals', () => {
                expect(formatNumber({ number: -100 })).toBe('-100');
                expect(formatNumber({ number: -50.567 })).toBe('-50,6');
                expect(formatNumber({ number: -5.678 })).toBe('-5,68');
                expect(formatNumber({ number: -0.5678 })).toBe('-0,568');
            });
        });

        describe('Custom decimals parameter', () => {
            it('should respect explicit decimals = 0', () => {
                expect(formatNumber({ number: 1234.567, decimals: 0 })).toBe('1\u202F235');
                expect(formatNumber({ number: 0.999, decimals: 0 })).toBe('1');
            });

            it('should respect explicit decimals = 1', () => {
                expect(formatNumber({ number: 1234.567, decimals: 1 })).toBe('1\u202F234,6');
            });

            it('should respect explicit decimals = 2', () => {
                expect(formatNumber({ number: 1234.567, decimals: 2 })).toBe('1\u202F234,57');
                expect(formatNumber({ number: 0, decimals: 2 })).toBe('0,00');
            });

            it('should respect explicit decimals = 3', () => {
                expect(formatNumber({ number: 1234.567, decimals: 3 })).toBe('1\u202F234,567');
            });
        });

        describe('useGrouping parameter', () => {
            it('should use grouping by default', () => {
                expect(formatNumber({ number: 1234567 })).toBe('1\u202F234\u202F567');
            });

            it('should respect useGrouping = true', () => {
                expect(formatNumber({ number: 1234567, useGrouping: true })).toBe('1\u202F234\u202F567');
            });

            it('should respect useGrouping = false', () => {
                expect(formatNumber({ number: 1234567, useGrouping: false })).toBe('1234567');
            });
        });

        describe('addSymbol parameter', () => {
            it('should not add symbol by default', () => {
                expect(formatNumber({ number: 100 })).toBe('100');
                expect(formatNumber({ number: -100 })).toBe('-100');
            });

            it('should add + symbol for positive numbers when addSymbol = true', () => {
                expect(formatNumber({ number: 100, addSymbol: true })).toBe('+100');
                expect(formatNumber({ number: 1234, addSymbol: true })).toBe('+1\u202F234');
            });

            it('should add + symbol for zero when addSymbol = true', () => {
                expect(formatNumber({ number: 0, addSymbol: true })).toBe('+0');
            });

            it('should keep - symbol for negative numbers when addSymbol = true', () => {
                expect(formatNumber({ number: -100, addSymbol: true })).toBe('-100');
                expect(formatNumber({ number: -1234, addSymbol: true })).toBe('-1\u202F234');
            });
        });

        describe('Edge cases and invalid inputs', () => {
            it('should return "0" for undefined', () => {
                expect(formatNumber({ number: undefined as any })).toBe('0');
            });

            it('should return "0" for null', () => {
                expect(formatNumber({ number: null as any })).toBe('0');
            });

            it('should return "0" for NaN', () => {
                expect(formatNumber({ number: Number.NaN })).toBe('0');
            });

            it('should handle Infinity', () => {
                const result = formatNumber({ number: Infinity });
                expect(result).toBe('∞');
            });

            it('should handle -Infinity', () => {
                const result = formatNumber({ number: -Infinity });
                expect(result).toBe('-∞');
            });

            it('should handle very large numbers', () => {
                expect(formatNumber({ number: 999999999999 })).toBe('999\u202F999\u202F999\u202F999');
            });

            it('should handle very small numbers', () => {
                expect(formatNumber({ number: 0.000001 })).toBe('0,000');
            });
        });

        describe('Combined parameters', () => {
            it('should handle decimals + useGrouping + addSymbol', () => {
                expect(formatNumber({
                    number: 1234.567,
                    decimals: 2,
                    useGrouping: true,
                    addSymbol: true
                })).toBe('+1\u202F234,57');
            });

            it('should handle decimals + no grouping + addSymbol for negative', () => {
                expect(formatNumber({
                    number: -1234.567,
                    decimals: 1,
                    useGrouping: false,
                    addSymbol: true
                })).toBe('-1234,6');
            });
        });
    });

    describe('formatDateTime', () => {
        describe('Valid dates', () => {
            it('should format a valid date with default options', () => {
                const date = new Date('2024-01-15T14:30:00');
                const result = formatDateTime(date);
                expect(result).toContain('15');
                expect(result).toContain('janvier');
                expect(result).toContain('2024');
                expect(result).toContain('14');
                expect(result).toContain('30');
            });

            it('should format with custom date-only options', () => {
                const date = new Date('2024-12-25T10:00:00');
                const result = formatDateTime(date, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: undefined,
                    minute: undefined
                });
                expect(result).toContain('25');
                expect(result).toContain('décembre');
                expect(result).toContain('2024');
                expect(result).not.toContain('10');
            });

            it('should format with short month', () => {
                const date = new Date('2024-06-10T10:00:00');
                const result = formatDateTime(date, { month: 'short' });
                expect(result).toContain('juin');
                expect(result).toContain('10');
                expect(result).toContain('2024');
            });

            it('should format with numeric month', () => {
                const date = new Date('2024-06-10T10:00:00');
                const result = formatDateTime(date, { month: 'numeric' });
                expect(result).toContain('06');
                expect(result).toContain('10');
                expect(result).toContain('2024');
            });

            it('should include seconds when specified', () => {
                const date = new Date('2024-01-15T14:30:45');
                const result = formatDateTime(date, { second: '2-digit' });
                expect(result).toContain('45');
            });
        });

        describe('Invalid dates', () => {
            it('should return "Date invalide" for invalid Date object', () => {
                const invalidDate = new Date('invalid');
                expect(formatDateTime(invalidDate)).toBe('Date invalide');
            });

            it('should return "Date invalide" for NaN date', () => {
                const nanDate = new Date(Number.NaN);
                expect(formatDateTime(nanDate)).toBe('Date invalide');
            });

            it('should return "Date invalide" for non-Date object', () => {
                expect(formatDateTime('2024-01-15' as any)).toBe('Date invalide');
                expect(formatDateTime(123456789 as any)).toBe('Date invalide');
                expect(formatDateTime(null as any)).toBe('Date invalide');
            });
        });

        describe('Edge cases', () => {
            it('should handle dates at epoch (1970-01-01)', () => {
                const epoch = new Date(0);
                const result = formatDateTime(epoch);
                expect(result).toContain('1970');
                expect(result).toContain('janvier');
            });

            it('should handle very old dates', () => {
                const oldDate = new Date('1900-01-01T00:00:00');
                const result = formatDateTime(oldDate);
                expect(result).toContain('1900');
            });

            it('should handle future dates', () => {
                const futureDate = new Date('2099-12-31T23:59:59');
                const result = formatDateTime(futureDate);
                expect(result).toContain('2099');
                expect(result).toContain('décembre');
            });
        });
    });

    describe('pluralize', () => {
        describe('Default pluralization (add "s")', () => {
            it('should return singular for count = 0', () => {
                expect(pluralize(0, 'chat')).toBe('chat');
            });

            it('should return singular for count = 1', () => {
                expect(pluralize(1, 'chat')).toBe('chat');
            });

            it('should return plural (with "s") for count = 2', () => {
                expect(pluralize(2, 'chat')).toBe('chats');
            });

            it('should return plural (with "s") for count > 2', () => {
                expect(pluralize(5, 'territoire')).toBe('territoires');
                expect(pluralize(100, 'habitant')).toBe('habitants');
            });
        });

        describe('Custom plural form', () => {
            it('should use custom plural for count > 1', () => {
                expect(pluralize(2, 'cheval', 'chevaux')).toBe('chevaux');
                expect(pluralize(10, 'œil', 'yeux')).toBe('yeux');
            });

            it('should use singular for count = 1 even with custom plural', () => {
                expect(pluralize(1, 'cheval', 'chevaux')).toBe('cheval');
            });

            it('should use singular for count = 0 even with custom plural', () => {
                expect(pluralize(0, 'cheval', 'chevaux')).toBe('cheval');
            });
        });

        describe('Edge cases', () => {
            it('should handle negative numbers (treated as singular)', () => {
                expect(pluralize(-1, 'chat')).toBe('chat');
                expect(pluralize(-5, 'chat')).toBe('chat');
            });

            it('should handle decimal numbers', () => {
                // 1.5 > 1, so plural is expected based on the implementation
                expect(pluralize(1.5, 'chat')).toBe('chats');
                expect(pluralize(2.5, 'chat')).toBe('chats');
            });

            it('should handle very large numbers', () => {
                expect(pluralize(1000000, 'habitant')).toBe('habitants');
            });

            it('should work with empty strings', () => {
                expect(pluralize(1, '')).toBe('');
                expect(pluralize(2, '')).toBe('s');
            });

            it('should handle words already ending with "s"', () => {
                expect(pluralize(1, 'souris')).toBe('souris');
                expect(pluralize(2, 'souris')).toBe('souriss'); // Default behavior adds 's'
                expect(pluralize(2, 'souris', 'souris')).toBe('souris'); // Custom plural
            });
        });
    });
});
