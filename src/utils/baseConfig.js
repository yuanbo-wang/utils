
export const protocol = window?.sys_con?.ssl ? "https://" : "http://";
export const hostname = location.hostname;
export const port = location.port;
export const isDev = process.env.NODE_ENV === 'development'
export const baseUrl = protocol + hostname + ":" + port;
