
import { configService } from './configService';
import { authService } from './authService';
import { enhancedOrderService } from './enhancedOrderService';
import { customerService } from './customerService';
import { productService } from './productService';
import { promotionService } from './promotionService';
import { inventoryService } from './inventoryService';
import { dashboardService } from './dashboardService';

class ServiceFactory {
  private services: Map<string, any> = new Map();

  constructor() {
    this.initializeServices();
  }

  private initializeServices(): void {
    this.services.set('auth', authService);
    this.services.set('orders', enhancedOrderService);
    this.services.set('customers', customerService);
    this.services.set('products', productService);
    this.services.set('promotions', promotionService);
    this.services.set('inventory', inventoryService);
    this.services.set('dashboard', dashboardService);
  }

  getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as T;
  }

  getAllServices(): Map<string, any> {
    return new Map(this.services);
  }

  switchToMockMode(): void {
    configService.updateConfig({ forceMode: 'mock' });
    this.services.forEach((service) => {
      if (service.forceMockMode) {
        service.forceMockMode();
      }
    });
  }

  switchToBackendMode(): void {
    configService.updateConfig({ forceMode: 'backend' });
    this.services.forEach((service) => {
      if (service.forceBackendMode) {
        service.forceBackendMode();
      }
    });
  }

  getServiceStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    this.services.forEach((service, name) => {
      if (service.isUsingBackend) {
        status[name] = service.isUsingBackend() ? 'backend' : 'mock';
      } else {
        status[name] = 'unknown';
      }
    });
    return status;
  }
}

export const serviceFactory = new ServiceFactory();
