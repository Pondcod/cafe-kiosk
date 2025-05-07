// In your React app, create a file called ConnectionTest.jsx
import { useState, useEffect } from 'react';
function ConnectionTest() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    // Test backend connection
    fetch('http://localhost:8080/api/test')
      .then(response => response.json())
      .then(data => {
        setBackendStatus(data.message || 'Connected!');
        setIsBackendConnected(true);
      })
      .catch(error => {
        setBackendStatus(`Connection failed: ${error.message}`);
        setIsBackendConnected(false);
      });
  }, []);

  return (
    <div className="p-4 border rounded mb-4">
      <h2 className="text-lg font-bold">Backend Connection</h2>
      <p className={`mt-2 ${isBackendConnected ? 'text-green-500' : 'text-red-500'}`}>
        Status: {backendStatus}
      </p>
    </div>
  );
}

export default ConnectionTest;