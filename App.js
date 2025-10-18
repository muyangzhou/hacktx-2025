import React, { useState, useEffect } from 'react';

// --- Helper Functions for Styles ---
// Since this is not React Native, we'll use CSS-in-JS.
// We'll define styles as simple objects.

const combineStyles = (...styleObjects) => {
  return Object.assign({}, ...styleObjects);
};


// --- Home Screen Component ---
const HomeScreen = ({ navigate }) => {
  const [pet, setPet] = useState({
    name: 'Finny',
    level: 1,
    experience: 0,
    health: 100,
    currency: 200,
    cosmetic: 'default',
    weapon: 'none'
  });

  // In a real app, you'd fetch this from storage
  useEffect(() => {
    // Mock data fetching
  }, []);

  const handleBattle = () => {
    // Example friend ID
    navigate('Battle', { friendId: 'friend123' });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{pet.name}</h2>
      <img
        src={`https://placehold.co/150x150/EFEFEF/333?text=${pet.cosmetic}`}
        style={styles.petImage}
        alt="Your Pet"
      />
      <p>Level: {pet.level}</p>
      <p>Experience: {pet.experience}/100</p>
      <p>Health: {pet.health}%</p>
      <p>In-Game Currency: ${pet.currency}</p>
      <p>Weapon: {pet.weapon}</p>

      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={handleBattle}>Battle a Friend</button>
        <button style={styles.button} onClick={() => navigate('Shop')}>Visit Shop</button>
        <button style={styles.button} onClick={() => navigate('Bank')}>Link Bank Account</button>
      </div>
    </div>
  );
};

// --- Battle Screen Component ---
const BattleScreen = ({ navigate, params }) => {
  // Default to empty object if params is undefined
  const { friendId } = params || {};

  const [playerPet, setPlayerPet] = useState({ health: 100, power: 10, weapon: 'Basic Sword' });
  const [opponentPet, setOpponentPet] = useState({ name: 'Opponent', health: 100, power: 8 });
  const [turn, setTurn] = useState('player');
  const [winner, setWinner] = useState < string | null > (null);

  useEffect(() => {
    console.log(`Fetching data for opponent: ${friendId}`);
  }, [friendId]);

  const handleAttack = () => {
    if (turn === 'player' && !winner) {
      const damage = playerPet.power + (playerPet.weapon !== 'none' ? 5 : 0);
      const newOpponentHealth = Math.max(0, opponentPet.health - damage);
      setOpponentPet({ ...opponentPet, health: newOpponentHealth });
      if (newOpponentHealth === 0) {
        setWinner('Player');
        alert('You Win! You defeated your opponent.');
      } else {
        setTurn('opponent');
      }
    }
  };

  useEffect(() => {
    if (turn === 'opponent' && !winner) {
      const damage = opponentPet.power;
      const newPlayerHealth = Math.max(0, playerPet.health - damage);

      const timeoutId = setTimeout(() => {
        setPlayerPet({ ...playerPet, health: newPlayerHealth });
        if (newPlayerHealth === 0) {
          setWinner('Opponent');
          alert('You Lose! Your opponent defeated you.');
        } else {
          setTurn('player');
        }
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [turn, winner, playerPet, opponentPet]);

  return (
    <div style={battleStyles.container}>
      <h2 style={styles.title}>Battle!</h2>
      <div style={battleStyles.petContainer}>
        <p style={battleStyles.petName}>Your Pet</p>
        <p>Health: {playerPet.health}</p>
        <p>Weapon: {playerPet.weapon}</p>
      </div>
      <div style={battleStyles.petContainer}>
        <p style={battleStyles.petName}>{opponentPet.name}</p>
        <p>Health: {opponentPet.health}</p>
      </div>
      {winner ? (
        <p style={battleStyles.winnerText}>{winner} wins!</p>
      ) : (
        <button style={styles.button} onClick={handleAttack} disabled={turn !== 'player'}>Attack</button>
      )}
      <button style={styles.button} onClick={() => navigate('Home')}>Go Home</button>
    </div>
  );
};


// --- Shop Screen Component ---
const ShopScreen = ({ navigate }) => {
  const cosmetics = [
    { id: '1', name: 'Cool Hat', price: 50, type: 'cosmetic' },
    { id: '2', name: 'Sunglasses', price: 30, type: 'cosmetic' },
  ];
  const weapons = [
    { id: '3', name: 'Power Sword', price: 100, type: 'weapon' },
    { id: '4', name: 'Mega Shield', price: 80, type: 'power-up' },
  ];
  const [currency, setCurrency] = useState(200);

  const handlePurchase = (item) => {
    if (currency >= item.price) {
      setCurrency(currency - item.price);
      alert(`Purchase Successful! You bought ${item.name}.`);
    } else {
      alert(`Not enough currency! You need ${item.price - currency} more to buy ${item.name}.`);
    }
  };

  const renderItem = (item) => (
    <div style={shopStyles.item} key={item.id}>
      <p>{item.name}</p>
      <p>Price: ${item.price}</p>
      <button style={styles.button} onClick={() => handlePurchase(item)}>Buy</button>
    </div>
  );

  return (
    <div style={shopStyles.container}>
      <h2 style={shopStyles.currency}>Your Currency: ${currency}</h2>
      <h3 style={shopStyles.sectionTitle}>Cosmetics</h3>
      <div>
        {cosmetics.map(item => renderItem(item))}
      </div>
      <h3 style={shopStyles.sectionTitle}>Weapons & Power-ups</h3>
      <div>
        {weapons.map(item => renderItem(item))}
      </div>
      <button style={styles.button} onClick={() => navigate('Home')}>Back to Home</button>
    </div>
  );
};

// --- Bank Screen Component ---
const BankScreen = ({ navigate }) => {
  const [accountLinked, setAccountLinked] = useState(false);
  const [savings, setSavings] = useState('');
  const [currency, setCurrency] = useState(0);

  const handleLinkAccount = () => {
    alert('Success! Bank Account Linked!');
    setAccountLinked(true);
  };

  const handleAddSavings = () => {
    const savedAmount = parseFloat(savings);
    if (!isNaN(savedAmount) && savedAmount > 0) {
      const newCurrency = Math.floor(savedAmount / 10);
      setCurrency(currency + newCurrency);
      alert(`Savings Added! You earned ${newCurrency} in-game currency!`);
      setSavings('');
    } else {
      alert('Invalid Amount. Please enter a valid number.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={bankStyles.title}>Bank Connection</h2>
      {!accountLinked ? (
        <button style={styles.button} onClick={handleLinkAccount}>Link Your Bank Account</button>
      ) : (
        <div style={bankStyles.form}>
          <p style={bankStyles.linkedText}>Account Linked!</p>
          <p>Total In-Game Currency Earned: ${currency}</p>
          <input
            style={bankStyles.input}
            placeholder="Enter amount you saved"
            type="number"
            value={savings}
            onChange={(e) => setSavings(e.target.value)}
          />
          <button style={styles.button} onClick={handleAddSavings}>Add Savings & Get Reward</button>
        </div>
      )}
      <button style={styles.button} onClick={() => navigate('Home')}>Back to Home</button>
    </div>
  );
};


// --- Main App Component ---
const App = () => {
  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState({});

  const navigate = (newScreen, newParams = {}) => {
    setScreen(newScreen);
    setParams(newParams);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'Home':
        return <HomeScreen navigate={navigate} />;
      case 'Battle':
        return <BattleScreen navigate={navigate} params={params} />;
      case 'Shop':
        return <ShopScreen navigate={navigate} />;
      case 'Bank':
        return <BankScreen navigate={navigate} />;
      default:
        return <HomeScreen navigate={navigate} />;
    }
  };

  return <div style={{height: '100vh'}}>{renderScreen()}</div>;
};

// --- Stylesheets (as JS Objects) ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    height: '100%',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    border: '2px solid #ddd'
  },
  buttonContainer: {
    marginTop: 30,
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  button: {
    padding: '10px 15px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '5px'
  }
};

const battleStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
    height: '100%',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif'
  },
  petContainer: {
    textAlign: 'center',
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 10,
    width: '80%',
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  winnerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'green',
  }
};

const shopStyles = {
  container: {
    padding: 20,
    fontFamily: 'Arial, sans-serif'
  },
  currency: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottom: '1px solid #eee',
  },
};

const bankStyles = {
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  linkedText: {
    fontSize: 18,
    color: 'green',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 5,
    width: '80%',
    padding: '0 10px',
    marginTop: 20,
    boxSizing: 'border-box'
  }
};

export default App;

