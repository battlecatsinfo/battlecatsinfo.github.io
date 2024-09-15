import {eggs} from './units_scheme.mjs';

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

// expose global variables
// @TODO: refactor code to prevent this
// maybe import directly in anim.min.js?
Object.assign(globalThis, {
	eggs,
});
