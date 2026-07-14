import { useCallback } from 'react';

// A simple hook that can be used to show toasts.
// For now, it will use a simple window alert or custom DOM injection, 
// to avoid needing to wrap the whole app in a Context.
export function useToast() {
  const showToast = useCallback((type, message) => {
    // Basic implementation that injects a toast element into the DOM
    const toastEl = document.createElement('div');
    toastEl.className = `fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg z-50 transition-opacity duration-300 flex items-center gap-2 ${
      type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-800'
    }`;
    toastEl.innerText = message;
    
    document.body.appendChild(toastEl);
    
    setTimeout(() => {
      toastEl.style.opacity = '0';
      setTimeout(() => {
        toastEl.remove();
      }, 300);
    }, 3000);
  }, []);

  return { showToast };
}
