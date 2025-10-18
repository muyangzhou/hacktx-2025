// App.js
import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import HomeScreen from './HomeScreen';
import BattleScreen from './BattleScreen';
import ShopScreen from './ShopScreen';
import BankScreen from './BankScreen';
import InventoryScreen from './InventoryScreen';
// If using Expo/Native, prefer AsyncStorage; for web-only, localStorage is fine.
// import AsyncStorage from '@react-native-async-storage/async-storage';

export const PetContext = createContext(null);
export const usePets = () => useContext(PetContext);

export default function App() {
  // Global player currency
  const [globalGold, setGlobalGold] = useState(150);
  
  // Simple demo seed (removed 'gold' from pets)
  const [pets, setPets] = useState([
    { id: 'p1', name: 'Aegis', level: 3, hp: 35, maxHp: 35, attack: 7, inventory: [], equipped: {weapon: null, comsetic:null}},
    { id: 'p2', name: 'Nyx',   level: 1, hp: 20, maxHp: 20, attack: 5, inventory: [], equipped: {weapon: null, comsetic:null}},
  ]);
  const [selectedPetId, setSelectedPetId] = useState('p1');

  // --- optional: persist roster & gold ---
  // ... (persistence logic would need to save globalGold too)

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

  // Helper for global currency
  const updateGlobalGold = (updater) => {
    setGlobalGold(updater); // updater can be a value or a function like (prev => prev + 10)
  };

  const value = useMemo(() => ({
    pets,
    selectedPet,
    selectedPetId,
    setSelectedPetId,
    updatePet,   // (id, updaterFn) -> merges updaterFn(p) into pet
    addPet,      // add a new pet
    setPets,     // in case you want full control later
    globalGold,
    updateGlobalGold,
  }), [pets, selectedPet, selectedPetId, globalGold]);

  // ---- your existing mini-router ----
  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState(null);
  const navigate = (nextScreen, nextParams = null) => {
    setScreen(nextScreen);
    setParams(nextParams);
    setMenuOpen(false); // Close menu on navigation
  };

  // --- New Menu State ---
  const [menuOpen, setMenuOpen] = useState(false);

  const renderMenu = () => {
    if (!menuOpen) return null;

    return (
      // Overlay
      <div style={styles.menuOverlay} onClick={() => setMenuOpen(false)}>
        {/* Popup Body */}
        <div style={styles.menuPopup} onClick={(e) => e.stopPropagation()}>
          <button 
            style={styles.menuItem} 
            onClick={() => { alert('Chatbot clicked!'); setMenuOpen(false); }}>
            Chatbot
          </button>
          <button 
            style={styles.menuItem} 
            onClick={() => { alert('Settings clicked!'); setMenuOpen(false); }}>
            Settings
          </button>
        </div>
      </div>
    );
  };

  return (
    <PetContext.Provider value={value}>
      <div style={styles.appContainer}>
        {/* --- New Global Header --- */}
        <div style={styles.headerBar}>
          <button onClick={() => setMenuOpen(true)}>
            ☰ Menu
          </button>
        </div>

        {/* --- Screen Content Area --- */}
        <div style={styles.screenContainer}>
          {screen === 'Home'   && <HomeScreen   navigate={navigate} />}
          {screen === 'Battle' && <BattleScreen navigate={navigate} params={params} />}
          {screen === 'Shop'   && <ShopScreen   navigate={navigate} />}
          {screen === 'Bank'   && <BankScreen   navigate={navigate} />}
          {screen === 'Roster' && <RosterScreen navigate={navigate} />}
          {screen === 'Inventory' && <InventoryScreen navigate = {navigate} />}
        </div>

        {/* --- Render Popup (if open) --- */}
        {renderMenu()}
      </div>
    </PetContext.Provider>
  );
}

// Styles
const styles = {
  appContainer: {
    fontFamily: 'Arial, sans-serif',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  headerBar: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    textAlign: 'right', // Puts menu button on the right
    flexShrink: 0, // Prevents header from shrinking
  },
  screenContainer: {
    flex: 1, // Takes up remaining vertical space
    overflowY: 'auto', // Allows individual screens to scroll
    position: 'relative', // Needed for some layout contexts
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
  }
};


// Inline here for brevity; feel free to split into its own file.
function RosterScreen({ navigate }) {
  const { pets, selectedPetId, setSelectedPetId, addPet } = usePets();

  const handleSelect = (id) => {
    setSelectedPetId(id);
    navigate('Home');
  };

  const handleAdd = () => {
    const id = `p${Math.random().toString(36).slice(2, 7)}`;
    // Note: 'gold' property is removed
    addPet({ id, name: 'New Pet', level: 1, hp: 20, maxHp: 20, attack: 5 });
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2>Pet Roster</h2>
      {pets.map(p => (
        <div key={p.id} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 10
        }}>
          <div>
            <div><strong>{p.name}</strong> {p.id === selectedPetId ? ' (Selected)' : ''}</div>
            {/* Removed Gold display from here */}
            <div>Lvl {p.level} • HP {p.hp}/{p.maxHp} • ATK {p.attack}</div>
          </div>
          <div>
            <button onClick={() => handleSelect(p.id)} style={{ marginRight: 8 }}>
              {p.id === selectedPetId ? 'Use' : 'Select'}
            </button>
          </div>
        </div>
      ))}
      <button onClick={handleAdd} style={{ marginTop: 10 }}>+ Add New Pet</button>
      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate('Home')}>Back</button>
      </div>
    </div>
  );
}