#include "stepperMotor.h"
#include "scan.h"
#include "orientation.h"
#include <SoftwareSerial.h>

#define BAUD_RATE 57600

#define LIDAR_RX_PIN    11
#define LIDAR_TX_PIN    12

stepperMotor::stepperMotor() {
  direction = 0;
  originalRPM = 0;
  stepDelay = 0;
  numberOfSteps = 200;
  stepsCompleted = 0;
  currentAngle = 0;
  invertAngle = false;
  hasPose = false;

  pinMode(output_pins[0], OUTPUT);
  pinMode(output_pins[1], OUTPUT);
  pinMode(output_pins[2], OUTPUT);
  pinMode(output_pins[3], OUTPUT);
}

stepperMotor::stepperMotor(int steps, int pins[4], bool invert) {
  direction = 0;
  originalRPM = 0;
  stepDelay = 0;
  numberOfSteps = steps;
  stepsCompleted = 0;
  currentAngle = 0.0;
  angleInc = 360.00 / numberOfSteps;
  maxAngle = 360.00 - angleInc;
  invertAngle = invert;
  hasPose = false;

  for(int i = 0; i < 4; i++) {
    output_pins[i] = pins[i];
    pinMode(output_pins[i], OUTPUT);
  }
}

stepperMotor::stepperMotor(int steps, int pins[4], bool invert, orientation &pose) {
  direction = 0;
  originalRPM = 0;
  stepDelay = 0;
  numberOfSteps = steps;
  stepsCompleted = 0;
  currentAngle = 0.0;
  currentPose = &pose;
  angleInc = 360.00 / numberOfSteps;
  maxAngle = 360.00 - angleInc;
  invertAngle = invert;
  hasPose = true;

  for(int i = 0; i < 4; i++) {
    output_pins[i] = pins[i];
    pinMode(output_pins[i], OUTPUT);
  }
}

void stepperMotor::reset() {
  direction = 0.00000000;
  currentAngle = 0.00000000;
}

void stepperMotor::setNumberOfSteps(int steps) {
  numberOfSteps = steps;
}

int stepperMotor::getNumberOfSteps() {
  return numberOfSteps;
}

void stepperMotor::increaseStep(int currentStep) {
  float angleAdjustment = angleInc;

  switch(currentStep){
    case 0: // 1010
      digitalWrite(output_pins[0], 1);
      digitalWrite(output_pins[1], 0);
      digitalWrite(output_pins[2], 1);
      digitalWrite(output_pins[3], 0);
    break;
    case 1: // 0110
      digitalWrite(output_pins[0], 0);
      digitalWrite(output_pins[1], 1);
      digitalWrite(output_pins[2], 1);
      digitalWrite(output_pins[3], 0);
    break;
    case 2: // 0101
      digitalWrite(output_pins[0], 0);
      digitalWrite(output_pins[1], 1);
      digitalWrite(output_pins[2], 0);
      digitalWrite(output_pins[3], 1);
    break;
    case 3: // 1001
      digitalWrite(output_pins[0], 1);
      digitalWrite(output_pins[1], 0);
      digitalWrite(output_pins[2], 0);
      digitalWrite(output_pins[3], 1);
    break;
  }

  if (currentAngle > (maxAngle + 0.00001) ) {
    currentAngle = 0.0;
  }

  // TODO: Complete the directional logic
  // else if (currentAngle <= -358.2) {
  //   currentAngle = 0;
  // }

  // reverse: decreases the angle
  if (direction == 0) {
    angleAdjustment *= -1.0;
  }

  if (invertAngle) {
    angleAdjustment *= -1.0;
  }

  if ( (currentAngle + angleAdjustment < 0.00001) ) {
    currentAngle += 360;
  }
  currentAngle += angleAdjustment;

  if (currentAngle >= 360.00) {
    currentAngle = 0;
  }

  if (invertAngle) {
    currentPose->setPhi(currentAngle);
  }
  else {
    currentPose->setTheta(currentAngle);
  }
}

void stepperMotor::setSpeed(int rpm) {
  originalRPM = rpm;
  stepDelay = 60L * 1000L * 1000L / numberOfSteps / rpm;
}

void stepperMotor::setLidar(scan lidarLite) {
  lidarObject = lidarLite;
}

void stepperMotor::startStepping(int stepsToMove) {
  float distance = 0;
  float phi = 0.0;
  float theta = 0.0;
  String tempAngle = "";
  int remainingSteps = abs(stepsToMove);
  unsigned long currentStepTime;
  unsigned long lastStepTime = 0;

  // if stepsToMove is a negative value the motor spins in the
  // counter clockwise direction
  if (stepsToMove > 0) {
    direction = 1;
  }
  else {
    direction = 0;
  }

  while (remainingSteps > 0) {
    currentStepTime = micros();
    if (hasLidar) { distance = lidarObject.getDistance(); }
    // Serial.println(distance);
    if (currentStepTime - lastStepTime >= stepDelay) {
      setSpeed(originalRPM);
      lastStepTime = currentStepTime;
      if (direction == 1) {
        stepsCompleted++;
        if (stepsCompleted == numberOfSteps) {
          stepsCompleted = 0;
        }
      }
      else {
        if (stepsCompleted == 0) {
          stepsCompleted = numberOfSteps;
        }
        stepsCompleted--;
      }

      // Scanning based on steps
      // --------------------------------------------------
      unsigned long startTime = micros();

      // only scan on x/y steps 
      if (!invertAngle) {
        distance = lidarObject.getDistance();
        if (hasPose) {
          currentPose->setDistance(distance);
        }
      }

      unsigned long endTime = micros();

      // compensate for the time it takes to read from lidar
      // --------------------------------------------------
      if ( (endTime - startTime) > stepDelay) {
        stepDelay = 0;
      }
      else {
        stepDelay -= (endTime - startTime);
      }

      if(stepDelay < 0) {
        stepDelay = 0;
      }

      // update the orientation, if the angle is inverted we 
      // need to update the phi angle, otherwise update theta angle
      if (hasPose) {
        theta = currentPose->getTheta();
        phi = currentPose->getPhi();
        distance = currentPose->getDistance();
        Serial.print("Point cloud data: ");
        Serial.print(distance);
        Serial.print(' ');
        tempAngle = String(theta, 7);
        Serial.print(tempAngle);
        Serial.print(' ');
        tempAngle = "";
        tempAngle = String(phi, 7);
        Serial.println(tempAngle);
      }

      remainingSteps--;
      increaseStep(stepsCompleted % 4);
    }
  }
}

