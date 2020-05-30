import { activeListening } from './store';

export async function performAction(action) {
  if (activeListening.get()) {
    action();
  }
}

export function performActionWithDelay(action) {
  setTimeout(() => {
    performAction(action);
  }, 100);
}

