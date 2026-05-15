import { IEventBusService } from "@medusajs/types";
import { ProductService } from "@medusajs/medusa";
import { SearchService } from "../modules/search/search-service";

type InjectedDependencies = {
  eventBusService: IEventBusService;
  productService: ProductService;
  searchService: SearchService;
};

export default class ProductSearchSyncSubscriber {
  private readonly eventBus_: IEventBusService;
  private readonly productService_: ProductService;
  private readonly searchService_: SearchService;

  constructor({ eventBusService, productService, searchService }: InjectedDependencies) {
    this.eventBus_ = eventBusService;
    this.productService_ = productService;
    this.searchService_ = searchService;

    // Subscribe to product events to keep search index in sync
    this.eventBus_.subscribe("product.created", this.handleProductUpdated);
    this.eventBus_.subscribe("product.updated", this.handleProductUpdated);
    this.eventBus_.subscribe("product.deleted", this.handleProductDeleted);
  }

  handleProductUpdated = async (data: { id: string }): Promise<void> => {
    try {
      // Wait a bit to ensure the product data is fully updated in the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Index the product in the search service
      await this.searchService_.indexProduct(data.id);
    } catch (error) {
      console.error(`Error syncing product to search index:`, error);
    }
  };

  handleProductDeleted = async (data: { id: string }): Promise<void> => {
    try {
      // Remove the product from the search index
      if (process.env.OPENSEARCH_URL) {
        const axios = require('axios');
        
        await axios.delete(
          `${process.env.OPENSEARCH_URL}/products/_doc/${data.id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(process.env.OPENSEARCH_USERNAME && process.env.OPENSEARCH_PASSWORD && {
                'Authorization': `Basic ${Buffer.from(
                  `${process.env.OPENSEARCH_USERNAME}:${process.env.OPENSEARCH_PASSWORD}`
                ).toString('base64')}`
              })
            }
          }
        );
      }
    } catch (error) {
      console.error(`Error removing product from search index:`, error);
    }
  };
}