const constants = {
	configFile: "neutralino.config.json",
	resourceFile: "resources.neu",
	downloadMirrors: {
		binary: {
			official: "https://github.com/neutralinojs/neutralinojs/releases/download/v{version}/neutralinojs-v{version}.zip",
			unoffical: "https://github.com/DEVLOPRR/neutralinojs/releases/download/v{version}/neutralinojs-v{version}-unofficial.zip"
		},
		client: {
			official: "https://github.com/neutralinojs/neutralino.js/releases/download/v{version}/neutralino.js"
		}
	},
	binaryFiles: {
		executables: {
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
		},
		sharedLib: {
			windows: {
				x86_64: "WebView2Loader.dll",
				i386: "WebView2Loader-i386.dll"
			}
		}
	}
}

module.exports = constants;