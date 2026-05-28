package vn.acfmart.mobile.features.home.presentation.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import vn.acfmart.mobile.features.home.data.Category

/**
 * Category Navigation - Horizontal scrollable category chips
 */
@Composable
fun CategoryNavigation(
    categories: List<Category>,
    selectedCategoryId: String?,
    onCategorySelected: (String?) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyRow(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 16.dp)
    ) {
        // "All" category
        item {
            val isSelected = selectedCategoryId == null
            FilterChip(
                selected = isSelected,
                onClick = { onCategorySelected(null) },
                label = {
                    Text(
                        text = "Tất cả",
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                    )
                }
            )
        }
        
        // Category items
        items(categories) { category ->
            val isSelected = category.id == selectedCategoryId
            FilterChip(
                selected = isSelected,
                onClick = { onCategorySelected(category.id) },
                label = {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                    ) {
                        Text(
                            text = category.icon,
                            style = MaterialTheme.typography.bodyLarge
                        )
                        Text(
                            text = category.name,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }
            )
        }
    }
}
