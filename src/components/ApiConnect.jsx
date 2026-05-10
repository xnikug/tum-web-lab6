import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, X, Key, Server } from 'lucide-react';
import { api } from '../services/api';

export function ApiConnect({ onConnect, onDisconnect }) {
  const [open,      setOpen]      = useState(false);
  const [baseUrl,   setBaseUrl]   = useState(api.getBaseUrl());
  const [token,     setToken]     = useState(api.getToken() || '');
  const [status,    setStatus]    = useState('idle'); // idle | loading | ok | error
  const [errorMsg,  setErrorMsg]  = useState('');
  const [role,      setRole]      = useState('ADMIN');

  const connected = api.isConnected() && status === 'ok';

  useEffect(() => {
    if (api.isConnected()) checkConnection();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkConnection() {
    setStatus('loading');
    try {
      await api.health();
      setStatus('ok');
      onConnect?.();
    } catch {
      setStatus('error');
      setErrorMsg('Cannot reach the backend. Is it running?');
    }
  }

  async function handleGetToken() {
    setStatus('loading');
    setErrorMsg('');
    try {
      api.setBaseUrl(baseUrl);
      const res = await api.fetchToken(role);
      api.setToken(res.token);
      setToken(res.token);
      setStatus('ok');
      onConnect?.();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to get token');
    }
  }

  function handleSetToken() {
    if (!token.trim()) return;
    api.setBaseUrl(baseUrl);
    api.setToken(token.trim());
    checkConnection();
  }

  function handleDisconnect() {
    api.clearToken();
    setToken('');
    setStatus('idle');
    setOpen(false);
    onDisconnect?.();
  }

  const dot = connected
    ? 'bg-emerald-500'
    : status === 'loading'
      ? 'bg-yellow-400 animate-pulse'
      : 'bg-gray-400';

  return (
    <>
      {/* Sidebar trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 transition-colors"
      >
        {connected
          ? <Wifi    className="w-4 h-4 mr-3 text-emerald-500" />
          : <WifiOff className="w-4 h-4 mr-3" />}
        <span>Backend API</span>
        <span className={`ml-auto w-2 h-2 rounded-full ${dot}`} />
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">Backend Connection</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Status badge */}
              <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${
                connected
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : status === 'error'
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                {connected ? 'Connected' : status === 'error' ? errorMsg : 'Not connected'}
              </div>

              {/* Backend URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Backend URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:3001"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              {/* Auto-get token */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Get token automatically
                </label>
                <div className="flex gap-2">
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="ADMIN">ADMIN (READ + WRITE + DELETE)</option>
                    <option value="WRITER">WRITER (READ + WRITE)</option>
                    <option value="VISITOR">VISITOR (READ only)</option>
                  </select>
                  <button
                    onClick={handleGetToken}
                    disabled={status === 'loading'}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {status === 'loading'
                      ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      : <Key className="w-3.5 h-3.5" />}
                    Get token
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Token expires in 60 s — click again to refresh.</p>
              </div>

              {/* Manual token */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Or paste an existing token
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="eyJhbGci..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-mono"
                  />
                  <button
                    onClick={handleSetToken}
                    className="px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={checkConnection}
                  disabled={!api.isConnected() || status === 'loading'}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
                  Test connection
                </button>
                {api.isConnected() && (
                  <button
                    onClick={handleDisconnect}
                    className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
