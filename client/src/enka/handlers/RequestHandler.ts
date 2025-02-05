/* eslint-disable @typescript-eslint/no-explicit-any */
import { WrapperOptions } from "../types";
import { APIError } from "../errors";

/**
 * A class that handles the requests to the APIs.
 */
export class RequestHandler {
  /**
   * The options of the Wrapper.
   */
  options?: WrapperOptions;

  /**
   * Creates a new `RequestHandler` instance.
   * @param options - The options of the Wrapper class.
   * @param options.userAgent - The User Agent used in the request. If not specified, the default User Agent will be used.
   */
  constructor(options?: WrapperOptions) {
    this.options = options;
  }

  /**
   * Sends a request to get the data of a player.
   * @param uid - The UID used to get the data of the player.
   * @returns The data of the player.
   */
  async player(uid: string | number): Promise<any> {

    if (!/^(18|[1-35-9])\d{8}$/.test(uid.toString()))
      console.log("The UID format is incorrect");

    try {
      const res = await fetch(`https://genshify.onrender.com/${uid}`);
      const data = await res.json();
      return data;
    } catch (err: any) {
      throw new APIError(
        err.response.status,
        `https://genshify.onrender.com/${uid}`
      );
    }
  }

  /**
   * Sends a request to get the data of an Enka profile.
   * @param route - The route to send the request.
   * @returns The data of the requested route.
   */
  async profile(route: string): Promise<any> {
    const url = `https://enka.network/api/profile/${route}/`;

    try {
      const res = await fetch(url, {
        headers: {
          "accept-encoding": "*",
          "User-Agent": `${
            this.options?.userAgent
            // || `enkanetwork.js/v${version}`
          }`,
        },
      });
      const data = await res.json();

      return data;
    } catch (err: any) {
      throw new APIError(err.response.status, url);
    }
  }

  /**
   * Sends a request to get the last version of the excels and the zip.
   * @returns The last version and the zip.
   */
  // async updateInfo(): Promise<any> {
  //   const lOptions = { headers: { "accept-encoding": "*" } }; // Method to fix axios 1.2.1 encoding error.
  //   const zOptions: AxiosRequestConfig<any> = { responseType: "stream" };

  //   try {
  //     const [config, zip] = await axios.all([
  //       axios.get(
  //         "https://raw.githubusercontent.com/Jelosus2/enkanetwork.js/master/info.json",
  //         lOptions
  //       ),
  //       axios.get(
  //         "https://raw.githubusercontent.com/Jelosus2/enkanetwork.js/master/content.zip",
  //         zOptions
  //       ),
  //     ]);

  //     return {
  //       lastVersion: config.data.version,
  //       zip: zip.data,
  //     };
  //   } catch (err) {
  //     throw new PackageError("Couldn't retrieve the information of the zip for update check");
  //   }
  // }
}
