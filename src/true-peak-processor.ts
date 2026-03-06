import { calculateLPFCoefficients, truePeakValues } from './true-peak';

class TruePeakProcessor extends AudioWorkletProcessor {
  sampleRate: number;
  numCoefficients: number;
  upsampleFactor: number;
  lpfCoefficients: number[];
  lpfBuffers: number[][];

  constructor() {
    super();
    this.numCoefficients = 49;
    //@ts-ignore
    this.sampleRate = sampleRate;
    this.upsampleFactor = this.sampleRate > 80000 ? 2 : 4;
    this.lpfCoefficients = calculateLPFCoefficients(this.numCoefficients, this.upsampleFactor);
    // this.lpfBuffers = new Array(this.numChannels).fill(new Array(numCoefficients).fill(0));
    this.lpfBuffers = [];
  }

  process(inputs:Float32Array[][]) {
    const input = inputs[0];
    if (input.length > this.lpfBuffers.length) {
      for (let i = 1; i <= input.length; i += 1) {
        if (i > this.lpfBuffers.length) {
          this.lpfBuffers.push(new Array(this.numCoefficients).fill(0));
        }
      }
    }
    const maxes = truePeakValues(input, this.lpfBuffers, this.lpfCoefficients, this.upsampleFactor);
    this.port.postMessage({type: 'peaks', peaks: maxes});
    return true;
  }
}

try {
  registerProcessor('true-peak-processor', TruePeakProcessor);
} catch (err) {
  console.info('Failed to register true-peak-processor. This probably means it was already registered.');
}
