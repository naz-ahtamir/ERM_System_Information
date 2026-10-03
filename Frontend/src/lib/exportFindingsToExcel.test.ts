import { exportFindingsToExcel } from './exportFindingsToExcel';

describe('exportFindingsToExcel', () => {
  // Mock the XLSX library
  const mockWriteFile = jest.fn();
  jest.mock('xlsx', () => ({
    utils: {
      book_new: jest.fn(() => ({})),
      json_to_sheet: jest.fn((data) => ({
        '!ref': 'A1:H' + (data.length + 1),
        'A1': { t: 's', v: 'Title' },
        'B1': { t: 's', v: 'Status' },
        'C1': { t: 's', v: 'Location' },
        'D1': { t: 's', v: 'Date' },
        'E1': { t: 's', v: 'Category' },
        'F1': { t: 's', v: 'Hazard Level' },
        'G1': { t: 's', v: 'Created By' },
        'H1': { t: 's', v: 'Approved By' },
      })),
      encode_range: jest.fn((range) => range),
      decode_range: jest.fn((range) => ({
        s: { c: 0, r: 0 },
        e: { c: 7, r: 0 },
      })),
      encode_col: jest.fn((col) => String.fromCharCode(65 + col)),
      book_append_sheet: jest.fn(),
    },
    writeFile: mockWriteFile,
  }));

  beforeEach(() => {
    mockWriteFile.mockClear();
  });

  test('should handle empty findings array', () => {
    // Empty array should not throw error
    expect(() => {
      exportFindingsToExcel([]);
    }).not.toThrow();
  });

  test('should handle findings with all fields', () => {
    const findings = [
      {
        id: '1',
        title: 'Test Finding',
        findingStatus: 'OPEN' as const,
        data: {
          lokasiUtama: 'Area A',
          tanggalInspeksi: '2026-07-14',
          kategoriHazard: 'Electrical',
          levelHazard: 'High',
        },
        createdAt: '2026-07-14T10:30:00Z',
        createdBy: 'Test User',
        approvedBy: 'Approver Name',
      },
    ];

    expect(() => {
      exportFindingsToExcel(findings);
    }).not.toThrow();

    // Verify writeFile was called with correct filename format
    expect(mockWriteFile).toHaveBeenCalled();
    const [, filename] = mockWriteFile.mock.calls[0];
    expect(filename).toMatch(/findings-export-\d{4}-\d{2}-\d{2}\.xlsx/);
  });

  test('should handle findings with missing optional fields', () => {
    const findings = [
      {
        id: '1',
        title: 'Test Finding',
        findingStatus: 'OPEN' as const,
        createdAt: '2026-07-14T10:30:00Z',
        createdBy: 'Test User',
      },
    ];

    expect(() => {
      exportFindingsToExcel(findings);
    }).not.toThrow();
  });

  test('should generate filename with correct date format', () => {
    const findings = [
      {
        id: '1',
        title: 'Test',
        findingStatus: 'OPEN' as const,
        createdAt: '2026-07-14T10:30:00Z',
        createdBy: 'User',
      },
    ];

    exportFindingsToExcel(findings);

    expect(mockWriteFile).toHaveBeenCalled();
    const [, filename] = mockWriteFile.mock.calls[0];
    
    // Filename should follow pattern: findings-export-YYYY-MM-DD.xlsx
    expect(filename).toMatch(/findings-export-\d{4}-\d{2}-\d{2}\.xlsx/);
  });

  test('should handle multiple findings', () => {
    const findings = [
      {
        id: '1',
        title: 'Finding 1',
        findingStatus: 'OPEN' as const,
        createdAt: '2026-07-14T10:30:00Z',
        createdBy: 'User 1',
      },
      {
        id: '2',
        title: 'Finding 2',
        findingStatus: 'INPG' as const,
        createdAt: '2026-07-15T10:30:00Z',
        createdBy: 'User 2',
      },
      {
        id: '3',
        title: 'Finding 3',
        findingStatus: 'CLSD' as const,
        createdAt: '2026-07-16T10:30:00Z',
        createdBy: 'User 3',
      },
    ];

    expect(() => {
      exportFindingsToExcel(findings);
    }).not.toThrow();

    expect(mockWriteFile).toHaveBeenCalled();
  });
});
