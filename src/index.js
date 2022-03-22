const path = require("path");
const fse = require("fs-extra");
// const process = require("process");
// const SevenZ = require('7zip-min');
const { unzipFile, downloadFromRemote, checkBinaries } = require("./utils");
const CONSTANTS = require("./constants");

// exit(0)
/**
 * @typedef {object} STATUS_CODE
 * @property {number} SUCCESS - Successfully Built the App.
 * @property {number} FILE_NOT_FOUND - If File Not Found.
 * @property {number} ARCHIVING_ERR - If There was an error when archiving the app.
 * @property {number} DIR_NOT_EMPTY - If A Directory isn't Empty.
 */

/**
 * @typedef {object} STATUS
 * @property {STATUS_CODE} code - Status Code
 * @property {string} text - Text Describing The Status
 */

/**
 * @type {STATUS_CODE}
 */
const STATUS_CODE = {
	SUCCESS: 0,
	FILE_NOT_FOUND: 1,
	ARCHIVING_ERR: 2,
	DIR_NOT_EMPTY: 3
}

/**
 * @typedef {object} Package
 * @property {string} name - Name Of The App.
 * @property {string} description - Description Of The App.
 * @property {string} developer - Name Of The Developer/Team Developing The Program.
 * @property {string} icon - Path To Application Icon File.
 * @property {string} license - Path To Your Application License.
 * @property {string} neuConfig - Path To The `neutralino.config.json`.
 * @property {string} dist - Path To Folder To Put The Built App.
 */

/**
 * @typedef {object} Misc
 * @property {boolean} minifyConfig - Should The Neutralino Config File Be Minfied.
 */

/**
 * @typedef {object} Platform
 * @property {object} windows - Windows.
 * @property {boolean} windows.x86_64 - 64 Bit Architecture.
 * @property {boolean} windows.i386 - 32 Bit Architecture.
 *
 * @property {boolean} macos - MacOS.
 *
 * @property {object} linux - Linux.
 * @property {boolean} linux.x86_64 - 64 Bit Architecture.
 * @property {boolean} linux.i386 - 32 Bit Architecture.
 * @property {boolean} linux.armhf - ARM 32 Bit Architecture.
 * @property {boolean} linux.arm64 - ARM 64 Bit Architecture.
 */

/**
 * @typedef {object} Formats
 * @property {boolean} zip - Package into `.zip`.
 * @property {boolean} tar - Package into `.tar`.
 * @property {boolean} sevenZ - Package into `.7z`.
 */

/**
 * @typedef {object} PackagerOptions
 * @property {Package} package - Information Related To Project Itself.
 * @property {Misc} misc - Other Optional Configuration Related To Bundling.
 * @property {Platform} platform - Platform To Build App For.
 * @property {Formats} formats - Formats To Package The App Into.
 */

/**
 * Helper Function To Download All The Binaries And Extract Them.
 * @param {string} binDirectory Directory Which Has And Will Contain The Binaries.
 * @param {string} version Version To Fetch.
 * @returns {Promise<Array|string>} Array Containing Executable Files Or String Containing Errors.
 */
function downloadAllBinaries(binDirectory, version) {
	return new Promise(async (resolve, reject) => {
		try {
			fse.rmdirSync(binDirectory);
			fse.ensureDirSync(binDirectory);

			const offBinMirror = CONSTANTS.downloadMirrors.binary.official.replace(/{version}/g, version);
			const unOffBinMirror = CONSTANTS.downloadMirrors.binary.unoffical.replace(/{version}/g, version);

			const zipFilePath1 = await downloadFromRemote(offBinMirror, binDirectory);
			const extractedFiles1 = await unzipFile(zipFilePath1, binDirectory);

			const zipFilePath2 = await downloadFromRemote(unOffBinMirror, binDirectory);
			const extractedFiles2 = await unzipFile(zipFilePath2, binDirectory);

			resolve([...extractedFiles1, ...extractedFiles2]);
		} catch (err) {
			reject(err)
		}
	})
}

/**
 * Bundle Neutralino Application To Binaries.
 * @param {PackagerOptions} options Neu Packager Options
 * @returns {Promise<STATUS>} - Object Containg Status.
 */
module.exports = (options) => {
	return new Promise(async (resolve, reject) => {
		const binDirectory = options.package.neuConfig;
		const binaryCheckStatus = checkBinaries(options.platform, binDirectory);
		if (binaryCheckStatus != true) {
			await downloadAllBinaries(binDirectory);
		}
		resolve(binaryCheckStatus)	
	})
};