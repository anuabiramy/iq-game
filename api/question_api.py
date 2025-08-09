from fastapi import FastAPI, Query
from pydantic import BaseModel
import json
import random
import math
import os

app = FastAPI()

# Load questions
QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), "questions.json")
with open(QUESTIONS_FILE, "r") as f:
    QUESTIONS = json.load(f)

class AnswerRequest(BaseModel):
    question_id: int
    selected_index: int

class ScoreRequest(BaseModel):
    score: int
    total_questions: int

@app.get("/api/question")
def get_question(difficulty: float = Query(1.0)):
    """Return a random question near the requested difficulty (1 = easy, 3 = hard)."""
    candidates = [q for q in QUESTIONS if abs(q["difficulty"] - difficulty) <= 0.5]
    if not candidates:
        candidates = QUESTIONS
    question = random.choice(candidates)
    q_copy = {k: v for k, v in question.items() if k != "answer_index"}
    return q_copy

@app.post("/api/answer")
def check_answer(data: AnswerRequest):
    question = next((q for q in QUESTIONS if q["id"] == data.question_id), None)
    if not question:
        return {"correct": False}
    correct = question["answer_index"] == data.selected_index
    return {"correct": correct}

@app.post("/api/percentile")
def get_percentile(data: ScoreRequest):
    """Roughly map score percentage to IQ percentile."""
    if data.total_questions == 0:
        return {"percentile": 0}
    percentage = data.score / data.total_questions
    iq_estimate = 100 + (percentage - 0.5) * 30  # scale ±15 IQ points
    z_score = (iq_estimate - 100) / 15
    percentile = 0.5 * (1 + math.erf(z_score / math.sqrt(2))) * 100
    return {"percentile": round(percentile, 2)}
