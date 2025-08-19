/**
 * This interface defines a basic template-module interface in beta version.
 * It contains a function to log a message which is implemented by the module as a console,
 * but other modules could implement the interface differently.
 */
export declare const Log: (message: string) => Promise<void>;
