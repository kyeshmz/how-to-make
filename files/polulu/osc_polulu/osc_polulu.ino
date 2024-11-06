// #define ARDUINOOSC_DEBUGLOG_ENABLE
#include <ArduinoOSCWiFi.h>
#include "AccelStepper.h"

// for accelstepper
#define dirPin 19
#define stepPin 20
#define motorInterfaceType 1

// Create a new instance of the AccelStepper class:
AccelStepper stepper = AccelStepper(motorInterfaceType, stepPin, dirPin);

const char* ssid = "MLDEV";
const char* pwd = "Aysyw2ch?";

const char* host = "192.168.41.200";
const int recv_port = 54321;
const int bind_port = 54345;
const int send_port = 55555;
const int publish_port = 54445;

// Variable to track if the motor is running
bool isRunning = false;
int motorSpeed = 1000;  // Default speed

void onLeft(const OscMessage& m) {
    Serial.println("Received /left command");
    isRunning = true;
    motorSpeed = abs(motorSpeed);  // Ensure positive speed
    if (isRunning) {
        stepper.setSpeed(-motorSpeed);
    }
}

void onRight(const OscMessage& m) {
    Serial.println("Received /right command");
    isRunning = true;
    motorSpeed = abs(motorSpeed);  // Ensure positive speed
    if (isRunning) {
        stepper.setSpeed(motorSpeed);
    }
}

void onStart(const OscMessage& m) {
    Serial.println("Received /start command");
    isRunning = true;
    stepper.setSpeed(stepper.speed());  // Maintain current direction
}

void onStop(const OscMessage& m) {
    Serial.println("Received /stop command");
    isRunning = false;
    stepper.setSpeed(0);  // Stop the motor by setting speed to zero
}

void onSpeed(const OscMessage& m) {
    int newSpeed = m.arg<int>(0);  // Get the speed from the OSC message
    Serial.print("Received /speed command: ");
    Serial.println(newSpeed);

    motorSpeed = abs(newSpeed);  // Update the motor speed, make sure it's positive
    if (isRunning) {
        // Set speed while maintaining current direction
        stepper.setSpeed(stepper.speed() < 0 ? -motorSpeed : motorSpeed);
    }
}

void setup() {
    Serial.begin(115200);
    delay(2000);

#if defined(ESP_PLATFORM) || defined(ARDUINO_ARCH_RP2040)
#ifdef ESP_PLATFORM
    WiFi.disconnect(true, true);  // disable wifi, erase ap info
#else
    WiFi.disconnect(true);  // disable wifi
#endif
    delay(1000);
    WiFi.mode(WIFI_STA);
#endif

    WiFi.begin(ssid, pwd);

    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(500);
    }

    Serial.print("WiFi connected, IP = ");
    Serial.println(WiFi.localIP());

    // Subscribe to the OSC addresses for control
    OscWiFi.subscribe(recv_port, "/left", onLeft);
    OscWiFi.subscribe(recv_port, "/right", onRight);
    OscWiFi.subscribe(recv_port, "/start", onStart);
    OscWiFi.subscribe(recv_port, "/stop", onStop);
    OscWiFi.subscribe(recv_port, "/speed", onSpeed);

    // Set the maximum speed in steps per second
    stepper.setMaxSpeed(5000);
}

void loop() {
    // Continuously update OSC messages
    OscWiFi.update();

    // Run the motor at the current speed if running
    if (isRunning) {
        stepper.runSpeed();
    }
}