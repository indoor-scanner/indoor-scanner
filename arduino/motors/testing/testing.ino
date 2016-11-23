#include "stepperMotor.h"
#include "I2C.h"
#include "orientation.h"2
#include "LIDARLite.h" //TODO: Maybe not call this scan
// #include <SoftwareSerial.h>
#define BAUD_RATE 57600

#define LIDAR_RX_PIN    11
#define LIDAR_TX_PIN    12

LIDARLite lidarLite;

orientation pose;

int pins1[4] = {10, 9, 8, 7};
int pins2[4] = {17, 16, 15, 14};

stepperMotor motor1(2038, pins1, true, pose); // small Motor
stepperMotor motor2(400, pins2, false, pose); // big motor

// command stuff
int maxCommands = 10;
String commands[10];
String arguments[9];

int firstRun = 1;
int lock = 0;
int flushCounter = 0;

void setup() {
  lidarLite.begin(0, true);
  lidarLite.configure(0);
  // motor setup

  // lidar setup
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
  motor2.startStepping(200);
};

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

// Visit this url for more info http://playground.arduino.cc/Code/PrintFloats
// printFloat prints out the float 'value' rounded to 'places' places after the decimal point
void printFloat(float value, int places) {
  // this is used to cast digits 
  int digit;
  float tens = 0.1;
  int tenscount = 0;
  int i;
  float tempfloat = value;

    // make sure we round properly. this could use pow from <math.h>, but doesn't seem worth the import
  // if this rounding step isn't here, the value  54.321 prints as 54.3209

  // calculate rounding term d:   0.5/pow(10,places)  
  float d = 0.5;
  if (value < 0)
    d *= -1.0;
  // divide by ten for each decimal place
  for (i = 0; i < places; i++)
    d/= 10.0;    
  // this small addition, combined with truncation will round our values properly 
  tempfloat +=  d;

  // first get value tens to be the large power of ten less than value
  // tenscount isn't necessary but it would be useful if you wanted to know after this how many chars the number will take

  if (value < 0)
    tempfloat *= -1.0;
  while ((tens * 10.0) <= tempfloat) {
    tens *= 10.0;
    tenscount += 1;
  }

  // write out the negative if needed
  if (value < 0)
    Serial.print('-');

  if (tenscount == 0)
    Serial.print(0, DEC);

  for (i=0; i< tenscount; i++) {
    digit = (int) (tempfloat/tens);
    Serial.print(digit, DEC);
    tempfloat = tempfloat - ((float)digit * tens);
    tens /= 10.0;
  }

  // if no places after decimal, stop now and return
  if (places <= 0)
    return;

  // otherwise, write the point and continue on
  Serial.print('.');  

  // now write out each decimal place by shifting digits one by one into the ones place and writing the truncated value
  for (i = 0; i < places; i++) {
    tempfloat *= 10.0; 
    digit = (int) tempfloat;
    Serial.print(digit,DEC);  
    // once written, subtract off that digit
    tempfloat = tempfloat - (float) digit; 
  }
}