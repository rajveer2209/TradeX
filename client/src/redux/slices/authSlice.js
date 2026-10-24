import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const token = localStorage.getItem('token') || null;
let savedUser = null;
try {
  savedUser = JSON.parse(localStorage.getItem('user'));
} catch (e) {
  savedUser = null;
}

const initialState = {
  user: savedUser,
  token: token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getProfile();
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to load user';
      return rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const data = await authService.updateProfile(profileData);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Update failed';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateBalance: (state, action) => {
      if (state.user) {
        state.user.balance = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        const resData = action.payload?.data || action.payload;
        const token = resData?.token || action.payload?.token;
        const user = resData?.user || action.payload?.user || resData;
        state.token = token;
        state.user = user;
        state.isAuthenticated = !!token;
        if (token) {
          localStorage.setItem('token', token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const resData = action.payload?.data || action.payload;
        const token = resData?.token || action.payload?.token;
        const user = resData?.user || action.payload?.user || resData;
        state.token = token;
        state.user = user;
        state.isAuthenticated = !!token;
        if (token) {
          localStorage.setItem('token', token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load User Profile
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        const resData = action.payload?.data || action.payload;
        state.user = resData?.user || resData;
        state.isAuthenticated = true;
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        const resData = action.payload?.data || action.payload;
        state.user = resData?.user || resData;
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      });
  },
});

export const { logout, clearError, updateBalance } = authSlice.actions;
export default authSlice.reducer;
