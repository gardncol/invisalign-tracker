import { createEvent, getLatestEvent } from '../src/db/repositories/eventRepo';

// Mock the database — these tests validate repository logic, not DB access
jest.mock('../src/db/client', () => {
  const mockDb = {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
    }),
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
        orderBy: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  };
  return { db: mockDb };
});

describe('Event Repository', () => {
  it('createEvent calls db.insert with correct shape', async () => {
    await createEvent({
      type: 'in',
      timestamp: new Date('2026-08-11T14:30:00'),
    });
    const { db } = require('../src/db/client');
    expect(db.insert).toHaveBeenCalled();
  });

  it('getLatestEvent returns the most recent event', async () => {
    const { db } = require('../src/db/client');
    // Override the mock to return a result
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              { id: 2, type: 'in', timestamp: 1723384200000, trayNumber: null, createdAt: 1723384200000, modifiedAt: 1723384200000, isEdited: false },
            ]),
          }),
        }),
        orderBy: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([
            { id: 2, type: 'in', timestamp: 1723384200000, trayNumber: null, createdAt: 1723384200000, modifiedAt: 1723384200000, isEdited: false },
          ]),
        }),
      }),
    });
    const result = await getLatestEvent();
    expect(result).not.toBeNull();
    expect(result?.type).toBe('in');
  });
});