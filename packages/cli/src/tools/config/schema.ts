/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable prettier/prettier */

const { validateValue } = require("@validatem/core");
const isNonEmptyString = require("@validatem/is-non-empty-string");
const allowExtraProperties = require("@validatem/allow-extra-properties");
const arrayOf = require("@validatem/array-of");
const required = require("@validatem/required");
const isPlainObject = require("@validatem/is-plain-object");
const anyProperty = require("@validatem/any-property");
const isFunction = require("@validatem/is-function");
const isBoolean = require("@validatem/is-boolean");
const isNumber = require("@validatem/is-number");
const isNumeric = require("@validatem/is-numeric");
const isString = require("@validatem/is-string");
const either = require("@validatem/either");
const defaultTo = require("@validatem/default-to");

function validatemToJoiAPI(rules: any) {
  return {
    validate: function (value: any) {
      return { value: validateValue(value, rules) };
    }
  };
}

function joiArrayOf(rules: any) {
  // NOTE: We insert `required` into the rules to match default Joi behaviour
  return arrayOf([ required, rules ]);
}

// This is separate from joiArrayOf because not all of the original array rules specified a default value
function defaultArrayOf(rules: any) {
  return [ defaultTo([]), joiArrayOf(rules) ];
}

function defaultObject(rules: any) {
  return [ defaultTo({}), rules ];
}

/**
 * Schema for CommandT
 */
const isCommand = {
  name: [ required, isNonEmptyString ],
  description: isNonEmptyString,
  usage: isNonEmptyString,
  func: [ required, isFunction ],
  options: joiArrayOf([
    // Alias command -> name
    (object: any) => ({ name: object.command, ... object }),
    {
      name: [ required, isNonEmptyString ],
      description: isNonEmptyString,
      parse: isFunction,
      default: either([
        isBoolean, isNumber, isString, isFunction,
        // NOTE: Needed for compatibility with the original Joi `.number` rule, which allows numeric strings by default
        isNumeric({ allowDecimal: true, allowNegative: true, parse: true })
      ])
    }
  ]),
  examples: joiArrayOf({
    desc: [ required, isNonEmptyString ],
    cmd: [ required, isNonEmptyString ]
  })
};

/**
 * Schema for HealthChecksT
 */
const isHealthCheck = {
  label: [ required, isNonEmptyString ],
  healthchecks: joiArrayOf({
    label: [ required, isNonEmptyString ],
    isRequired: isBoolean,
    description: isNonEmptyString,
    getDiagnostics: isFunction,
    win32AutomaticFix: isFunction,
    darwinAutomaticFix: isFunction,
    linuxAutomaticFix: isFunction,
    runAutomaticFix: [ required, isFunction ],
  })
};

/**
 * Schema for UserDependencyConfigT
 */
export const dependencyConfig = validatemToJoiAPI(
  defaultObject(allowExtraProperties({
    dependency: defaultObject({
      platforms: defaultObject(allowExtraProperties({
        ios: defaultObject({
          project: isNonEmptyString,
          podspecPath: isNonEmptyString,
          sharedLibraries: joiArrayOf(isNonEmptyString),
          libraryFolder: isNonEmptyString,
          scriptPhases: joiArrayOf(isPlainObject),
          configurations: defaultArrayOf(isNonEmptyString)
        }),
        android: defaultObject({
          sourceDir: isNonEmptyString,
          manifestPath: isNonEmptyString,
          packageImportPath: isNonEmptyString,
          packageInstance: isNonEmptyString,
          buildTypes: defaultArrayOf(isNonEmptyString)
        })
      })),
      assets: defaultArrayOf(isNonEmptyString),
      hooks: defaultObject(anyProperty({
        key: isNonEmptyString,
        value: isNonEmptyString
      })),
      params: defaultArrayOf({
        name: isNonEmptyString,
        type: isNonEmptyString,
        message: isNonEmptyString
      }),
    }),
    platforms: defaultObject(anyProperty({
      key: isNonEmptyString,
      value: {
        npmPackageName: isNonEmptyString,
        dependencyConfig: isFunction,
        projectConfig: isFunction,
        linkConfig: isFunction
      }
    })),
    commands: defaultArrayOf(isCommand),
    healthChecks: defaultArrayOf(isHealthCheck)
  }))
);

/**
 * Schema for ProjectConfigT
 */
export const projectConfig = validatemToJoiAPI(
  defaultObject(allowExtraProperties({
    dependencies: defaultObject(anyProperty({
      key: isNonEmptyString,
      value: {
        root: isNonEmptyString,
        platforms: allowExtraProperties({
          ios: {
            sourceDir: isNonEmptyString,
            folder: isNonEmptyString,
            pbxprojPath: isNonEmptyString,
            podfile: isNonEmptyString,
            podspecPath: isNonEmptyString,
            projectPath: isNonEmptyString,
            projectName: isNonEmptyString,
            libraryFolder: isNonEmptyString,
            sharedLibraries: joiArrayOf(isNonEmptyString),
            configurations: defaultArrayOf(isNonEmptyString)
          },
          android: {
            sourceDir: isNonEmptyString,
            folder: isNonEmptyString,
            packageImportPath: isNonEmptyString,
            packageInstance: isNonEmptyString,
            buildTypes: defaultArrayOf(isNonEmptyString),
          }
        }),
        assets: joiArrayOf(isNonEmptyString),
        hooks: anyProperty({ key: isNonEmptyString, value: isNonEmptyString }),
        params: joiArrayOf({
          name: isNonEmptyString,
          type: isNonEmptyString,
          message: isNonEmptyString
        })
      }
    })),
    reactNativePath: isNonEmptyString,
    project: defaultObject(allowExtraProperties({
      ios: defaultObject({
        project: isNonEmptyString,
        sharedLibraries: joiArrayOf(isNonEmptyString),
        libraryFolder: isNonEmptyString
      }),
      android: defaultObject({
        sourceDir: isNonEmptyString,
        manifestPath: isNonEmptyString,
        packageName: isNonEmptyString,
        packageFolder: isNonEmptyString,
        mainFilePath: isNonEmptyString,
        stringsPath: isNonEmptyString,
        settingsGradlePath: isNonEmptyString,
        assetsPath: isNonEmptyString,
        buildGradlePath: isNonEmptyString,
        appName: isNonEmptyString,
      })
    })),
    assets: defaultArrayOf(isNonEmptyString),
    commands: defaultArrayOf(isCommand),
    platforms: defaultObject(anyProperty({
      key: isNonEmptyString,
      value: {
        npmPackageName: isNonEmptyString,
        dependencyConfig: isFunction,
        projectConfig: isFunction,
        linkConfig: isFunction
      }
    }))
  }))
);
