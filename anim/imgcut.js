const canvas = document.getElementById("imgcut");
const ctx = canvas.getContext("2d");


(function() {
  const img = new Image();
  img.onload = function() {
    canvas.width = this.naturalWidth;
    canvas.height = this.naturalHeight;
    ctx.drawImage(this, 0, 0);
    ctx.drawImage(this, 0, 0, this.naturalWidth, this.naturalHeight);
  };
  img.src = '/data/unit/000/f/000_f.png';
})();
