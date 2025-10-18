import React, { useState, useEffect } from 'react';

const HomeScreen = ({ navigate }) => {
  const [pet, setPet] = useState({
    name: 'Finny',
    level: 1,
    experience: 0,
    health: 100,
    currency: 0,
    cosmetic: 'default',
    weapon: 'none'
  });

  // Fetch pet data from a backend/storage in a real app
  useEffect(() => {
    // Mock API call
    const fetchPetData = async () => {
      // In a real app, you would fetch this from a server
      // For now, we'll use the initial state.
    };
    fetchPetData();
  }, []);

  const handleBattle = () => {
    // Example friend ID
    navigate('Battle', { friendId: 'friend123' });
  };
  
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#fff',
      fontFamily: 'Arial, sans-serif',
      height: '100vh',
      boxSizing: 'border-box'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    petImage: {
      width: '150px',
      height: '150px',
      borderRadius: '75px',
      marginBottom: '20px',
      border: '2px solid #ddd'
    },
    petStats: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    statText: {
        margin: '5px 0'
    },
    buttonContainer: {
      marginTop: '30px',
      width: '80%',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    button: {
        padding: '10px 15px',
        fontSize: '16px',
        cursor: 'pointer',
        borderRadius: '5px',
        border: '1px solid #ccc',
        backgroundColor: '#f0f0f0'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{pet.name}</h2>
      <img
        src={`https://placehold.co/150x150/EFEFEF/333?text=${pet.cosmetic}`}
        style={styles.petImage}
        alt={`${pet.name} the pet`}
      />
      <div style={styles.petStats}>
          <p style={styles.statText}>Level: {pet.level}</p>
          <p style={styles.statText}>Experience: {pet.experience}/100</p>
          <p style={styles.statText}>Health: {pet.health}%</p>
          <p style={styles.statText}>In-Game Currency: ${pet.currency}</p>
          <p style={styles.statText}>Weapon: {pet.weapon}</p>
      </div>

      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={handleBattle}>Battle a Friend</button>
        <button style={styles.button} onClick={() => navigate('Shop')}>Visit Shop</button>
        <button style={styles.button} onClick={() => navigate('Bank')}>Link Bank Account</button>
      </div>
    </div>
  );
};

export default HomeScreen;

