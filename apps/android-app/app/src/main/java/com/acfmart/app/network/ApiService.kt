package com.acfmart.app.network

import com.acfmart.app.Product
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path

interface ApiService {
    @GET("products")
    suspend fun getProducts(): Response<List<Product>>

    @GET("products/{id}")
    suspend fun getProductDetail(@Path("id") id: String): Response<Product>
}
