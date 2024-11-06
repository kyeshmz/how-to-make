#include <ADCTouch.h>
// tell the code which analog pin you connected your sensor to
#define TOUCHPIN A0

// set the touch sensor resolution: 
//      higher means more stable results, 
//      at the cost of higher processing times
#define RESOLUTION 100

// determine how many readings are stored for smoothing
#define SMOOTH 100

// determen when the sensor is understood as "ON"
float multiplier = 1.1;

// smooth data a little:
// the last readings
int previousReadings[SMOOTH];

// used for cycling through the array
int currentIndex = 0;

// the latest reading
int reading;

// calculate the average of the previous readings
int average(){
  // calculate the sum of all previous readings
  unsigned long sum = 0;
  for(int i = 0; i < SMOOTH; i++){
    sum += previousReadings[i];
  }

  // return the sum divided by the number of elements
  // or, in other words, the average of all previous readings
  //Serial.println(sum/SMOOTH);
  return sum / SMOOTH;
}

void setup() {
  // serial communication
  Serial.begin(9600);

  // fill the [previousReaings] array with readings
  for(int i = 0; i < SMOOTH; i++){
    previousReadings[i] = ADCTouch.read(TOUCHPIN, RESOLUTION);
  }
}

void loop() {
  // read the sensor
  reading = ADCTouch.read(TOUCHPIN, RESOLUTION);

  // check if triggered
  if(reading > average() * multiplier){
    // executes if the sensor is triggered
    Serial.println("HIGH");

    // don't use this reading for smoothing
  }else{
    // executes if the sensor is not triggered
    Serial.println("LOW");
    
    // use this reading to compensate for environmental changes (i.e. smoothing)
    previousReadings[currentIndex] = reading;

    // set index for the next reading
    currentIndex++;

    // mnake sure [currentIndex] doesn't get out of bounds
    if(currentIndex >= SMOOTH){
      currentIndex = 0;
    }
  }  
  
  // Serial.println(reading);
}