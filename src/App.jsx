import { useReducer, useEffect, useState, useCallback } from 'react'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { subscriptionReducer, initialState } from './context/SubscriptionReducer'
import { useLocalStorage, useTheme } from './hooks/useLocalStorage'
import { MainLayout } from './components/MainLayout'
import { Dashboard } from './components/Dashboard'
import { SubscriptionModal } from './components/SubscriptionModal'
import { ApiKeysPage } from './pages/ApiKeysPage'
import { RenewalsPage } from './pages/RenewalsPage'
import { api } from './services/api'
import './App.css'

function AppContent() {
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentHash, setCurrentHash] = useState(window.location.hash)

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash)
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleAddClick = () => { setEditingSubscription(null); setShowModal(true) }
  const handleEditClick = (sub) => { setEditingSubscription(sub); setShowModal(true) }
  const handleCloseModal = () => { setShowModal(false); setEditingSubscription(null) }

  const renderContent = () => {
    if (currentHash === '#/api-keys') return <ApiKeysPage />
    if (currentHash === '#/renewals') return <RenewalsPage />
    return <Dashboard onAddClick={handleAddClick} onEditClick={handleEditClick} />
  }

  return (
    <MainLayout>
      {renderContent()}
      {showModal && (
        <SubscriptionModal subscription={editingSubscription} onClose={handleCloseModal} />
      )}
    </MainLayout>
  )
}

function App() {
  const [state, dispatch]  = useReducer(subscriptionReducer, initialState)
  const saveToStorage      = useLocalStorage('subscriptionState', initialState, dispatch)
  const { theme }          = useTheme()
  const [apiReady, setApiReady] = useState(false)

  useEffect(() => { saveToStorage(state) }, [state, saveToStorage])

  // Load initial data from backend when connected
  const loadFromApi = useCallback(async () => {
    if (!api.isConnected()) return
    try {
      const [subs, keys, usage] = await Promise.all([
        api.getSubscriptions({ limit: 100 }),
        api.getApiKeys({ limit: 100 }),
        api.getApiUsage({ limit: 100 }),
      ])
      dispatch({
        type: 'LOAD_STATE',
        payload: {
          subscriptions: subs.data,
          apiKeys:        keys.data,
          apiUsages:      usage.data,
        },
      })
      setApiReady(true)
    } catch (err) {
      console.warn('Backend sync failed:', err.message)
    }
  }, [])

  useEffect(() => { loadFromApi() }, [loadFromApi])

  // Dispatch that mirrors every mutation to the backend
  const apiDispatch = useCallback(async (action) => {
    if (!api.isConnected()) { dispatch(action); return }

    try {
      switch (action.type) {
        case 'ADD_SUBSCRIPTION': {
          const created = await api.createSubscription(action.payload)
          dispatch({ type: 'ADD_SUBSCRIPTION', payload: { ...action.payload, id: created.id, createdAt: created.createdAt } })
          break
        }
        case 'UPDATE_SUBSCRIPTION': {
          await api.updateSubscription(action.payload.id, action.payload)
          dispatch(action)
          break
        }
        case 'DELETE_SUBSCRIPTION': {
          await api.deleteSubscription(action.payload)
          dispatch(action)
          break
        }
        case 'TOGGLE_SUBSCRIPTION_STATUS': {
          await api.toggleSubscription(action.payload)
          dispatch(action)
          break
        }
        case 'ADD_API_KEY': {
          const created = await api.createApiKey(action.payload)
          dispatch({ type: 'ADD_API_KEY', payload: { ...action.payload, id: created.id } })
          break
        }
        case 'UPDATE_API_KEY': {
          await api.updateApiKey(action.payload.id, action.payload)
          dispatch(action)
          break
        }
        case 'DELETE_API_KEY': {
          await api.deleteApiKey(action.payload)
          dispatch(action)
          break
        }
        case 'ADD_API_USAGE': {
          const created = await api.createApiUsage(action.payload)
          dispatch({ type: 'ADD_API_USAGE', payload: { ...action.payload, id: created.id } })
          break
        }
        case 'DELETE_API_USAGE': {
          await api.deleteApiUsage(action.payload)
          dispatch(action)
          break
        }
        default:
          dispatch(action)
      }
    } catch (err) {
      console.error('API mutation failed:', err.message)
      // Fall back to local-only update so the UI never freezes
      dispatch(action)
    }
  }, [])

  return (
    <SubscriptionProvider state={state} dispatch={apiDispatch} onApiConnect={loadFromApi} apiReady={apiReady}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        <AppContent />
      </div>
    </SubscriptionProvider>
  )
}

export default App
