import { Test, TestingModule } from '@nestjs/testing';
import { ExecutorService } from './executor.service';

describe('ExecutorService', () => {
  let service: ExecutorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutorService],
    }).compile();

    service = module.get<ExecutorService>(ExecutorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
