
class PCM_Player extends AudioWorkletProcessor {

  fifo = [];            // Queue of Int16Array objects.  Head is fifo[0].
  currentSample = 0;    // Index into fifo[0] of next sample to transfer.

  constructor() {
    super();

    // PCM audio to be played arrives via the port message mechanism in
    // (arbitrarily sized) Int16Arry objects which are queued in the
    // fifo array.

    this.port.onmessage = (event) => {
      this.fifo.push(event.data);
    };
  }

  process(inputs, outputs, parameters) {

    // The Worklet process function consumes the 16-bit PCM samples from
    // the fifo array and converts them to [-1.0, 1.0] values for the
    // WebAudio channel.

    const channels = outputs[0];
    const channel = channels[0];

    for (let i = 0; i < channel.length; i++) {

      // We're done if the FIFO is empty
      if (this.fifo.length < 1) {
        return true;
      }

      channel[i] = this.fifo[0][this.currentSample++] / 32768.0;

      // If we've emptied the head array
      if (this.currentSample == this.fifo[0].length) {
          this.fifo.shift()
          this.currentSample = 0;
      }
    }

    return true;
  }
}

registerProcessor('pcm_player', PCM_Player);

