import { useEffect, useState } from "react";

function App() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [writer, setWriter] = useState<WritableStreamDefaultWriter | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Any side effects or cleanup can be handled here
  }, []);

  // Connect to Serial Port
  const connect = async () => {
    if ("serial" in navigator) {
      console.log("Web Serial API is supported.");
    } else {
      console.log("Web Serial API is not supported.");
    }

    try {
      const selectedPort = await navigator.serial!.requestPort();
      await selectedPort.open({ baudRate: 57600 });

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = selectedPort.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      const writer = selectedPort.writable!.getWriter();

      setWriter(writer);
      setPort(selectedPort);
      setConnected(true);

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            reader.releaseLock();
            break;
          }
          if (value) {
            setMessages((prev) => [...prev, value.trim()]);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Disconnect from Serial Port
  const disconnect = async () => {
    try {
      if (writer) {
        await writer.close();
      }
      if (port) {
        await port.close();
      }
      setWriter(null);
      setPort(null);
      setConnected(false);
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  // Send data to the Arduino
  const sendData = async () => {
    if (writer && input) {
      const encoder = new TextEncoder();
      const encodedInput = encoder.encode(input + "\n");
      await writer.write(encodedInput);
      setInput("");
    }
  };

  // New function to send "hello"
  const sendHello = async () => {
    if (writer) {
      const data = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
      await writer.write(data);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}>
      <h1>React WebSerial Example</h1>
      {!connected ? (
        <button
          onClick={connect}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Connect
        </button>
      ) : (
        <button
          onClick={disconnect}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Disconnect
        </button>
      )}
      <br />
      <br />

      {connected && (
        <div>
          <textarea
            rows="4"
            cols="50"
            placeholder="Type a message to send..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
          <br />
          <button
            onClick={sendData}
            style={{ padding: "10px 20px", marginTop: "10px" }}
          >
            Send
          </button>
          <button
            onClick={sendHello}
            style={{ padding: "10px 20px", marginTop: "10px" }}
          >
            Send Hello
          </button>
        </div>
      )}

      <h2>Messages from Arduino:</h2>
      <div
        style={{
          border: "1px solid #ddd",
          padding: "10px",
          height: "200px",
          overflowY: "scroll",
        }}
      >
        {messages.map((message, index) => (
          <p key={index} style={{ margin: "5px 0" }}>
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;