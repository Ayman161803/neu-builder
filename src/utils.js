const path = require("path");
const { https } = require("follow-redirects");
const fs = require("fs");
const jsZip = require("jszip");
const CONSTANTS = require("./constants");

/**
 * Generates Something Like UUID but more shitty.
 * @returns {string}
 */
 function generateString() {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let string = "";

	function generate() {
		let result = "";
		for (var i = 0; i < 4; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	string += generate();
	string += "-" + generate();
	string += "-" + generate();
	string += "-" + generate();

	return string;
}

function unzipFile(zipFilePath, outdir) {
	return new Promise(async (resolve, reject) => {
		try {
			var zip = new jsZip();
			var extractedFiles = [];
			const zipData = fs.readFileSync(zipFilePath);
			const contents = await zip.loadAsync(zipData);
			const files = Object.keys(contents.files);

			for (let i = 0; i < files.length; i++) {
				const fileName = files[i];
				const filePath = path.resolve(outdir, fileName);
				const zipData = await zip.file(fileName).async('nodebuffer');
				fs.writeFileSync(filePath, zipData);
				extractedFiles.push(filePath);
			}

			resolve(extractedFiles)
		} catch (err) {
			reject(err);
		}
	})
}

function downloadFromRemote(url, outdir) {
	return new Promise((resolve, reject) => {
		try {
			const filePath = path.resolve(outdir, 'neutralinojs-unofficial.zip');
			const file = fs.createWriteStream(filePath);
			https.get(url, (response) => {
				response.pipe(file);
				response.on('end', () => resolve(filePath));
				response.on('error', (err) => reject(err));
			});
		} catch (err) {
			reject(err);
		}
	});
}

/**
 * Check If Binaries Exist.
 * @param {object} platforms 
 * @param {string} binariesDir 
 * @returns {(object|true)} If Binaries Exists Returns true, or object containing platform and arch binary missing.
 */
function checkBinaries(platforms, binariesDir) {
	for (let platform in platforms) {
		for (let arch in platforms[platform]) {
			let binaryName = CONSTANTS.binaryFiles.executables[platform][arch];
			if (binaryName == CONSTANTS.binaryFiles.executables.windows.x86_64 || binaryName == CONSTANTS.binaryFiles.executables.windows.i386) {
				if (!fs.existsSync(path.resolve(binariesDir, CONSTANTS.binaryFiles.sharedLib.windows[arch]))) {
					return {
						platform: platform,
						arch: arch,
						file: "dll"
					}
				}
			}
			if (!fs.existsSync(path.resolve(binariesDir, binaryName))) {
				return {
					platform: platform,
					arch: arch,
					file: "executable"
				}
			}
		}
	}

	return true;
}

module.exports.generateString = generateString;
module.exports.unzipFile = unzipFile;
module.exports.downloadFromRemote = downloadFromRemote;
module.exports.checkBinaries = checkBinaries;
