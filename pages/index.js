import { useState, useEffect } from "react";

export default function Home() {
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [percentile, setPercentile] = useState(null);

  async function fetchQuestion() {
    const difficulty = Math.min(3, 1 + score / 5);
    const res = await fetch(`/api/question?difficulty=${difficulty}`);
    const data = await res.json();
    setQuestion(data);
  }

  async function submitAnswer(index) {
    const res = await fetch(`/api/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: question.id, selected_index: index })
    });
    const data = await res.json();
    if (data.correct) setScore(s => s + 1);
    setTotal(t => t + 1);
    await updatePercentile(score + (data.correct ? 1 : 0), total + 1);
    fetchQuestion();
  }

  async function updatePercentile(s, t) {
    const res = await fetch(`/api/percentile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: s, total_questions: t })
    });
    const data = await res.json();
    setPercentile(data.percentile);
  }

  useEffect(() => {
    fetchQuestion();
  }, []);

  if (!question) return <div className="p-6">Loading...</div>;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>Mini IQ Test</h1>
      <p><strong>Score:</strong> {score}/{total} | <strong>Percentile:</strong> {percentile ?? "--"}</p>
      <div style={{ margin: "20px 0" }}>
        <h2>{question.question}</h2>
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => submitAnswer(idx)}
            style={{ display: "block", margin: "8px 0", padding: "8px 16px" }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
