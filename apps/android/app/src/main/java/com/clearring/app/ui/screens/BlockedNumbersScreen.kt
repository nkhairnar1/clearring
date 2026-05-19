package com.clearring.app.ui.screens

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.clearring.app.data.model.PhoneNumberSummary
import com.clearring.app.ui.theme.formatPhoneDisplay
import com.clearring.app.ui.theme.riskColor
import com.clearring.app.viewmodel.BlockedNumbersViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BlockedNumbersScreen(onBack: () -> Unit) {
    val viewModel: BlockedNumbersViewModel = hiltViewModel()
    val state by viewModel.state.collectAsState()
    val unblockState by viewModel.unblockState.collectAsState()

    LaunchedEffect(Unit) { viewModel.load() }

    var confirmingUnblock: PhoneNumberSummary? by remember { mutableStateOf(null) }

    if (confirmingUnblock != null) {
        AlertDialog(
            onDismissRequest = { confirmingUnblock = null },
            title = { Text("Unblock number?") },
            text = {
                Text(
                    "${formatPhoneDisplay(confirmingUnblock!!.e164Number)} will no longer be blocked. Calls will ring through normally.",
                    color = Color(0xFF94A3B8),
                )
            },
            confirmButton = {
                val haptic = LocalHapticFeedback.current
                TextButton(onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    viewModel.unblock(confirmingUnblock!!.id)
                    confirmingUnblock = null
                }) { Text("Unblock", color = Color(0xFF22C55E), fontWeight = FontWeight.Bold) }
            },
            dismissButton = {
                TextButton(onClick = { confirmingUnblock = null }) { Text("Cancel") }
            },
            containerColor = Color(0xFF1E293B),
            titleContentColor = Color.White,
            textContentColor = Color(0xFF94A3B8),
        )
    }

    LaunchedEffect(unblockState) {
        if (unblockState is UnblockState.Success) viewModel.load()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)))),
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp).statusBarsPadding(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, "Go back", tint = Color.White)
                }
                Text(
                    "Blocked Numbers",
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 18.sp,
                )
                Spacer(Modifier.weight(1f))
                if (state is BlockedState.Success) {
                    IconButton(onClick = { viewModel.load() }) {
                        Icon(Icons.Default.Refresh, "Refresh list", tint = Color(0xFF64748B), modifier = Modifier.size(20.dp))
                    }
                }
            }

            when (val s = state) {
                is BlockedState.Loading -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Color(0xFF8B5CF6))
                    }
                }
                is BlockedState.Error -> {
                    Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Icon(Icons.Default.ErrorOutline, null, tint = Color(0xFFEF4444), modifier = Modifier.size(48.dp))
                            Text(s.message, color = Color(0xFF94A3B8), fontSize = 14.sp)
                            Button(onClick = { viewModel.load() }) { Text("Retry") }
                        }
                    }
                }
                is BlockedState.Success -> {
                    if (s.numbers.isEmpty()) {
                        Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                Box(
                                    Modifier.size(80.dp).background(Color(0xFF1E293B), MaterialTheme.shapes.extraLarge),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Icon(Icons.Default.Block, null, tint = Color(0xFF475569), modifier = Modifier.size(40.dp))
                                }
                                Text("No blocked numbers", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                                Text("Swipe left on any lookup result to block a number.", color = Color(0xFF64748B), fontSize = 14.sp)
                            }
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            contentPadding = PaddingValues(bottom = 24.dp),
                        ) {
                            item {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Text(
                                        "${s.numbers.size} blocked number${if (s.numbers.size != 1) "s" else ""}",
                                        color = Color(0xFF64748B),
                                        fontSize = 12.sp,
                                    )
                                    Text(
                                        "Swipe right to unblock",
                                        color = Color(0xFF334155),
                                        fontSize = 11.sp,
                                    )
                                }
                            }
                            items(s.numbers, key = { it.id }) { number ->
                                SwipeToUnblock(
                                    onUnblock = { confirmingUnblock = number },
                                ) {
                                    BlockedNumberCard(
                                        number = number,
                                        isUnblocking = unblockState is UnblockState.Loading,
                                        onUnblock = { confirmingUnblock = number },
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SwipeToUnblock(
    onUnblock: () -> Unit,
    content: @Composable () -> Unit,
) {
    val haptic = LocalHapticFeedback.current
    val dismissState = rememberSwipeToDismissBoxState(
        confirmValueChange = { value ->
            if (value == SwipeToDismissBoxValue.StartToEnd) {
                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                onUnblock()
            }
            false // don't actually dismiss — dialog handles it
        },
        positionalThreshold = { it * 0.35f },
    )

    SwipeToDismissBox(
        state = dismissState,
        enableDismissFromStartToEnd = true,
        enableDismissFromEndToStart = false,
        backgroundContent = {
            val fraction = dismissState.progress
            val bgColor by animateColorAsState(
                targetValue = if (fraction > 0.1f) Color(0xFF22C55E).copy(alpha = (fraction * 2f).coerceIn(0.3f, 1f)) else Color.Transparent,
                animationSpec = tween(100),
                label = "swipe_bg",
            )
            Box(
                Modifier
                    .fillMaxSize()
                    .background(bgColor, MaterialTheme.shapes.large)
                    .padding(horizontal = 20.dp),
                contentAlignment = Alignment.CenterStart,
            ) {
                if (fraction > 0.05f) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Icon(Icons.Default.LockOpen, "Unblock number", tint = Color.White, modifier = Modifier.size(20.dp))
                        Text("Unblock", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        },
    ) {
        content()
    }
}

@Composable
private fun BlockedNumberCard(number: PhoneNumberSummary, isUnblocking: Boolean, onUnblock: () -> Unit) {
    val riskCol = riskColor(number.riskLevel)
    val scoreColor = when {
        number.spamScore >= 70 -> Color(0xFFEF4444)
        number.spamScore >= 40 -> Color(0xFFF97316)
        else -> Color(0xFF22C55E)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Box(
            Modifier.size(44.dp).background(Color(0xFFEF4444).copy(0.15f), MaterialTheme.shapes.medium),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Default.Block, null, tint = Color(0xFFEF4444), modifier = Modifier.size(22.dp))
        }

        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
                formatPhoneDisplay(number.e164Number),
                color = Color.White,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                fontFamily = FontFamily.Monospace,
            )
            number.businessProfile?.businessName?.let {
                Text(it, color = Color(0xFF94A3B8), fontSize = 12.sp)
            }
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Surface(
                    color = riskCol.copy(0.12f),
                    shape = MaterialTheme.shapes.extraSmall,
                ) {
                    Text(
                        number.riskLevel.replace('_', ' '),
                        color = riskCol,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                    )
                }
                Text(
                    "${number.totalReports} report${if (number.totalReports != 1) "s" else ""}",
                    color = Color(0xFF475569),
                    fontSize = 11.sp,
                )
            }
        }

        Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                "${number.spamScore}",
                color = scoreColor,
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
            )
            Text(
                "/100",
                color = Color(0xFF475569),
                fontSize = 10.sp,
            )
            TextButton(
                onClick = onUnblock,
                enabled = !isUnblocking,
                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                colors = ButtonDefaults.textButtonColors(contentColor = Color(0xFF22C55E)),
            ) {
                Text("Unblock", fontSize = 12.sp, fontWeight = FontWeight.Medium)
            }
        }
    }
}

sealed class BlockedState {
    object Loading : BlockedState()
    data class Success(val numbers: List<PhoneNumberSummary>) : BlockedState()
    data class Error(val message: String) : BlockedState()
}

sealed class UnblockState {
    object Idle : UnblockState()
    object Loading : UnblockState()
    object Success : UnblockState()
    data class Error(val message: String) : UnblockState()
}
