const API_URL = 'http://localhost:3001/api/ai';
// App.js
import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import HomeScreen from './HomeScreen';
import BattleScreen from './BattleScreen';
import ShopScreen from './ShopScreen';
import BankScreen from './BankScreen';
import InventoryScreen from './InventoryScreen';
import LessonsScreen from './LessonsScreen'; // Import the new screen
import lessonsData from './lessons.json'; // Import lesson data
import ReceiptUploadScreen from './ReceiptUploadScreen'; // Import the new receipt upload screen

export const PetContext = createContext(null);
export const usePets = () => useContext(PetContext);

export default function App() {
  const [globalGold, setGlobalGold] = useState(150);
  const [userAge, setUserAge] = useState(10); // Default age for kids series
  const [pets, setPets] = useState([
    // Add lesson progress tracking to each pet's state
    { id: 'p1', name: 'Moon', level: 3, hp: 35, maxHp: 35, attack: 7, xp: 0, xpToNextLevel: 300, inventory: [], equipped: {weapon: null, comsetic:null}, lessonProgress: 0, lessonsCompleted: false },
    { id: 'p2', name: 'Aqua',   level: 1, hp: 20, maxHp: 20, attack: 5, xp: 0, xpToNextLevel: 100, inventory: [], equipped: {weapon: null, comsetic:null}, lessonProgress: 0, lessonsCompleted: false },
  ]);
  const [selectedPetId, setSelectedPetId] = useState('p1');
  const selectedPet = useMemo(() => pets.find(p => p.id === selectedPetId) ?? null, [pets, selectedPetId]);

  
  const updatePet = (id, updater) =>
    setPets(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...(typeof updater === 'function' ? updater(p) : updater) }
          : p
      )
    );
  const addPet = (pet) => {
    // New pets also get lesson tracking state
    const newPet = { ...pet, lessonProgress: 0, lessonsCompleted: false };
    setPets(prev => [...prev, newPet]);

  };
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
  
  // --- New Lesson Functions ---
  const advanceLesson = (id) => {
    updatePet(id, p => ({ lessonProgress: p.lessonProgress + 1 }));
  };
  
  const markLessonsCompleted = (id) => {
      const pet = pets.find(p => p.id === id);
      if (pet && !pet.lessonsCompleted) {
          updatePet(id, () => ({ lessonsCompleted: true }));
          updateGlobalGold(prev => prev + 250); // Big reward for finishing the series!
          alert("Congratulations! You've completed all lessons and earned 250 gold!");
      }
  };

  const value = useMemo(() => ({
    pets, selectedPet, selectedPetId, setSelectedPetId,
    updatePet, addPet, setPets,
    globalGold, updateGlobalGold, addXp,
    userAge, lessonsData, advanceLesson, markLessonsCompleted, // Expose lesson data and functions
  }), [pets, selectedPet, selectedPetId, globalGold, userAge]);

  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState(null);
  const navigate = (nextScreen, nextParams = null) => {
    setScreen(nextScreen);
    setParams(nextParams);
    setMenuOpen(false);
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDebugMenuOpen, setDebugMenuOpen] = useState(false);
  const [debugAgeInput, setDebugAgeInput] = useState(userAge.toString());
  const [isChatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  useEffect(() => {
    setDebugAgeInput(userAge.toString());
  }, [userAge]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isBotTyping) return;
    const newUserMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newUserMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsBotTyping(true);
    try {
      // --- This is where you call your server ---
      // (You will need to create this server and deploy it)
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      // alert("data: " + data.text);
      const botResponse = { role: 'bot', text: data.text }; // Assuming your server returns { text: "..." }
      setChatMessages(prev => [...prev, botResponse]);
      // --- End API Call ---
      // console.log(await promptAI("<prompt>"));

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorResponse = { role: 'bot', text: "Sorry, I'm having trouble connecting right now." };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsBotTyping(false);
    }
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

  // --- Updated Debug Menu ---
  const renderDebugMenu = () => {
    if (!isDebugMenuOpen) return null;

    const handleSetAge = () => {
        const ageNum = parseInt(debugAgeInput, 10);
        if (!isNaN(ageNum) && ageNum > 0) {
            setUserAge(ageNum);
            // Reset pet progress when changing age categories to avoid index issues
            pets.forEach(p => updatePet(p.id, () => ({lessonProgress: 0, lessonsCompleted: false})));
            alert(`User age set to ${ageNum}. Lesson series updated and progress reset.`);
        } else {
            alert("Please enter a valid age.");
        }
    };

    return (
      <div style={styles.debugPanel}>
        <h4 style={styles.debugTitle}>Debug Panel</h4>
        <button style={styles.debugButton} onClick={handleNewDay}>New Day</button>
        
        <h5 style={styles.debugTitle}>Set User Age</h5>
        <input
            style={styles.debugInput}
            placeholder="User Age"
            type="number"
            value={debugAgeInput}
            onChange={(e) => setDebugAgeInput(e.target.value)}
        />
        <button style={styles.debugButton} onClick={handleSetAge}>Set Age</button>

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
        <div style={styles.headerBar}>
          <div style={styles.goldDisplay}>Gold: {globalGold}</div>
          <button onClick={() => setMenuOpen(true)}>☰ Menu</button>
        </div>
        <div style={styles.screenContainer}>
          {screen === 'Home'   && <HomeScreen   navigate={navigate} />}
          {screen === 'Battle' && <BattleScreen navigate={navigate} params={params} />}
          {screen === 'Shop'   && <ShopScreen   navigate={navigate} params={params} />}
          {screen === 'Bank'   && <BankScreen   navigate={navigate} />}
          {screen === 'Inventory' && <InventoryScreen navigate = {navigate} />}
          {screen === 'Lessons' && <LessonsScreen navigate = {navigate} />}
          {screen === 'ReceiptUpload' && <ReceiptUploadScreen navigate={navigate} />} 
        </div>
        {renderMenu()}
        {renderDebugMenu()}
        {renderChatbot()}
        <button style={styles.debugToggleButton} onClick={() => setDebugMenuOpen(prev => !prev)}>
          Debug ⚙️
        </button>
      </div>
    </PetContext.Provider>
  );
}

const styles = {
  appContainer: {
    fontFamily: 'Arial, sans-serif',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#121212',
    backgroundImage: 'url(https://cdn.mos.cms.futurecdn.net/BfemybeKVXCf9pgX9WCxsc-1200-80.jpg)',
    backgroundSize: 'cover',
    backgroundRepeat: 'repeat',
    backgroundAttachment: 'fixed',
  },
  headerBar: {
    padding: '10px 20px',
    backgroundColor: '#dcdcdc',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    zIndex: 10,
    position: 'sticky',   // stays at top on scroll
    top: 0,
    width: '100%',        // span full app width
    boxSizing: 'border-box'
  },
  goldDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    display: 'flex',
    overflowY: 'auto',
    position: 'relative',
    paddingBottom: 60,
    paddingTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
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
  debugTitle: { margin: '8px 0 0 0', fontSize: 14, fontWeight: 'bold' },
  debugInput: { padding: '8px 10px', fontSize: 14, border: '1px solid #ccc', borderRadius: 5 },
  debugButton: {
    padding: '10px', fontSize: 14, cursor: 'pointer',
    backgroundColor: '#eee', border: '1px solid #ccc', borderRadius: 5,
  },
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

