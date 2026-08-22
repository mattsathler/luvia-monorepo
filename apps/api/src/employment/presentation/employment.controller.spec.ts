import { EmploymentController } from './employment.controller';
import { StartContractUseCase } from '../application/use-cases/start-contract.use-case';
import { GetContractUseCase } from '../application/use-cases/get-contract.use-case';

describe('EmploymentController', () => {
  function buildController() {
    const startContractUseCase = { execute: jest.fn() } as unknown as jest.Mocked<StartContractUseCase>;
    const getContractUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetContractUseCase>;

    const controller = new EmploymentController(startContractUseCase, getContractUseCase);

    return { controller, startContractUseCase, getContractUseCase };
  }

  it('startContract() delegates to StartContractUseCase with characterId, accountId and workplaceId', () => {
    const { controller, startContractUseCase } = buildController();
    startContractUseCase.execute.mockResolvedValue('contract' as never);

    const result = controller.startContract('acc-1', 'char-1', { workplaceId: 'workplace-1' });

    expect(startContractUseCase.execute).toHaveBeenCalledWith({
      characterId: 'char-1',
      accountId: 'acc-1',
      workplaceId: 'workplace-1',
    });
    expect(result).resolves.toBe('contract');
  });

  it('getContract() delegates to GetContractUseCase with the characterId param', () => {
    const { controller, getContractUseCase } = buildController();
    getContractUseCase.execute.mockResolvedValue('contract' as never);

    const result = controller.getContract('char-1');

    expect(getContractUseCase.execute).toHaveBeenCalledWith('char-1');
    expect(result).resolves.toBe('contract');
  });
});
