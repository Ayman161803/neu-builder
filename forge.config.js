// Structure Of Forge.Config.Js
// This is a config file for imaginary software named: 'Mozzarella FuryFox'

module.exports = {
	package: {
		name: "Mozzarella FuryFox", // Software Name
		description: "Browse Internet With The Speed Of Light.", // Software Description.
		developer: "Aditya Mishra", // Name of the person/group/company developing the software.
		icon: "path/to/my/icon.png", // Path to a icon file to be used for the application, recommended size is 512x512 pixels
		license: "path/to/my/license.txt", // Path to the license file your program is licensed under.
		dist: "./dist/"
	},
	misc: {
		minifyConfig: true, // Should it minify the neutralino.config.json? (such as removing the unused modes and removing indentations)
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
	},
	formats: {
		zip: true,
		tar: false,
		sevenZ: false
	},
}