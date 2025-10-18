import React, { useState, useEffect } from 'react';

const BattleScreen = ({ navigate, params }) => {
  // Default to an empty object if params are not provided
  const { friendId } = params || {};

  const [playerPet, setPlayerPet] = useState({ health: 100, power: 10, weapon: 'Basic Sword' });
  const [opponentPet, setOpponentPet] = useState({ name: 'Opponent', health: 100, power: 8 });
  const [turn, setTurn] = useState('player');
  const [winner, setWinner] = useState(null);
  const [battleLog, setBattleLog] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch opponent data from a backend
    if(friendId) {
        console.log(`Fetching data for opponent: ${friendId}`);
        setBattleLog([`Battle started against a friend's pet!`]);
    } else {
        setBattleLog([`Battle started against an opponent!`]);
    }
  }, [friendId]);

  const handleAttack = () => {
    if (turn === 'player' && !winner) {
      const damage = playerPet.power + (playerPet.weapon !== 'none' ? 5 : 0);
      const newOpponentHealth = Math.max(0, opponentPet.health - damage);
      setOpponentPet({ ...opponentPet, health: newOpponentHealth });
      setBattleLog(prev => [...prev, `You attacked and dealt ${damage} damage!`]);

      if (newOpponentHealth === 0) {
        setWinner('You');
        setBattleLog(prev => [...prev, 'You Win! You defeated your opponent.']);
      } else {
        setTurn('opponent');
      }
    }
  };

  // Simulate opponent's turn
  useEffect(() => {
    if (turn === 'opponent' && !winner) {
      const opponentDamage = opponentPet.power;
      const newPlayerHealth = Math.max(0, playerPet.health - opponentDamage);
      
      const timeoutId = setTimeout(() => {
        setPlayerPet({ ...playerPet, health: newPlayerHealth });
        setBattleLog(prev => [...prev, `Opponent attacked and dealt ${opponentDamage} damage!`]);

        if (newPlayerHealth === 0) {
          setWinner('Opponent');
          setBattleLog(prev => [...prev, 'You Lose! Your opponent defeated you.']);
        } else {
          setTurn('player');
        }
      }, 1000);

      // Cleanup timeout on component unmount
      return () => clearTimeout(timeoutId);
    }
  }, [turn, winner, playerPet, opponentPet]);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      height: '100vh',
      boxSizing: 'border-box'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    petsContainer: {
        display: 'flex',
        justifyContent: 'space-around',
        width: '100%'
    },
    petContainer: {
      textAlign: 'center',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '10px',
      width: '40%',
    },
    petName: {
      fontSize: '18px',
      fontWeight: 'bold',
    },
    winnerContainer: {
        textAlign: 'center',
        padding: '20px'
    },
    winnerText: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: winner === 'You' ? 'green' : 'red',
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        margin: '5px'
    },
    logContainer: {
        width: '80%',
        height: '100px',
        border: '1px solid #eee',
        padding: '10px',
        overflowY: 'scroll',
        backgroundColor: '#f9f9f9',
        borderRadius: '5px'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Battle!</h2>

      <div style={styles.petsContainer}>
        <div style={styles.petContainer}>
            <p style={styles.petName}>Your Pet</p>
            <p>Health: {playerPet.health}</p>
            <p>Weapon: {playerPet.weapon}</p>
        </div>

        <div style={styles.petContainer}>
            <p style={styles.petName}>{opponentPet.name}</p>
            <p>Health: {opponentPet.health}</p>
        </div>
      </div>
      
      <div style={styles.logContainer}>
        {battleLog.map((log, index) => <p key={index}>{log}</p>)}
      </div>

      {winner ? (
        <div style={styles.winnerContainer}>
            <p style={styles.winnerText}>{winner} win{winner === 'You' ? '' : 's'}!</p>
            <button style={styles.button} onClick={() => navigate('Home')}>Go Home</button>
        </div>
      ) : (
        <button style={styles.button} onClick={handleAttack} disabled={turn !== 'player'}>
          Attack
        </button>
      )}
    </div>
  );
};

export default BattleScreen;

