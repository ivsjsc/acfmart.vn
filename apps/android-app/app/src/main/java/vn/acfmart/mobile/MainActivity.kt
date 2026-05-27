package vn.acfmart.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import dagger.hilt.android.AndroidEntryPoint
import vn.acfmart.mobile.core.ui.theme.ACFMartTheme
import vn.acfmart.mobile.navigation.AppNavGraph

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.light(0xFFDC2626.toInt(), 0xFFDC2626.toInt())
        )
        super.onCreate(savedInstanceState)
        setContent {
            ACFMartTheme {
                AppNavGraph()
            }
        }
    }
}
