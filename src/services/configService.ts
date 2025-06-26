
interface AppConfig {
  apiBaseUrl: string;
  backendTimeout: number;
  mockDelay: {
    min: number;
    max: number;
  };
  enableMockFallback: boolean;
  forceMode?: 'backend' | 'mock';
}

class ConfigService {
  private config: AppConfig = {
    apiBaseUrl: 'http://localhost:8080/api',
    backendTimeout: 5000,
    mockDelay: {
      min: 300,
      max: 1000,
    },
    enableMockFallback: true,
    forceMode: undefined,
  };

  getConfig(): AppConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  isBackendEnabled(): boolean {
    return this.config.forceMode !== 'mock';
  }

  isMockEnabled(): boolean {
    return this.config.enableMockFallback || this.config.forceMode === 'mock';
  }

  getApiUrl(endpoint: string): string {
    return `${this.config.apiBaseUrl}${endpoint}`;
  }
}

export const configService = new ConfigService();
