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

// command stuff
int maxCommands = 10;
String commands[10];
String arguments[9];

void setup() {
  // lidarLite
  lidarLite.begin(0, true);
  lidarLite.configure(0);

  pinMode(LIDAR_RX_PIN, INPUT);
  pinMode(LIDAR_TX_PIN, OUTPUT);
  pinMode(A4, INPUT);
  Serial.begin(57600);
  Serial.flush();


  motor1.setLidar(lidarLite);
  motor1.setSpeed(1);

  motor2.setLidar(lidarLite);
  motor2.setSpeed(12);

  // command setup
  Serial.setTimeout(50); // may need to tweak it value that will not break
  for (int i = 0; i < maxCommands; i++) {
    // reserve 200 bytes for the commands
    commands[i].reserve(200);
  }
}

void loop() {
  int stepInc = 1;
  int smallStepSize = 2;

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
      case 0:
        Serial.println("Resetting");
        softReset();
        break;
      case 2:
        Serial.println("Being normal scan");
        // normal routine
        for (int i = 0; i < (777 / smallStepSize); i++) {
          motor2.startStepping(200);
          motor1.startStepping(-smallStepSize);
        }

        motor1.reset();
        motor2.reset();
        break;
      case 3:
        Serial.println("Begin custom scan");
        break;
      case 4:
        Serial.println("Panning counter clockwise");
        motor2.startStepping(stepInc);
        // for (int i = 0; i <= 50; i++) {
        //   float test = lidarLite.distance(false);
        // }
        // Serial.println(lidarLite.distance(false));
        break;
      case 5:
        Serial.println("Panning clockwise");
        motor2.startStepping(-stepInc);
        // for (int i = 0; i <= 50; i++) {
        //   float test = lidarLite.distance(false);
        // }
        // Serial.println(lidarLite.distance(false));
        break;
      case 6:
        Serial.println("Tilting up");
        pose.setDistance(lidarLite.distance(false));
        motor1.startStepping(stepInc);
        break;
      case 7:
        Serial.println("Tilting down");
        pose.setDistance(lidarLite.distance(false));
        motor1.startStepping(-stepInc);
        break;
      case 8:
        Serial.println("Setting max position (ccw)");
        break;
      case 9:
        Serial.println("Setting max position (cw)");
        break;
      case 10:
        Serial.println("Setting max position (up)");
        break;
      case 11:
        Serial.println("Setting max position (down)");
        break;
      case 12:
        Serial.println("Scanning point");
        break;
      case 13:
        Serial.println("Continuous scan activated");
        break;
      case 14:
        Serial.println("Continuous scan deactivated");
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

void tiltUp(stepperMotor motor) {
  motor.startStepping(1);
}

void tiltDown(stepperMotor motor) {
  motor.startStepping(-1);
}

void roateLeft(stepperMotor motor) {
  motor.startStepping(1);
}

void rotateRight(stepperMotor motor) {
  motor.startStepping(-1);
}

void softReset(){
  asm volatile ("  jmp 0");
}