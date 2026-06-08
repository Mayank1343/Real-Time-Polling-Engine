function Loader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "5px solid #ddd",
          borderTop: "5px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      <p style={{ marginTop: "20px" }}>
        Backend is waking up...
      </p>

      <small>
        Our backend is deployed on Render free tier. It may take up to 30-60 seconds. Thank you for your patience.
      </small>
    </div>
  );
}

export default Loader;