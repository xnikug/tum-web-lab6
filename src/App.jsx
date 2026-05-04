import { useReducer, useEffect, useState } from 'react'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { subscriptionReducer, initialState } from './context/SubscriptionReducer'
import { useLocalStorage, useTheme } from './hooks/useLocalStorage'
import { MainLayout } from './components/MainLayout'
import { Dashboard } from './components/Dashboard'
import { SubscriptionModal } from './components/SubscriptionModal'
import { ApiKeysPage } from './pages/ApiKeysPage'
import { RenewalsPage } from './pages/RenewalsPage'
import './App.css'

function AppContent() {
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentHash, setCurrentHash] = useState(window.location.hash)

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAddClick = () => {
    setEditingSubscription(null)
    setShowModal(true)
  }

  const handleEditClick = (subscription) => {
    setEditingSubscription(subscription)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingSubscription(null)
  }

  const renderContent = () => {
    if (currentHash === '#/api-keys') {
      return <ApiKeysPage />;
    }
    if (currentHash === '#/renewals') {
      return <RenewalsPage />;
    }
    return <Dashboard onAddClick={handleAddClick} onEditClick={handleEditClick} />;
  }

  return (
    <MainLayout>
      {renderContent()}
      {showModal && (
        <SubscriptionModal
          subscription={editingSubscription}
          onClose={handleCloseModal}
        />
      )}
    </MainLayout>
  )
}

function App() {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState)
  const saveToStorage = useLocalStorage('subscriptionState', initialState, dispatch)
  const { theme } = useTheme()

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(state)
  }, [state, saveToStorage])

  return (
    <SubscriptionProvider state={state} dispatch={dispatch}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        <AppContent />
      </div>
    </SubscriptionProvider>
  )
}

export default App

