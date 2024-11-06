#include <ArduinoOSCWiFi.h>
#include <WiFi.h>


const char* ssid = "MLDEV";
const char* pwd = "Aysyw2ch?";

// for ArduinoOSC
const char* host = "192.168.41.180";
const int recv_port = 54321;
const int bind_port = 54345;
const int send_port = 55555;
const int publish_port = 54445;
// send / receive varibales
int i;
float f;
String s;



void onOscReceived(const OscMessage& m) {
    Serial.print(m.remoteIP());
    Serial.print(" ");
    Serial.print(m.remotePort());
    Serial.print(" ");
    Serial.print(m.size());
    Serial.print(" ");
    Serial.print(m.address());
    Serial.print(" ");
    Serial.print(m.arg<int>(0));
    Serial.print(" ");
    Serial.print(m.arg<float>(1));
    Serial.print(" ");
    Serial.print(m.arg<String>(2));
    Serial.println();
}

void setup() {
  // put your setup code here, to run oncprint("Hello World")
  Serial.begin(115200);
  Serial.println("Hello World");
  delay(2000);

  // WiFi stuff (no timeout setting for WiFi)
 
  WiFi.disconnect(true, true);  // disable wifi, erase ap info
 

    // WiFi stuff
    WiFi.begin(ssid, pwd);
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(500);
    }
    Serial.print("WiFi connected, IP = ");
    Serial.println(WiFi.localIP());


    OscWiFi.subscribe(recv_port, "/callback", onOscReceived);

}

void loop() {
  OscWiFi.update();  // should be called to receive + send osc
}

