// TODO: Helper functions that update the motor's angle
int maxCommands = 5;
String commands[5];
String arguments[4];


void setup() {
  // initialize serial:
  Serial.begin(57600);
  Serial.setTimeout(10); // may need to tweak it value that will not break

  for (int i = 0; i < maxCommands; i++) {
    // reserve 200 bytes for the commands
    commands[i].reserve(200);  
  }
}

void loop() {
  // print the string when a newline arrives:
  String inputString = getSerial();

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
        break;
      case 3:
        Serial.println("Begin custom scan");
        break;
      case 4:
        Serial.println("Panning counter clockwise");
        break;
      case 5:
        Serial.println("Panning clockwise");
        break;
      case 6:
        Serial.println("Tilting up");
        break;
      case 7:
        Serial.println("Tilting down");
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

