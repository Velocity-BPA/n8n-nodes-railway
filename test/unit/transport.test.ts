/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  formatDate,
  safeJsonParse,
  convertToVariables,
  simplifyResponse,
} from '../../nodes/Railway/transport';

import {
  formatDeploymentStatus,
  cleanObject,
  parseArrayString,
  formatBytes,
  isValidRailwayId,
  truncate,
  buildUpdateInput,
  extractConnectionItems,
} from '../../nodes/Railway/utils/helpers';

describe('Transport Functions', () => {
  describe('formatDate', () => {
    it('should format string date to ISO', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should format Date object to ISO', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('should return null for invalid JSON', () => {
      const result = safeJsonParse('invalid json');
      expect(result).toBeNull();
    });
  });

  describe('convertToVariables', () => {
    it('should convert key-value pairs to object', () => {
      const pairs = [
        { name: 'KEY1', value: 'value1' },
        { name: 'KEY2', value: 'value2' },
      ];
      const result = convertToVariables(pairs);
      expect(result).toEqual({ KEY1: 'value1', KEY2: 'value2' });
    });

    it('should skip empty names', () => {
      const pairs = [
        { name: '', value: 'value1' },
        { name: 'KEY2', value: 'value2' },
      ];
      const result = convertToVariables(pairs);
      expect(result).toEqual({ KEY2: 'value2' });
    });
  });

  describe('simplifyResponse', () => {
    it('should remove __typename from response', () => {
      const data = {
        __typename: 'Project',
        id: '123',
        name: 'Test',
      };
      const result = simplifyResponse(data);
      expect(result).toEqual({ id: '123', name: 'Test' });
    });

    it('should handle nested objects', () => {
      const data = {
        __typename: 'Project',
        id: '123',
        service: {
          __typename: 'Service',
          id: '456',
          name: 'Test Service',
        },
      };
      const result = simplifyResponse(data);
      expect(result).toEqual({
        id: '123',
        service: { id: '456', name: 'Test Service' },
      });
    });
  });
});

describe('Helper Functions', () => {
  describe('formatDeploymentStatus', () => {
    it('should format known statuses', () => {
      expect(formatDeploymentStatus('SUCCESS')).toBe('✅ Success');
      expect(formatDeploymentStatus('FAILED')).toBe('❌ Failed');
      expect(formatDeploymentStatus('BUILDING')).toBe('🔨 Building');
    });

    it('should return unknown status as-is', () => {
      expect(formatDeploymentStatus('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('cleanObject', () => {
    it('should remove empty values', () => {
      const obj = {
        name: 'Test',
        description: '',
        count: 0,
        empty: null,
        valid: 'value',
      };
      const result = cleanObject(obj);
      expect(result).toEqual({ name: 'Test', count: 0, valid: 'value' });
    });

    it('should handle nested objects', () => {
      const obj = {
        name: 'Test',
        nested: {
          value: 'test',
          empty: '',
        },
      };
      const result = cleanObject(obj);
      expect(result).toEqual({ name: 'Test', nested: { value: 'test' } });
    });
  });

  describe('parseArrayString', () => {
    it('should parse comma-separated string', () => {
      const result = parseArrayString('a, b, c');
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should return empty array for undefined', () => {
      const result = parseArrayString(undefined);
      expect(result).toEqual([]);
    });

    it('should return array as-is', () => {
      const result = parseArrayString(['a', 'b']);
      expect(result).toEqual(['a', 'b']);
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('isValidRailwayId', () => {
    it('should validate UUID format', () => {
      expect(isValidRailwayId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should validate alphanumeric IDs', () => {
      expect(isValidRailwayId('abc123-def456')).toBe(true);
    });

    it('should reject invalid IDs', () => {
      expect(isValidRailwayId('')).toBe(false);
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const result = truncate('This is a very long string', 10);
      expect(result).toBe('This is...');
    });

    it('should not truncate short strings', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });
  });

  describe('buildUpdateInput', () => {
    it('should build update input from params', () => {
      const params = {
        name: 'Test',
        description: 'Description',
        extra: 'ignored',
      };
      const result = buildUpdateInput(params, ['name', 'description']);
      expect(result).toEqual({ name: 'Test', description: 'Description' });
    });

    it('should skip empty values', () => {
      const params = {
        name: 'Test',
        description: '',
      };
      const result = buildUpdateInput(params, ['name', 'description']);
      expect(result).toEqual({ name: 'Test' });
    });
  });

  describe('extractConnectionItems', () => {
    it('should extract nodes from edges', () => {
      const connection = {
        edges: [
          { node: { id: '1', name: 'Test 1' } },
          { node: { id: '2', name: 'Test 2' } },
        ],
      };
      const result = extractConnectionItems(connection);
      expect(result).toEqual([
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' },
      ]);
    });

    it('should return empty array for undefined', () => {
      const result = extractConnectionItems(undefined);
      expect(result).toEqual([]);
    });
  });
});
