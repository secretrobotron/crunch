BeatHelper = function(audioSrc, beat_callback, spectrum_callback, vu_callback)
{
  console.log("Enter beathelper");
  this.audio = document.createElement("audio");
  this.beat_callback = beat_callback;
  this.spectrum_callback = spectrum_callback;
  this.vu_callback = vu_callback;
  document.body.appendChild(this.audio);
  this.audio.setAttribute('src', audioSrc);
  this.audio.controls = true;
  this.audio.play();
  var self = this;
  this.audio.onloadedmetadata = function(event) {
    console.log("meta");
    self.channels = self.audio.mozChannels;
    self.rate = self.audio.mozSampleRate;
    self.frameBufferLength = self.audio.mozFrameBufferLength;

    self.bufferSize = self.frameBufferLength/self.channels;
    self.fft = new FFT(self.bufferSize, self.rate);
    self.signal = new Float32Array(self.bufferSize);

    self.beatTimer = 0;
 
    self.audio.addEventListener("MozAudioAvailable", function(event) {
      self.audioWritten(event); 
    },false);
    self.bd = new BeatDetektor(80, 159);
    self.vu = new BeatDetektor.modules.vis.VU();
  };
}

BeatHelper.prototype.audioWritten = function(event)
{
  if (this.fft == null) return;

  var fb = event.frameBuffer;

  for (var i = 0, fbl = this.bufferSize; i < fbl; i++ ) {
    // Assuming interlaced stereo channels,
    // need to split and merge into a stero-mix mono signal
    this.signal[i] = (fb[2*i] + fb[2*i+1]) / 2;
  }
  this.fft.forward(this.signal);

  var timestamp = event.time;

  this.bd.process(timestamp, this.fft.spectrum);

  // Bass Kick detection
  this.vu.process(this.bd);

  if (this.bd.win_bpm_int_lo)
  {
    this.beatTimer += this.bd.last_update;

    if (this.beatTimer > (60.0/this.bd.win_bpm_int_lo))
    {
      this.beatTimer -= (60.0/this.bd.win_bpm_int_lo);
      //clearClr[0] = 0.5+Math.random()/2;
      //clearClr[1] = 0.5+Math.random()/2;
      //clearClr[2] = 0.5+Math.random()/2;
      this.beatCounter++;
      if (this.beat_callback) {
        this.beat_callback();
      }
      //console.log("beat");
    }
  }
  if (this.spectrum_callback) {
    this.spectrum_callback(this.fft.spectrum);
  }
  if (this.vu_callback) {
    this.vu_callback(this.vu);
  }

}

