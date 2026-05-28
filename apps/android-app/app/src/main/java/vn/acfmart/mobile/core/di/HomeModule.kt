package vn.acfmart.mobile.core.di

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import vn.acfmart.mobile.features.home.data.ProductRepository
import javax.inject.Singleton

/**
 * Hilt module cung cấp các repository cho feature home
 */
@Module
@InstallIn(SingletonComponent::class)
object HomeModule {
    
    @Provides
    @Singleton
    fun provideProductRepository(): ProductRepository {
        return ProductRepository()
    }
}
