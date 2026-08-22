import { GetContractUseCase } from './get-contract.use-case';
import { RecomputeContractUseCase } from './recompute-contract.use-case';
import { Contract } from '../../domain/entities/contract.entity';

describe('GetContractUseCase', () => {
  it('delegates to RecomputeContractUseCase', async () => {
    const contract = new Contract({
      id: 'contract-1',
      characterId: 'char-1',
      workplaceId: 'workplace-1',
      buildingTypeId: 'city-hall',
      cargoId: 'intern',
      hourlyWage: 5,
      hoursWorked: 0,
      progressScore: 0,
      lastUpdatedAt: new Date(),
    });
    const recomputeContractUseCase = { execute: jest.fn().mockResolvedValue(contract) } as unknown as jest.Mocked<RecomputeContractUseCase>;

    const useCase = new GetContractUseCase(recomputeContractUseCase);
    const result = await useCase.execute('char-1');

    expect(recomputeContractUseCase.execute).toHaveBeenCalledWith('char-1', expect.any(Date));
    expect(result).toBe(contract);
  });
});
