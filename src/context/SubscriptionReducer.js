export const initialState = {
  subscriptions: [],
  currency: 'USD',
  theme: 'light',
  filters: {
    status: 'all',
    category: 'all',
    searchTerm: '',
  },
  budgetThreshold: 5000,
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

    case 'LOAD_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
};
