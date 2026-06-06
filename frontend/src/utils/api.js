const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = {
  setToken(token) {
    localStorage.setItem('filevault_jwt', token);
  },

  getToken() {
    return localStorage.getItem('filevault_jwt');
  },

  removeToken() {
    localStorage.removeItem('filevault_jwt');
  },

  setUser(user) {
    localStorage.setItem('filevault_user', JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem('filevault_user');
    return user ? JSON.parse(user) : null;
  },

  clearUser() {
    localStorage.removeItem('filevault_user');
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    const response = await fetch(url, config);
    
    // For local mock PUT S3 requests, we might call fetch direct to raw url,
    // but this wrapper is for our /api endpoints.
    if (!response.ok) {
      let errorMsg = 'An error occurred';
      try {
        const errJson = await response.json();
        errorMsg = errJson.error || errorMsg;
      } catch (e) {
        errorMsg = response.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    // Handles empty responses
    if (response.status === 204) {
      return null;
    }

    return response.json();
  },

  // Auth Operations
  async register(username, password) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.token) {
      this.setToken(res.token);
      this.setUser(res.user);
    }
    return res;
  },

  async login(username, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.token) {
      this.setToken(res.token);
      this.setUser(res.user);
    }
    return res;
  },

  logout() {
    this.removeToken();
    this.clearUser();
  },

  // File Operations
  async requestUpload(filename, fileSize, mimeType, expiryHours, oneTimeDownload, password) {
    return this.request('/files/upload-request', {
      method: 'POST',
      body: JSON.stringify({ filename, fileSize, mimeType, expiryHours, oneTimeDownload, password })
    });
  },

  async confirmUpload(fileId) {
    return this.request('/files/upload-confirm', {
      method: 'POST',
      body: JSON.stringify({ fileId })
    });
  },

  async getHistory() {
    return this.request('/files/history', {
      method: 'GET'
    });
  },

  async deleteFile(fileId) {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE'
    });
  },

  async getShareInfo(shareToken) {
    return this.request(`/files/download/${shareToken}`, {
      method: 'GET'
    });
  },

  async verifySharePassword(shareToken, password) {
    return this.request(`/files/download/${shareToken}/verify`, {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  },

  async getHealth() {
    const rootUrl = API_BASE.replace('/api', '');
    const res = await fetch(`${rootUrl}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  }
};

export default api;
