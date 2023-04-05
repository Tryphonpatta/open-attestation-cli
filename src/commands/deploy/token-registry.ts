import { Argv } from "yargs";
import { deployTokenRegistry } from "../../implementations/deploy/token-registry";
import { error, info, success } from "signale";
import { getLogger } from "../../logger";
import { withGasPriceOption, withNetworkAndWalletSignerOption } from "../shared";
import { getErrorMessage, getEtherscanAddress } from "../../utils";
import { DeployTokenRegistryCommand } from "./deploy.types";

const { trace } = getLogger("deploy:token-registry");

export const command = "token-registry <registry-name> <registry-symbol> [options]";

export const describe = "Deploys a token registry contract on the blockchain";

// Refer to @govtechsg/token-registry tasks/deploy-token.ts

export const builder = (yargs: Argv): Argv =>
  withGasPriceOption(
    withNetworkAndWalletSignerOption(
      yargs
        .positional("name", {
          description: "Name of the token",
          normalize: true,
        })
        .positional("symbol", {
          description: "Symbol of the token (typically 3 characters)",
          normalize: true,
        })
        .option("factory", {
          description: "Address of Token Registry factory (Optional)",
          type: "string",
        })
        .option("standalone", {
          description: "Use Standalone Deployer (Optional)",
          type: "boolean",
        })
        .option("token", {
          description: "Address of Token Implementation (Optional)",
          type: "string",
        })
        .option("deployer", {
          description: "Address of Deployer (Optional)",
          type: "string",
        })
    )
  );

export const handler = async (args: DeployTokenRegistryCommand): Promise<string | undefined> => {
  trace(`Args: ${JSON.stringify(args, null, 2)}`);
  try {
    info(`Deploying token registry ${args.registryName}`);
    const tokenRegistryAddress = await deployTokenRegistry(args);
    success(`Token registry deployed at ${tokenRegistryAddress}`);
    info(`Find more details at ${getEtherscanAddress({ network: args.network })}/address/${tokenRegistryAddress}`);
    return tokenRegistryAddress;
  } catch (e) {
    error(getErrorMessage(e));
  }
};
