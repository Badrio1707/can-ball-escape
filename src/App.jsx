import EscapeSimulation from "./components/EscapeSimulation";

export default function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#000",
      }}
    >
      <EscapeSimulation />
    </div>
  );
}
