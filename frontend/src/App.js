import React, { useState, useRef } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/feedback';

function App() {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Voice input (SpeechRecognition)
  const handleSpeak = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Voice input is only supported in Chrome.');
      return;
    }
    setError('');
    if (!recognitionRef.current) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setAnswer((prev) => prev ? prev + ' ' + transcript : transcript);
        setListening(false);
      };
      recognition.onerror = (event) => {
        setError('Voice input error: ' + event.error);
        setListening(false);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
    setListening(true);
    recognitionRef.current.start();
  };

  // Text-to-speech (SpeechSynthesis)
  const speakFeedback = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Submit answer for feedback
  const handleFeedback = async () => {
    setError('');
    setFeedback('');
    if (!answer.trim()) {
      setError('Please enter or speak your answer.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data.feedback);
        speakFeedback(data.feedback);
      } else {
        setError(data.error || 'Error getting feedback.');
      }
    } catch (err) {
      // Local fallback feedback if backend is unreachable
      const localFeedback = generateLocalFeedback(answer);
      setFeedback(localFeedback);
      speakFeedback(localFeedback);
    }
    setLoading(false);
  };

  // Local feedback generator
  function generateLocalFeedback(text) {
    if (text.length < 30) {
      return 'Try to elaborate more on your answer for better clarity and detail.';
    }
    if (!/I|my|me|we|our|us/i.test(text)) {
      return 'Try to personalize your answer with examples from your own experience.';
    }
    if (/um|uh|like|you know/i.test(text)) {
      return 'Try to avoid filler words for a more professional answer.';
    }
    return 'Good answer! Consider adding more structure: Situation, Action, Result.';
  }

  return (
    <div className="container">
      <header>
        <h1>🎤 Smart Interview Coach</h1>
      </header>
      <main>
        <label htmlFor="answer" className="visually-hidden">Type your answer here</label>
        <textarea
          id="answer"
          rows={6}
          placeholder="Type your answer here..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          aria-label="Type your answer here"
        />
        <div className="button-row">
          <button type="button" onClick={handleSpeak} disabled={listening} aria-pressed={listening}>
            🎙️ {listening ? 'Listening...' : 'Speak'}
          </button>
          <button type="button" onClick={handleFeedback} disabled={loading}>
            🧠 {loading ? 'Getting Feedback...' : 'Get Feedback'}
          </button>
        </div>
        {error && <div className="error" role="alert">{error}</div>}
        <section className="feedback-section" aria-live="polite">
          {feedback && (
            <div className="feedback">
              <strong>AI Feedback:</strong>
              <p>{feedback}</p>
              <span role="img" aria-label="Speaker">🔊</span> <span className="spoken">(Text is spoken aloud)</span>
            </div>
          )}
        </section>
      </main>
      <footer>
        <small>&copy; {new Date().getFullYear()} Smart Interview Coach</small>
      </footer>
    </div>
  );
}

export default App;
