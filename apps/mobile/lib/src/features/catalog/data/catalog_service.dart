import '../../../core/network/api_client.dart';

class CatalogService {
  CatalogService(this._apiClient);

  final ApiClient _apiClient;

  Future<List<dynamic>> getProducts() async {
    try {
      final response = await _apiClient.get('/store/products');
      if (response.statusCode == 200) {
        return response.data['products'] ?? [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<List<dynamic>> getCategories() async {
    try {
      final response = await _apiClient.get('/store/product-categories');
      if (response.statusCode == 200) {
        return response.data['product_categories'] ?? [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<Map<String, dynamic>?> getProductById(String id) async {
    try {
      final response = await _apiClient.get('/store/products/$id');
      if (response.statusCode == 200) {
        return response.data['product'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
