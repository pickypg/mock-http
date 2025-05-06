//
// THIS IS AN EXAMPLE TEST THAT WAS WRITTEN USING KIBANA TEST CODE TO SHOW USING THE CONTAINER
// FOR THIS TO WORK LOCALLY, YOU WOULD NEED TO CREATE A DOCKER IMAGE NAMED "mock-http:{version}"
// WHERE {version} IS THE TESTED VERSION(s).
//

import expect from '@kbn/expect';
import axios, { AxiosResponse } from 'axios';
import { AbstractStartedContainer, GenericContainer, StartedTestContainer } from "testcontainers";

const MOCK_HTTP_PORT = 1234;

export class MockHttpContainer extends GenericContainer {
  constructor(version: string) {
    super(`mock-http:${version}`);

    this.withExposedPorts(MOCK_HTTP_PORT)
      .withStartupTimeout(2_000);
  }

  public override async start(): Promise<StartedMockHttpContainer> {
    return new StartedMockHttpContainer(await super.start());
  }
}

export class StartedMockHttpContainer extends AbstractStartedContainer {
  constructor(override readonly startedTestContainer: StartedTestContainer) {
    super(startedTestContainer);
  }

  public getPort(): number {
    return this.getMappedPort(MOCK_HTTP_PORT);
  }

  public getHttpUrl(): string {
    return `http://${this.getHost()}:${this.getPort()}`;
  }
}

describe('mock-http API', () => {
  let container: StartedMockHttpContainer;

  const validateVersion = async (response: AxiosResponse, version: string, status: number = 200) => {
    expect(response.status).to.be(status);
    expect(response.data).to.have.property('version', version);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let savedAxiosDefaultsAdapter: any;

  beforeEach(() => {
    // needed to prevent the dreaded Error: Cross origin http://localhost forbidden
    // see: https://github.com/axios/axios/issues/1754#issuecomment-572778305
    savedAxiosDefaultsAdapter = axios.defaults.adapter;
    axios.defaults.adapter = 'http';
  });

  afterEach(async () => {
    axios.defaults.adapter = savedAxiosDefaultsAdapter;

    if (container) {
      await container.stop();
    }
  });
  
  it("should work with 1.0.0", async () => {
    container = await new MockHttpContainer("1.0.0").start();

    const response = await axios(`${container.getHttpUrl()}/`, { method: 'POST' });
  
    await validateVersion(response, "1.0.0");
  });
  
  it("should work with 2.0.0", async () => {
    container = await new MockHttpContainer("2.0.0").start();

    const response = await axios(`${container.getHttpUrl()}/`, { method: 'POST' });
  
    await validateVersion(response, "2.0.0");
  });
  
  describe("should work with 3.0.0", () => {
    it('fails with POST', async () => {
      container = await new MockHttpContainer("3.0.0").start();

      const response = await axios(`${container.getHttpUrl()}/`, { method: 'POST', validateStatus: () => true });

      await validateVersion(response, "3.0.0", 404);
    });

    it('succeeds with GET', async () => {
      container = await new MockHttpContainer("3.0.0").start();

      const response = await axios(`${container.getHttpUrl()}/`, { method: 'GET' });

      await validateVersion(response, "3.0.0");
    });
  });
});
