export const initialState = {
  subscriptions: [
    {
      id: '1',
      serviceName: 'GitHub Copilot',
      category: 'Productivity',
      cost: 10,
      billingCycle: 'monthly',
      currency: 'USD',
      renewalDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), // 5 days from now
      status: 'active',
    },
    {
      id: '2',
      serviceName: 'Figma',
      category: 'Design',
      cost: 15,
      billingCycle: 'monthly',
      currency: 'USD',
      renewalDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
      status: 'active',
    },
    {
      id: '3',
      serviceName: 'Vercel Pro',
      category: 'Other',
      cost: 200,
      billingCycle: 'yearly',
      currency: 'USD',
      renewalDate: new Date(new Date().setDate(new Date().getDate() + 120)).toISOString(),
      status: 'active',
    }
  ],
  apiKeys: [
    { id: '1', provider: 'OpenAI', name: 'Chat App Backend', key: 'sk-op...1234', projectTag: 'Project A' },
    { id: '2', provider: 'Anthropic', name: 'Summarizer Worker', key: 'sk-ant...abcd', projectTag: 'Project B' },
    { id: '3', provider: 'Google Gemini', name: 'Analytics Agent', key: 'AIza...wxyz', projectTag: 'Internal' }
  ],
  apiUsages: [
    { id: '1', keyId: '1', date: new Date().toISOString(), tokens: 125000, estimatedCost: 2.50 },
    { id: '2', keyId: '2', date: new Date().toISOString(), tokens: 40000, estimatedCost: 1.20 },
    { id: '3', keyId: '1', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), tokens: 300000, estimatedCost: 6.00 },
    { id: '4', keyId: '3', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), tokens: 15000, estimatedCost: 0.15 }
  ],
  currency: 'USD',
  theme: 'light',
  filters: {
    status: 'all',
    category: 'all',
    searchTerm: '',
  },
  budgetThreshold: 500,
};

export const subscriptionReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_SUBSCRIPTION': {
      const newSubscription = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        subscriptions: [...state.subscriptions, newSubscription],
      };
    }

    case 'UPDATE_SUBSCRIPTION': {
      return {
        ...state,
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === action.payload.id ? { ...sub, ...action.payload } : sub
        ),
      };
    }

    case 'DELETE_SUBSCRIPTION': {
      return {
        ...state,
        subscriptions: state.subscriptions.filter((sub) => sub.id !== action.payload),
      };
    }

    case 'TOGGLE_SUBSCRIPTION_STATUS': {
      return {
        ...state,
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === action.payload
            ? { ...sub, status: sub.status === 'active' ? 'paused' : 'active' }
            : sub
        ),
      };
    }

    case 'SET_CURRENCY': {
      return {
        ...state,
        currency: action.payload,
      };
    }

    case 'SET_THEME': {
      return {
        ...state,
        theme: action.payload,
      };
    }

    case 'UPDATE_FILTERS': {
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    }

    case 'SET_BUDGET_THRESHOLD': {
      return {
        ...state,
        budgetThreshold: action.payload,
      };
    }

    case 'ADD_API_KEY': {
      const newKey = { id: Date.now().toString(), ...action.payload };
      return { ...state, apiKeys: [...state.apiKeys, newKey] };
    }

    case 'UPDATE_API_KEY': {
      return {
        ...state,
        apiKeys: state.apiKeys.map(k => k.id === action.payload.id ? { ...k, ...action.payload } : k)
      };
    }

    case 'DELETE_API_KEY': {
      return {
        ...state,
        apiKeys: state.apiKeys.filter(k => k.id !== action.payload),
        apiUsages: state.apiUsages.filter(u => u.keyId !== action.payload)
      };
    }

    case 'ADD_API_USAGE': {
      const newUsage = { id: Date.now().toString(), ...action.payload };
      return { ...state, apiUsages: [...state.apiUsages, newUsage] };
    }

    case 'DELETE_API_USAGE': {
      return { ...state, apiUsages: state.apiUsages.filter(u => u.id !== action.payload) };
    }

    case 'LOAD_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
};
