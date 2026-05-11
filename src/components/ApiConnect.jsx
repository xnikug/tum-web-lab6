import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, X, Key, Server, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useSubscription } from '../hooks/useSubscription';

function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch { return null; }
}

export function ApiConnect() {
  const { apiStatus, onApiConnect, onApiDisconnect } = useSubscription();

  const [open,     setOpen]    = useState(false);
  const [baseUrl,  setBaseUrl] = useState(api.getBaseUrl());
  const [token,    setToken]   = useState(api.getToken() || '');
  const [loading,  setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [role,     setRole]    = useState('ADMIN');
  const [secsLeft, setSecsLeft] = useState(null); // token countdown

  // Sync token input with what's stored (e.g. after auto-clear on expiry)
  useEffect(() => {
    if (apiStatus === 'expired') { setToken(''); setSecsLeft(null); }
  }, [apiStatus]);

  // Countdown timer for token expiry
  useEffect(() => {
    const stored = api.getToken();
    if (!stored) { setSecsLeft(null); return; }
    const expiry = getTokenExpiry(stored);
    if (!expiry) { setSecsLeft(null); return; }

    const tick = () => {
      const remaining = Math.max(0, Math.round((expiry - Date.now()) / 1000));
      setSecsLeft(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [token, apiStatus]);

  const checkConnection = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await api.health();
      onApiConnect?.();
    } catch (err) {
      setErrorMsg(err.status === 401 ? 'Token rejected by server.' : 'Cannot reach backend. Is it running?');
    } finally {
      setLoading(false);
    }
  }, [onApiConnect]);

  async function handleGetToken() {
    setLoading(true);
    setErrorMsg('');
    try {
      api.setBaseUrl(baseUrl);
      const res = await api.fetchToken(role);
      api.setToken(res.token);
      setToken(res.token);
      onApiConnect?.();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reach backend. Check the URL.');
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyToken() {
    if (!token.trim()) return;
    api.setBaseUrl(baseUrl);
    api.setToken(token.trim());
    await checkConnection();
  }

  function handleDisconnect() {
    api.clearToken();
    setToken('');
    setSecsLeft(null);
    setErrorMsg('');
    setOpen(false);
    onApiDisconnect?.();
  }

  // Derive display state
  const isExpired   = apiStatus === 'expired' || secsLeft === 0;
  const isConnected = apiStatus === 'connected' && !isExpired;
  const isError     = apiStatus === 'error' || !!errorMsg;

  const dotClass = isConnected
    ? 'bg-emerald-500'
    : isExpired
      ? 'bg-amber-400 animate-pulse'
      : loading
        ? 'bg-yellow-400 animate-pulse'
        : 'bg-gray-400';

  const statusText = isConnected
    ? secsLeft !== null ? `Connected · ${secsLeft}s` : 'Connected'
    : isExpired
      ? 'Token expired — refresh'
      : errorMsg || (apiStatus === 'error' ? 'Connection error' : 'Not connected');

  const statusClass = isConnected
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
    : isExpired
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
      : isError
        ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400';

  return (
    <>
      {/* Sidebar button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 transition-colors"
      >
        {isConnected
          ? <Wifi className="w-4 h-4 mr-3 text-emerald-500" />
          : isExpired
            ? <AlertTriangle className="w-4 h-4 mr-3 text-amber-400" />
            : <WifiOff className="w-4 h-4 mr-3" />}
        <span>Backend API</span>
        <span className={`ml-auto flex items-center gap-1.5`}>
          {isConnected && secsLeft !== null && (
            <span className={`text-xs font-mono ${secsLeft <= 15 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {secsLeft}s
            </span>
          )}
          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">Backend Connection</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* Status */}
              <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${statusClass}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
                <span>{statusText}</span>
                {isConnected && secsLeft !== null && secsLeft <= 15 && (
                  <span className="ml-auto text-amber-600 dark:text-amber-400 font-semibold">Expiring soon!</span>
                )}
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

              {/* Auto get token */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {isExpired ? 'Token expired — get a new one' : 'Get token automatically'}
                </label>
                <div className="flex gap-2">
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="WRITER">WRITER</option>
                    <option value="VISITOR">VISITOR</option>
                  </select>
                  <button
                    onClick={handleGetToken}
                    disabled={loading}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap
                      ${isExpired
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'}`}
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                    {isExpired ? 'Refresh' : 'Get token'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Tokens expire in 60 s (demo mode).
                </p>
              </div>

              {/* Manual token paste */}
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
                    onClick={handleApplyToken}
                    disabled={!token.trim() || loading}
                    className="px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Bottom actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={checkConnection}
                  disabled={!api.isConnected() || loading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Test &amp; sync
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
