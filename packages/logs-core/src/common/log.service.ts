export interface GlobalLogConfig {
  // 默认为 LogLevel.Info
  logLevel?: LogLevel;
  // 设置log目录的绝对路径，默认为 ~/.kaitian/logs/
  logRootFolder?: string;
}

export enum SupportLogNamespace {
  // 主进程
  Main = 'main',
  // 渲染进程
  Render = 'render',
  // Node进程
  Node = 'node',
  // 浏览器进程
  Browser = 'browser',
  // 插件进程
  ExtensionHost = 'extHost',
  // 应用层
  App = 'App',
  // 其他未分类
  OTHER = 'other',
}

export enum LogLevel {
  Verbose,
  Debug,
  Info,
  Warning,
  Error,
  Critical,
  Off,
}

export interface ILogService {
  getLevel(): LogLevel;
  setLevel(level: LogLevel): void;

  setShowConsoleLog(isShow: boolean);
  setOptions(options: SimpleLogServiceOptions);

  verbose(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  log(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string | Error, ...args: any[]): void;
  critical(message: string | Error, ...args: any[]): void;

  dispose(): void;
}

export interface ILogServiceManage {
  getLogger(namespace: SupportLogNamespace): ILogService;
  getGlobalLogLevel(): LogLevel;
  removeLogger(namespace: SupportLogNamespace);
  setGlobalLogLevel(level: LogLevel);
  getLogFolder(): string;
  cleanOldLogs(): Promise<void>;
}

export interface SimpleLogServiceOptions {
  namespace?: string;
  logLevel?: LogLevel;
  pid?: number;
  isShowConsoleLog?: boolean;
}

export interface ILogServiceOptions extends SimpleLogServiceOptions {
  logServiceManage: ILogServiceManage;
  namespace: string;
  logLevel?: LogLevel;
  pid?: number;
  isShowConsoleLog?: boolean;
}

export const LogServiceForClientPath =  'LogServiceForClient';
export const ILogServiceForClient = Symbol('LogServiceForClient');

export interface ILogServiceForClient {
  getLevel(namespace: SupportLogNamespace): LogLevel;
  setLevel(namespace: SupportLogNamespace, level: LogLevel): void;

  verbose(namespace: SupportLogNamespace, message: string, pid?: number): void;
  debug(namespace: SupportLogNamespace, message: string, pid?: number): void;
  log(namespace: SupportLogNamespace, message: string, pid?: number): void;
  warn(namespace: SupportLogNamespace, message: string, pid?: number): void;
  error(namespace: SupportLogNamespace, message: string, pid?: number): void;
  critical(namespace: SupportLogNamespace, message: string, pid?: number): void;

  dispose(namespace: SupportLogNamespace): void;

  setGlobalLogLevel(level: LogLevel);
  getGlobalLogLevel();
  disposeAll();
}

export interface LoggerManageInitOptions {
  logDir?: string;
  logLevel?: LogLevel;
}

export function format(args: any): string {
  let result = '';

  for (let i = 0; i < args.length; i++) {
    let a = args[i];

    if (typeof a === 'object') {
      try {
        a = JSON.stringify(a);
      } catch (e) { }
    }

    result += (i > 0 ? ' ' : '') + a;
  }

  return result;
}
