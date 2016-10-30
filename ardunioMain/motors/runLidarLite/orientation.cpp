#include "orientation.h"

orientation::orientation() {
  currentPhi = 0.0;
  currentTheta = 0.0;
  currentDistance = 0.0;
  lastPhi = 0.0;
  lastTheta = 0.0;
  lastDistance = 0.0;
}

orientation::orientation(float theta, float phi, float distance) {
  currentPhi = phi;
  currentTheta = theta;
  currentDistance = distance;
  lastPhi = 0.0;
  lastTheta = 0.0;
  lastDistance = 0.0;
}

float orientation::getTheta() {
  return currentTheta;
}

void orientation::setTheta(float theta) {
  currentTheta = theta;
}

float orientation::getPhi() {
  return currentPhi;
}

void orientation::setPhi(float phi) {
  currentPhi = phi;
}

float orientation::getDistance() {
  return currentDistance;
}

void orientation::setDistance(float distance) {
  currentDistance = distance;
}

float orientation::getLastDistance() {
  return lastDistance;
}

void orientation::setLastDistance(float distance) {
  lastDistance = distance;
}

