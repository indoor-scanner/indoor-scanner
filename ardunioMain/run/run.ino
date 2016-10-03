#include "SF02.h"
#include "newStep.h"
#include <SoftwareSerial.h>

#define BAUD_RATE 57600

#define LIDAR_RX_PIN    8
#define LIDAR_TX_PIN    9

SF02 sf02;

stepMotor motorTest;


SoftwareSerial sf02Serial(LIDAR_RX_PIN, LIDAR_TX_PIN);


void setup() {

  // motor setup
  int output_pins[] = {A0, A1, A2, A3};
  pinMode(output_pins[0], OUTPUT);
  pinMode(output_pins[1], OUTPUT);
  pinMode(output_pins[2], OUTPUT);
  pinMode(output_pins[3], OUTPUT);

  // lidar setup
  pinMode(LIDAR_RX_PIN, INPUT);
  pinMode(LIDAR_TX_PIN, OUTPUT);
  pinMode(A4, INPUT);
  Serial.begin(BAUD_RATE);
  Serial.flush();
  sf02.setAuxUartBaudRate(BAUD_RATE);
  sf02Serial.begin(BAUD_RATE);
  sf02Serial.flush();
  sf02.begin(sf02Serial);
}

void loop() {
  // quick demon
  // stepMotor motor1(sf02);
  // motor1.setSpeed(20);
  // motor1.step(201);
  // unsigned long currentTime = micros();
  float test = sf02.getDistance(100);
  Serial.print("Distance: ");
  Serial.println(test);
  // Serial.println( (micros() - currentTime) );
  

  // motorTest.setSpeed(90);
  // motorTest.step(-200);
  // delay(2000);
  // delay(1);
}
