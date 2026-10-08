import "./Intro.css";
import { useNavigate } from "react-router-dom";

function Intro() {
  const navigate = useNavigate();

  return (
    <div className="intro-page">
      <div className="intro-content">
        <h1>
          Every Drop Can Save a Life
        </h1>

        <p>
          Be a hero today by donating blood
          and helping someone in need.
        </p>

        <div className="button-group">
          <button
            className="start-btn"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Intro;