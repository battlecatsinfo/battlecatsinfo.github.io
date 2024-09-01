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
const eggs={{{toJSON eggs}}};
