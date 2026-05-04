import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { formatCurrency, formatDate } from '../utils/subscriptionUtils';
import { Key, Plus, Trash2, Edit2, BarChart2, Activity } from 'lucide-react';

export const ApiKeysPage = () => {
  const { state, dispatch } = useSubscription();
  const { apiKeys, apiUsages, currency } = state;

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);

  const [keyForm, setKeyForm] = useState({ provider: 'OpenAI', name: '', key: '', projectTag: '' });
  const [usageForm, setUsageForm] = useState({ keyId: '', tokens: '', estimatedCost: '', date: new Date().toISOString().split('T')[0] });

  // Dashboard calculations
  const totalSpend = apiUsages?.reduce((acc, curr) => acc + Number(curr.estimatedCost), 0) || 0;
  
  const spendByProvider = apiUsages?.reduce((acc, curr) => {
    const keyDetail = apiKeys.find(k => k.id === curr.keyId);
    if (!keyDetail) return acc;
    acc[keyDetail.provider] = (acc[keyDetail.provider] || 0) + Number(curr.estimatedCost);
    return acc;
  }, {}) || {};

  const handleSaveKey = () => {
    if (editingKey) {
      dispatch({ type: 'UPDATE_API_KEY', payload: { ...keyForm, id: editingKey.id } });
    } else {
      const maskedKey = keyForm.key.length > 8 ? `sk-${keyForm.key.substring(0,3)}...${keyForm.key.slice(-4)}` : 'sk-...masked';
      dispatch({ type: 'ADD_API_KEY', payload: { ...keyForm, key: maskedKey } });
    }
    setShowKeyModal(false);
  };

  const handleDeleteKey = (id) => {
    if (window.confirm("Delete this API key and ALL associated usage logs?")) {
      dispatch({ type: 'DELETE_API_KEY', payload: id });
    }
  };

  const handleSaveUsage = () => {
    dispatch({ 
      type: 'ADD_API_USAGE', 
      payload: { 
        keyId: usageForm.keyId, 
        tokens: Number(usageForm.tokens), 
        estimatedCost: Number(usageForm.estimatedCost),
        date: new Date(usageForm.date).toISOString() 
      } 
    });
    setShowUsageModal(false);
  };

  const deleteUsage = (id) => {
    dispatch({ type: 'DELETE_API_USAGE', payload: id });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">API Key Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track LLM API spend, mask keys securely, and log token usage.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setUsageForm({...usageForm, keyId: apiKeys[0]?.id || ''}); setShowUsageModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
            + Log Usage
          </button>
          <button onClick={() => { setEditingKey(null); setKeyForm({ provider: 'OpenAI', name: '', key: '', projectTag: '' }); setShowKeyModal(true); }} className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
            + Add Key
          </button>
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
           <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2"><BarChart2 className="w-4 h-4"/> Total Spend (All Time)</h3>
           <p className="text-3xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totalSpend, currency)}</p>
        </div>
        
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm col-span-2">
           <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2"><Activity className="w-4 h-4"/> Spend by Provider</h3>
           <div className="flex flex-col gap-3">
             {Object.entries(spendByProvider).length === 0 ? <p className="text-sm text-gray-500">No usage recorded.</p> : 
               Object.entries(spendByProvider).map(([provider, amount]) => {
                 const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
                 return (
                   <div key={provider} className="flex items-center gap-4">
                     <span className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{provider}</span>
                     <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                       <div className="bg-indigo-500 h-2 rounded-full" style={{width: `${pct}%`}}></div>
                     </div>
                     <span className="w-20 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(amount, currency)}</span>
                   </div>
                 )
               })
             }
           </div>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Key className="w-4 h-4" /> Registered Keys</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Provider / Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Key (Masked)</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Project Tag</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
             {!apiKeys || apiKeys.length === 0 ? <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">No keys added yet.</td></tr> : null}
             {apiKeys?.map(k => (
               <tr key={k.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                 <td className="px-6 py-3"><div className="text-sm font-medium text-gray-900 dark:text-white">{k.provider}</div><div className="text-xs text-gray-500">{k.name}</div></td>
                 <td className="px-6 py-3 text-sm text-gray-500 font-mono tracking-tight">{k.key}</td>
                 <td className="px-6 py-3 text-sm"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400">{k.projectTag || 'None'}</span></td>
                 <td className="px-6 py-3 text-sm text-right">
                   <button onClick={() => { setEditingKey(k); setKeyForm(k); setShowKeyModal(true); }} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 className="w-4 h-4 inline"/></button>
                   <button onClick={() => handleDeleteKey(k.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4 inline"/></button>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Usage Logs</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Key Reference</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tokens</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estimated Cost</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
             {!apiUsages || apiUsages.length === 0 ? <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">No usage logged yet.</td></tr> : null}
             {apiUsages?.sort((a,b) => new Date(b.date) - new Date(a.date)).map(u => {
               const keyObj = apiKeys.find(k => k.id === u.keyId);
               return (
                 <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                   <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(u.date)}</td>
                   <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{keyObj?.provider || 'Unknown'} <span className="text-gray-400 font-normal ml-1">({keyObj?.name || 'Deleted Key'})</span></td>
                   <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{u.tokens.toLocaleString()}</td>
                   <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(u.estimatedCost, currency)}</td>
                   <td className="px-6 py-3 text-sm text-right">
                     <button onClick={() => deleteUsage(u.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4 inline"/></button>
                   </td>
                 </tr>
               )
             })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111111] p-6 rounded-xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4">{editingKey ? 'Edit Key Metadata' : 'Add New Key'}</h2>
            <div className="space-y-4">
              <div><label className="text-sm font-medium block mb-1">Provider</label><input className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-700" value={keyForm.provider} onChange={e => setKeyForm({...keyForm, provider: e.target.value})} placeholder="e.g. OpenAI" /></div>
              <div><label className="text-sm font-medium block mb-1">Label / Name</label><input className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-700" value={keyForm.name} onChange={e => setKeyForm({...keyForm, name: e.target.value})} placeholder="e.g. Production Engine" /></div>
              <div><label className="text-sm font-medium block mb-1">API Key</label><input className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-700 font-mono" value={keyForm.key} onChange={e => setKeyForm({...keyForm, key: e.target.value})} placeholder="sk-..." type={editingKey ? 'text' : 'password'} disabled={!!editingKey} />
              {!!editingKey && <p className="text-xs text-gray-500 mt-1">Key token cannot be edited. Delete and recreate if compromised.</p>}</div>
              <div><label className="text-sm font-medium block mb-1">Project Tag</label><input className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-700" value={keyForm.projectTag} onChange={e => setKeyForm({...keyForm, projectTag: e.target.value})} placeholder="e.g. App v2" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowKeyModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Cancel</button>
              <button onClick={handleSaveKey} className="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Log Usage Modal */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111111] p-6 rounded-xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4">Log Manual Usage</h2>
            <div className="space-y-4">
              <div><label className="text-sm font-medium block mb-1">Select API Key Reference</label>
                <select className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-700" value={usageForm.keyId} onChange={e => setUsageForm({...usageForm, keyId: e.target.value})}>
                  {apiKeys?.map(k => <option key={k.id} value={k.id}>{k.provider} - {k.name}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium block mb-1">Date</label><input type="date" className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-700" value={usageForm.date} onChange={e => setUsageForm({...usageForm, date: e.target.value})} /></div>
              <div><label className="text-sm font-medium block mb-1">Tokens / Requests</label><input type="number" className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-700" value={usageForm.tokens} onChange={e => setUsageForm({...usageForm, tokens: e.target.value})} placeholder="e.g. 5000" /></div>
              <div><label className="text-sm font-medium block mb-1">Estimated Cost ({currency})</label><input type="number" step="0.01" className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-700" value={usageForm.estimatedCost} onChange={e => setUsageForm({...usageForm, estimatedCost: e.target.value})} placeholder="1.50" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowUsageModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Cancel</button>
              <button onClick={handleSaveUsage} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium">Log Usage</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
