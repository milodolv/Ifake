const LOW_THRESHOLD = 17;
const DISCHARGE_MIN = 1;
const DISCHARGE_MAX = 5;
const CHARGE_MIN = 90;
const CHARGE_MAX = 100;
const MORNING_MIN = 80;
const MORNING_MAX = 100;

interface BatterySessionState {
  level: number;
}

const sessionState: BatterySessionState = {
  level: randomInt(MORNING_MIN, MORNING_MAX),
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clampLevel(level: number): number {
  return Math.max(5, Math.min(100, Math.round(level)));
}

function parseHourFromTime(time?: string): number | null {
  if (!time) return null;
  const match = time.match(/^(\d{1,2}):/);
  if (!match) return null;
  const hour = Number(match[1]);
  return Number.isFinite(hour) ? hour : null;
}

function morningLevel(): number {
  return randomInt(MORNING_MIN, MORNING_MAX);
}

export function getCurrentSessionBatteryLevel(): number {
  return sessionState.level;
}

export function getInitialBatteryLevel(timeHint?: string): number {
  const hour = parseHourFromTime(timeHint);
  if (hour != null && hour >= 6 && hour <= 10) {
    sessionState.level = morningLevel();
  }
  return sessionState.level;
}

export function advanceBatteryForNewConversation(timeHint?: string): number {
  if (sessionState.level <= LOW_THRESHOLD) {
    sessionState.level = randomInt(CHARGE_MIN, CHARGE_MAX);
    return sessionState.level;
  }

  const hour = parseHourFromTime(timeHint);
  const drop = randomInt(DISCHARGE_MIN, DISCHARGE_MAX);

  if (hour != null && hour >= 6 && hour <= 10 && sessionState.level < MORNING_MIN) {
    sessionState.level = morningLevel();
    return sessionState.level;
  }

  sessionState.level = clampLevel(sessionState.level - drop);
  return sessionState.level;
}

export function resetBatterySessionForTests(level = 95): void {
  sessionState.level = clampLevel(level);
}
