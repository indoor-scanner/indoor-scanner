#include "SF02.h"
#include "newStep.h"
#include <SoftwareSerial.h>

#define BAUD_RATE 115200

#define LIDAR_RX_PIN    11
#define LIDAR_TX_PIN    12

SF02 sf02;


stepMotor motorTest;


SoftwareSerial sf02Serial(LIDAR_RX_PIN, LIDAR_TX_PIN);


int lock = 0;

void setup() {

  // motor setup
  int output_pins[] = {A0, A1, A2, A3};
  pinMode(output_pins[0], OUTPUT);
  pinMode(output_pins[1], OUTPUT);
  pinMode(output_pins[2], OUTPUT);
  pinMode(output_pins[3], OUTPUT);

  pinMode(A4, INPUT);

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
  sf02.setAnalogInputPin(A4);
}

void loop() {
  // quick demon
  // while (!Serial);
  if (!lock) {


  stepMotor motor1(sf02);
  // TODO: Find max speed
  motor1.setSpeed(50);
  motor1.step(200);
  // unsigned long currentTime = micros();
  // float test = sf02.getAnalogDistance();
  // Serial.print("Distance: ");
  // Serial.println(test);

  // int voltage = analogRead(A4);
  // Serial.println(voltage);
  // Serial.println("this is a test");
  // Serial.println( (micros() - currentTime) );

  // lock = 1;
  }

  // motorTest.setSpeed(90);
  // motorTest.step(-200);
  // delay(2000);
  // delay(1);
}
