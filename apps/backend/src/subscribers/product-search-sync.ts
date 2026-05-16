import { ProductService, EventBusService } from "@medusajs/medusa";
import SearchService from "../modules/search/search-service";

class ProductSearchSyncSubscriber {
  private productService_: ProductService;
  private searchService_: SearchService;

  constructor({ productService, eventBusService, searchService }) {
    this.productService_ = productService;
    this.searchService_ = searchService;

    // Subscribe to product events to keep search index in sync
    eventBusService.subscribe("product.created", this.handleProductSync.bind(this));
    eventBusService.subscribe("product.updated", this.handleProductSync.bind(this));
    eventBusService.subscribe("product.deleted", this.handleProductDelete.bind(this));
  }

  async handleProductSync(data: { id: string }): Promise<void> {
    try {
      // Get the full product details
      const product = await this.productService_.retrieve(data.id, {
        relations: ["variants", "tags", "type", "collection"]
      });

      // Index the product in our search system
      await this.searchService_.indexProduct(product.id);
      
      console.log(`Synced product ${product.title} (${product.id}) to search index`);
    } catch (error) {
      console.error(`Failed to sync product ${data.id} to search index:`, error);
    }
  }

  async handleProductDelete(data: { id: string }): Promise<void> {
    try {
      // Remove the product from search index
      await this.searchService_.deindexProduct(data.id);
      
      console.log(`Removed product ${data.id} from search index`);
    } catch (error) {
      console.error(`Failed to remove product ${data.id} from search index:`, error);
    }
  }
}

export default ProductSearchSyncSubscriber;