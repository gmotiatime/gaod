import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatStore } from './chatStore';
import { db } from './db';

// Mock the db module
vi.mock('./db', () => ({
  db: {
    getChats: vi.fn(),
    createChat: vi.fn(),
    updateChat: vi.fn(),
    deleteChat: vi.fn(),
  },
}));

describe('chatStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getChats should call db.getChats with userId', async () => {
    const userId = 'user-123';
    await chatStore.getChats(userId);
    expect(db.getChats).toHaveBeenCalledWith(userId);
  });

  it('createChat should throw error without userId', async () => {
    await expect(chatStore.createChat('Hello')).rejects.toThrow(
      'User ID required to create chat'
    );
  });

  it('createChat should call db.createChat with correct structure', async () => {
    const userId = 'user-123';
    const message = 'Hello world';

    // Mock db.createChat implementation to return what it receives (roughly)
    db.createChat.mockImplementation(async (chat) => chat);

    await chatStore.createChat(message, userId);

    expect(db.createChat).toHaveBeenCalledTimes(1);
    const createdChat = db.createChat.mock.calls[0][0];

    expect(createdChat.userId).toBe(userId);
    expect(createdChat.title).toBe('Hello world...');
    expect(createdChat.messages).toHaveLength(1);
    expect(createdChat.messages[0].content).toBe(message);
    expect(createdChat.messages[0].role).toBe('user');
  });
});
