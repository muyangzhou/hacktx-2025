// BankScreen.js
import React, { useState } from 'react';
import { usePets } from './App';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const NESSIE_API_URL = 'http://localhost:3001/api/nessie';
const GENAI_API_URL = 'http://localhost:3001/api/ai';
const DUMMY_ACCOUNT_ID = '68f426849683f20dd519ff49';

const BankScreen = ({ navigate }) => {
  const [accountLinked, setAccountLinked] = useState(true); // Default to true for styling
  const [savings, setSavings] = useState('');
  const [view, setView] = useState('main'); // 'main' or 'history'
  const [transactions, setTransactions] = useState(null); 
  const [analysisScore, setAnalysisScore] = useState(null); 

  const { globalGold, updateGlobalGold } = usePets();

  const handleAddSavings = () => {
    const savedAmount = parseFloat(savings);
    if (!isNaN(savedAmount) && savedAmount > 0) {
      const newCurrency = Math.floor(savedAmount / 10);
      updateGlobalGold(prevGold => prevGold + newCurrency);
      alert(`Savings Added! You earned ${newCurrency} in-game currency!`);
      setSavings('');
    } else {
      alert('Invalid Amount: Please enter a valid number.');
    }
  };

  const handleFetchTransactions = async () => {
    setView('history');
    setTransactions("Loading transactions...");
    setAnalysisScore("Analyzing..."); 
    
    let fetchedTransactions = null;
    let analysisResult = { score: null, reasoning: ["Error: AI analysis failed to process."] };

    try {
      let response = await fetch(NESSIE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: DUMMY_ACCOUNT_ID }), 
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      let data = await response.json();
      fetchedTransactions = data.text; 
      setTransactions(fetchedTransactions); 
      
      if (!Array.isArray(fetchedTransactions) || fetchedTransactions.length === 0) {
          analysisResult.reasoning = ["No transactions found to analyze."];
          setAnalysisScore(analysisResult);
          return;
      }
      
      const formattedTransactionData = JSON.stringify(fetchedTransactions, null, 2);

      const instructions = "Analyze the following list of transactions in terms of how healthy or unhealthy this list of transactions is. Give the overall list a score value from 0 - 100, where higher scores represent healthy transaction histories and lower scores represent unhealthy transaction histories. Respond ONLY with a JSON string containing two fields: 'score' (an integer from 0-100) and 'reasoning' (a JSON array of strings, where each string is a separate point of analysis).";
      const prompt = `${instructions}\n\n--- TRANSACTION DATA ---\n${formattedTransactionData}`;

      response = await fetch(GENAI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) throw new Error('Failed to fetch AI analysis');

      data = await response.json();
      const aiRawText = data.text;
      
      const jsonString = aiRawText.replace(/```json|```/g, '').trim();
      const parsedData = JSON.parse(jsonString);
      
      if (typeof parsedData.score === 'number' && Array.isArray(parsedData.reasoning)) {
            analysisResult = { 
                score: Math.max(0, Math.min(100, Math.round(parsedData.score))),
                reasoning: parsedData.reasoning.map(String)
            };
      } else {
            throw new Error("Parsed JSON structure is invalid.");
      }
      
      setAnalysisScore(analysisResult); 

    } catch (error) {
      console.error("Error in fetch or analysis:", error);
      setTransactions(fetchedTransactions || "Error loading transactions.");
      analysisResult.reasoning = [`Error: ${error.message || "Could not complete API call."}`];
      analysisResult.score = null;
      setAnalysisScore(analysisResult);
    }
  };

  const renderMainView = () => (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Savings Account</Text>
        <Text style={styles.paragraph}>Current Gold: {globalGold}</Text>
         <TextInput
            style={styles.input}
            placeholder="Enter amount to deposit"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={savings}
            onChangeText={setSavings}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddSavings}>
            <Text style={styles.buttonText}>Add Savings & Get Reward</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Actions</Text>
        <TouchableOpacity style={{...styles.button, backgroundColor: '#4CAF50'}} onPress={handleFetchTransactions}>
            <Text style={styles.buttonText}>View Transactions & Get AI Score</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{...styles.button, backgroundColor: '#007bff'}} onPress={() => navigate('ReceiptUpload')}>
            <Text style={styles.buttonText}>Upload Receipt for Gold</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderHistoryView = () => {
    const isArray = Array.isArray(transactions);
    const sortedTransactions = isArray ? [...transactions].sort((a, b) => new Date(b.purchase_date || b.transaction_date) - new Date(a.purchase_date || a.transaction_date)).slice(0, 10) : [];

    return (
        <>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Recent Transactions</Text>
                {typeof transactions === 'string' ? (
                    <Text style={styles.paragraph}>{transactions}</Text>
                ) : (
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Date</Text>
                            <Text style={[styles.tableCell, { flex: 4, fontWeight: 'bold' }]}>Description</Text>
                            <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold', textAlign: 'right' }]}>Amount</Text>
                        </View>
                        {isArray && sortedTransactions.length > 0 ? (
                            sortedTransactions.map((t, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{t.purchase_date || t.transaction_date || 'N/A'}</Text>
                                    <Text style={[styles.tableCell, { flex: 4 }]}>{t.description || t.type || 'Unknown'}</Text>
                                    <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.amount)}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.paragraph}>No transactions found.</Text>
                        )}
                    </View>
                )}
            </View>

            {analysisScore && (
                <View style={styles.card}>
                    {typeof analysisScore === "string" ? (
                        <>
                            <Text style={styles.cardTitle}>AI Transaction Analysis</Text>
                            <Text style={styles.paragraph}>{analysisScore}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.cardTitle}>Your Financial Health Score</Text>
                            {analysisScore.score !== null ? (
                                <Text style={[styles.bigScore, { color: analysisScore.score >= 75 ? '#28a745' : analysisScore.score >= 50 ? '#ffc107' : '#dc3545' }]}>
                                    {analysisScore.score} / 100
                                </Text>
                            ) : (
                                <Text style={[styles.paragraph, { color: '#dc3545', fontWeight: 'bold' }]}>Analysis Error</Text>
                            )}
                            <Text style={{...styles.paragraph, fontWeight: 'bold', textAlign: 'left', alignSelf: 'stretch', marginTop: 10 }}>Key Reasonings:</Text>
                            <View style={{alignSelf: 'stretch', paddingLeft: 20}}>
                                {analysisScore.reasoning.map((point, index) => (
                                    <Text key={index} style={{...styles.paragraph, textAlign: 'left', marginVertical: 4}}>• {point}</Text>
                                ))}
                            </View>
                        </>
                    )}
                </View>
            )}
        </>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bank Connection</Text>
      
      {accountLinked ? (
        view === 'main' ? renderMainView() : renderHistoryView()
      ) : (
        <View style={styles.card}>
            <Text style={styles.paragraph}>Link your bank account to get started.</Text>
            {/* In a real app, this would trigger a service like Plaid */}
            <TouchableOpacity style={styles.button} onPress={() => setAccountLinked(true)}>
                <Text style={styles.buttonText}>Link Bank Account</Text>
            </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity 
        style={{...styles.button, backgroundColor: '#6c757d', marginTop: 20}} 
        onPress={() => view === 'main' ? navigate('Home') : setView('main')}>
        <Text style={styles.buttonText}>{view === 'main' ? 'Back to Home' : 'Back to Bank'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
    container: {
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    card: {
        width: '100%',
        maxWidth: 600,
        padding: '20px',
        backgroundColor: 'rgba(40, 40, 40, 0.85)',
        borderRadius: 10,
        border: '1px solid #555',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#FFFFFF',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center',
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '15px',
    },
    paragraph: {
        color: '#DDDDDD',
        marginBottom: '15px',
        lineHeight: 22,
        fontSize: '16px',
        textAlign: 'center',
    },
    input: {
      height: 40,
      width: '100%',
      borderColor: '#555',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 20,
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    button: {
        width: '100%',
        padding: '12px 20px',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
    },
    bigScore: {
        fontSize: '48px',
        fontWeight: '900',
        marginVertical: 10,
    },
    table: {
        width: '100%',
        border: '1px solid #555',
        borderRadius: 5,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderBottomWidth: 1,
        borderColor: '#555',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#555',
    },
    tableCell: {
        padding: '10px',
        color: '#DDDDDD',
        fontSize: '14px',
    }
};

export default BankScreen;

