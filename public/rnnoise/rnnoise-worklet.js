/* rnnoise-worklet.js */
class RNNoiseProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    // RNNoise instance pasada desde main thread
    this.rnnoise = options.processorOptions.rnnoise;

    this.frameSize = 480; // 10 ms @ 48kHz
    this.buffer = new Float32Array(this.frameSize);
    this.offset = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0][0];
    const output = outputs[0][0];

    if (!input || !output) return true;

    for (let i = 0; i < input.length; i++) {
      this.buffer[this.offset++] = input[i];

      if (this.offset === this.frameSize) {
        // 🔥 AQUÍ actúa la IA
        this.rnnoise.processFrame(this.buffer);
        this.offset = 0;
      }

      output[i] = input[i];
    }

    return true;
  }
}

registerProcessor("rnnoise-worklet", RNNoiseProcessor);