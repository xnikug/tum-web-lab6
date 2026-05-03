import { useReducer, useEffect } from 'react'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { subscriptionReducer, initialState } from './context/SubscriptionReducer'
import { useLocalStorage, useTheme } from './hooks/useLocalStorage'
import './App.css'

function AppContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text mb-8">
          SaaS Subscription Manager
        </h1>
        <p className="text-gray-600 dark:text-dark-text-secondary">
          Manage and track your software subscriptions efficiently.
        </p>
      </div>
    </div>
  )
}

function App() {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState)
  const saveToStorage = useLocalStorage('subscriptionState', initialState, dispatch)
  const { theme, setTheme } = useTheme()

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

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
