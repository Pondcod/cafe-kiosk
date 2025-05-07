// In your React app, create SupabaseConnectionTest.jsx
import { useState, useEffect } from 'react';

function SupabaseConnectionTest() {
  const [supabaseStatus, setSupabaseStatus] = useState('Checking...');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    // Test Supabase connection through the backend
    fetch('http://localhost:8080/api/supabase-test')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSupabaseStatus(data.message);
          setIsSupabaseConnected(true);
        } else {
          throw new Error(data.message);
        }
      })
      .catch(error => {
        setSupabaseStatus(`Connection failed: ${error.message}`);
        setIsSupabaseConnected(false);
      });
  }, []);

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold">Supabase Connection</h2>
      <p className={`mt-2 ${isSupabaseConnected ? 'text-green-500' : 'text-red-500'}`}>
        Status: {supabaseStatus}
      </p>
    </div>
  );
}

export default SupabaseConnectionTest;