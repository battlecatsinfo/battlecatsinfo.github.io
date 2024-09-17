import {loadScheme} from './common.mjs';

if (window.OffscreenCanvas == undefined || window.OffscreenCanvas.prototype.convertToBlob == undefined) {
	window.OffscreenCanvas = class OffscreenCanvas {
		constructor(width, height) {
			this.canvas = document.createElement('canvas');
			this.canvas.width = width;
			this.canvas.height = height;
			this.width = width;
			this.height = height;
		}
		getContext(c) {
			return this.canvas.getContext(c);
		}
		convertToBlob(type, Q) {
			const self = this;
			return new Promise(resolve => {
				self.canvas.toBlob(resolve, type, Q);
			});
		}
	}
}

// expose global variables and load anim.min.js afterwards
// @TODO: refactor code to prevent this
// maybe import directly in anim.min.js?
const {eggs} = await loadScheme('units', ['eggs']);

Object.assign(globalThis, {
	eggs,
});

await import('./anim.min.js');
