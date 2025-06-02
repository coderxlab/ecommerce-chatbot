import API, { setAuthToken } from '../../services/axiosConfig';

describe('axiosConfig', () => {
  it('should create an axios instance with correct base URL', () => {
    expect(API.defaults.baseURL).toBe('http://localhost:5000');
  });

  describe('setAuthToken', () => {
    it('should set Authorization header when token is provided', () => {
      const token = 'test-token';
      setAuthToken(token);
      expect(API.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });

    it('should remove Authorization header when token is null', () => {
      // First set a token
      setAuthToken('test-token');
      // Then remove it
      setAuthToken(null);
      expect(API.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });
});