import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px 20px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between" }}>
      <div style={{ fontWeight: "bold" }}>AI Doctor</div>
      <div>
        <Link to="/symptoms" style={{ marginLeft: 12 }}>
          Find a Doctor
        </Link>
      </div>
    </nav>
  );
}
