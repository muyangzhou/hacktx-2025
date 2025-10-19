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

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      height: '100vh',
      boxSizing: 'border-box',
      backgroundColor: '#a2a2a2'
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
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Bank Connection</h2>
      {!accountLinked ? (
        <button style={styles.button} onClick={handleLinkAccount}>Link Your Bank Account</button>
      ) : (
        <div style={styles.form}>
          <p style={styles.linkedText}>Account Linked!</p>
          {/* Display globalGold from context */}
          <p>Total In-Game Currency: ${globalGold}</p>
          <input
            style={styles.input}
            placeholder="Enter amount you saved"
            type="number"
            value={savings}
            onChange={(e) => setSavings(e.targe.value)}
          />
          <button style={styles.button} onClick={handleAddSavings}>Add Savings & Get Reward</button>
        </div>
      )}
      <button style={{...styles.button, marginTop: '30px'}} onClick={() => navigate('Home')}>Back to Home</button>
    </div>
  );
};

export default BankScreen;