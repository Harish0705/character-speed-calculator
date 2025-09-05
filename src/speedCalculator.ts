interface SpeedInput {
  initialSpeed: number;
  inclines: number[];
}

interface SpeedOutput {
  finalSpeed: number;
}

export function calculate_final_speed(input: SpeedInput): SpeedOutput {
  let currentSpeed = input.initialSpeed;
  
  for (const incline of input.inclines) {
    if (incline > 0) {
      // speed decreases on Uphill
      currentSpeed -= incline;
    } else if (incline < 0) {
      // speed increases on Downhill 
      currentSpeed += Math.abs(incline);
    }
    // incline = 0, then no change in speed
  }
  
  // If the last incline is Uphill and also it reduces the final speed to 0 or less than 0, then the final output will be 0.
  const finalSpeed = Math.max(0, currentSpeed);
  
  return {
    finalSpeed: Math.round(finalSpeed * 10) / 10
  };
}