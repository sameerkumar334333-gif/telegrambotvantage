// In-memory state management for user conversation flow
// In production, you might want to use Redis or database for this

interface UserState {
  step: 'waiting_for_uid' | 'completed';
  uid?: string;
}

const userStates = new Map<number, UserState>();

export function getUserState(telegramUserId: number): UserState | null {
  return userStates.get(telegramUserId) || null;
}

export function setUserState(telegramUserId: number, state: UserState): void {
  userStates.set(telegramUserId, state);
}

export function clearUserState(telegramUserId: number): void {
  userStates.delete(telegramUserId);
}

export function resetUserState(telegramUserId: number): void {
  clearUserState(telegramUserId);
}

