// BankScreen.js
import React, { useState } from 'react';
import { usePets } from './App'; // Import the context

// Define the API URLs needed for the bank and AI services
const NESSIE_API_URL = 'http://localhost:3001/api/nessie';
const GENAI_API_URL = 'http://localhost:3001/api/ai'; // Reusing App.js's API_URL structure

// A hardcoded account ID for the demo/sample code
const DUMMY_ACCOUNT_ID = '68f426849683f20dd519ff49';

const BankScreen = ({ navigate }) => {
  const [accountLinked, setAccountLinked] = useState(false);
  const [savings, setSavings] = useState('');
  const [view, setView] = useState('main'); // 'main' or 'history'
  // transactions can be null, a string ('Loading...'), or an array
  const [transactions, setTransactions] = useState(null); 
  // analysisScore will now be an object { score: number|null, reasoning: string } 
  // or a string ('Analyzing...') for the initial loading state
  const [analysisScore, setAnalysisScore] = useState(null); 

  // Get global currency state and updater from context
  const { globalGold, updateGlobalGold } = usePets();

  // --- Handlers for Bank Linking and Savings ---
  const handleLinkAccount = () => {
    alert('Success! Bank Account Linked! (Using a dummy ID for now)');
    setAccountLinked(true);
    // In a real app, you'd store the actual account ID here
  };

  const handleAddSavings = () => {
    const savedAmount = parseFloat(savings);
    if (!isNaN(savedAmount) && savedAmount > 0) {
      // Reward logic: 1 currency for every $10 saved
      const newCurrency = Math.floor(savedAmount / 10);
      
      // Update the global currency state
      updateGlobalGold(prevGold => prevGold + newCurrency);
      
      alert(`Savings Added! You earned ${newCurrency} in-game currency!`);
      setSavings('');
    } else {
      alert('Invalid Amount: Please enter a valid number.');
    }
  };

  // --- Handlers for Transaction History and AI Analysis ---

  const handleFetchTransactions = async () => {
    // 1. Setup UI for loading
    setTransactions("Loading transactions...");
    setAnalysisScore("Analyzing..."); 
    setView('history');
    
    let fetchedTransactions = null;
    let analysisResult = { score: null, reasoning: "Error: AI analysis failed to process." };

    try {
      // 2. Fetch transactions from the bank API
      let response = await fetch(NESSIE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: DUMMY_ACCOUNT_ID }), 
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      let data = await response.json();
      fetchedTransactions = data.text; 
      setTransactions(fetchedTransactions); 
      
      // Check if we have a valid array to analyze 
      if (!Array.isArray(fetchedTransactions) || fetchedTransactions.length === 0) {
          analysisResult.reasoning = "No transactions found to analyze.";
          setAnalysisScore(analysisResult);
          return;
      }
      
      // 3. Format the transaction data for the AI
      const formattedTransactionData = JSON.stringify(fetchedTransactions, null, 2);

      // UPDATED PROMPT: Ask for reasoning as a JSON array of strings
      const instructions = "Analyze the following list of transactions in terms of \
how healthy or unhealthy this list of transactions is. Give the overall list \
of transactions a score value from 0 - 100, where higher scores represent healthy \
transaction histories and lower scores represent unhealthy transaction histories. \
Respond ONLY with a JSON string containing two fields: 'score' (an integer from 0-100) and 'reasoning' (a JSON array of strings, where each string is a separate point of analysis).";

      const prompt = `${instructions}\n\n--- TRANSACTION DATA ---\n${formattedTransactionData}`;

      // 4. Call the Generative AI API
      response = await fetch(GENAI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) throw new Error('Failed to fetch AI analysis');

      data = await response.json();
      const aiRawText = data.text;

      // 5. Robustly parse the JSON response
      try {
          // Attempt to clean up common AI output markdown
          const jsonString = aiRawText.replace(/```json|```/g, '').trim();
          const parsedData = JSON.parse(jsonString);
          
          if (typeof parsedData.score === 'number' && Array.isArray(parsedData.reasoning)) {
               analysisResult = { 
                   score: Math.max(0, Math.min(100, Math.round(parsedData.score))), // Clamp score
                   // Ensure reasoning is an array of strings
                   reasoning: parsedData.reasoning.map(String)
               };
          } else {
               throw new Error("Parsed JSON structure is invalid or fields are missing/wrong type.");
          }
      } catch (e) {
          console.error("Failed to parse AI response as JSON:", e);
          // Fallback: use the raw text as the reasoning if parsing fails
          analysisResult.reasoning = [`AI response could not be parsed. Raw Output: ${aiRawText}`];
          analysisResult.score = null;
      }
      
      setAnalysisScore(analysisResult); 

    } catch (error) {
      console.error("Error in fetch or analysis:", error);
      // Update states to reflect the error, ensuring analysisScore is an object for consistent rendering
      setTransactions(fetchedTransactions || "Error loading transactions. Check server status.");
      analysisResult.reasoning = [`Error: ${error.message || "Could not complete bank or AI call."}`];
      analysisResult.score = null;
      setAnalysisScore(analysisResult);
    }
  };

  // --- Styles ---
  const styles = {
    // ... (Your existing styles) ...
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      height: '100%',
      boxSizing: 'border-box',
      backgroundColor: '#a2a2a2',
      width: '100%', 
      overflowY: 'auto',
    },
    title: {
      fontSize: '22px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    linkedText: {
      fontSize: '18px',
      color: 'green',
      marginBottom: '20px',
    },
    form: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: '600px', 
    },
    input: {
      height: '40px',
      borderColor: 'gray',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '5px',
      width: '80%',
      padding: '0 10px',
      marginBottom: '20px',
      marginTop: '20px',
      boxSizing: 'border-box'
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        margin: '5px'
    },
    historyContainer: {
        width: '100%',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '20px',
        overflowX: 'auto',
    },
    analysisBox: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '5px',
        whiteSpace: 'pre-wrap', 
        width: '100%',
    },
    loadingText: {
        fontWeight: 'bold',
        color: '#007bff',
    },
    // NEW: Style for the big score number
    bigScore: {
        fontSize: '48px',
        fontWeight: '900',
        margin: '10px 0',
        lineHeight: '1',
    },
    // New styles for the table
    transactionTable: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: '14px',
    },
    tableHeader: {
        backgroundColor: '#f2f2f2',
    },
    tableCell: {
        padding: '10px',
        border: '1px solid #ddd',
    }
  };

  // --- Render Functions ---

  const renderMainView = () => (
    <div style={styles.form}>
      {/* Existing Savings Feature */}
      <p style={styles.linkedText}>Account Linked!</p>
      <p>Total In-Game Currency: **{globalGold}**</p>
      <input
        style={styles.input}
        placeholder="Enter amount you saved"
        type="number"
        value={savings}
        onChange={(e) => setSavings(e.target.value)}
      />
      <button style={styles.button} onClick={handleAddSavings}>Add Savings & Get Reward</button>
      
      <hr style={{width: '80%', margin: '20px 0'}} />

      {/* New Transaction History Button */}
      <button style={{...styles.button, backgroundColor: '#4CAF50', color: 'white'}} 
              onClick={handleFetchTransactions}>
        View Transactions & Get AI Score
      </button>
    </div>
  );

  const renderHistoryView = () => {
    // Check if transactions is a valid array before trying to sort
    const isArray = Array.isArray(transactions) && transactions.length > 0;
    
    let sortedTransactions = [];

    if (isArray) {
        // Create a copy and sort it by date (newest first/descending)
        sortedTransactions = [...transactions].sort((a, b) => {
            const dateA = new Date(a.purchase_date || a.transaction_date);
            const dateB = new Date(b.purchase_date || b.transaction_date);
            // Sort in descending order (dateB - dateA)
            return dateB - dateA; 
        }).slice(0, 10); // Show only the first 10 sorted transactions
    }

    return (
        <div style={styles.form}>
        <div style={styles.historyContainer}>
            <h3>Transaction History (Dummy Data)</h3>
            
            {/* Check if transactions is a string (e.g., loading or error message) */}
            {typeof transactions === 'string' ? (
            <p>{transactions}</p>
            ) : (
            <table style={styles.transactionTable}>
                <thead style={styles.tableHeader}>
                <tr>
                    <th style={styles.tableCell}>Date</th>
                    <th style={styles.tableCell}>Description</th>
                    <th style={styles.tableCell}>Amount ($)</th>
                </tr>
                </thead>
                <tbody>
                {/* Mapping over the sorted transactions */}
                {isArray ? (
                    sortedTransactions.map((t, index) => ( 
                    <tr key={index}>
                        <td style={styles.tableCell}>{t.purchase_date || t.transaction_date || 'N/A'}</td>
                        <td style={styles.tableCell}>{t.description || t.type || 'Unknown'}</td>
                        <td style={styles.tableCell}>
                            {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'USD' 
                            }).format(t.amount)}
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="3" style={styles.tableCell}>No transactions found.</td>
                    </tr>
                )}
                </tbody>
            </table>
            )}
        </div>
        
        {/* The analysis box is now always present when in history view */}
        {analysisScore && (
            <div style={styles.analysisBox}>
            
            {/* Display logic based on the state type (string for loading/initial, object for result) */}
            {typeof analysisScore === "string" ? (
                // Loading State
                <>
                    <h4>AI Transaction Analysis:</h4>
                    <p style={styles.loadingText}>Analyzing your financial health...</p>
                </>
            ) : (
                // Result State
                <>
                <h4>Your Financial Health Score:</h4>
                {analysisScore.score !== null ? (
                    <div style={{
                        ...styles.bigScore,
                        color: analysisScore.score >= 75 ? 'green' : analysisScore.score >= 50 ? 'orange' : 'red' 
                    }}>
                        {analysisScore.score} / 100
                    </div>
                ) : (
                    // Display error if score is null
                    <p style={{color: 'red', fontWeight: 'bold'}}>Analysis Error</p>
                )}
                
                <strong>Key Reasonings:</strong>
                <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                    {/* Map the array of reasoning strings to list items */}
                    {analysisScore.reasoning.map((point, index) => (
                        <li key={index} style={{ marginBottom: '5px' }}>{point}</li>
                    ))}
                </ul>
                </>
            )}
            </div>
        )}
        </div>
    );
  };


  // --- Main Render ---
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Bank Connection</h2>
      
      {!accountLinked ? (
        <button style={styles.button} onClick={handleLinkAccount}>Link Your Bank Account</button>
      ) : (
        view === 'main' ? renderMainView() : renderHistoryView()
      )}
      
      <button 
        style={{...styles.button, marginTop: '30px'}} 
        onClick={() => view === 'main' ? navigate('Home') : setView('main')}
      >
        {view === 'main' ? 'Back to Home' : 'Back to Savings'}
      </button>
    </div>
  );
};

export default BankScreen;
