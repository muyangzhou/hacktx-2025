// LessonsScreen.js
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView } from 'react-native';
import { usePets } from './App';

export default function LessonsScreen({ navigate }) {
  // ... (All logic functions are unchanged) ...
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

    const openVideoLink = () => {
        Linking.openURL(currentLesson.url);
        setVideoLinkOpened(true);
    };


  if (!selectedPet) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No pet selected</Text>
        {/* "Go to Home" button removed from here */}
      </View>
    );
  }

  // ... (renderVideoView, renderQuizView, renderResultsView, renderCertificateView are unchanged) ...
  const renderVideoView = () => (
        <View style={styles.viewContainer}>
            <Text style={styles.title}>Lesson {currentLessonIndex + 1}: {currentLesson.title}</Text>
            <Text style={styles.paragraph}>Watch the video to learn about this topic. When you're done, come back and take the quiz!</Text>
            <View style={{alignItems: 'center'}}>
                <TouchableOpacity style={styles.videoLink} onPress={openVideoLink}>
                    <Text style={styles.videoLinkText}>Watch Video on YouTube</Text>
                </TouchableOpacity>
                {videoLinkOpened && (
                    <TouchableOpacity style={styles.button} onPress={() => setView('quiz')}>
                        <Text style={styles.buttonText}>I've Watched It, Take the Quiz!</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderQuizView = () => (
        <View style={styles.viewContainer}>
            <Text style={styles.title}>Quiz for: {currentLesson.title}</Text>
            <ScrollView style={styles.scrollBox}>
                {currentLesson.quiz.map((q, qIndex) => (
                    <View key={qIndex} style={styles.questionContainer}>
                        <Text style={styles.questionText}>{qIndex + 1}. {q.question}</Text>
                        {q.options.map((option, oIndex) => {
                            const isSelected = answers[qIndex] === option;
                            return (
                                <TouchableOpacity 
                                    key={oIndex} 
                                    style={styles.optionContainer}
                                    onPress={() => handleAnswerSelect(qIndex, option)}
                                >
                                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                                        {isSelected && <View style={styles.radioInnerCircle} />}
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={handleSubmitQuiz}>
                <Text style={styles.buttonText}>Submit Answers</Text>
            </TouchableOpacity>
        </View>
    );
    
    const renderResultsView = () => (
        <View style={styles.viewContainer}>
            <Text style={styles.title}>Quiz Results</Text>
            <Text style={styles.scoreText}>You scored {quizResult.score.toFixed(0)}%</Text>
            <Text style={styles.paragraph}>({quizResult.correct} out of {quizResult.total} correct)</Text>
            {quizResult.score >= 70 ? (
                <View>
                    <Text style={styles.passText}>Congratulations, you passed!</Text>
                    <TouchableOpacity style={styles.button} onPress={handleNextLesson}>
                        <Text style={styles.buttonText}>Continue to Next Lesson</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View>
                    <Text style={styles.failText}>You need to score 70% or higher. Please re-watch the video and try again.</Text>
                    <TouchableOpacity style={styles.button} onPress={handleRetry}>
                        <Text style={styles.buttonText}>Re-watch Video</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderCertificateView = () => (
         <View style={styles.certificate}>
            <Text style={styles.title}>Certificate of Completion</Text>
            <Text style={styles.paragraph}>This certifies that</Text>
            <Text style={styles.certName}>{selectedPet.name}</Text>
            <Text style={styles.paragraph}>has successfully completed the{'\n'}
                <Text style={{fontWeight: 'bold'}}>{userAge <= 14 ? 'Kids' : 'Teens'} Financial Literacy Course</Text>.
            </Text>
            <Text style={styles.certCongrats}>Great job investing in your future!</Text>
        </View>
    );


  return (
    <View style={styles.container}>
      {view === 'video' && !isSeriesCompleted && renderVideoView()}
      {view === 'quiz' && !isSeriesCompleted && renderQuizView()}
      {view === 'results' && !isSeriesCompleted && renderResultsView()}
      {isSeriesCompleted && renderCertificateView()}
      {/* The "Back to Home" button was here and is now removed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Padding removed
    alignItems: 'center',
    color: '#FFFFFF',
    width: '100%',
    flex: 1, 
    justifyContent: 'center'
  },
  // ... (all other styles are unchanged) ...
  viewContainer: {
        backgroundColor: 'rgba(40, 40, 40, 0.8)',
        padding: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#555',
        width: '100%',
        marginBottom: 20, 
        maxHeight: '80%', 
    },
    title: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },
    paragraph: {
        color: '#DDDDDD',
        lineHeight: 22,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
    },
    button: {
      padding: 12,
      fontSize: 16,
      margin: 10,
      backgroundColor: '#6c757d',
      color: 'white',
      borderWidth: 1,
      borderColor: '#888',
      borderRadius: 5,
      alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    videoLink: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        marginVertical: 20,
        backgroundColor: '#c4302b',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    videoLinkText: {
        color: 'white',
        textDecorationLine: 'none',
        fontWeight: 'bold',
        fontSize: 18,
    },
    questionContainer: {
        marginVertical: 15,
        textAlign: 'left',
        borderWidth: 1,
        borderColor: '#555',
        padding: 15,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    questionText: {
        fontWeight: 'bold',
        marginBottom: 10,
        fontSize: 17,
        color: '#FFFFFF',
    },
    optionContainer: {
        marginVertical: 8,
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        color: '#DDDDDD',
        fontSize: 16,
        flex: 1,
        lineHeight: 22,
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#DDDDDD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioCircleSelected: {
        borderColor: '#007bff',
    },
    radioInnerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#007bff',
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    passText: {
        color: '#28a745',
        fontWeight: 'bold',
        margin: 10,
        fontSize: 16,
        textAlign: 'center',
    },
    failText: {
        color: '#dc3545',
        fontWeight: 'bold',
        margin: 10,
        fontSize: 16,
        textAlign: 'center',
    },
    certificate: {
        borderWidth: 10,
        borderColor: '#6c757d',
        padding: 30,
        borderRadius: 10,
        backgroundColor: 'rgba(20, 20, 20, 0.9)',
        width: '100%',
        marginVertical: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    certName: {
        fontSize: 28,
        color: '#007bff',
        marginVertical: 10,
        fontWeight: 'bold',
    },
    certCongrats: {
        marginTop: 20,
        fontStyle: 'italic',
        color: '#CCCCCC',
        textAlign: 'center',
    },
    scrollBox: {
        maxHeight: 300, 
        width: '100%',
        marginVertical: 10,
    }
});