export interface WatchCommandOptions {
  log?: (message: string) => void;
}

/** `lombok-ts watch` is a stub for Phase 2; logs a note and exits. */
export async function runWatch(opts: WatchCommandOptions = {}): Promise<void> {
  const log = opts.log ?? ((msg) => console.info(msg));
  log('Watch mode is not implemented yet (Phase 2).');
  log('Re-run `lombok-ts generate` after changes.');
}
