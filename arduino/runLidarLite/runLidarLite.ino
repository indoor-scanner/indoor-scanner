#include "stepperMotor.h"
#include "I2C.h"
#include "orientation.h"
#include "LIDARLite.h"
#define BAUD_RATE 57600

#define LIDAR_RX_PIN    11
#define LIDAR_TX_PIN    12

// create lidarLite object
LIDARLite lidarLite;

// create orientation object
orientation pose;

int pins1[4] = {10, 9, 8, 7};
int pins2[4] = {17, 16, 15, 14};

stepperMotor motor1(2038, pins1, true, pose); // small Motor
stepperMotor motor2(400, pins2, false, pose); // big motor

// command and argument variables
int maxCommands = 10;
String commands[10];
String arguments[9];

int smallStepSize = 2;

void setup() {
  // lidarLite
  lidarLite.begin(0, true);
  lidarLite.configure(0);

  pinMode(LIDAR_RX_PIN, INPUT);
  pinMode(LIDAR_TX_PIN, OUTPUT);
  pinMode(A4, INPUT);
  Serial.begin(BAUD_RATE);
  Serial.flush();

  motor1.setLidar(lidarLite);
  motor1.setSpeed(1);

  motor2.setLidar(lidarLite);
  motor2.setSpeed(40); // the speed of the motor will be limited by the time it takes to retrieve the distance

  // command setup
  Serial.setTimeout(50); // may need to tweak it value that will not break
  for (int i = 0; i < maxCommands; i++) {
    // reserve 200 bytes for the commands
    commands[i].reserve(200);
  }
}

void loop() {
  String inputString = getSerial();
  if (inputString.length() > 0) {
    Serial.println(inputString);
  }

  if (inputString.length() > 1) {
    String temp = "";
    int count = 0;
    for(int i = 0; i <= inputString.length(); i++) {
      if (!isSpace(inputString[i]) && i != (inputString.length()) ) {
        temp += inputString[i];
      }
      else {
        commands[count] = temp;
        temp = "";
        count++;
      }
    }

    int commandNumber = commands[0].toInt();

    for (int i = 1; i < count; i++) {
      arguments[i-1] = commands[i];
    }

    Serial.println("Executing command");

    switch (commandNumber) {
      // TODO: implement soft reset
      case 0:
        Serial.println("Resetting");
        break;
      case 1:
        Serial.println("Being normal scan");
        // normal routine
        for (int i = 0; i < (777 / smallStepSize); i++) {
          motor2.startStepping(200, true);
          motor1.startStepping(-smallStepSize, true);
        }

        for (int i = 0; i < (777 / smallStepSize); i++) {
          motor1.startStepping(smallStepSize, false);
          delay(20);
        }
        
        motor1.reset();
        motor2.reset();
        Serial.println("Finished scanning");
        break;
      case 3:
        Serial.println("Panning counter clockwise");
        motor2.startStepping(1, true);
        break;
      case 4:
        Serial.println("Panning clockwise");
        motor2.startStepping(-1, true);
        break;
      case 5:
        Serial.println("Tilting up");
        motor1.startStepping(1, true);
        break;
      case 6:
        Serial.println("Tilting down");
        motor1.startStepping(-1, true);
        break;
      default:
        Serial.println("Error! Unrecognized command");
    }
  }
}

String getSerial() {
  String inputString = "";
  while (Serial.available()) {
    inputString = Serial.readString();
  }
  return inputString;
}
