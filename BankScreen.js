import React, { useState } from 'react';
import { usePets } from './App'; // Import the context

const BankScreen = ({ navigate }) => {
  const [accountLinked, setAccountLinked] = useState(false);
  const [savings, setSavings] = useState('');
  
  // Get global currency state and updater from context
  const { globalGold, updateGlobalGold } = usePets();

  const handleLinkAccount = () => {
    // This would involve a secure third-party service like Plaid in a real app
    alert('Success! Bank Account Linked!');
    setAccountLinked(true);
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Bank & Savings</h2>
        
        {/* New Receipt Upload Button */}
        <button style={styles.button} onClick={() => navigate('ReceiptUpload')}>
          Upload Receipt for Gold
        </button>
        <hr style={styles.divider} />

        {!accountLinked ? (
          <button style={styles.button} onClick={handleLinkAccount}>Link Your Bank Account</button>
        ) : (
          <div style={styles.form}>
            <p style={styles.linkedText}>Account Linked!</p>
            <p>Total In-Game Gold: {globalGold}</p>
            <input
              style={styles.input}
              placeholder="Enter amount you saved"
              type="number"
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
            />
            <button style={styles.button} onClick={handleAddSavings}>Add Savings & Get Reward</button>
          </div>
        )}
        <button style={{...styles.button, marginTop: '30px', backgroundColor: '#6c757d'}} onClick={() => navigate('Home')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    height: '100%',
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    padding: '25px',
    backgroundColor: 'rgba(40, 40, 40, 0.85)',
    borderRadius: '10px',
    border: '1px solid #555',
    textAlign: 'center',
    backdropFilter: 'blur(5px)',
    color: '#FFFFFF',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  linkedText: {
    fontSize: '18px',
    color: '#28a745',
    marginBottom: '20px',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    height: '40px',
    borderColor: '#555',
    backgroundColor: '#333',
    color: '#FFF',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '5px',
    width: '90%',
    padding: '0 10px',
    marginBottom: '20px',
    marginTop: '10px',
  },
  button: {
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
      margin: '5px',
      width: '90%',
      backgroundColor: '#007bff',
      color: 'white',
      border: '1px solid #888',
      borderRadius: '5px',
      fontWeight: 'bold',
  },
  divider: {
    width: '100%',
    borderColor: '#555',
    margin: '25px 0',
  }
};

export default BankScreen;
