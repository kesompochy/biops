import type Provider from '~/core/entities/Provider';
import type ProviderRepository from '~/core/repositories/ProviderRepository';
import ProviderLogic from '~/logics/ProviderLogic';
import { chmod } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export default class FileSystemProviderRepository implements ProviderRepository {
  private filePath: string;
  private static _defaultFilePath: string;
  static {
    const homeDir = os.homedir();
    FileSystemProviderRepository._defaultFilePath = path.join(homeDir, '.biops', 'providers.json');
  }
  static get DEFAULT_FILE_PATH(): string {
    return FileSystemProviderRepository._defaultFilePath;
  }
  
  constructor(filePath?: string) {
    this.filePath = filePath || FileSystemProviderRepository.DEFAULT_FILE_PATH;
  }
  async getAll(): Promise<Provider[]> {
    try {
      const file = Bun.file(this.filePath);
      const exists = await file.exists();
      if (exists) {
        const data = await file.text();
        return JSON.parse(data) as Provider[];
      }
      return [];
    } catch(e) {
      console.error('Error reading providers file', e);
      return [];
    }
  }
  async save(providers: Provider[]): Promise<void> {
    try {
      await Bun.write(this.filePath, JSON.stringify(providers));
      const dirPath = path.dirname(this.filePath);
      chmod(this.filePath, 0o600);
      chmod(dirPath, 0o700);
    } catch(e) {
      console.error('Error adding provider', e);
    }
  }
}
