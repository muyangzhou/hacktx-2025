// App.js
import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import HomeScreen from './HomeScreen';
import BattleScreen from './BattleScreen';
//import ShopScreen from './ShopScreen';
import BankScreen from './BankScreen';
import InventoryScreen from './InventoryScreen';

export const PetContext = createContext(null);
export const usePets = () => useContext(PetContext);

export default function App() {
  // ... (all state and helper functions remain the same) ...
  const [globalGold, setGlobalGold] = useState(150);
  const [pets, setPets] = useState([
    { id: 'p1', name: 'Moon', level: 3, hp: 35, maxHp: 35, attack: 7, xp: 0, xpToNextLevel: 300, inventory: [], equipped: {weapon: null, comsetic:null}},
    { id: 'p2', name: 'Aqua',   level: 1, hp: 20, maxHp: 20, attack: 5, xp: 0, xpToNextLevel: 100, inventory: [], equipped: {weapon: null, comsetic:null}},
  ]);
  const [selectedPetId, setSelectedPetId] = useState('p1');
  const selectedPet = useMemo(() => pets.find(p => p.id === selectedPetId) ?? null, [pets, selectedPetId]);
  const updatePet = (id, updater) => setPets(prev => prev.map(p => (p.id === id ? { ...p, ...updater(p) } : p)));
  const addPet = (pet) => setPets(prev => [...prev, pet]);
  const updateGlobalGold = (updater) => setGlobalGold(updater);
  const addXp = (id, amount) => {
    let petToUpdate = pets.find(p => p.id === id);
    if (!petToUpdate) return;
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
    updatePet(id, (p) => ({ ...p, xp: newXp, level: newLevel, maxHp: newMaxHp, hp: leveledUp ? newMaxHp : p.hp, attack: newAttack, xpToNextLevel: newXpToNextLevel }));
  };
  const handleNewDay = () => {
    if (!selectedPetId) { alert("Please select a pet first."); return; }
    const randomAmount = Math.floor(Math.random() * 201) + 50;
    updateGlobalGold(prev => prev + randomAmount);
    const hpLoss = Math.floor(Math.random() * 5) + 1;
    updatePet(selectedPetId, (p) => ({ hp: Math.max(0, p.hp - hpLoss) }));
    alert(`New Day: Found ${randomAmount} gold and lost ${hpLoss} HP!`);
  };
  const value = useMemo(() => ({
    pets, selectedPet, selectedPetId, setSelectedPetId,
    updatePet, addPet, setPets,
    globalGold, updateGlobalGold, addXp,
  }), [pets, selectedPet, selectedPetId, globalGold]);
  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState(null);
  const navigate = (nextScreen, nextParams = null) => {
    setScreen(nextScreen);
    setParams(nextParams);
    setMenuOpen(false);
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDebugMenuOpen, setDebugMenuOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isBotTyping) return;
    const newUserMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsBotTyping(true);
    setTimeout(() => {
      const botResponse = { role: 'bot', text: "This is a dummy response from the LLM. I'm ready for a real API!" };
      setChatMessages(prev => [...prev, botResponse]);
      setIsBotTyping(false);
    }, 1500);
  };
  const renderMenu = () => {
    if (!menuOpen) return null;
    return (
      <div style={styles.menuOverlay} onClick={() => setMenuOpen(false)}>
        <div style={styles.menuPopup} onClick={(e) => e.stopPropagation()}>
          <button style={styles.menuItem} onClick={() => { setChatOpen(true); setMenuOpen(false); }}>
            Chatbot
          </button>
          <button style={styles.menuItem} onClick={() => { alert('Settings clicked!'); setMenuOpen(false); }}>
            Settings
          </button>
        </div>
      </div>
    );
  };
  const renderDebugMenu = () => {
    if (!isDebugMenuOpen) return null;
    return (
      <div style={styles.debugPanel}>
        <h4 style={styles.debugTitle}>Debug Panel</h4>
        <button style={styles.debugButton} onClick={handleNewDay}>New Day</button>
        <h5 style={styles.debugTitle}>Add Custom Item</h5>
        <input style={styles.debugInput} placeholder="Item Name" />
        <input style={styles.debugInput} placeholder="Price" type="number" />
        <button style={styles.debugButton} onClick={() => alert('Submit clicked (dummy)')}>Submit Item</button>
      </div>
    );
  };
  const renderChatbot = () => {
    if (!isChatOpen) return null;
    return (
      <div style={styles.chatOverlay}>
        <div style={styles.chatPopup}>
          <div style={styles.chatHeader}>
            <h3>Chatbot</h3>
            <button onClick={() => setChatOpen(false)} style={styles.closeButton}>X</button>
          </div>
          <div style={styles.chatMessagesContainer}>
            {chatMessages.map((msg, index) => (
              <div key={index} style={styles.chatMessage(msg.role)}>
                {msg.text}
              </div>
            ))}
            {isBotTyping && <div style={styles.chatMessage('bot')}>...</div>}
          </div>
          <form onSubmit={handleChatSubmit} style={styles.chatInputContainer}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Enter your prompt..."
              style={styles.chatInput}
            />
            <button type="submit" style={styles.chatSendButton} disabled={isBotTyping}>Send</button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <PetContext.Provider value={value}>
      <div style={styles.appContainer}>
        {/* --- Global Header --- */}
        <div style={styles.headerBar}>
          <div style={styles.goldDisplay}>Gold: {globalGold}</div>
          <button onClick={() => setMenuOpen(true)}>☰ Menu</button>
        </div>

        {/* --- Screen Content Area --- */}
        {/* --- overflowY is now set dynamically --- */}
        <div style={{
            ...styles.screenContainer, 
            overflowY: screen === 'Inventory' ? 'hidden' : 'auto' 
          }}>
          {screen === 'Home'   && <HomeScreen   navigate={navigate} />}
          {screen === 'Battle' && <BattleScreen navigate={navigate} params={params} />}
          {/*screen === 'Shop'   && <ShopScreen   navigate={navigate} params={params} />*/}
          {screen === 'Bank'   && <BankScreen   navigate={navigate} />}
          {screen === 'Inventory' && <InventoryScreen navigate = {navigate} />}
        </div>

        {/* --- Render Popups (if open) --- */}
        {renderMenu()}
        {renderDebugMenu()}
        {renderChatbot()}

        {/* --- Debug Toggle Button --- */}
        <button style={styles.debugToggleButton} onClick={() => setDebugMenuOpen(prev => !prev)}>
          Debug ⚙️
        </button>
      </div>
    </PetContext.Provider>
  );
}

// ... (existing styles)
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
    overflowY: 'auto', // <-- Added back
    position: 'relative',
    paddingBottom: 60,
  },
  menuOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  menuPopup: {
    backgroundColor: 'white', padding: '10px', borderRadius: '10px',
    display: 'flex', flexDirection: 'column', width: '250px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  menuItem: {
    padding: '12px 20px', fontSize: '16px', border: 'none',
    backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left',
    borderBottom: '1px solid #eee',
  },
  debugToggleButton: {
    position: 'fixed', bottom: 10, right: 10,
    padding: '10px 15px', backgroundColor: '#f0f0f0',
    border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer',
    fontSize: 14, zIndex: 999, boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  debugPanel: {
    position: 'fixed', bottom: 50, right: 10, width: 200,
    backgroundColor: 'white', border: '1px solid #ccc',
    borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: 10, zIndex: 998, display: 'flex',
    flexDirection: 'column', gap: 8,
  },
  debugTitle: { margin: 0, fontSize: 14, fontWeight: 'bold' },
  debugInput: { padding: '8px 10px', fontSize: 14, border: '1px solid #ccc', borderRadius: 5 },
  debugButton: {
    padding: '10px', fontSize: 14, cursor: 'pointer',
    backgroundColor: '#eee', border: '1px solid #ccc', borderRadius: 5,
  },
  // --- Chatbot Styles ---
  chatOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1001,
  },
  chatPopup: {
    width: '90%', maxWidth: '500px', height: '70%',
    backgroundColor: 'white', borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column',
  },
  chatHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 15px', borderBottom: '1px solid #eee',
  },
  closeButton: {
    border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer',
  },
  chatMessagesContainer: {
    flex: 1,
    padding: '15px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  chatMessage: role => ({
    padding: '10px 15px',
    borderRadius: '15px',
    maxWidth: '80%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    backgroundColor: role === 'user' ? '#007bff' : '#f1f1f1',
    color: role === 'user' ? 'white' : 'black',
  }),
  chatInputContainer: {
    display: 'flex',
    padding: '15px',
    borderTop: '1px solid #eee',
  },
  chatInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginRight: '10px',
  },
  chatSendButton: {
    padding: '10px 15px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};