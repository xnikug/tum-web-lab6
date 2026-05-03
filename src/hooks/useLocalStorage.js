import { useEffect } from 'react';

export const useLocalStorage = (key, initialValue, dispatch) => {
  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        const parsedValue = JSON.parse(storedValue);
        dispatch({ type: 'LOAD_STATE', payload: parsedValue });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, [key, dispatch]);

  // Save state to localStorage whenever it changes
  const saveToStorage = (state) => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return saveToStorage;
};

export const useTheme = () => {
  const theme = localStorage.getItem('appTheme') || 'light';
  
  const setTheme = (newTheme) => {
    localStorage.setItem('appTheme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return { theme, setTheme };
};
