import type Provider from "~/core/entities/Provider";
import type ProviderRepository from "~/core/repositories/ProviderRepository";

export default class ProviderLogic {
  constructor(private repository: ProviderRepository) {}
  getAll(): Promise<Provider[]> {
    return this.repository.getAll();
  }
  async addProvider(provider: Provider): Promise<Provider[]> {
    const providers = await this.getAll();
    if (providers.find((p) => p.name === provider.name)) {
      console.error(`Provider ${provider.name} already exists`);
      return [];
    }
    const processedProviders = providers.map((p) => {
      p.current = false;
      return p;
    });
    processedProviders.push(provider);
    await this.repository.save(processedProviders);
    return processedProviders;
  }
  async useProvider(name: string): Promise<Provider[]> {
    const providers = await this.getAll();
    const processedProviders = providers.map((p) => {
      p.current = p.name === name;
      return p;
    });
    await this.repository.save(processedProviders);
    return processedProviders;
  }
  async deleteProvider(name: string): Promise<Provider[]> {
    const providers = await this.getAll();
    if (!providers.find((p) => p.name === name)) {
      console.error(`Provider ${name} does not exist`);
      return [];
    }
    const processedProviders = providers.filter((p) => p.name !== name);
    await this.repository.save(processedProviders);
    return processedProviders;
  }
  async getCurrentProvider(): Promise<Provider> {
    const providers = await this.getAll();
    const currentProvider = providers.find((p) => p.current);
    return currentProvider as Provider;
  }
}
