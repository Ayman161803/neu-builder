const fse = require("fs-extra");
const path = require("path");
const asar = require("asar");

const { generateString } = require("./utils");

/**
 * Package Neutralino App Resources Into `resources.neu`
 * @param {string} neuConfigPath Absolute Path to neutralino.config.json
 * @param {string} outFolder Absolute Path to output the `resource.neu` file.
 */
async function packager(neuConfigPath, outFolder) {
	// Holds The Temporarily Created Directory Which Holds the Project Resources.
	const tempProject = path.join(outFolder, `.${generateString()}`);
	fse.mkdirSync(tempProject);

	// Holds The Path to the project to be packaged.
	const projectDir = path.resolve(path.dirname(neuConfigPath));
	const neuConfig = require(neuConfigPath);

	// Replace functions will remove
	const resourcesPath = path.resolve(projectDir, neuConfig.cli.resourcesPath.replace(/^\//, ""));
	const clientLibrary = path.resolve(projectDir, neuConfig.cli.clientLibrary.replace(/^\//, ""));
	const iconFile = path.resolve(projectDir, neuConfig.modes.window.icon.replace(/^\//, ""));

	// Copy The Resources Folder Into A Temporary Directory.
	fse.copySync(
		resourcesPath,
		path.join(tempProject, path.basename(resourcesPath)),
		{ recursive: true, overwrite: true }
	);

	fse.writeFileSync(neuConfigPath, JSON.stringify(neuConfig));

	fse.copyFileSync(
		clientLibrary,
		path.join(tempProject, path.basename(clientLibrary))
	);

	fse.copyFileSync(
		iconFile,
		path.join(tempProject, path.basename(iconFile))
	);

	await asar.createPackage(tempProject, path.join(tempFolder, 'resources.neu'))
	fse.removeSync(tempProject);

	return path.resolve(`${tempFolder}/resources.neu`);
}

// let tempFolder = path.resolve(fse.mkdtempSync(".temp-"));

// let resourceFile = packager(
// 	path.resolve(__dirname, "../Mozzarella FuryFox/neutralino.config.json"),
// 	path.resolve(tempFolder)
// );

// console.log(resourceFile);

// fse.rmdirSync(tempFolder);

module.exports.default = packager;