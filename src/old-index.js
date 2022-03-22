const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const process = require("process");
const SevenZ = require('7zip-min');
const asar = require('asar');

/**
 * Neu Packager
 */
class NeuPackager {
	/**
	 * @typedef {object} STATUS_CODE
	 */
	STATUS_CODE = {
		SUCCESS: 0,
		FILE_NOT_FOUND: 1,
		ARCHIVING_ERR: 2,
		DIR_NOT_EMPTY: 3
	}

	/**
	 * @typedef {object} STATUS
	 * @property {STATUS_CODE} code - Status Code
	 * @property {string} text - Text Describing The Status
	 */

	/**
	 * @param {string} configFile - Path To Your `forge.config.js`, if null then will look for one in current directory
	 */
	constructor(configFile) {
		if (!configFile) {
			configFile = path.join(process.cwd(), "forge.config.js");
			if (!fs.existsSync(configFile)) {
				throw new Error(`Config File '${configFile}' Not Found!`)
			}
		} else {
			configFile = path.resolve(configFile);
			if (!fs.existsSync(configFile)) {
				throw new Error(`Config File '${configFile}' Not Found!`)
			}
		}

		/** @private */
		this.config = require(configFile);
	}

	/**
	 * Make The Project Archive File.
	 * @private
	 * @param {string} folder - Path of Folder To Zip.
	 * @param {string} output - Path of Folder To Generate The Zip.
	 * @returns {Promise<STATUS>} - Object Containing Status
	 */
	makeArchive(folder, output) {
		return new Promise((resolve, reject) => {
			SevenZ.pack(folder, output, err => {
				if (err) {
					reject({
						code: this.STATUS_CODE.ARCHIVING_ERR,
						text: err
					})
				} else {
					resolve({
						code: this.STATUS_CODE.SUCCESS,
						text: "Success!"
					});
				}
			});
		})
	}

	/**
	 * Generates The `resources.neu` file
	 * @private
	 * @param {string} projectDir Directory Which Contains The Neutralino App.
	 * @param {object} neutralinoConfig Neutralino Config.
	 * @returns {string} Path To the generated `resources.neu` file.
	 */
	async makeResourceFile(projectDir, neutralinoConfig) {
		const tempFolder = path.resolve(`./${fs.mkdtempSync(".temp-")}`);
		const tempProject = path.join(tempFolder, "project")
		const resourcesPath = path.resolve(projectDir, neutralinoConfig.cli.resourcesPath.replace(/^\//, ""));
		const clientLibrary = path.resolve(projectDir, neutralinoConfig.cli.clientLibrary.replace(/^\//, ""));
		const iconFile = path.resolve(projectDir, neutralinoConfig.modes.window.icon.replace(/^\//, ""));

		// Copy The Resources Folder Into A Temporary Directory.
		fse.copySync(
			resourcesPath,
			path.join(tempProject, path.basename(resourcesPath)),
			{ recursive: true, overwrite: true }
		);

		fs.writeFileSync(path.join(tempProject, 'neutralino.config.json'), JSON.stringify(neutralinoConfig));
		fs.copyFileSync(clientLibrary, path.join(tempProject, path.basename(clientLibrary)))
		fs.copyFileSync(iconFile, path.join(tempProject, path.basename(iconFile)))

		await asar.createPackage(tempProject, path.join(tempFolder, 'resources.neu'))
		fse.removeSync(tempProject);

		return path.resolve(`${tempFolder}/resources.neu`);
	}

	/**
	 * Builds Your Application
	 * @returns {Promise<STATUS>} - Object Containing Status
	 */
	package() {
		return new Promise(async (resolve, reject) => {
			const binaryMap = {
				windows: {
					x86_64: "neutralino-win_x64.exe",
					i386: "neutralino-win_ia32.exe"
				},
				macos: {
					x86_64: "neutralino-mac_x64"
				},
				linux: {
					x86_64: "neutralino-linux_x64",
					i386: "neutralino-linux_ia32",
					armhf: "neutralino-linux_armhf",
					arm64: "neutralino-linux_arm64"
				}
			}

			let config = this.config;
			if (!fs.existsSync(path.resolve("./neutralino.config.json"))) {
				reject({
					code: this.STATUS_CODE.FILE_NOT_FOUND,
					text: `'${path.resolve('./neutralino.config.json')}' not found!`
				})
			}

			let neutralinoConfig = fs.readFileSync(path.resolve("./neutralino.config.json"))
			neutralinoConfig = JSON.parse(neutralinoConfig);
			let resources = await this.makeResourceFile("./", neutralinoConfig);
			let tempFolder = path.dirname(resources);
			let binaryFolder = path.resolve(__dirname, "../binaries/");

			for (let platform in config.platform) {
				console.log(platform);
				for (let architecture in config.platform[platform]) {
					if (config.platform[platform][architecture]) {
						console.log("  " + architecture);
						let folder = path.join(tempFolder, `${neutralinoConfig.cli.binaryName}-${platform}-${architecture}`);
						fs.mkdirSync(folder);
						fs.copyFileSync(resources, path.join(folder, "resources.neu"));
						fs.copyFileSync(
							path.join(binaryFolder, binaryMap[platform][architecture]),
							path.join(folder, `${binaryMap[platform][architecture].replace("neutralino", neutralinoConfig.cli.binaryName)}`)
						);

						if (platform == "windows") {
							if (architecture == "x86_64") {
								fs.copyFileSync(path.join(binaryFolder, "DLL/x64/WebView2Loader.dll"), path.join(folder, "WebView2Loader.dll"))
							} else if (architecture == "i386") {
								fs.copyFileSync(path.join(binaryFolder, "DLL/x32/WebView2Loader.dll"), path.join(folder, "WebView2Loader.dll"))
							}
						}
						for (let format in config.formats) {
							// If The Format is Null
							if (!config.formats[format]) continue;

							if (format == "zip") {
								await this.makeArchive(folder, path.join(tempFolder, `${neutralinoConfig.cli.binaryName}-${platform}-${architecture}.zip`));
							}

							if (format == "sevenZ") {
								await this.makeArchive(folder, path.join(tempFolder, `${neutralinoConfig.cli.binaryName}-${platform}-${architecture}.7z`));
							}

							if (format == "tar") {
								await this.makeArchive(folder, path.join(tempFolder, `${neutralinoConfig.cli.binaryName}-${platform}-${architecture}.tar`));
							}
						}
						fse.removeSync(folder);
					}
				}
			}

			fs.rmSync(resources);

			let distDir = path.resolve(config.package.dist);
			fse.ensureDirSync(distDir);

			const files = fs.readdirSync(tempFolder);

			for (let i = 0; i < files.length; i++) {
				fse.moveSync(path.resolve(tempFolder, files[i]), path.resolve(distDir, files[i]))
			}

			fs.rmdirSync(tempFolder);
			resolve();
		})
	}
}

module.exports = NeuPackager