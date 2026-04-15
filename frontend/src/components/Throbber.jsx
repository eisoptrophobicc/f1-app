import { ping } from "ldrs";

ping.register();

export default function Throbber({ text = "Loading..." }) {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "16px",
      background: "#000"
    }}>
      
      <l-ping
        size="60"
        speed="2.0"
        color="#E10600"
      ></l-ping>

      <p style={{ color: "#aaa" }}>{text}</p>
    </div>
  );
}