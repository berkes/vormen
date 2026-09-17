/** Writes a single line of output. */
export type Log = (message: string) => void;

/**
 * The contract every subcommand module implements so that `vormen.ts` can
 * list, document and run it without knowing anything else about it.
 */
export interface Subcommand {
  /** Single line description, listed by `vormen --help`. */
  readonly summary: string;
  /** Full help text, printed by `vormen <subcommand> --help`. */
  readonly help: string;
  /** Runs the subcommand and resolves to the exit code. */
  main(args: string[], log?: Log): number | Promise<number>;
}
