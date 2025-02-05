import { AssetFinderOptions } from "../types";
import { GenshinFinder } from "./Genshin";

/**
 * A class for building the asset finder.
 */
export class AssetFinder {
  /**
   * The genshin asset finder.
   */
  readonly genshin: GenshinFinder;

  /**
   * The star rail asset finder.
   */

  /**
   * Creates a new `AssetFinder` instance.
   * @param options - The options for the asset finder.
   * @param options.language - The language to get the names. If not specified, the default language will be used.
   */
  constructor(options?: AssetFinderOptions) {
    this.genshin = new GenshinFinder(options);
  };
};