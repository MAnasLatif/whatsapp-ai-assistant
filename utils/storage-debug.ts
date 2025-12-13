/**
 * Storage Debug Utilities
 * Helper functions to test and verify storage persistence
 *
 * Usage in browser console:
 * - Check all storage: chrome.storage.local.get(null, console.log)
 * - Clear all: chrome.storage.local.clear()
 */

import { browser } from "wxt/browser";

/**
 * Log all stored data (for debugging)
 */
export async function debugStorageContents(): Promise<void> {
  try {
    const all = await browser.storage.local.get(null);
    console.group("📦 Storage Contents");
    console.log("Total keys:", Object.keys(all).length);

    for (const [key, value] of Object.entries(all)) {
      const size = JSON.stringify(value).length;
      console.log(`${key}: ${size} bytes`, value);
    }

    console.groupEnd();
  } catch (error) {
    console.error("Failed to read storage:", error);
  }
}

/**
 * Get storage size in bytes
 */
export async function getStorageSize(): Promise<number> {
  try {
    const all = await browser.storage.local.get(null);
    return JSON.stringify(all).length;
  } catch (error) {
    console.error("Failed to calculate storage size:", error);
    return 0;
  }
}

/**
 * Test storage persistence
 */
export async function testStoragePersistence(): Promise<void> {
  const testKey = "wa_ai_test_persistence";
  const testValue = {
    timestamp: Date.now(),
    message: "Storage persistence test",
  };

  console.group("🧪 Storage Persistence Test");

  try {
    // Write test data
    await browser.storage.local.set({ [testKey]: testValue });
    console.log("✅ Test data written:", testValue);

    // Read it back
    const result = await browser.storage.local.get(testKey);
    if (result[testKey]) {
      console.log("✅ Test data read successfully:", result[testKey]);
      console.log("✅ Storage is working correctly");
    } else {
      console.error("❌ Failed to read test data");
    }

    // Clean up
    await browser.storage.local.remove(testKey);
    console.log("✅ Test data cleaned up");
  } catch (error) {
    console.error("❌ Storage test failed:", error);
  }

  console.groupEnd();
}

/**
 * Backup all storage data to JSON
 */
export async function backupStorage(): Promise<string> {
  try {
    const all = await browser.storage.local.get(null);
    const backup = JSON.stringify(all, null, 2);
    console.log("📥 Storage backup created:", backup.length, "bytes");
    return backup;
  } catch (error) {
    console.error("Failed to create backup:", error);
    throw error;
  }
}

/**
 * Restore storage from JSON backup
 */
export async function restoreStorage(backup: string): Promise<void> {
  try {
    const data = JSON.parse(backup);
    await browser.storage.local.clear();
    await browser.storage.local.set(data);
    console.log("📤 Storage restored from backup");
  } catch (error) {
    console.error("Failed to restore backup:", error);
    throw error;
  }
}

// Make functions available globally in dev mode for console access
if (import.meta.env.DEV) {
  (globalThis as any).__storageDebug = {
    showContents: debugStorageContents,
    getSize: getStorageSize,
    test: testStoragePersistence,
    backup: backupStorage,
    restore: restoreStorage,
  };

  console.log("💡 Storage debug tools available: __storageDebug");
  console.log("  - __storageDebug.showContents() - View all stored data");
  console.log("  - __storageDebug.getSize() - Get total storage size");
  console.log("  - __storageDebug.test() - Test persistence");
  console.log("  - __storageDebug.backup() - Create backup");
  console.log("  - __storageDebug.restore(json) - Restore from backup");
}
