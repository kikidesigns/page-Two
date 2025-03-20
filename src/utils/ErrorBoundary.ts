import { EventEmitter } from 'events';

export interface ErrorInfo {
  error: Error;
  componentName: string;
  methodName: string;
  data?: any;
}

export class ErrorBoundary extends EventEmitter {
  private static instance: ErrorBoundary;
  private errorHandlers: Map<string, (error: ErrorInfo) => void>;

  private constructor() {
    super();
    this.errorHandlers = new Map();
  }

  public static getInstance(): ErrorBoundary {
    if (!ErrorBoundary.instance) {
      ErrorBoundary.instance = new ErrorBoundary();
    }
    return ErrorBoundary.instance;
  }

  public registerHandler(componentName: string, handler: (error: ErrorInfo) => void): void {
    this.errorHandlers.set(componentName, handler);
  }

  public removeHandler(componentName: string): void {
    this.errorHandlers.delete(componentName);
  }

  public catchError(componentName: string, methodName: string, error: Error, data?: any): void {
    const errorInfo: ErrorInfo = {
      error,
      componentName,
      methodName,
      data
    };

    // Emit error event
    this.emit('error', errorInfo);

    // Call component-specific handler if exists
    const handler = this.errorHandlers.get(componentName);
    if (handler) {
      handler(errorInfo);
    }

    // Log error
    console.error(`Error in ${componentName}.${methodName}:`, error);
  }

  public wrapMethod<T extends any[], R>(
    componentName: string,
    methodName: string,
    method: (...args: T) => Promise<R> | R
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        const result = await method(...args);
        return result;
      } catch (error) {
        this.catchError(componentName, methodName, error as Error, { args });
        throw error;
      }
    };
  }
}