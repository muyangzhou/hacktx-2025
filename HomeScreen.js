// HomeScreen.js
import React from 'react';
import { usePets } from './App'; // or from a separate PetContext file

export default function HomeScreen({ navigate }) {
  const { 
    pets, 
    selectedPet, 
    selectedPetId, 
    setSelectedPetId, 
    addPet,
  } = usePets();

  // "handleNewDay" logic has been moved to App.js

  const currentIndex = pets.findIndex(p => p.id === selectedPetId);

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + pets.length) % pets.length;
    setSelectedPetId(pets[newIndex].id);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % pets.length;
    setSelectedPetId(pets[newIndex].id);
  };

  const handleAddPet = () => {
    const id = `p${Math.random().toString(36).slice(2, 7)}`;
    addPet({ id, name: 'New Pet', level: 1, hp: 20, maxHp: 20, attack: 5, xp: 0, xpToNextLevel: 100 });
  };


  if (!selectedPet) {
    return (
      <div style={{ padding: 20 }}>
        <p>No pet selected.</p>
        <button onClick={handleAddPet}>Add First Pet</button>
      </div>
    );
  }

  const { name, level, hp, maxHp, attack, xp, xpToNextLevel } = selectedPet;

  return (
    <div style={styles.container}>
      {/* --- Pet Browser and Action Hub --- */}
      <div style={styles.petBrowser}>
        <button onClick={handlePrevious} style={styles.arrowButton}>{'<'}</button>
        
        <div style={styles.petInfo}>
          <h2>{name}</h2>
          <p>Level: {level} ({xp}/{xpToNextLevel} XP)</p>
          <p>HP: {hp}/{maxHp}</p>
          <p>Attack: {attack}</p>
          
          {/* --- Pet-Specific Action Buttons --- */}
          <div style={styles.petActions}>
            <button style={styles.actionButton} onClick={() => navigate('Battle')}>Battle</button>
            <button style={styles.actionButton} onClick={() => navigate('Inventory')}>Inventory</button>
            {/* --- "Item Shop" button removed --- */}
          </div>
        </div>

        <button onClick={handleNext} style={styles.arrowButton}>{'>'}</button>
      </div>

      {/* --- "New Day" / Debug Section Removed --- */}

      {/* --- Global Action Buttons --- */}
      <div style={styles.globalActions}>
        <button style={styles.globalButton} onClick={() => navigate('Bank')}>Bank</button>
        <button style={styles.globalButton} onClick={() => navigate('Shop', { view: 'pets' })}>Buy Pets</button>
      </div>
    </div>
  );
}

// --- Styles for this screen ---
const styles = {
  container: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
  },
  petBrowser: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  arrowButton: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: '10px 15px',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#eee',
    borderRadius: 5,
    alignSelf: 'stretch',
  },
  petInfo: {
    textAlign: 'center',
    flex: 1,
    padding: '0 10px',
  },
  petActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    padding: '8px 12px',
    fontSize: 14,
  },
  // --- debugSection and debugButton styles removed ---
  globalActions: {
    marginTop: 'auto', // Pushes this section to the bottom
    paddingTop: 20,
    display: 'flex',
    gap: 10,
  },
  globalButton: {
    flex: 1, // Make buttons share space
    padding: '12px',
    fontSize: 16,
    fontWeight: 'bold',
  }
};