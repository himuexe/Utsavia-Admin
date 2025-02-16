import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the state
interface AppState {
  toast: { message: string; type: 'SUCCESS' | 'ERROR' } | undefined;
  isLoading: boolean;
  isLoggedIn: boolean;
}

// Initial state
const initialState: AppState = {
  toast: undefined,
  isLoading: true,
  isLoggedIn: true,
};

// Create the slice
export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ message: string; type: 'SUCCESS' | 'ERROR' }>) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = undefined;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    }
}
});
// Export actions
export const {
  showToast,
  clearToast,
  setLoading,
  setLoggedIn,
} = appSlice.actions;

// Define the root state type
interface RootState {
  app: AppState;
}

// Selectors
export const selectToast = (state: RootState) => state.app.toast;
export const selectIsLoading = (state: RootState) => state.app.isLoading;
export const selectIsLoggedIn = (state: RootState) => state.app.isLoggedIn;

// Export the reducer
export default appSlice.reducer;