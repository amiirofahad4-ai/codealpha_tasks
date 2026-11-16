import * as Clipboard from 'expo-clipboard';
import { Platform, Share } from 'react-native';

export const formatQuote = (quote) => `“${quote.text}” — ${quote.author}`;

export async function copyQuote(quote) {
  await Clipboard.setStringAsync(formatQuote(quote));
}

/**
 * Opens the native share sheet. Returns 'shared', 'dismissed' or 'copied'
 * (web browsers without the Web Share API fall back to the clipboard).
 */
export async function shareQuote(quote) {
  const message = formatQuote(quote);
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
    await Clipboard.setStringAsync(message);
    return 'copied';
  }
  try {
    const result = await Share.share({ message });
    return result.action === Share.dismissedAction ? 'dismissed' : 'shared';
  } catch {
    if (Platform.OS === 'web') {
      // User cancelled the browser share sheet, or it isn't allowed here.
      return 'dismissed';
    }
    throw new Error('Share failed');
  }
}
