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
  const [transactions, setTransactions] = useState(null); // To store fetched transactions
  const [analysisScore, setAnalysisScore] = useState(null); // To store AI analysis

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
    setAnalysisScore("Analyzing..."); // Set loading state for AI score immediately
    setView('history');
    
    let fetchedTransactions = null;

    try {
      // 2. Fetch transactions from the bank API
      let response = await fetch(NESSIE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: DUMMY_ACCOUNT_ID }), // Use the dummy ID
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      let data = await response.json();
      fetchedTransactions = data.text; // Store the fetched data
      setTransactions(fetchedTransactions); // Set the transactions state
      
      // Check if we have an array to analyze (or just proceed with what we got)
      if (!fetchedTransactions || typeof fetchedTransactions === 'string' || fetchedTransactions.length === 0) {
          setAnalysisScore("No valid transactions to analyze.");
          return;
      }
      
      // 3. Format the transaction data for the AI
      const formattedTransactionData = JSON.stringify(fetchedTransactions, null, 2);

      const instructions = "Analyze the following list of transactions in terms of \
how healthy or unhealthy this list of transastions is. Give the overall list \
of transactions a score value from 0 - 100, where higher scores represent healthy \
transaction histories and lower scores represent unhealthy transaction histories. \
Respond only with a text analysis, not JSON.";

      const prompt = `${instructions}\n\n--- TRANSACTION DATA ---\n${formattedTransactionData}`;

      // 4. Call the Generative AI API
      response = await fetch(GENAI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) throw new Error('Failed to fetch AI analysis');

      data = await response.json();
      setAnalysisScore(data.text); // Set the final AI analysis score

    } catch (error) {
      console.error("Error in fetch or analysis:", error);
      // Update states to reflect the error
      setTransactions(fetchedTransactions || "Error loading transactions. Check server status.");
      setAnalysisScore("Error: Could not get AI score.");
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
      width: '100%', // Ensure it takes full width for flex
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
      maxWidth: '600px', // Increased width for better table view
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
        whiteSpace: 'pre-wrap', // Preserve formatting of the AI's response
        width: '100%',
    },
    loadingText: {
        fontWeight: 'bold',
        color: '#007bff',
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
                    {/* Updated colSpan from 4 to 3 */}
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
            <h4>AI Transaction Analysis:</h4>
            <p style={analysisScore === "Analyzing..." ? styles.loadingText : {}}>
                {analysisScore === "Analyzing..." ? "Analyzing your financial health..." : analysisScore}
            </p>
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