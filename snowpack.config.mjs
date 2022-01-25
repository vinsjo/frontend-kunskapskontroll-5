export default {
	mount: {
		public: { url: '/', static: true },
		src: { url: '/dist' },
	},
	plugins: [
		[
			'@snowpack/plugin-webpack',
			{
				sourceMap: false,
			},
		],
	],

	// optimize: {
	// 	bundle: true,
	// 	minify: true,
	// 	target: 'es2015',
	// 	sourcemap: false,
	// },
};
