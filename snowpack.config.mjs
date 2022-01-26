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
};
