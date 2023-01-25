const { format } = require('../../rest/util/emailFormatter');

describe('Testing emailFormatter util', () => {
  describe('Testing format', () => {
    it('should return empty string if email is empty', () => {
      expect(format('')).toBe('');
    });

    it('should return empty string if email has no @', () => {
      expect(format('email')).toBe('');
    });

    it('should format email correctly', () => {
      expect(format('test@test.test')).toBe('te...@...test');
    });
  });
});
