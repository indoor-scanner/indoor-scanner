#include "SF02.h"
#include "smallMotor.h"
#include "bigMotor.h"
#include <SoftwareSerial.h>

#define BAUD_RATE 57600

#define LIDAR_RX_PIN    11
#define LIDAR_TX_PIN    12

SF02 sf02;

smallMotor motor1(sf02);
bigMotor motor2(sf02);

SoftwareSerial sf02Serial(LIDAR_RX_PIN, LIDAR_TX_PIN);


// command stuff
int maxCommands = 10;
String commands[10];
String arguments[9];

int firstRun = 1;
int lock = 0;
int flushCounter = 0;

void setup() {
  // motor setup
  int output_pins[] = {A0, A1, A2, A3, 7, 8, 9, 10};
  pinMode(output_pins[0], OUTPUT);
  pinMode(output_pins[1], OUTPUT);
  pinMode(output_pins[2], OUTPUT);
  pinMode(output_pins[3], OUTPUT);
  pinMode(output_pins[4], OUTPUT);
  pinMode(output_pins[5], OUTPUT);
  pinMode(output_pins[6], OUTPUT);
  pinMode(output_pins[7], OUTPUT);

  // lidar setup
  pinMode(LIDAR_RX_PIN, INPUT);
  pinMode(LIDAR_TX_PIN, OUTPUT);
  pinMode(A4, INPUT);
  Serial.begin(57600);
  Serial.flush();
  sf02.setAuxUartBaudRate(BAUD_RATE);
  sf02Serial.begin(BAUD_RATE);
  sf02Serial.flush();
  sf02.begin(sf02Serial);

  motor1.setLidar(sf02);
  motor1.setSpeed(1);

  motor2.setLidar(sf02);
  motor2.setSpeed(80);

  // command setup
  Serial.setTimeout(20); // may need to tweak it value that will not break
  for (int i = 0; i < maxCommands; i++) {
    // reserve 200 bytes for the commands
    commands[i].reserve(200);  
  }
}

// steps 830

void loop() {
  int stepInc = 1;
  int smallStepSize = 1;

  // print the string when a newline arrives:
  if (firstRun) {
    clearLidarBuffer();
    firstRun = 0;
  }

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

    switch (commandNumber) {
      case 0:
        Serial.println("Resetting");
        break;
      case 1:
        Serial.println("Stopping scan");
        break;
      case 2:
        Serial.println("Being normal scan");
        // normal routine
        // for (int i = 0; i < (830 / smallStepSize); i++) {
        //   clearLidarBuffer();
        //   motor2.step(200);
        //   motor1.step(smallStepSize);  
        // }
        // Serial.println("Being normal scan");
        // for (int i = 0; i < (830 / smallStepSize); i++) {
        //   motor2.step(200);
        //   motor1.step(-smallStepSize);  
        // }
        // azimuth testing 
        motor1.step(777);
        delay(1000);
        motor1.step(-777);
        break;
      case 3:
        Serial.println("Begin custom scan");
        break;
      case 4:
        Serial.println("Panning counter clockwise");
        motor2.step(stepInc);
        for (int i = 0; i <= 50; i++) {
          float test = sf02.getDistance(100);
        }
        Serial.println(sf02.getDistance(100));
        break;
      case 5:
        Serial.println("Panning clockwise");
        motor2.step(-stepInc);
        for (int i = 0; i <= 50; i++) {
          float test = sf02.getDistance(100);
        }
        Serial.println(sf02.getDistance(100));
        break;
      case 6:
        Serial.println("Tilting up");
        // sf02Serial.flush();
        motor1.step(stepInc);
        for (int i = 0; i <= 50; i++) {
          float test = sf02.getDistance(100);
        }
        Serial.println(sf02.getDistance(100));
        break;
      case 7:
        Serial.println("Tilting down");
        motor1.step(-stepInc);
        for (int i = 0; i <= 50; i++) {
          float test = sf02.getDistance(100);
        }
        Serial.println(sf02.getDistance(100));
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
  if (flushCounter > 10) {
    sf02Serial.overflow();
    flushCounter = 0;
  }
  return inputString;
}

void tiltUp(smallMotor motor) {
  motor.step(1);
}

void tiltDown(smallMotor motor) {
  motor.step(-1);
}

void roateLeft(smallMotor motor) {
  motor.step(1);
}

void rotateRight(smallMotor motor) {
  motor.step(-1);
}

void flushReceive() {
  while(Serial.available())
  Serial.read();
}

void clearLidarBuffer() {
  for (int i = 0; i < 50; i++) {
    float clear = sf02.getDistance(100);  
  }
}