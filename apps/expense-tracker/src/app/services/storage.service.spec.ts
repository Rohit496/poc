import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null for a missing key', () => {
    expect(service.get('nonexistent-key')).toBeNull();
  });

  it('should round-trip a value through JSON serialization', () => {
    const value = [{ id: '1', amount: 10.5 }];
    service.set('test-key', value);
    expect(service.get('test-key')).toEqual(value);
  });

  it('should return null when the stored value is not valid JSON', () => {
    localStorage.setItem('bad-json', 'not{valid json');
    expect(service.get('bad-json')).toBeNull();
  });

  it('should remove a key so subsequent get returns null', () => {
    service.set('removable', 'data');
    service.remove('removable');
    expect(service.get('removable')).toBeNull();
  });

  it('remove should be a no-op for a key that does not exist', () => {
    expect(() => service.remove('nonexistent-key')).not.toThrow();
  });

  it('should overwrite an existing key on set', () => {
    service.set('key', 'first');
    service.set('key', 'second');
    expect(service.get<string>('key')).toBe('second');
  });
});
