import { useColorScheme } from 'react-native';

export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    primary: string;
    success: string;
    warning: string;
    danger: string;
    border: string;
    inputBorder: string;
    tabBg: string;
    tabActive: string;
    tabInactive: string;
    barTrack: string;
  };
}

const lightTheme: Theme['colors'] = {
  background: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#f5f5f5',
  text: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  primary: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  border: '#eee',
  inputBorder: '#ddd',
  tabBg: '#ffffff',
  tabActive: '#007AFF',
  tabInactive: '#999999',
  barTrack: '#eee',
};

const darkTheme: Theme['colors'] = {
  background: '#000000',
  surface: '#1c1c1e',
  surfaceAlt: '#2c2c2e',
  text: '#ffffff',
  textSecondary: '#aeaeb2',
  textTertiary: '#636366',
  primary: '#0a84ff',
  success: '#30d158',
  warning: '#ff9f0a',
  danger: '#ff453a',
  border: '#38383a',
  inputBorder: '#48484a',
  tabBg: '#1c1c1e',
  tabActive: '#0a84ff',
  tabInactive: '#636366',
  barTrack: '#2c2c2e',
};

export function getTheme(mode: 'light' | 'dark' | 'system' | undefined): Theme {
  const resolved = mode === 'dark' ? 'dark' : 'light';
  return {
    mode: resolved,
    colors: resolved === 'dark' ? darkTheme : lightTheme,
  };
}

export function useTheme(userPreference: 'light' | 'dark' | 'system' | undefined = 'system'): Theme {
  // useColorScheme may return null on some platforms — default to 'light' in that case
  const systemScheme = useColorScheme();
  const resolved = userPreference === 'dark'
    ? 'dark'
    : userPreference === 'light'
    ? 'light'
    : (systemScheme === 'dark' ? 'dark' : 'light');
  return {
    mode: resolved,
    colors: resolved === 'dark' ? darkTheme : lightTheme,
  };
}