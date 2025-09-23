/**
 * Navigation Helper for handling chunk loading errors
 * Provides safe navigation methods that handle ChunkLoadError gracefully
 */

/**
 * Safe navigation function that handles chunk loading errors
 * @param {string} url - The URL to navigate to
 * @param {boolean} replace - Whether to replace current history entry
 */
export function safeNavigate(url, replace = false) {
  try {
    if (typeof window !== 'undefined') {
      if (replace) {
        window.location.replace(url);
      } else {
        window.location.href = url;
      }
    }
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback to direct navigation
    window.location.href = url;
  }
}

/**
 * Safe router push that handles chunk loading errors
 * @param {object} router - Next.js router instance
 * @param {string} url - The URL to navigate to
 */
export async function safePush(router, url) {
  try {
    await router.push(url);
  } catch (error) {
    console.error('Router push error:', error);
    
    // Check if it's a chunk loading error
    if (error.name === 'ChunkLoadError' || 
        error.message?.includes('Loading chunk') ||
        error.message?.includes('webpack')) {
      console.log('Chunk loading error detected, using window.location fallback');
      window.location.href = url;
    } else {
      throw error; // Re-throw if it's not a chunk error
    }
  }
}

/**
 * Retry function for failed operations
 * @param {function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 */
export async function retryOperation(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Operation failed (attempt ${i + 1}/${maxRetries}):`, error.message);
      
      // If it's a chunk loading error, reload the page instead of retrying
      if (error.name === 'ChunkLoadError' || 
          error.message?.includes('Loading chunk') ||
          error.message?.includes('webpack')) {
        console.log('Chunk loading error detected, reloading page...');
        window.location.reload();
        return;
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Clear browser cache and reload
 */
export function clearCacheAndReload() {
  if (typeof window !== 'undefined') {
    // Clear various caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Clear localStorage related to chunks
    Object.keys(localStorage).forEach(key => {
      if (key.includes('chunk') || key.includes('webpack')) {
        localStorage.removeItem(key);
      }
    });
    
    // Force reload with cache bypass
    window.location.reload(true);
  }
}

/**
 * Check if current error is a chunk loading error
 * @param {Error} error - The error to check
 */
export function isChunkLoadError(error) {
  return error && (
    error.name === 'ChunkLoadError' ||
    error.message?.includes('Loading chunk') ||
    error.message?.includes('webpack') ||
    error.stack?.includes('webpack')
  );
}
