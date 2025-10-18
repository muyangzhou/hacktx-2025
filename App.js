// App.js
import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import HomeScreen from './HomeScreen';
import BattleScreen from './BattleScreen';
import ShopScreen from './ShopScreen';
import BankScreen from './BankScreen';
import InventoryScreen from './InventoryScreen';
// import RosterScreen from './RosterScreen'; // No longer used

export const PetContext = createContext(null);
export const usePets = () => useContext(PetContext);

export default function App() {
  // Global player currency
  const [globalGold, setGlobalGold] = useState(150);
  
  // Updated pet seed with XP properties
  const [pets, setPets] = useState([
    { id: 'p1', name: 'Aegis', level: 3, hp: 35, maxHp: 35, attack: 7, xp: 0, xpToNextLevel: 300, inventory: [], equipped: {weapon: null, comsetic:null}},
    { id: 'p2', name: 'Nyx',   level: 1, hp: 20, maxHp: 20, attack: 5, xp: 0, xpToNextLevel: 100, inventory: [], equipped: {weapon: null, comsetic:null}},
  ]);
  const [selectedPetId, setSelectedPetId] = useState('p1');

  // ... (persistence logic) ...

  const selectedPet = useMemo(
    () => pets.find(p => p.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  // helpers
  const updatePet = (id, updater) => {
    setPets(prev => prev.map(p => (p.id === id ? { ...p, ...updater(p) } : p)));
  };

  const addPet = (pet) => {
    setPets(prev => [...prev, pet]);
  };

  const updateGlobalGold = (updater) => {
    setGlobalGold(updater);
  };

  // --- New Level-Up and XP Handler ---
  const addXp = (id, amount) => {
    let petToUpdate = pets.find(p => p.id === id);
    if (!petToUpdate) return;
    
    // ... (level up logic remains the same) ...
    let newXp = petToUpdate.xp + amount;
    let newLevel = petToUpdate.level;
    let newMaxHp = petToUpdate.maxHp;
    let newAttack = petToUpdate.attack;
    let newXpToNextLevel = petToUpdate.xpToNextLevel;
    let leveledUp = false;
    if (newXp >= newXpToNextLevel) {
      leveledUp = true;
      newLevel += 1;
      newXp -= newXpToNextLevel;
      newXpToNextLevel = Math.floor(newXpToNextLevel * 1.5);
      newMaxHp = Math.floor(newMaxHp * 1.2);
      newAttack = newAttack + 2;
      const levelUpGold = 50 * newLevel;
      updateGlobalGold(prev => prev + levelUpGold);
      alert(`${petToUpdate.name} grew to Level ${newLevel}!\nMax HP +${newMaxHp - petToUpdate.maxHp}, Attack +2.\nYou found ${levelUpGold} gold!`);
    }
    updatePet(id, (p) => ({
      ...p,
      xp: newXp,
      level: newLevel,
      maxHp: newMaxHp,
      hp: leveledUp ? newMaxHp : p.hp,
      attack: newAttack,
      xpToNextLevel: newXpToNextLevel
    }));
  };

  // --- "New Day" logic ---
  const handleNewDay = () => {
    if (!selectedPetId) {
      alert("Please select a pet first.");
      return;
    }
    const randomAmount = Math.floor(Math.random() * 201) + 50;
    updateGlobalGold(prev => prev + randomAmount);
    const hpLoss = Math.floor(Math.random() * 5) + 1;
    updatePet(selectedPetId, (p) => ({
      hp: Math.max(0, p.hp - hpLoss)
    }));
    alert(`New Day: Found ${randomAmount} gold and lost ${hpLoss} HP!`);
  };


  const value = useMemo(() => ({
    pets,
    selectedPet,
    selectedPetId,
    setSelectedPetId,
    updatePet,
    addPet,
    setPets,
    globalGold,
    updateGlobalGold,
    addXp,
  }), [pets, selectedPet, selectedPetId, globalGold]);

  // ---- router ----
  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState(null);
  const navigate = (nextScreen, nextParams = null) => {
    setScreen(nextScreen);
    setParams(nextParams);
    setMenuOpen(false);
  };

  // --- Menu State ---
  const [menuOpen, setMenuOpen] = useState(false);
  // --- New Debug Menu State ---
  const [isDebugMenuOpen, setDebugMenuOpen] = useState(false);

  const renderMenu = () => {
    // ... (menu render logic remains the same) ...
    if (!menuOpen) return null;
    return (
      <div style={styles.menuOverlay} onClick={() => setMenuOpen(false)}>
        <div style={styles.menuPopup} onClick={(e) => e.stopPropagation()}>
          <button style={styles.menuItem} onClick={() => { alert('Chatbot clicked!'); setMenuOpen(false); }}>
            Chatbot
          </button>
          <button style={styles.menuItem} onClick={() => { alert('Settings clicked!'); setMenuOpen(false); }}>
            Settings
          </button>
        </div>
      </div>
    );
  };

  // --- New Debug Panel Renderer ---
  const renderDebugMenu = () => {
    if (!isDebugMenuOpen) return null;

    return (
      <div style={styles.debugPanel}>
        <h4 style={styles.debugTitle}>Debug Panel</h4>
        <button style={styles.debugButton} onClick={handleNewDay}>
          New Day
        </button>
        
        <h5 style={styles.debugTitle}>Add Custom Item</h5>
        <input
          style={styles.debugInput}
          placeholder="Item Name"
        />
        <input
          style={styles.debugInput}
          placeholder="Price"
          type="number"
        />
        <button 
          style={styles.debugButton} 
          onClick={() => alert('Submit clicked (dummy)')}>
          Submit Item
        </button>
      </div>
    );
  };

  return (
    <PetContext.Provider value={value}>
      <div style={styles.appContainer}>
        {/* --- Global Header --- */}
        <div style={styles.headerBar}>
          <div style={styles.goldDisplay}>
            Gold: {globalGold}
          </div>
          <button onClick={() => setMenuOpen(true)}>
            ☰ Menu
          </button>
        </div>

        {/* --- Screen Content Area --- */}
        <div style={styles.screenContainer}>
          {screen === 'Home'   && <HomeScreen   navigate={navigate} />}
          {screen === 'Battle' && <BattleScreen navigate={navigate} params={params} />}
          {screen === 'Shop'   && <ShopScreen   navigate={navigate} params={params} />}
          {screen === 'Bank'   && <BankScreen   navigate={navigate} />}
          {screen === 'Inventory' && <InventoryScreen navigate = {navigate} />}
        </div>

        {/* --- Render Popups (if open) --- */}
        {renderMenu()}
        {renderDebugMenu()}

        {/* --- Debug Toggle Button --- */}
        <button style={styles.debugToggleButton} onClick={() => setDebugMenuOpen(prev => !prev)}>
          Debug ⚙️
        </button>
      </div>
    </PetContext.Provider>
  );
}

// ... (styles for App layout)
const styles = {
  appContainer: {
    fontFamily: 'Arial, sans-serif',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  headerBar: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    zIndex: 10,
  },
  goldDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    overflowY: 'auto',
    position: 'relative',
    paddingBottom: 60,
  },
  menuOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  menuPopup: {
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    width: '250px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  menuItem: {
    padding: '12px 20px',
    fontSize: '16px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    borderBottom: '1px solid #eee',
  },
  // --- Renamed 'newDayButton' to 'debugToggleButton' ---
  debugToggleButton: {
    position: 'fixed',
    bottom: 10,
    right: 10,
    padding: '10px 15px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    zIndex: 999,
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  // --- New Debug Panel Styles ---
  debugPanel: {
    position: 'fixed',
    bottom: 50, // Position above the toggle button
    right: 10,
    width: 200,
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: 10,
    zIndex: 998,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  debugTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugInput: {
    padding: '8px 10px',
    fontSize: 14,
    border: '1px solid #ccc',
    borderRadius: 5,
  },
  debugButton: {
    padding: '10px',
    fontSize: 14,
    cursor: 'pointer',
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    borderRadius: 5,
  }
};