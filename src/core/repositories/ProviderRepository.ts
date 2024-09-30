import type Provider from '~/core/entities/Provider';

export default interface ProviderRepository {
  getAll(): Promise<Provider[]>;
  save(providers: Provider[]): Promise<void>;
}
