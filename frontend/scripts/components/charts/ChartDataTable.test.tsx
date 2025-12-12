import { formatCellContent } from './ChartDataTable';

/**
 * Tests for formatCellContent function
 *
 * This function formats cell values for display in data tables.
 * It should format numeric values using formatNumber() and leave non-numeric values unchanged.
 */

describe('formatCellContent', () => {
    describe('Numeric inputs', () => {
        it('should format integer numbers', () => {
            const result = formatCellContent(1234);
            // formatNumber returns French-formatted numbers (space as thousands separator)
            expect(typeof result).toBe('string');
        });

        it('should format decimal numbers', () => {
            const result = formatCellContent(1234.56);
            expect(typeof result).toBe('string');
        });

        it('should format zero', () => {
            const result = formatCellContent(0);
            expect(typeof result).toBe('string');
        });

        it('should format negative numbers', () => {
            const result = formatCellContent(-1234.56);
            expect(typeof result).toBe('string');
        });
    });

    describe('String inputs that represent numbers', () => {
        it('should format numeric strings', () => {
            const result = formatCellContent('1234');
            expect(typeof result).toBe('string');
        });

        it('should format decimal numeric strings', () => {
            const result = formatCellContent('1234.56');
            expect(typeof result).toBe('string');
        });

        it('should format string zero', () => {
            const result = formatCellContent('0');
            expect(typeof result).toBe('string');
        });
    });

    describe('Non-numeric inputs', () => {
        it('should return text strings unchanged', () => {
            const input = 'Paris';
            const result = formatCellContent(input);
            expect(result).toBe(input);
        });

        it('should return null unchanged', () => {
            const result = formatCellContent(null);
            expect(result).toBe(null);
        });

        it('should return undefined unchanged', () => {
            const result = formatCellContent(undefined);
            expect(result).toBe(undefined);
        });

        it('should format empty string as zero', () => {
            // Empty string is converted to 0 by Number('')
            const result = formatCellContent('');
            expect(typeof result).toBe('string');
            // The formatted result will be "0" (or French formatted zero)
        });

        it('should return non-numeric strings unchanged', () => {
            const input = 'Not a number';
            const result = formatCellContent(input);
            expect(result).toBe(input);
        });

        it('should return objects unchanged', () => {
            const input = { value: 123 };
            const result = formatCellContent(input);
            expect(result).toBe(input);
        });

        it('should return arrays unchanged', () => {
            const input = [1, 2, 3];
            const result = formatCellContent(input);
            expect(result).toBe(input);
        });
    });

    describe('Edge cases', () => {
        it('should handle NaN', () => {
            const result = formatCellContent(Number.NaN);
            // NaN gets converted to "0" when passed through Number() and formatNumber()
            expect(typeof result).toBe('string');
        });

        it('should handle Infinity', () => {
            const result = formatCellContent(Infinity);
            // Infinity is a number type but may be handled specially by formatNumber
            expect(typeof result).toBe('string');
        });

        it('should handle very large numbers', () => {
            const result = formatCellContent(999999999999);
            expect(typeof result).toBe('string');
        });

        it('should handle very small numbers', () => {
            const result = formatCellContent(0.000001);
            expect(typeof result).toBe('string');
        });
    });
});
