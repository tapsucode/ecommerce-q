
export class BaseHybridService {
  private useBackend: boolean = true;
  private backendUrl: string = 'http://localhost:8080/api';

  constructor() {
    // Check if backend is available
    this.checkBackendHealth();
  }

  private async checkBackendHealth(): Promise<void> {
    try {
      const response = await fetch(`${this.backendUrl}/actuator/health`, {
        method: 'GET',
        timeout: 3000,
      });
      this.useBackend = response.ok;
    } catch (error) {
      console.warn('Backend not available, using mock data');
      this.useBackend = false;
    }
  }

  protected async apiRequest<T>(
    endpoint: string,
    options?: RequestInit,
    mockFallback?: () => Promise<T>
  ): Promise<T> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.backendUrl}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            ...options?.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.warn(`Backend request failed for ${endpoint}, falling back to mock`);
        this.useBackend = false;
        
        if (mockFallback) {
          return await mockFallback();
        }
        throw error;
      }
    } else if (mockFallback) {
      return await mockFallback();
    } else {
      throw new Error('No backend connection and no mock fallback available');
    }
  }

  protected getMockDelay(): number {
    return 300 + Math.random() * 700; // 300-1000ms
  }

  isUsingBackend(): boolean {
    return this.useBackend;
  }

  forceBackendMode(): void {
    this.useBackend = true;
  }

  forceMockMode(): void {
    this.useBackend = false;
  }
}
