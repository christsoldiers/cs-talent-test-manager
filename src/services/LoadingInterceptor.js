// Loading interceptor for FirebaseService
// This file provides a proxy to automatically show/hide loading for all async operations

let loadingCallbacks = null;

export const setLoadingCallbacks = (showLoading, hideLoading) => {
  loadingCallbacks = { showLoading, hideLoading };
};

export const withLoading = (asyncFunction) => {
  return async (...args) => {
    if (loadingCallbacks) {
      loadingCallbacks.showLoading();
    }
    
    try {
      const result = await asyncFunction(...args);
      return result;
    } finally {
      if (loadingCallbacks) {
        // Small delay to prevent flickering on fast operations
        setTimeout(() => {
          loadingCallbacks.hideLoading();
        }, 100);
      }
    }
  };
};

export const createLoadingProxy = (service) => {
  const handler = {
    get(target, prop) {
      const original = target[prop];
      
      // If it's a function and not the constructor
      if (typeof original === 'function' && prop !== 'constructor') {
        // Check if it's an async function by checking if it returns a Promise
        return function(...args) {
          const result = original.apply(target, args);
          
          // If it returns a Promise, wrap it with loading
          if (result && typeof result.then === 'function') {
            return withLoading(() => result)();
          }
          
          return result;
        };
      }
      
      return original;
    }
  };
  
  return new Proxy(service, handler);
};
