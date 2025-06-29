import { readdir, rm, unlink } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Cross-platform recursive directory removal
 * @param {string} path - Directory path to remove
 * @returns {Promise<void>}
 */
export async function removeDirectory(path) {
  try {
    await rm(path, { recursive: true, force: true });
  } catch (error) {
    // Ignore if directory doesn't exist
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Remove files matching a pattern in a directory
 * @param {string} dir - Directory to search in
 * @param {RegExp} pattern - Pattern to match files against
 * @returns {Promise<void>}
 */
export async function removeFilesWithPattern(dir, pattern) {
  try {
    const files = await readdir(dir, { recursive: true });
    const removals = files
      .filter((file) => pattern.test(file))
      .map((file) => unlink(join(dir, file)));

    await Promise.all(removals);
  } catch (error) {
    // Ignore if directory doesn't exist
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}
