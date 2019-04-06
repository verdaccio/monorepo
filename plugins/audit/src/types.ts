// Temporary solution for requiring types will not cause the error.
import { PluginOptions } from "@verdaccio/types";
export class Plugin<T> {
	constructor(config: T, options: PluginOptions<T>) { }
}
