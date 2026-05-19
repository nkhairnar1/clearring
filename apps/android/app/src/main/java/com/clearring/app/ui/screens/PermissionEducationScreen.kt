package com.clearring.app.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat

data class PermissionInfo(
    val icon: ImageVector,
    val title: String,
    val desc: String,
    val isOptional: Boolean,
    val permission: String?,
    val color: Color,
)

@Composable
fun PermissionEducationScreen(onContinue: () -> Unit) {
    val context = LocalContext.current

    fun isGranted(permission: String) =
        ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED

    val permInfos = listOf(
        PermissionInfo(
            Icons.Default.Phone,
            "Phone State",
            "Detect incoming calls to show caller info before they ring.",
            isOptional = false,
            permission = Manifest.permission.READ_PHONE_STATE,
            color = Color(0xFF3B82F6),
        ),
        PermissionInfo(
            Icons.Default.Shield,
            "Call Screening",
            "Set as default screening app for automatic protection on every call.",
            isOptional = false,
            permission = null, // set via system settings, not a runtime permission
            color = Color(0xFF8B5CF6),
        ),
        PermissionInfo(
            Icons.Default.Contacts,
            "Read Contacts",
            "Show your saved contacts instantly — we never upload your address book.",
            isOptional = true,
            permission = Manifest.permission.READ_CONTACTS,
            color = Color(0xFF22C55E),
        ),
        PermissionInfo(
            Icons.Default.Lock,
            "No Call Recording",
            "We never record calls. Your conversations stay completely private.",
            isOptional = true,
            permission = null,
            color = Color(0xFF94A3B8),
        ),
    )

    // Track which runtime permissions are granted
    var grantedMap by remember {
        mutableStateOf(
            permInfos.associate { info ->
                (info.permission ?: info.title) to (info.permission?.let { isGranted(it) } ?: true)
            }
        )
    }

    val runtimePermissions = permInfos.mapNotNull { it.permission }

    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        grantedMap = grantedMap + results.mapKeys { it.key }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)))),
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(horizontal = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(Modifier.height(48.dp))

            Box(
                Modifier
                    .size(72.dp)
                    .background(Color(0xFF3B82F6).copy(0.15f), MaterialTheme.shapes.extraLarge),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Default.Security, null, tint = Color(0xFF3B82F6), modifier = Modifier.size(40.dp))
            }
            Spacer(Modifier.height(16.dp))
            Text("Permissions We Need", fontSize = 24.sp, fontWeight = FontWeight.Black, color = Color.White)
            Spacer(Modifier.height(8.dp))
            Text(
                "ClearRing respects your privacy. Here's exactly what we need and why.",
                fontSize = 14.sp, color = Color(0xFF94A3B8), textAlign = TextAlign.Center,
            )

            Spacer(Modifier.height(28.dp))

            permInfos.forEach { info ->
                val key = info.permission ?: info.title
                val granted = grantedMap[key] == true
                PermissionCard(info = info, granted = granted)
                Spacer(Modifier.height(10.dp))
            }

            Spacer(Modifier.weight(1f))

            // Grant permissions button (only if there are ungrantd runtime permissions)
            val allGranted = runtimePermissions.all { grantedMap[it] == true }
            if (!allGranted) {
                Button(
                    onClick = { launcher.launch(runtimePermissions.toTypedArray()) },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                    shape = MaterialTheme.shapes.extraLarge,
                ) {
                    Icon(Icons.Default.CheckCircle, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Grant Permissions", fontWeight = FontWeight.SemiBold)
                }
                Spacer(Modifier.height(8.dp))
                TextButton(onClick = onContinue, modifier = Modifier.fillMaxWidth()) {
                    Text("Skip for now", color = Color(0xFF64748B))
                }
            } else {
                Button(
                    onClick = onContinue,
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF22C55E)),
                    shape = MaterialTheme.shapes.extraLarge,
                ) {
                    Icon(Icons.Default.CheckCircle, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("All Set — Continue", fontWeight = FontWeight.SemiBold)
                }
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun PermissionCard(info: PermissionInfo, granted: Boolean) {
    val statusColor = when {
        info.permission == null -> Color(0xFF475569)   // N/A — no runtime permission
        granted -> Color(0xFF22C55E)
        else -> Color(0xFFF97316)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
            .padding(16.dp),
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(info.color.copy(alpha = 0.15f), MaterialTheme.shapes.medium),
            contentAlignment = Alignment.Center,
        ) {
            Icon(info.icon, null, tint = info.color, modifier = Modifier.size(20.dp))
        }
        Column(Modifier.weight(1f)) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(info.title, fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 14.sp)
                if (info.isOptional) {
                    Surface(color = Color(0xFF334155), shape = MaterialTheme.shapes.extraSmall) {
                        Text("Optional", color = Color(0xFF94A3B8), fontSize = 9.sp, fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp))
                    }
                }
            }
            Spacer(Modifier.height(2.dp))
            Text(info.desc, color = Color(0xFF94A3B8), fontSize = 12.sp)
        }
        // Status indicator
        when {
            info.permission == null -> Icon(Icons.Default.Lock, null, tint = Color(0xFF475569), modifier = Modifier.size(16.dp))
            granted -> Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF22C55E), modifier = Modifier.size(16.dp))
            else -> Icon(Icons.Default.RadioButtonUnchecked, null, tint = Color(0xFF475569), modifier = Modifier.size(16.dp))
        }
    }
}
