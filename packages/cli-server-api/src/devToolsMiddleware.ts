/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import http from 'http';
import {launchDebugger, logger} from '@react-native-community/cli-tools';
import {execFile} from 'child_process';

function launchDefaultDebugger(
  host: string | undefined,
  port: number,
  args = '',
) {
  const hostname = host || 'localhost';
  const debuggerURL = `http://${hostname}:${port}/debugger-ui${args}`;
  logger.info('Launching Dev Tools...');
  launchDebugger(debuggerURL);
}

type LaunchDevToolsOptions = {
  host?: string;
  port: number;
  watchFolders: ReadonlyArray<string>;
};

function launchDevTools(
  {host, port, watchFolders}: LaunchDevToolsOptions,
  isDebuggerConnected: () => boolean,
) {
  // Explicit config always wins
  const customDebugger = process.env.REACT_DEBUGGER;
  if (customDebugger) {
    startCustomDebugger({watchFolders, customDebugger});
  } else if (!isDebuggerConnected()) {
    // Debugger is not yet open; we need to open a session
    launchDefaultDebugger(host, port);
  }
}

function startCustomDebugger({
  watchFolders,
  customDebugger,
}: {
  watchFolders: ReadonlyArray<string>;
  customDebugger: string;
}) {
  logger.info('Starting custom debugger by executing:', customDebugger);
  execFile(customDebugger, watchFolders, function (error) {
    if (error !== null) {
      logger.error('Error while starting custom debugger:', error.stack || '');
    }
  });
}

export default function getDevToolsMiddleware(
  options: LaunchDevToolsOptions,
  isDebuggerConnected: () => boolean,
) {
  return function devToolsMiddleware(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
  ) {
    launchDevTools(options, isDebuggerConnected);
    res.end('OK');
  };
}
