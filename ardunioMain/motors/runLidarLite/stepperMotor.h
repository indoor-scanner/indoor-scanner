// stepper motor class
#ifndef STEPPERMOTOR_H
#define STEPPERMOTOR_H
#include "LIDARLite.h"
#include "orientation.h"
#include <SoftwareSerial.h>

class stepperMotor {
  public:
    stepperMotor();
    stepperMotor(int steps, int pins[4], bool invert);
    stepperMotor(int setps, int pins[4], bool invert, orientation &pose);
    void setNumberOfSteps(int steps);
    int getNumberOfSteps();
    void increaseStep(int currentStep);
    void setSpeed(int rpm);
    void setLidar(LIDARLite lidarLite);
    void startStepping(int stepsToMove);
    void reset();
  private:
    int output_pins[4];
    int originalRPM;
    int direction;
    double angleInc;
    float maxAngle;
    float currentAngle;
    bool hasLidar;
    unsigned long stepDelay;
    unsigned long numberOfSteps;
    unsigned long stepsCompleted;
    LIDARLite lidarObject;
    orientation *currentPose;
    bool invertAngle;
    bool hasPose;
};
#endif
