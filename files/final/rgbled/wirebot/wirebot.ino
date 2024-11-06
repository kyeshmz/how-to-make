#include <ArduinoOSCWiFi.h>


void setup() {
  // put your setup code here, to run once:

    // WiFi stuff
    WiFi.begin(ssid, pwd);
    WiFi.config(ip, gateway, subnet);

      // subscribe osc packet and directly bind to variable
    OscWiFi.subscribe(bind_port, "/bind/values", i, f, s);

    // publish osc packet in 30 times/sec (default)
    OscWiFi.publish(host, publish_port, "/publish/value", i, f, s);
    // function can also be published
    OscWiFi.publish(host, publish_port, "/publish/func", &millis, &micros)
        ->setFrameRate(1); // and publish it once per second



}

void loop() {
  // put your main code here, to run repeatedly:

      OscWiFi.update(); // should be called to subscribe + publish osc

}
