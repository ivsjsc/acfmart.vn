import { TransactionBaseService } from '@medusajs/medusa';
import { EntityManager } from 'typeorm';
import { Logger } from '@medusajs/medusa/dist/types';
import axios from 'axios';

type InjectedDependencies = {
  manager: EntityManager;
  logger: Logger;
};

export interface ProductSearchParams {
  q?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  verified_only?: boolean;
  limit?: number;
  offset?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'created_at' | 'rating' | 'popularity';
}

export interface ProductSearchResult {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
  price: number;
  category: string;
  verified: boolean;
  rating: number;
  inventory_quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface RecommendationRule {
  id: string;
  name: string;
  condition: (product: any) => boolean;
  weight: number;
}

export default class SearchService extends TransactionBaseService {
  protected readonly logger_: Logger;

  constructor({ manager, logger }: InjectedDependencies) {
    super({ manager });

    this.logger_ = logger;
  }

  async searchProducts(params: ProductSearchParams): Promise<ProductSearchResult[]> {
    // Try OpenSearch first, fallback to database search if unavailable
    try {
      if (process.env.OPENSEARCH_URL) {
        return await this.searchWithOpenSearch(params);
      }
    } catch (error) {
      this.logger_.warn(`OpenSearch unavailable, falling back to database search: ${error.message}`);
    }

    // Fallback to database search with PostgreSQL full-text search
    return await this.searchWithDatabase(params);
  }

  private async searchWithOpenSearch(params: ProductSearchParams): Promise<ProductSearchResult[]> {
    try {
      const response = await axios.post(
        `${process.env.OPENSEARCH_URL}/products/_search`,
        {
          query: {
            bool: {
              must: [],
              filter: []
            }
          },
          sort: this.buildSortClause(params.sort_by),
          from: params.offset || 0,
          size: params.limit || 20
        },
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

      return response.data.hits.hits.map((hit: any) => ({
        id: hit._source.id,
        title: hit._source.title,
        handle: hit._source.handle,
        thumbnail: hit._source.thumbnail,
        price: hit._source.price,
        category: hit._source.category,
        verified: hit._source.verified,
        rating: hit._source.rating,
        inventory_quantity: hit._source.inventory_quantity,
        created_at: new Date(hit._source.created_at),
        updated_at: new Date(hit._source.updated_at)
      }));
    } catch (error) {
      this.logger_.error(`OpenSearch query failed: ${error.message}`);
      throw error;
    }
  }

  private buildSortClause(sortBy?: string) {
    if (!sortBy) {
      return [{ score: 'desc' }, { verified: 'desc' }, { created_at: 'desc' }];
    }

    switch (sortBy) {
      case 'price_asc':
        return [{ price: 'asc' }];
      case 'price_desc':
        return [{ price: 'desc' }];
      case 'created_at':
        return [{ created_at: 'desc' }];
      case 'rating':
        return [{ rating: 'desc' }];
      case 'popularity':
        return [{ popularity_score: 'desc' }];
      default:
        return [{ score: 'desc' }, { verified: 'desc' }, { created_at: 'desc' }];
    }
  }

  private async searchWithDatabase(params: ProductSearchParams): Promise<ProductSearchResult[]> {
    const entityManager = this.activeManager_;
    
    // Build the query with full-text search capabilities
    let queryBuilder = entityManager.query(`
      SELECT 
        p.id,
        p.title,
        p.handle,
        p.thumbnail,
        pp.min_price as price,
        pc.category,
        p.is_verified as verified,
        COALESCE(pv.average_rating, 0) as rating,
        pi.inventory_quantity,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN product_variants pv_temp ON p.id = pv_temp.product_id
      LEFT JOIN price_preferences pp ON p.id = pp.product_id
      LEFT JOIN product_inventory pi ON p.id = pi.product_id
      LEFT JOIN (
        SELECT 
          product_id,
          AVG(rating) as average_rating
        FROM product_reviews 
        GROUP BY product_id
      ) pv ON p.id = pv.product_id
      WHERE p.deleted_at IS NULL
    `);

    const queryParams: any[] = [];
    let paramIndex = 1;

    // Add search term filtering
    if (params.q) {
      queryBuilder += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      queryParams.push(`%${params.q}%`);
      paramIndex++;
    }

    // Add category filtering
    if (params.category) {
      queryBuilder += ` AND pc.handle = $${paramIndex}`;
      queryParams.push(params.category);
      paramIndex++;
    }

    // Add price range filtering
    if (params.min_price !== undefined) {
      queryBuilder += ` AND pp.min_price >= $${paramIndex}`;
      queryParams.push(params.min_price);
      paramIndex++;
    }

    if (params.max_price !== undefined) {
      queryBuilder += ` AND pp.min_price <= $${paramIndex}`;
      queryParams.push(params.max_price);
      paramIndex++;
    }

    // Add verified-only filtering
    if (params.verified_only) {
      queryBuilder += ` AND p.is_verified = true`;
    }

    // Add sorting
    if (params.sort_by) {
      switch (params.sort_by) {
        case 'price_asc':
          queryBuilder += ` ORDER BY pp.min_price ASC`;
          break;
        case 'price_desc':
          queryBuilder += ` ORDER BY pp.min_price DESC`;
          break;
        case 'created_at':
          queryBuilder += ` ORDER BY p.created_at DESC`;
          break;
        case 'rating':
          queryBuilder += ` ORDER BY pv.average_rating DESC NULLS LAST`;
          break;
        default:
          queryBuilder += ` ORDER BY p.is_verified DESC, p.created_at DESC`;
      }
    } else {
      // Default sorting: verified first, then newest
      queryBuilder += ` ORDER BY p.is_verified DESC, p.created_at DESC`;
    }

    // Add pagination
    if (params.limit) {
      queryBuilder += ` LIMIT $${paramIndex}`;
      queryParams.push(params.limit);
      paramIndex++;
    }

    if (params.offset) {
      queryBuilder += ` OFFSET $${paramIndex}`;
      queryParams.push(params.offset);
    }

    const results = await entityManager.query(queryBuilder, queryParams);
    
    return results.map(result => ({
      id: result.id,
      title: result.title,
      handle: result.handle,
      thumbnail: result.thumbnail,
      price: parseFloat(result.price),
      category: result.category,
      verified: result.verified,
      rating: parseFloat(result.rating) || 0,
      inventory_quantity: result.inventory_quantity || 0,
      created_at: new Date(result.created_at),
      updated_at: new Date(result.updated_at)
    }));
  }

  async getRecommendations(productId: string, limit: number = 10): Promise<ProductSearchResult[]> {
    // Implement rule-based recommendation logic
    try {
      // Get the product to base recommendations on
      const baseProduct = await this.getProductById(productId);
      if (!baseProduct) {
        return [];
      }

      // Apply recommendation rules
      const rules = this.getRecommendationRules();
      
      // Build a query based on rules and similarity
      const recommendations = await this.findSimilarProducts(baseProduct, limit, rules);
      
      return recommendations;
    } catch (error) {
      this.logger_.error(`Error getting recommendations: ${error.message}`);
      return [];
    }
  }

  private async getProductById(productId: string): Promise<any> {
    const entityManager = this.activeManager_;
    
    const result = await entityManager.query(
      `SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL`,
      [productId]
    );
    
    return result.length > 0 ? result[0] : null;
  }

  private getRecommendationRules(): RecommendationRule[] {
    return [
      {
        id: 'same_category',
        name: 'Same Category',
        condition: (product: any) => (p: any) => p.category_id === product.category_id,
        weight: 0.7
      },
      {
        id: 'same_collection',
        name: 'Same Collection',
        condition: (product: any) => (p: any) => p.collection_id === product.collection_id,
        weight: 0.6
      },
      {
        id: 'similar_price_range',
        name: 'Similar Price Range',
        condition: (product: any) => (p: any) => {
          const priceDiff = Math.abs(p.price - product.price);
          return priceDiff < (product.price * 0.3); // Within 30% of original price
        },
        weight: 0.5
      },
      {
        id: 'high_rated',
        name: 'High Rated',
        condition: (product: any) => (p: any) => p.average_rating >= 4.0,
        weight: 0.4
      },
      {
        id: 'verified_seller',
        name: 'Verified Seller',
        condition: (product: any) => (p: any) => p.is_verified,
        weight: 0.8
      }
    ];
  }

  private async findSimilarProducts(baseProduct: any, limit: number, rules: RecommendationRule[]): Promise<ProductSearchResult[]> {
    const entityManager = this.activeManager_;
    
    // Get related products based on rules
    let query = `
      SELECT 
        p.id,
        p.title,
        p.handle,
        p.thumbnail,
        pp.min_price as price,
        pc.category,
        p.is_verified as verified,
        COALESCE(pv.average_rating, 0) as rating,
        pi.inventory_quantity,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN price_preferences pp ON p.id = pp.product_id
      LEFT JOIN product_inventory pi ON p.id = pi.product_id
      LEFT JOIN (
        SELECT 
          product_id,
          AVG(rating) as average_rating
        FROM product_reviews 
        GROUP BY product_id
      ) pv ON p.id = pv.product_id
      WHERE p.id != $1 AND p.deleted_at IS NULL
    `;
    
    const queryParams: any[] = [baseProduct.id];
    
    // Apply filters based on rules
    if (baseProduct.category_id) {
      query += ` AND p.category_id = $${queryParams.length + 1}`;
      queryParams.push(baseProduct.category_id);
    }
    
    query += ` ORDER BY p.is_verified DESC, pv.average_rating DESC NULLS LAST, p.created_at DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit * 2); // Get more than needed for post-processing
    
    const results = await entityManager.query(query, queryParams);
    
    // Sort by relevance using our rules
    const scoredResults = results.map(product => {
      let score = 0;
      
      for (const rule of rules) {
        if (rule.condition(baseProduct)(product)) {
          score += rule.weight;
        }
      }
      
      return { product, score };
    });
    
    // Sort by score and return top results
    return scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        id: item.product.id,
        title: item.product.title,
        handle: item.product.handle,
        thumbnail: item.product.thumbnail,
        price: parseFloat(item.product.price),
        category: item.product.category,
        verified: item.product.verified,
        rating: parseFloat(item.product.rating) || 0,
        inventory_quantity: item.product.inventory_quantity || 0,
        created_at: new Date(item.product.created_at),
        updated_at: new Date(item.product.updated_at)
      }));
  }

  async indexProduct(productId: string): Promise<boolean> {
    try {
      if (!process.env.OPENSEARCH_URL) {
        return true; // Skip indexing if OpenSearch is not configured
      }

      // Get product data from database
      const entityManager = this.activeManager_;
      const result = await entityManager.query(
        `SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL`,
        [productId]
      );

      if (result.length === 0) {
        return false;
      }

      const product = result[0];

      // Index in OpenSearch
      await axios.put(
        `${process.env.OPENSEARCH_URL}/products/_doc/${productId}`,
        {
          id: product.id,
          title: product.title,
          handle: product.handle,
          description: product.description,
          thumbnail: product.thumbnail,
          price: product.price,
          category: product.category,
          verified: product.is_verified,
          rating: product.rating,
          inventory_quantity: product.inventory_quantity,
          created_at: product.created_at,
          updated_at: product.updated_at
        },
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

      return true;
    } catch (error) {
      this.logger_.error(`Error indexing product: ${error.message}`);
      return false;
    }
  }
}