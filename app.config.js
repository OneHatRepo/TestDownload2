import 'dotenv/config' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

export default ({ config }) => { // Cannot contain any promises

	if (!config.extra) {
		config.extra = {};
	}
	
	switch(process.env.CHANNEL) {
		case 'staging':
			config.name = 'TestDownload2 Staging';
			config.extra.subdomain = 'staging';
			break;
		case 'testing':
			config.name = 'TestDownload2 Testing';
			config.extra.subdomain = 'testing';
			break;
		case 'dev':
			config.name = 'TestDownload2 Dev';
			config.extra.subdomain = 'dev';
			break;
		case 'production':
		default:
			config.extra.subdomain = 'app';
	}
	const reverseDomain = 'com.testdownload2.' + config.extra.subdomain;
	config.ios.bundleIdentifier = reverseDomain + '1';
	config.ios.buildNumber = config.version;
	config.android.package = reverseDomain;

	config.extra.experienceId = '@' + config.owner + '/' + config.slug;

	// config.extra.CONFIG = JSON.stringify(config);
	config.extra.PROCESS_ENV = JSON.stringify(process.env);

	return config;
};
