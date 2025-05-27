export interface JsonDiff {
  added?: boolean;
  removed?: boolean;
  modified?: boolean;
  value?: any;
  oldValue?: any;
  children?: Record<string, JsonDiff>;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}