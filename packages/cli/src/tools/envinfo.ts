// @ts-ignore
import {EnvironmentInfo} from '@react-native-community/cli-types';

/**
 * Returns information about the running system.
 * If `json === true`, or no options are passed,
 * the return type will be an `EnvironmentInfo`.
 * If set to `false`, it will be a `string`.
 */
async function getEnvironmentInfo(): Promise<EnvironmentInfo>;
async function getEnvironmentInfo(json: true): Promise<EnvironmentInfo>;
async function getEnvironmentInfo(json: false): Promise<string>;
async function getEnvironmentInfo(): Promise<string | EnvironmentInfo> {
  throw new Error('getEnvironmentInfo disabled by Exodus audit team due to security reasons')
}

export default getEnvironmentInfo;
