// Logger utility - csak development módban logol
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Error-öket mindig logoljuk, mert fontosak
    console.error(...args);
  },
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
};

