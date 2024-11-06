/* Example sketch to control a stepper motor with 
   A4988/DRV8825 stepper motor driver and 
   Arduino without a library. 
   More info: https://www.makerguides.com */

// Define stepper motor connections and steps per revolution:
// #define enablePin 9
// #define dirPin 7
// #define stepPin 8

#define enablePin 18
#define dirPin 19
#define stepPin 20

#define stepsPerRevolution 200
void setup() {
  // Declare pins as output:
  pinMode(stepPin, OUTPUT);
  pinMode(dirPin, OUTPUT);
  pinMode(enablePin, OUTPUT);
  digitalWrite(enablePin, LOW);
}

void loop() {
  // Set the spinning direction clockwise:
  digitalWrite(dirPin, HIGH);

  // Spin the stepper motor 1 revolution slowly:
  for (int i = 0; i < stepsPerRevolution; i++) {
    // These four lines result in 1 step:
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(100);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(100);
  }

  // delay(500);

  // // Set the spinning direction counterclockwise:
  // digitalWrite(dirPin, LOW);

  // // Spin the stepper motor 1 revolution quickly:
  // for (int i = 0; i < stepsPerRevolution; i++) {
  //   // These four lines result in 1 step:
  //   digitalWrite(stepPin, HIGH);
  //   delayMicroseconds(1000);
  //   digitalWrite(stepPin, LOW);
  //   delayMicroseconds(1000);
  // }

  // delay(1000);

  // // Set the spinning direction clockwise:
  // digitalWrite(dirPin, HIGH);

  // // Spin the stepper motor 5 revolutions fast:
  // for (int i = 0; i < 5 * stepsPerRevolution; i++) {
  //   // These four lines result in 1 step:
  //   digitalWrite(stepPin, HIGH);
  //   delayMicroseconds(500);
  //   digitalWrite(stepPin, LOW);
  //   delayMicroseconds(500);
  // }

  // delay(1000);

  // // Set the spinning direction counterclockwise:
  // digitalWrite(dirPin, LOW);

  // //Spin the stepper motor 5 revolutions fast:
  // for (int i = 0; i < 5 * stepsPerRevolution; i++) {
  //   // These four lines result in 1 step:
  //   digitalWrite(stepPin, HIGH);
  //   delayMicroseconds(500);
  //   digitalWrite(stepPin, LOW);
  //   delayMicroseconds(500);
  // }

  // delay(1000);
}