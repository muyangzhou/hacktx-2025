import React, { useState, useRef } from 'react';
import { usePets } from './App';
import { View, Text, TouchableOpacity, Image } from 'react-native';

const NESSIE_ACCOUNT_ID = "68f426849683f20dd519ff49";
const API_URL = 'http://localhost:3001/api/process-receipt';

// Helper function to promisify the FileReader API
const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export default function ReceiptUploadScreen({ navigate }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const { updateGlobalGold } = usePets();
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            setStatusMessage('');
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setStatusMessage('Please select an image first.');
            return;
        }

        setIsLoading(true);
        setStatusMessage('Processing your receipt...');
        
        let response;
        try {
            const fileDataUrl = await readFileAsBase64(selectedFile);
            const base64Image = fileDataUrl.split(',')[1];

            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageData: base64Image,
                    nessieAccountId: NESSIE_ACCOUNT_ID,
                }),
            });

            const result = await response.json();
            console.log("Frontend: Received response from server:", result);

            if (response.ok && result.success) {
                const total = parseFloat(result.geminiData?.amount) || 0;
                
                const goldReward = Math.floor(total) + 5;
                updateGlobalGold(prev => prev + goldReward);
                setStatusMessage(`Success! Receipt for $${total.toFixed(2)} processed. You earned ${goldReward} gold!`);
                setPreview(null);
                setSelectedFile(null);
            } else {
                throw new Error(result.message || 'Failed to process receipt.');
            }

        } catch (error) {
            console.error("Frontend: Error during submission:", error);
            if (response) {
                const errorText = await response.text();
                console.error("Frontend: Raw error response from server:", errorText);
                setStatusMessage(`Server error: ${errorText}`);
            } else {
                setStatusMessage(`Error: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChooseImage = () => {
        fileInputRef.current.click();
    };

    return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Upload Receipt</Text>
        <Text style={styles.paragraph}>Upload a photo of a receipt to earn gold based on the total amount!</Text>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />

        <TouchableOpacity onPress={handleChooseImage} style={styles.uploadButton}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Choose Image</Text>
        </TouchableOpacity>

        {preview && (
          <View style={styles.previewContainer}>
            <Text style={{color: '#FFFFFF', textAlign: 'center'}}>Image Preview:</Text>
            <Image source={{ uri: preview }} style={styles.previewImage} />
          </View>
        )}

        <TouchableOpacity onPress={handleSubmit} disabled={isLoading || !selectedFile} style={{...styles.button, opacity: (isLoading || !selectedFile) ? 0.5 : 1}}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>{isLoading ? 'Processing...' : 'Submit Receipt'}</Text>
        </TouchableOpacity>

        {statusMessage && <Text style={styles.statusText}>{statusMessage}</Text>}

        <TouchableOpacity onPress={() => navigate('Bank')} style={{...styles.button, backgroundColor: '#6c757d'}}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Back to Bank</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
}

const styles = {
    container: {
        padding: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    card: {
        width: '100%',
        maxWidth: 500,
        padding: '25px',
        backgroundColor: 'rgba(40, 40, 40, 0.85)',
        borderRadius: 10,
        border: '1px solid #555',
        alignItems: 'center',
    },
    title: {
        color: '#FFFFFF',
        marginBottom: '15px',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    paragraph: {
        color: '#DDDDDD',
        marginBottom: '25px',
        lineHeight: 22,
        fontSize: '16px',
        textAlign: 'center',
    },
    uploadButton: {
        display: 'inline-flex',
        padding: '12px 25px',
        backgroundColor: '#007bff',
        borderRadius: 5,
        cursor: 'pointer',
        marginBottom: '20px',
        justifyContent: 'center',
    },
    button: {
        padding: '12px 25px',
        fontSize: '16px',
        cursor: 'pointer',
        margin: '10px 0',
        backgroundColor: '#28a745',
        borderRadius: '5px',
        width: '100%',
        alignItems: 'center',
    },
    previewContainer: {
        margin: '20px 0',
        width: '100%',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 5,
        border: '1px solid #555',
        marginTop: '10px',
        resizeMode: 'contain',
    },
    statusText: {
        marginTop: '20px',
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: '16px',
        textAlign: 'center',
    }
};

