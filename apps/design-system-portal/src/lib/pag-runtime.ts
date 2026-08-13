import type { types } from "libpag";

const PAG_WASM_PATH = "/vendor/libpag/libpag.wasm";

let runtimePromise: Promise<types.PAG> | null = null;

export function getPagRuntime(): Promise<types.PAG> {
  if (!runtimePromise) {
    runtimePromise = import("libpag")
      .then(({ PAGInit }) =>
        PAGInit({
          locateFile: () => PAG_WASM_PATH,
        }),
      )
      .catch((error) => {
        runtimePromise = null;
        throw error;
      });
  }

  return runtimePromise;
}
