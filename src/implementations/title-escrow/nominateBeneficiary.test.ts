import { TitleEscrow__factory, TradeTrustToken__factory } from "@govtechsg/token-registry/contracts";
import { Wallet } from "ethers";

import { TitleEscrowNominateBeneficiaryCommand } from "../../commands/title-escrow/title-escrow-command.type";
import { getMockTitleEscrow, getMockTokenRegistry, initMockGetCode, mergeMockSmartContract } from "../testsHelpers";
import { nominateBeneficiary } from "./nominateBeneficiary";

jest.mock("@govtechsg/token-registry/contracts");

const nominateBeneficiaryParams: TitleEscrowNominateBeneficiaryCommand = {
  newBeneficiary: "0x0000000000000000000000000000000000000002",
  tokenId: "0x0000000000000000000000000000000000000000000000000000000000000001",
  tokenRegistry: "0x0000000000000000000000000000000000000001",
  network: "goerli",
  dryRun: false,
};

describe("title-escrow", () => {
  describe("nominate change of owner of transferable record", () => {
    const mockedTradeTrustTokenFactory: jest.Mock<TradeTrustToken__factory> = TradeTrustToken__factory as any;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock static method
    const mockedConnectERC721: jest.Mock = mockedTradeTrustTokenFactory.connect;
    const mockedTokenFactory: jest.Mock<TitleEscrow__factory> = TitleEscrow__factory as any;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock static method
    const mockedConnectTokenFactory: jest.Mock = mockedTokenFactory.connect;
    // const mockedOwnerOf = jest.fn();
    const mockNominateBeneficiary = jest.fn();
    const mockedTitleEscrowAddress = "0x0000000000000000000000000000000000000003";
    const mockedBeneficiary = "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf";
    const mockedHolder = "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf";
    const mockGetBeneficiary = jest.fn();
    const mockGetHolder = jest.fn();
    const mockCallStaticNominateBeneficiary = jest.fn().mockResolvedValue(undefined);
    mockGetBeneficiary.mockResolvedValue(mockedBeneficiary);
    mockGetHolder.mockResolvedValue(mockedHolder);
    const mockBaseTokenRegistry = getMockTokenRegistry({ ownerOfValue: mockedTitleEscrowAddress });
    mockedConnectERC721.mockReturnValue(mockBaseTokenRegistry);
    const mockBaseTitleEscrow = getMockTitleEscrow({ beneficiaryValue: mockedBeneficiary, holderValue: mockedHolder });
    const mockCustomTitleEscrow = {
      nominate: mockNominateBeneficiary,
      // beneficiary: mockGetBeneficiary,
      // holder: mockGetHolder,
      callStatic: {
        nominate: mockCallStaticNominateBeneficiary,
      },
    };
    initMockGetCode();
    const mockTitleEscrow = mergeMockSmartContract({ base: mockBaseTitleEscrow, override: mockCustomTitleEscrow });
    mockedConnectTokenFactory.mockReturnValue(mockTitleEscrow);
    mockNominateBeneficiary.mockReturnValue({
      hash: "hash",
      wait: () => Promise.resolve({ transactionHash: "transactionHash" }),
    });

    beforeEach(() => {
      delete process.env.OA_PRIVATE_KEY;
      mockedTradeTrustTokenFactory.mockClear();
      mockedConnectERC721.mockClear();
      mockedTokenFactory.mockClear();
      mockedConnectTokenFactory.mockClear();
      mockNominateBeneficiary.mockClear();
      mockGetBeneficiary.mockClear();
      mockGetHolder.mockClear();
      mockCallStaticNominateBeneficiary.mockClear();
    });

    it("should pass in the correct params and call the following procedures to invoke an nomination of change of owner of a transferable record", async () => {
      const privateKey = "0000000000000000000000000000000000000000000000000000000000000001";
      await nominateBeneficiary({
        ...nominateBeneficiaryParams,
        key: privateKey,
      });

      const passedSigner: Wallet = mockedConnectERC721.mock.calls[0][1];
      expect(passedSigner.privateKey).toBe(`0x${privateKey}`);
      expect(mockedConnectERC721).toHaveBeenCalledWith(nominateBeneficiaryParams.tokenRegistry, passedSigner);
      expect(mockedConnectTokenFactory).toHaveBeenCalledWith(mockedTitleEscrowAddress, passedSigner);
      expect(mockCallStaticNominateBeneficiary).toHaveBeenCalledTimes(1);
      expect(mockNominateBeneficiary).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if new owner addresses is the same as current owner", async () => {
      const privateKey = "0000000000000000000000000000000000000000000000000000000000000001";
      await expect(
        nominateBeneficiary({
          ...nominateBeneficiaryParams,
          newBeneficiary: mockedBeneficiary,
          key: privateKey,
        })
      ).rejects.toThrow("Destination wallet already has the rights as beneficiary");
    });
  });
});
