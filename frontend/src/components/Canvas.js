class Canvas {
    constructor(bool) {
      this.canvas = document.createElement('canvas');
      if (bool) {
        this.canvas.style.display = 'block';
        document.body.appendChild(this.canvas);
      }
      this.ctx = this.canvas.getContext('2d');
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
      this.shapes = [];
      this.glitchSwitch = false;
    }
  
    init() {
      this.shapes = [];
      for (let i = 0; i < 3; i++) {
        const shape = new Shape(this.ctx, 0, this.height - this.height / 5, i + 1);
        this.shapes.push(shape);
      }
    }
  
    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let i = 0; i < this.shapes.length; i++) {
        this.shapes[i].render(i);
      }
  
      // Update behavior based on elapsed time
      const timeElapsed = Date.now();
      if (timeElapsed > 4000) {
        // Update mes1 and mes2 visibility or behaviors
      }
  
      if (this.glitchSwitch) {
        // Handle glitch effects
      }
    }
  
    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    }
  }
  