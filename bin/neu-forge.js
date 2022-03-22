const Packager = require("../src/index");
const path = require("path");

Packager({
	package: {
		name: "Mozzarella FuryFox",
		description: "Browse Internet With The Speed Of Light.",
		developer: "Aditya Mishra",
		icon: "path/to/my/icon.png",
		license: "path/to/my/license.txt",
		neuConfig: path.resolve(__dirname, "../Mozzarella FuryFox"),
		dist: path.resolve(__dirname, "../Mozzarella FuryFox/dist")
	},
	platform: {
		windows: {
			x86_64: true,
			i386: true,
		},
		macos: null,
		linux: {
			x86_64: true,
			i386: false,
			armhf: false,
			arm64: false
		}
	}
})
	.then((res) => {
		console.log(res);
	})
	.catch((err) => {
		console.log(err);
	})
