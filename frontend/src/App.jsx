import React, { useState } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWandMagicSparkles,
  faRotateRight,
  faTrash,
  faCopy,
  faRotateLeft,
  faFileLines,
  faCheck,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

import {
  faGithub,
  faLinkedin
} from "@fortawesome/free-brands-svg-icons";

import Error from "./Error";


function App() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary);
      } else {
        setError("Error generating summary"); // summary stays unchanged
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error connecting to backend"); // summary stays unchanged
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setSummary("");
  };

  const handleCopy = () => {
  if (summary) {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000); 
  }
};


  return (<>
    <div className="app">
      {/* Header */}
      <div className="header">
      <FontAwesomeIcon icon={faWandMagicSparkles} style={{ marginRight: "12px", fontSize : "1.2rem" }}/>
        <span style={{ fontSize: "1.8rem", fontFamily: "Georgia, serif", color: "#fff" }}>
          Summary Generator
        </span>
      </div>

      {/* Main layout */}
      <div className="main">
        {/* Input Panel */}
        <div className="panel input-panel">
          <label className="panel-title">Enter text to summarize</label>
          <textarea
            className="input-box"
            rows="12"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here or type directly..."
          />

          <div className="button-group">
            <button
              onClick={handleSummarize}
              className="btn generate"
              disabled={loading} // optional: disable button while loading
            >
              <FontAwesomeIcon icon={faWandMagicSparkles} />{" "}
              {loading ? "Generating..." : "Generate Summary"}
            </button>

            {/* <button
              onClick={handleSummarize}
              className="btn regenerate"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faRotateRight} />{" "}
              {loading ? "Generating..." : "Regenerate"}
            </button> */}

            <button onClick={handleClear} className="btn clear" disabled={loading}>
              <FontAwesomeIcon icon={faTrash} /> Clear
            </button>
          </div>

        </div>

        {/* Output Panel */}
        <div className="panel output-panel">
          <div className="output-header">
            <label className="panel-title">Generated Summary</label>
            <div className="output-actions">
              <button
                onClick={handleCopy}
                className="btn copy"
                style={{
                  backgroundColor: copied ? "#a7f3d0" : "", // ✅ pastel green background
                  color: copied ? "#0f111a" : "",           // optional: darker text for contrast
                  transition: "all 0.3s ease",
                }}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} /> {copied ? "Copied" : "Copy"}
              </button>

              {/* <button onClick={handleClear} className="btn reset">
                <FontAwesomeIcon icon={faRotateLeft} /> Reset
              </button> */}
            </div>
          </div>

          <div className="summary-box">
            {summary ? (
              <p>{summary}</p>
            ) : (
              <div className="placeholder">
                <div className="icon">
                  <FontAwesomeIcon icon={faFileLines} />
                </div>
                <div className="message">
                  <strong>No summary generated yet</strong>
                  <p>Enter your text and click 'Generate Summary' to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
          
      <div className="footer">
        <div className="footer-left">
          <span className="footer-link" onClick={() => setShowAbout(true)}>About This Project</span>
          <span className="footer-separator">|</span>
          <span className="footer-name">Made by : Shantvi Gohel</span>
        </div>
        <div className="footer-right">
          <a
            href="https://github.com/Shantvigohel"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FontAwesomeIcon icon={faGithub} className="footer-icon" />
          </a>
          <a
            href="https://www.linkedin.com/in/shantvi-gohel-197420371/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FontAwesomeIcon icon={faLinkedin} className="footer-icon" />
          </a>
        </div>
      </div>

      {showAbout && (
        <div className="about-popup-overlay">
          <div className="about-popup">
            <button className="close-btn" onClick={() => setShowAbout(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2>About This Project</h2>
            <p>
              This is an AI-powered summarization tool built using a fine-tuned T5 transformer model. 
              Users can input long-form text and generate concise summaries with one click.
            </p>
            <p>
              The app uses a custom-trained model hosted on a Python backend (Hugging Face Transformers),
              and a React frontend styled with modern aesthetics.
            </p>
            <p>
              Developed as part of a learning project in Natural Language Processing and modern web app deployment.
            </p>
          </div>
        </div>
      )}

      {error && <Error message={error} onClose={() => setError(null)} />}
    </div>
    </>
  );
}

export default App;
