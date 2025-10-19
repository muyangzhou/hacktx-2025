import React, { useState, useMemo } from 'react';
import { usePets } from './App';

export default function LessonsScreen({ navigate }) {
    const {
        selectedPet,
        userAge,
        lessonsData,
        advanceLesson,
        markLessonsCompleted,
        updateGlobalGold,
    } = usePets();

    const lessonSeries = useMemo(() => {
        return userAge <= 14 ? lessonsData.kids : lessonsData.teens;
    }, [userAge, lessonsData]);

    const currentLessonIndex = selectedPet?.lessonProgress || 0;
    const isSeriesCompleted = currentLessonIndex >= lessonSeries.length;
    const currentLesson = !isSeriesCompleted ? lessonSeries[currentLessonIndex] : null;
    
    const [view, setView] = useState(isSeriesCompleted ? 'certificate' : 'video');
    const [answers, setAnswers] = useState({});
    const [quizResult, setQuizResult] = useState({ score: 0, correct: 0, total: 0 });
    const [videoLinkOpened, setVideoLinkOpened] = useState(false);

    if (isSeriesCompleted && !selectedPet.lessonsCompleted) {
        markLessonsCompleted(selectedPet.id);
    }

    const handleAnswerSelect = (questionIndex, option) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    const handleSubmitQuiz = () => {
        let correctAnswers = 0;
        const totalQuestions = currentLesson.quiz.length;

        currentLesson.quiz.forEach((q, index) => {
            if (answers[index] === q.answer) {
                correctAnswers++;
            }
        });

        const score = (correctAnswers / totalQuestions) * 100;
        setQuizResult({ score, correct: correctAnswers, total: totalQuestions });
        setView('results');
    };

    const handleNextLesson = () => {
        if (quizResult.score >= 70) {
            updateGlobalGold(prev => prev + 50);
            alert("Great job! You passed the quiz and earned 50 gold!");
            advanceLesson(selectedPet.id);
            setView('video');
            setAnswers({});
            setVideoLinkOpened(false);
        }
    };

    const handleRetry = () => {
        setView('video');
        setAnswers({});
    };

    if (!selectedPet) {
        return (
            <div style={styles.container}>
                <h2>No pet selected</h2>
                <button style={styles.button} onClick={() => navigate('Home')}>Go to Home</button>
            </div>
        );
    }
    
    const renderVideoView = () => (
        <div style={styles.viewContainer}>
            <h2 style={styles.title}>Lesson {currentLessonIndex + 1}: {currentLesson.title}</h2>
            <p style={styles.paragraph}>Watch the video to learn about this topic. When you're done, come back and take the quiz!</p>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <a href={currentLesson.url} target="_blank" rel="noopener noreferrer" style={styles.videoLink} onClick={() => setVideoLinkOpened(true)}>
                    Watch Video on YouTube
                </a>
                {videoLinkOpened && (
                    <button style={styles.button} onClick={() => setView('quiz')}>I've Watched It, Take the Quiz!</button>
                )}
            </div>
        </div>
    );

    const renderQuizView = () => (
        <div style={styles.viewContainer}>
            <h2 style={styles.title}>Quiz for: {currentLesson.title}</h2>
            {currentLesson.quiz.map((q, qIndex) => (
                <div key={qIndex} style={styles.questionContainer}>
                    <p style={styles.questionText}>{qIndex + 1}. {q.question}</p>
                    {q.options.map((option, oIndex) => (
                        <div key={oIndex} style={styles.optionContainer}>
                            <input
                                type="radio"
                                id={`q${qIndex}o${oIndex}`}
                                name={`q${qIndex}`}
                                value={option}
                                checked={answers[qIndex] === option}
                                onChange={() => handleAnswerSelect(qIndex, option)}
                                style={{marginRight: '8px'}}
                            />
                            <label htmlFor={`q${qIndex}o${oIndex}`}>{option}</label>
                        </div>
                    ))}
                </div>
            ))}
            <button style={styles.button} onClick={handleSubmitQuiz}>Submit Answers</button>
        </div>
    );
    
    const renderResultsView = () => (
        <div style={styles.viewContainer}>
            <h2 style={styles.title}>Quiz Results</h2>
            <p style={styles.scoreText}>You scored {quizResult.score.toFixed(0)}%</p>
            <p style={styles.paragraph}>({quizResult.correct} out of {quizResult.total} correct)</p>
            {quizResult.score >= 70 ? (
                <div>
                    <p style={styles.passText}>Congratulations, you passed!</p>
                    <button style={styles.button} onClick={handleNextLesson}>Continue to Next Lesson</button>
                </div>
            ) : (
                <div>
                    <p style={styles.failText}>You need to score 70% or higher. Please re-watch the video and try again.</p>
                    <button style={styles.button} onClick={handleRetry}>Re-watch Video</button>
                </div>
            )}
        </div>
    );

    const renderCertificateView = () => (
         <div style={styles.certificate}>
            <h2 style={styles.title}>Certificate of Completion</h2>
            <p style={styles.paragraph}>This certifies that</p>
            <h3 style={styles.certName}>{selectedPet.name}</h3>
            <p style={styles.paragraph}>has successfully completed the<br/><strong>{userAge <= 14 ? 'Kids' : 'Teens'} Financial Literacy Course</strong>.</p>
            <p style={styles.certCongrats}>Great job investing in your future!</p>
        </div>
    );

    return (
        <div style={styles.container}>
            {view === 'video' && !isSeriesCompleted && renderVideoView()}
            {view === 'quiz' && !isSeriesCompleted && renderQuizView()}
            {view === 'results' && !isSeriesCompleted && renderResultsView()}
            {isSeriesCompleted && renderCertificateView()}
            <button style={{ ...styles.button, marginTop: '20px' }} onClick={() => navigate('Home')}>Back to Home</button>
        </div>
    );
}

const styles = {
    container: {
      padding: 20,
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      color: '#FFFFFF',
      width: '100%',
      maxWidth: '600px',
    },
    viewContainer: {
        backgroundColor: 'rgba(40, 40, 40, 0.8)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #555',
        backdropFilter: 'blur(5px)',
    },
    title: {
      color: '#FFFFFF',
    },
    paragraph: {
        color: '#DDDDDD',
        lineHeight: '1.6',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
      margin: '10px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: '1px solid #888',
      borderRadius: '5px',
      fontWeight: 'bold',
    },
    videoLink: {
        display: 'inline-block',
        padding: '12px 25px',
        margin: '20px 0',
        backgroundColor: '#c4302b',
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold',
        borderRadius: '5px',
        fontSize: '18px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
    },
    questionContainer: {
        margin: '20px 0',
        textAlign: 'left',
        border: '1px solid #555',
        padding: '15px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    questionText: {
        fontWeight: 'bold',
        marginBottom: '10px',
        fontSize: '1.1em',
        color: '#FFFFFF',
    },
    optionContainer: {
        margin: '8px 0',
        padding: '5px',
        cursor: 'pointer',
        color: '#DDDDDD',
    },
    scoreText: {
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '10px 0',
        color: '#FFFFFF',
    },
    passText: {
        color: '#28a745',
        fontWeight: 'bold',
        margin: '10px 0',
    },
    failText: {
        color: '#dc3545',
        fontWeight: 'bold',
        margin: '10px 0',
    },
    certificate: {
        border: '10px solid #6c757d',
        padding: '30px',
        borderRadius: '10px',
        backgroundColor: 'rgba(20, 20, 20, 0.9)',
        maxWidth: '500px',
        margin: '20px auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        color: '#FFFFFF',
    },
    certName: {
        fontSize: '2em',
        color: '#007bff',
        margin: '10px 0',
    },
    certCongrats: {
        marginTop: '20px',
        fontStyle: 'italic',
        color: '#CCCCCC',
    }
};