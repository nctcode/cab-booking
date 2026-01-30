import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAPI from '../services/auth';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when backend ready
      console.log('Update profile data:', profileData);
      return { success: true, data: profileData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    role: (() => {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || payload.userRole || null;
      } catch {
        return null;
      }
    })()
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('remembered_email');
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.role = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.role = action.payload?.role || null;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user || null;
        state.accessToken = action.payload.data?.tokens?.accessToken || null;
        state.refreshToken = action.payload.data?.tokens?.refreshToken || null;
        state.isAuthenticated = true;
        state.role = action.payload.data?.user?.role || null;
        
        if (state.accessToken) {
          localStorage.setItem('access_token', state.accessToken);
          
          // Try to extract role from token if not in response
          if (!state.role) {
            try {
              const payload = JSON.parse(atob(state.accessToken.split('.')[1]));
              state.role = payload.role || payload.userRole || null;
            } catch {
              // Keep the role as is
            }
          }
        }
        if (state.refreshToken) {
          localStorage.setItem('refresh_token', state.refreshToken);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.role = null;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user || null;
        state.accessToken = action.payload.data?.tokens?.accessToken || null;
        state.refreshToken = action.payload.data?.tokens?.refreshToken || null;
        state.isAuthenticated = true;
        state.role = action.payload.data?.user?.role || null;
        
        if (state.accessToken) {
          localStorage.setItem('access_token', state.accessToken);
          
          // Try to extract role from token if not in response
          if (!state.role) {
            try {
              const payload = JSON.parse(atob(state.accessToken.split('.')[1]));
              state.role = payload.role || payload.userRole || null;
            } catch {
              // Keep the role as is
            }
          }
        }
        if (state.refreshToken) {
          localStorage.setItem('refresh_token', state.refreshToken);
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data || state.user;
        state.role = action.payload.data?.role || state.role;
      })
      .addCase(getProfile.rejected, (state) => {
        state.loading = false;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload.data };
        state.role = action.payload.data?.role || state.role;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError, setUser, setRole } = authSlice.actions;
export default authSlice.reducer;