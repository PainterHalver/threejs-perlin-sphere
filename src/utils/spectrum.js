export default class Spectrum {
  constructor(audio, spectrumCanvas) {
    this.audio = audio;
    this.canvas = spectrumCanvas;

    this._createContextAndAnalyser();

    this._getBufferLengthAndDataArray();

    this._setCanvasWidthAndHeight();

    this._getContextFromCanvas();

    this._setSpectrumProperties();
  }

  _createContextAndAnalyser() {
    this.audioContext = new AudioContext();
    this.audioSrc = this.audioContext.createMediaElementSource(audio);
    this.analyser = this.audioContext.createAnalyser();

    this.audioSrc.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.analyser.fftSize = 256;
  }

  _getBufferLengthAndDataArray() {
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
  }

  _setCanvasWidthAndHeight() {
    this.canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    this.canvas.height = window.innerHeight * 0.3;
  }

  _getContextFromCanvas() {
    this.canvasContext = this.canvas.getContext("2d");
  }

  _setSpectrumProperties() {
    // Idea from moving average XDDDDD
    this.MOVING_AVERAGE = 5;
    this.lastSpectrums = [];
    this.audio.play();
  }

  _sphereUpdate() {}

  renderSpectrum() {
    let x = 0;
    let barWidth = this.canvas.width / (this.bufferLength - 10); // omit last 10 spectrums
    let barHeight;

    this.analyser.getByteFrequencyData(this.dataArray);

    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ////////////////////////////////////////////////////////////////////////////////////////////////
    //// CALCULATIONS

    this._sphereUpdate();

    ////////////////////////////////////////////////////////////////////////////////////////////////

    for (let i = 0; i < this.bufferLength; i++) {
      barHeight = this.dataArray[i];

      const r = barHeight + 25 * (i / this.bufferLength);
      const g = 250 * (i / this.bufferLength);
      const b = 50;

      this.canvasContext.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      this.canvasContext.fillRect(
        x,
        this.canvas.height - barHeight,
        barWidth,
        barHeight
      );

      x += barWidth + 1;
    }
    x = 0;
  }

  setSphereUpdate(func) {
    this._sphereUpdate = func;
  }
}
