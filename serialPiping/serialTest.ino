int lock = 0;

void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(115200);
}

void loop() {
  int points = 1000;
  double inc = PI * (3 - sqrt(5));
  double off = 2.0 / points;
  double x, y, z, r, phi;
  for(int k = 0; k < points && !lock; k++) {
    y = k * off - 1 + (off / 2);
    r = sqrt(1 - y * y);
    phi = k * inc;
    x = cos(phi) * r;
    z = sin(phi) * r;
    Serial.print(x);
    Serial.print(' ');
    Serial.print(y);
    Serial.print(' ');
    Serial.println(z);  
  }
  lock = 1;

}


