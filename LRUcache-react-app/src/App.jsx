import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const App = () => {
    const [cache, setCache] = useState({});
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [keyGet, setKeyGet] = useState('');
    const [valueGet, setValueGet] = useState('key value not exists');
    const [duration, setDuration] = useState(0);
    const [initialized, setInitialized] = useState(false); // State to track cache initialization
    const [fetchedValue, setFetchedValue] = useState('');
    const [deleteKey, setKeyDelete] = useState('');
    const [deletedKeyValue, setDeletedKeyValue] = useState('');

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
        fetch(`http://localhost:8080/cache/${keyGet}`)
            .then(response => response.json())
            .then(data => {
                console.log('hiiiiiiiiii',data.value)
                if (data.error=="Key not found"){
                    setValueGet("key not exists");
                }else{
                    setValueGet(data.value);

                }
            })
            .catch(error => {
                console.error('Error fetching value for key:', error);
            });
    };

    const handleDeleteKey = () => {
        fetch(`http://localhost:8080/cache/${deleteKey}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                setDeletedKeyValue(`${key}: ${cache[key]}`);
                fetchCache();
            } else {
                console.error('Failed to delete key:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error deleting key:', error);
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
    {Object.entries(cache).map(([cacheKey, cacheValue]) => (
        <li key={cacheKey}>{cacheKey}: {cacheValue}</li>
    ))}
</ul>

<div>
    <h2>Fetch Value</h2>
    <input type="text" value={keyGet} onChange={e => setKeyGet(e.target.value)} placeholder="Key" />
    <button onClick={handleFetchKey}>Get</button>
    {valueGet !== '' ? (
        <p>Value for entered key : {valueGet}</p>
    ) : (
        <p>Key not found</p>
    )}
</div>
<div>
                <h2>Delete Key</h2>
                <input type="text" value={deleteKey} onChange={e => setKeyDelete(e.target.value)} placeholder="Key to delete" />
                <button onClick={handleDeleteKey}>Delete</button>
                {deletedKeyValue && <p>Deleted key: {deleteKey}</p>}
            </div>
        </div>
    );
};

export default App;
