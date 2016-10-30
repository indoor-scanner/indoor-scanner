// orientation class
#ifndef ORIENTATION_H
#define ORIENTATION_H

class orientation {
  public:
    orientation();
    orientation(float theta, float phi, float distance);
    float getTheta();
    void setTheta(float theta);
    float getPhi();
    void setPhi(float phi);
    float getDistance();
    void setDistance(float distance);
    float getLastDistance();
    void setLastDistance(float distance);
  private:
    float currentPhi;
    float currentTheta;
    float currentDistance;
    float lastPhi;
    float lastTheta;
    float lastDistance;
};

#endif
