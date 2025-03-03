import { Test, TestingModule } from '@nestjs/testing';
import { HttpRequestHeadersMiddleware } from '../http-request-headers.middleware';
import { HttpConnector } from 'src/shared/connectors';
import { GlobalScheduleProvider } from '../../providers/global-schedule.provider';
import { JwtDecodeOptions, jwtDecode } from 'jwt-decode';

jest.mock('src/shared/connectors/http.connector');
jest.mock('jwt-decode', () => jest.fn());

describe('HttpRequestHeadersMiddleware', () => {
  let middleware: HttpRequestHeadersMiddleware;
  let httpConnector: jest.Mocked<HttpConnector>;
  let globalVariableProvider: jest.Mocked<GlobalScheduleProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpRequestHeadersMiddleware,
        {
          provide: HttpConnector,
          useFactory: () => ({
            call: jest.fn(),
          }),
        },
        {
          provide: GlobalScheduleProvider,
          useFactory: () => ({
            setTenant: jest.fn(),
          }),
        },
      ],
    }).compile();

    middleware = module.get<HttpRequestHeadersMiddleware>(HttpRequestHeadersMiddleware);
    httpConnector = module.get(HttpConnector);
    globalVariableProvider = module.get(GlobalScheduleProvider);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should set headers and baseurl ends with "/timer" and call next', async () => {
    const request: any = {
      headers: {
        'x-tenant-id': 'some-tenant-id',
        'authorization': 'Bearer some-token',
      },
      baseUrl: '/timer',
    };
    const response: any = {};
    const next: jest.Mock = jest.fn();
    await expect(middleware.use(request, response, next))

  });

  it('should set headers and baseurl not ends with "/timer" and call next', async () => {
    const request: any = {
      headers: {
        'x-tenant-id': 'some-tenant-id',
        'authorization': 'Bearer some-token',
      },
      baseUrl: '/some-url',
    };
    const httpResponse: any = {
      data: {
        access_token: 'sdfgh456798iyutrdfghbjyt67ytuhghyte678tytujgh'
      }
    };
    const response: any = {};
    const next: jest.Mock = jest.fn();
    jest.spyOn(httpConnector, 'call').mockResolvedValue([null, httpResponse]);
    const mockedJwtDecode = jest.fn().mockReturnValue({ tenantId: 'your_mocked_tenant_id', userId: 'your_mocked_user_id' }) as (token: string, options?: JwtDecodeOptions) => any;
    (jwtDecode as any) = mockedJwtDecode;
    await expect(middleware.use(request, response, next));
  })

  it('should not set headers and baseurl not ends with "/timer" and call next', async () => {
    const request: any = {
      headers: {},
      baseUrl: '/some-url',
    };
    const httpResponse: any = {
      data: {
        access_token: 'sdfgh456798iyutrdfghbjyt67ytuhghyte678tytujgh'
      }
    };
    const response: any = {};
    const next: jest.Mock = jest.fn();
    jest.spyOn(httpConnector, 'call').mockResolvedValue([null, httpResponse]);
    const mockedJwtDecode = jest.fn().mockReturnValue({ tenantId: 'your_mocked_tenant_id', userId: 'your_mocked_user_id' }) as (token: string, options?: JwtDecodeOptions) => any;
    (jwtDecode as any) = mockedJwtDecode;
    jest.spyOn(globalVariableProvider, 'setTenant')
    await expect(middleware.use(request, response, next));
  })

});
