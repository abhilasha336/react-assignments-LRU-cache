import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const App = () => {
    const [cache, setCache] = useState({});
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [keyGet, setKeyGet] = useState('');
    const [valueGet, setValueGet] = useState('');
    const [duration, setDuration] = useState(0);
    const [initialized, setInitialized] = useState(false); // State to track cache initialization
    const [fetchedValue, setFetchedValue] = useState('');

    // Connect to the WebSocket server
    const socket = io('http://localhost:8080');

    useEffect(() => {
        // Listen for updates from the server
        socket.on('update', data => {
            setCache(data);
        });

        // Fetch the initial cache state only if not initialized
        if (!initialized) {
            fetchCache();
            setInitialized(true); // Set initialized to true
        }
    }, [initialized]); // Depend on initialized state

    const fetchCache = () => {
        fetch(`http://localhost:8080/cache/${key}`)
            .then(response => response.json())
            .then(data => {
                setCache(data);
            })
            .catch(error => {
                console.error('Error fetching initial cache state:', error);
            });
    };

    const handleSet = () => {
        fetch(`http://localhost:8080/cache/${key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value, duration }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Fetch cache again after successful post
            fetchCache();
        })
        .catch(error => {
            console.error('Error setting cache value:', error);
        });
    };

    const handleFetchKey = () => {
        fetch(`http://localhost:8080/cache/${key}`)
            .then(response => response.json())
            .then(data => {
              setValueGet(data.value);
            })
            .catch(error => {
                console.error('Error fetching value for key:', error);
            });
    };

    return (
        <div>
            <h1>Cache</h1>
            <h2>Set Key/Value</h2>
            <input type="text" value={key} onChange={e => setKey(e.target.value)} placeholder="Key" />
            <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="Value" />
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration" />
            <button onClick={handleSet}>Set</button>
            <ul>
                {Object.entries(cache).map(([key, value]) => (
                    <li key={key}>{key}: {value}</li>
                ))}
            </ul>
            <div>
                <h2>Fetch Value</h2>
                <input type="text" value={keyGet} onChange={e => setKeyGet(e.target.value)} placeholder="Key" />
                <button onClick={handleFetchKey}>Get</button>
                {fetchedValue && <p>Value for key {keyGet}: {valueGet}</p>}
            </div>
        </div>
    );
};

export default App;
