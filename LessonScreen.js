// LessonScreen.js
import React, { useState } from 'react';
import lessonsData from './lessons.json';

export default function LessonScreen({ navigate }) {
  const [age, setAge] = useState(null);
  const [series, setSeries] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [quizStage, setQuizStage] = useState(null); // watching | quiz | done
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [coins, setCoins] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const handleSetAge = (userAge) => {
    setAge(userAge);
    setSeries(userAge <= 14 ? lessonsData.kids : lessonsData.teens);
    setCurrentLessonIndex(0);
    setQuizStage('watching');
  };

  const currentLesson = series[currentLessonIndex];

  const handleWatchVideo = () => {
    window.open(currentLesson.url, '_blank');
    setQuizStage('quiz');
  };

  const handleAnswer = (qIdx, opt) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: opt }));
  };

  const handleSubmitQuiz = () => {
    const currentQuiz = currentLesson.quiz;
    let correct = 0;
    currentQuiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    const percent = (correct / currentQuiz.length) * 100;
    setScore(percent);

    if (percent >= 70) {
      if (currentLessonIndex + 1 < series.length) {
        alert(`✅ You passed with ${percent.toFixed(0)}%! Moving to next video.`);
        setCurrentLessonIndex(currentLessonIndex + 1);
        setAnswers({});
        setQuizStage('watching');
      } else {
        alert('🎉 All lessons complete!');
        setShowCertificate(true);
        setCoins((c) => c + 100);
        setQuizStage('done');
      }
    } else {
      alert(`❌ You scored ${percent.toFixed(0)}%. Please rewatch and retry.`);
      setQuizStage('watching');
    }
  };

  return (
    <div style={styles.container}>
      <h1>📘 Lessons</h1>

      {/* Debug Menu */}
      <div style={styles.debugSection}>
        <button onClick={() => setShowDebug(!showDebug)} style={styles.debugButton}>
          ⚙ Debug Menu
        </button>
        {showDebug && (
          <div>
            <input
              type="number"
              placeholder="Enter Age"
              onChange={(e) => handleSetAge(Number(e.target.value))}
            />
            <p>Current Age: {age ?? 'Not set'}</p>
          </div>
        )}
      </div>

      {age && currentLesson && quizStage !== 'done' && (
        <div style={styles.lessonSection}>
          <h3>
            Lesson {currentLessonIndex + 1}: {currentLesson.title}
          </h3>

          {quizStage === 'watching' && (
            <button onClick={handleWatchVideo} style={styles.globalButton}>
              ▶ Watch Video
            </button>
          )}

          {quizStage === 'quiz' && (
            <div style={styles.quizSection}>
              {currentLesson.quiz.map((q, idx) => (
                <div key={idx} style={styles.questionBlock}>
                  <p>{q.question}</p>
                  {q.options.map((opt) => (
                    <label key={opt}>
                      <input
                        type="radio"
                        name={`q${idx}`}
                        value={opt}
                        checked={answers[idx] === opt}
                        onChange={() => handleAnswer(idx, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ))}
              <button onClick={handleSubmitQuiz} style={styles.actionButton}>
                Submit Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {showCertificate && (
        <div style={styles.certificate}>
          <h2>🏆 Certificate of Completion</h2>
          <p>You’ve completed all your financial lessons!</p>
          <p>Reward: +{coins} coins</p>
          <button style={styles.globalButton} onClick={() => navigate('Home')}>
            Return Home
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
  },
  debugSection: {
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  debugButton: {
    padding: '8px 10px',
    marginBottom: 8,
  },
  lessonSection: {
    backgroundColor: '#fafafa',
    padding: 10,
    borderRadius: 8,
  },
  quizSection: {
    marginTop: 10,
  },
  questionBlock: {
    marginBottom: 10,
  },
  certificate: {
    textAlign: 'center',
    backgroundColor: '#e6ffe6',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  globalButton: {
    flex: 1,
    padding: 12,
    fontWeight: 'bold',
  },
  actionButton: {
    marginTop: 10,
    padding: '8px 12px',
  },
};
