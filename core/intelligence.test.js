import { forecastDemand } from './intelligence';

// core/intelligence.test.js

describe('forecastDemand', () => {
    const period = {
        start: '2024-08-01',
        end: '2024-08-03'
    };

    it('returns empty object for empty bookings', () => {
        const result = forecastDemand({ bookings: [], period });
        expect(result).toEqual({
            '2024-08-01': 0,
            '2024-08-02': 0,
            '2024-08-03': 0
        });
    });

    it('returns empty object for missing period', () => {
        expect(forecastDemand({ bookings: [], period: null })).toEqual([]);
        expect(forecastDemand({ bookings: [], period: {} })).toEqual([]);
        expect(forecastDemand({ bookings: [], period: { start: null, end: null } })).toEqual([]);
    });

    it('counts bookings per day using startsAt', () => {
        const bookings = [
            { startsAt: '2024-08-01T10:00:00Z' },
            { startsAt: '2024-08-01T12:00:00Z' },
            { startsAt: '2024-08-02T09:00:00Z' }
        ];
        const result = forecastDemand({ bookings, period });
        expect(result).toEqual({
            '2024-08-01': 2,
            '2024-08-02': 1,
            '2024-08-03': 0
        });
    });

    it('counts bookings per day using date field', () => {
        const bookings = [
            { date: '2024-08-01T10:00:00Z' },
            { date: '2024-08-03T12:00:00Z' }
        ];
        const result = forecastDemand({ bookings, period });
        expect(result).toEqual({
            '2024-08-01': 1,
            '2024-08-02': 0,
            '2024-08-03': 1
        });
    });

    it('ignores bookings outside the period', () => {
        const bookings = [
            { startsAt: '2024-07-31T23:59:59Z' },
            { startsAt: '2024-08-04T00:00:00Z' }
        ];
        const result = forecastDemand({ bookings, period });
        expect(result).toEqual({
            '2024-08-01': 0,
            '2024-08-02': 0,
            '2024-08-03': 0
        });
    });

    it('handles bookings with missing date fields gracefully', () => {
        const bookings = [
            {},
            { startsAt: null },
            { date: undefined }
        ];
        const result = forecastDemand({ bookings, period });
        expect(result).toEqual({
            '2024-08-01': 0,
            '2024-08-02': 0,
            '2024-08-03': 0
        });
    });

    it('handles bookings with invalid date strings', () => {
        const bookings = [
            { startsAt: 'not-a-date' },
            { date: '2024-08-02T09:00:00Z' }
        ];
        const result = forecastDemand({ bookings, period });
        expect(result).toEqual({
            '2024-08-01': 0,
            '2024-08-02': 1,
            '2024-08-03': 0
        });
    });

    it('counts bookings with mixed startsAt and date fields', () => {
        const bookings = [
            { startsAt: '2024-08-01T10:00:00Z' },
            { date: '2024-08-01T12:00:00Z' },
            { startsAt: '2024-08-02T09:00:00Z' },
            { date: '2024-08-03T15:00:00Z' }
        ];
        const result = forecastDemand({ bookings, period });
        expect(result).toEqual({
            '2024-08-01': 2,
            '2024-08-02': 1,
            '2024-08-03': 1
        });
    });
});