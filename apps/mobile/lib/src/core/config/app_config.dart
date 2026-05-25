enum AppEnvironment {
  dev,
  staging,
  prod,
}

class AppConfig {
  AppConfig({
    required this.environment,
    required this.appName,
    required this.apiBaseUrl,
  });

  AppConfig.dev()
      : environment = AppEnvironment.dev,
        appName = 'ACFMart',
        apiBaseUrl = String.fromEnvironment(
          'ACFMART_API_BASE_URL',
          defaultValue: 'http://localhost:3001',
        );

  AppConfig.staging()
      : environment = AppEnvironment.staging,
        appName = 'ACFMart',
        apiBaseUrl = String.fromEnvironment(
          'ACFMART_API_BASE_URL',
          defaultValue: 'https://staging-api.acfmart.vn',
        );

  AppConfig.prod()
      : environment = AppEnvironment.prod,
        appName = 'ACFMart',
        apiBaseUrl = String.fromEnvironment(
          'ACFMART_API_BASE_URL',
          defaultValue: 'https://api.acfmart.vn',
        );

  final AppEnvironment environment;
  final String appName;
  final String apiBaseUrl;
}
