import { TransactionBaseService } from "medusa-core-utils";
import { EntityManager, IsNull, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { Product, ProductVariant } from "@medusajs/medusa";
import { Logger } from "@medusajs/medusa/dist/types/global";

type ProductType = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  handle: string;
  is_giftcard: boolean;
  discountable: boolean;
  thumbnail: string;
  profile_id: string;
  weight: number;
  length: number;
  height: number;
  width: number;
  hs_code: string;
  origin_country: string;
  mid_code: string;
  material: string;
  collection_id: string;
  type_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  metadata: any;
  collection?: any;
  type?: any;
  tags?: any[];
  variants: ProductVariant[];
};

type RecommendationRule = {
  name: string;
  description: string;
  weight: number;
  filterFn: (product: ProductType) => boolean;
};

class SearchService extends TransactionBaseService {
  protected manager_: EntityManager;
  protected transactionManager_: EntityManager;
  protected readonly logger_: Logger;

  private recommendationRules: RecommendationRule[] = [
    {
      name: "same_collection",
      description: "Products from the same collection",
      weight: 0.8,
      filterFn: (product: ProductType) => (p: ProductType) => 
        product.collection_id && p.collection_id === product.collection_id
    },
    {
      name: "same_type",
      description: "Products of the same type",
      weight: 0.7,
      filterFn: (product: ProductType) => (p: ProductType) => 
        product.type_id && p.type_id === product.type_id
    },
    {
      name: "similar_price",
      description: "Products with similar price",
      weight: 0.6,
      filterFn: (product: ProductType) => (p: ProductType) => {
        if (!product.variants || product.variants.length === 0) return false;
        const avgPrice = product.variants.reduce((sum, v) => sum + parseFloat(v.prices[0]?.amount?.toString() || '0'), 0) / product.variants.length;
        if (!p.variants || p.variants.length === 0) return false;
        const pAvgPrice = p.variants.reduce((sum, v) => sum + parseFloat(v.prices[0]?.amount?.toString() || '0'), 0) / p.variants.length;
        return Math.abs(avgPrice - pAvgPrice) / avgPrice < 0.3; // Within 30% price difference
      }
    },
    {
      name: "high_rated",
      description: "Products with high ratings",
      weight: 0.5,
      filterFn: (product: ProductType) => (p: ProductType) => 
        p.metadata?.rating && p.metadata.rating >= 4
    },
    {
      name: "verified_seller",
      description: "Products from verified sellers",
      weight: 0.9,
      filterFn: (product: ProductType) => (p: ProductType) => 
        p.metadata?.verified_seller === true
    }
  ];

  constructor(container) {
    super(container);
    this.logger_ = container.logger;
  }

  async searchProducts(query: string, filters: any = {}) {
    try {
      // For phase 1, we're using a simple DB search with SQL window functions
      // In production, this would connect to OpenSearch
      
      const productRepo = this.container_[`productRepository`] as Repository<Product>;
      
      let whereClause = "deleted_at IS NULL";
      const params: any[] = [];
      
      if (query) {
        whereClause += ` AND (title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 2})`;
        params.push(`%${query}%`, `%${query}%`);
      }
      
      if (filters.collection_id) {
        whereClause += ` AND collection_id = $${params.length + 1}`;
        params.push(filters.collection_id);
      }
      
      if (filters.type_id) {
        whereClause += ` AND type_id = $${params.length + 1}`;
        params.push(filters.type_id);
      }
      
      if (filters.price_min !== undefined) {
        whereClause += ` AND EXISTS (SELECT 1 FROM product_variant pv WHERE pv.product_id = product.id AND pv.calculated_price >= $${params.length + 1})`;
        params.push(filters.price_min);
      }
      
      if (filters.price_max !== undefined) {
        whereClause += ` AND EXISTS (SELECT 1 FROM product_variant pv WHERE pv.product_id = product.id AND pv.calculated_price <= $${params.length + 1})`;
        params.push(filters.price_max);
      }
      
      // Only verified products by default
      whereClause += ` AND (metadata->>'verified' = 'true' OR metadata->>'verified' IS NULL)`;
      
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      
      // Add ordering
      let orderBy = "created_at DESC";
      if (filters.sort_by === "price_low_to_high") {
        orderBy = "calculated_price ASC";
      } else if (filters.sort_by === "price_high_to_low") {
        orderBy = "calculated_price DESC";
      } else if (filters.sort_by === "rating") {
        orderBy = "(metadata->>'rating')::INTEGER DESC, created_at DESC";
      } else {
        // Default order: verified, then created_at
        orderBy = `(metadata->>'verified') DESC NULLS LAST, created_at DESC`;
      }
      
      const queryBuilder = productRepo
        .createQueryBuilder("product")
        .where(whereClause, ...params)
        .limit(limit)
        .offset(offset)
        .orderBy(orderBy);
      
      if (filters.with_variants) {
        queryBuilder.leftJoinAndSelect("product.variants", "variants");
      }
      
      const products = await queryBuilder.getMany();
      
      return {
        products,
        count: products.length,
        offset,
        limit
      };
    } catch (error: unknown) {
      this.logger_.error(`Error searching products: ${(error as Error).message}`);
      throw error;
    }
  }

  async getRecommendations(productId: string, limit: number = 10) {
    try {
      const productRepo = this.container_[`productRepository`] as Repository<Product>;
      
      // Get the source product
      const sourceProduct = await productRepo.findOne({
        where: { id: productId },
        relations: ["variants"]
      });
      
      if (!sourceProduct) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      // Get all products except the source
      const allProducts = await productRepo.find({
        where: { 
          id: Not(productId),
          deleted_at: IsNull()
        },
        relations: ["variants"]
      });
      
      // Apply recommendation rules
      const scoredProducts = allProducts.map(product => {
        const score = this.recommendationRules.reduce((totalScore, rule) => {
          try {
            const matches = rule.filterFn(sourceProduct)(product);
            return matches ? totalScore + rule.weight : totalScore;
          } catch (err) {
            this.logger_.warn(`Error applying recommendation rule ${rule.name}: ${(err as Error).message}`);
            return totalScore;
          }
        }, 0);
        
        return { product, score };
      });
      
      // Sort by score and return top recommendations
      const topRecommendations = scoredProducts
        .sort((a, b) => b.score - a.score)
        .filter(item => item.score > 0)
        .slice(0, limit)
        .map(item => item.product);
      
      return topRecommendations;
    } catch (error: unknown) {
      this.logger_.error(`Error getting recommendations: ${(error as Error).message}`);
      throw error;
    }
  }

  async getTrendingProducts(limit: number = 10) {
    try {
      // For phase 1, we'll use a simple algorithm based on recent sales/orders
      // In production, this would use more sophisticated trending algorithms
      
      const productRepo = this.container_[`productRepository`] as Repository<Product>;
      
      // Simple implementation: return recently created products
      // A real implementation would use order data to calculate trending scores
      const products = await productRepo.find({
        where: {
          deleted_at: IsNull(),
          created_at: MoreThanOrEqual(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        },
        order: { created_at: "DESC" },
        take: limit
      });
      
      return products;
    } catch (error: unknown) {
      this.logger_.error(`Error getting trending products: ${(error as Error).message}`);
      throw error;
    }
  }

  async getRelatedProducts(productId: string, limit: number = 10) {
    try {
      const productRepo = this.container_[`productRepository`] as Repository<Product>;
      
      // Get the source product
      const sourceProduct = await productRepo.findOne({
        where: { id: productId },
        relations: ["variants"]
      });
      
      if (!sourceProduct) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      // Find products from the same collection or same type
      const relatedProducts = await productRepo.find({
        where: [
          { collection_id: sourceProduct.collection_id, id: Not(productId) },
          { type_id: sourceProduct.type_id, id: Not(productId) }
        ],
        take: limit,
        order: { created_at: "DESC" }
      });
      
      return relatedProducts;
    } catch (error: unknown) {
      this.logger_.error(`Error getting related products: ${(error as Error).message}`);
      throw error;
    }
  }

  async indexProduct(productId: string) {
    try {
      // In phase 1, this would just ensure the product is in our searchable DB
      // In phase 2+, this would send to OpenSearch
      
      const productRepo = this.container_[`productRepository`] as Repository<Product>;
      const product = await productRepo.findOne({ 
        where: { id: productId }, 
        relations: ["variants", "tags", "type", "collection"] 
      });
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      // For now, just log that indexing happened
      this.logger_.info(`Indexed product: ${product.title} (${productId})`);
      
      return { indexed: true, productId };
    } catch (error: unknown) {
      this.logger_.error(`Error indexing product: ${(error as Error).message}`);
      throw error;
    }
  }

  async deindexProduct(productId: string) {
    try {
      // In phase 1, this would just remove from searchable DB
      // In phase 2+, this would remove from OpenSearch
      
      // For now, just log that deindexing happened
      this.logger_.info(`Deindexed product: ${productId}`);
      
      return { deindexed: true, productId };
    } catch (error: unknown) {
      this.logger_.error(`Error deindexing product: ${(error as Error).message}`);
      throw error;
    }
  }
}

// Import Not from typeorm
import { Not } from "typeorm";

export default SearchService;