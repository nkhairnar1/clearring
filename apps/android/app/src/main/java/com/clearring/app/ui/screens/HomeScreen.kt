package com.clearring.app.ui.screens

import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateIntAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clearring.app.data.local.LookupEntity
import com.clearring.app.ui.theme.formatPhoneDisplay
import com.clearring.app.ui.theme.riskColor
import com.clearring.app.viewmodel.LookupViewModel
import kotlinx.coroutines.launch

private val GRADIENT = listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A))


@Composable
fun HomeScreen(
    lookupViewModel: LookupViewModel,
    onLookupResult: (String) -> Unit,
    onSettings: () -> Unit,
) {
    var searchText by remember { mutableStateOf("") }
    var searchError by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current
    val clipboardManager = LocalClipboardManager.current
    val searchFocusRequester = remember { FocusRequester() }
    LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(300)
        runCatching { searchFocusRequester.requestFocus() }
    }

    // Network connectivity state
    var isOnline by remember {
        val cm = context.getSystemService(ConnectivityManager::class.java)
        val active = cm?.activeNetwork?.let { cm.getNetworkCapabilities(it) }
        mutableStateOf(active?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true)
    }
    DisposableEffect(Unit) {
        val cm = context.getSystemService(ConnectivityManager::class.java)
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) { isOnline = true }
            override fun onLost(network: Network) { isOnline = false }
        }
        val req = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        cm?.registerNetworkCallback(req, callback)
        onDispose { cm?.unregisterNetworkCallback(callback) }
    }
    val recentLookups by lookupViewModel.persistedLookups.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    var isRefreshing by remember { mutableStateOf(false) }
    var showClearDialog by remember { mutableStateOf(false) }
    var historyFilter by remember { mutableStateOf("") }

    val clipboardText = remember(searchText) {
        if (searchText.isNotEmpty()) null
        else clipboardManager.getText()?.text?.trim()?.takeIf { t ->
            t.length in 7..16 && (t.startsWith("+") || t.all { it.isDigit() || it == ' ' || it == '-' })
        }
    }

    fun doSearch() {
        val raw = searchText.trim()
        if (raw.isBlank()) return
        val digits = raw.filter { it.isDigit() }
        val hasPlus = raw.startsWith("+")
        val isValid = digits.length in 7..15 && (hasPlus || raw.all { it.isDigit() || it == ' ' || it == '-' })
        if (!isValid) {
            searchError = "Enter a valid phone number (7–15 digits)"
            return
        }
        searchError = null
        lookupViewModel.lookup(raw)
        onLookupResult(raw)
        focusManager.clearFocus()
    }

    // Clear history dialog
    if (showClearDialog) {
        AlertDialog(
            onDismissRequest = { showClearDialog = false },
            title = { Text("Clear history?") },
            text = { Text("This will remove all recent lookups from your device.") },
            confirmButton = {
                TextButton(onClick = {
                    lookupViewModel.clearHistory()
                    showClearDialog = false
                }) { Text("Clear", color = Color(0xFFEF4444)) }
            },
            dismissButton = {
                TextButton(onClick = { showClearDialog = false }) { Text("Cancel") }
            },
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(GRADIENT)),
    ) {
        Scaffold(
            containerColor = Color.Transparent,
            contentWindowInsets = WindowInsets(0),
            snackbarHost = {
                SnackbarHost(snackbarHostState) { data ->
                    Snackbar(
                        snackbarData = data,
                        containerColor = Color(0xFF334155),
                        contentColor = Color.White,
                        shape = MaterialTheme.shapes.large,
                    )
                }
            },
        ) { _ ->
            val filteredLookups = remember(recentLookups, historyFilter) {
                if (historyFilter.isBlank()) recentLookups
                else recentLookups.filter { e ->
                    e.e164Number.contains(historyFilter, ignoreCase = true) ||
                    e.riskLevel.replace("_", " ").contains(historyFilter, ignoreCase = true) ||
                    (e.businessName?.contains(historyFilter, ignoreCase = true) == true) ||
                    (e.contactName?.contains(historyFilter, ignoreCase = true) == true)
                }
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 32.dp),
            ) {
                // Top bar
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .statusBarsPadding()
                            .padding(horizontal = 20.dp, vertical = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(
                                Modifier
                                    .size(38.dp)
                                    .background(Brush.linearGradient(listOf(Color(0xFF3B82F6), Color(0xFF8B5CF6))), MaterialTheme.shapes.medium),
                                contentAlignment = Alignment.Center,
                            ) {
                                Icon(Icons.Default.Shield, null, tint = Color.White, modifier = Modifier.size(22.dp))
                            }
                            Text("ClearRing", fontSize = 22.sp, fontWeight = FontWeight.Black, color = Color.White)
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            if (recentLookups.isNotEmpty()) {
                                IconButton(onClick = { showClearDialog = true }) {
                                    Icon(Icons.Default.DeleteOutline, "Clear history", tint = Color(0xFF64748B), modifier = Modifier.size(20.dp))
                                }
                            }
                            IconButton(onClick = onSettings) {
                                Icon(Icons.Default.Settings, "Open settings", tint = Color(0xFF94A3B8))
                            }
                        }
                    }
                }

                // Search bar
                item {
                    OutlinedTextField(
                        value = searchText,
                        onValueChange = { searchText = it; searchError = null },
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp).focusRequester(searchFocusRequester),
                        placeholder = { Text("Search any number, e.g. +91 98765…") },
                        isError = searchError != null,
                        supportingText = searchError?.let { { Text(it, color = Color(0xFFEF4444), fontSize = 12.sp) } },
                        leadingIcon = { Icon(Icons.Default.Search, null) },
                        trailingIcon = {
                            when {
                                searchText.isNotEmpty() ->
                                    IconButton(onClick = { searchText = "" }) {
                                        Icon(Icons.Default.Close, "Clear search", tint = Color(0xFF64748B))
                                    }
                                clipboardText != null ->
                                    IconButton(onClick = { searchText = clipboardText }) {
                                        Icon(Icons.Default.ContentPaste, "Paste", tint = Color(0xFF3B82F6))
                                    }
                            }
                        },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone, imeAction = ImeAction.Search),
                        keyboardActions = KeyboardActions(onSearch = { doSearch() }),
                        singleLine = true,
                        shape = MaterialTheme.shapes.extraLarge,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF3B82F6),
                            unfocusedBorderColor = Color(0xFF1E293B),
                            errorBorderColor = Color(0xFFEF4444),
                            focusedContainerColor = Color(0xFF1E293B),
                            unfocusedContainerColor = Color(0xFF1E293B),
                            errorContainerColor = Color(0xFF1E293B),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            errorTextColor = Color.White,
                            focusedPlaceholderColor = Color(0xFF475569),
                            unfocusedPlaceholderColor = Color(0xFF475569),
                        ),
                    )
                }

                // Offline banner
                item {
                    AnimatedVisibility(
                        visible = !isOnline,
                        enter = expandVertically() + fadeIn(),
                        exit = shrinkVertically() + fadeOut(),
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp, vertical = 4.dp)
                                .background(Color(0xFF78350F).copy(0.8f), MaterialTheme.shapes.large)
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(Icons.Default.WifiOff, null, tint = Color(0xFFFBBF24), modifier = Modifier.size(16.dp))
                            Text("No internet connection — results may be unavailable", color = Color(0xFFFDE68A), fontSize = 12.sp)
                        }
                    }
                }

                // Lookup button
                if (searchText.isNotEmpty()) {
                    item {
                        Spacer(Modifier.height(8.dp))
                        Button(
                            onClick = { doSearch() },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp)
                                .height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                            shape = MaterialTheme.shapes.extraLarge,
                        ) {
                            Icon(Icons.Default.Search, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Lookup", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        }
                    }
                }

                item { Spacer(Modifier.height(24.dp)) }

                // Quick stats
                item {
                    val spamFlagged = recentLookups.count { it.riskLevel in listOf("HIGH_RISK", "LIKELY_SPAM", "CAUTION") }
                    val verified = recentLookups.count { it.isVerified }
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        StatCard(recentLookups.size, "Looked Up", Color(0xFF3B82F6), Modifier.weight(1f))
                        StatCard(spamFlagged, "Spam Found", Color(0xFFEF4444), Modifier.weight(1f))
                        StatCard(verified, "Verified", Color(0xFF22C55E), Modifier.weight(1f))
                    }
                }

                item { Spacer(Modifier.height(24.dp)) }

                // Section header
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            "RECENT LOOKUPS",
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF64748B),
                            fontSize = 11.sp,
                            letterSpacing = 1.sp,
                        )
                        if (recentLookups.isNotEmpty()) {
                            Text(
                                "${recentLookups.size} total",
                                color = Color(0xFF475569),
                                fontSize = 11.sp,
                            )
                        }
                    }
                    Spacer(Modifier.height(6.dp))
                    // History filter bar (only shown when there are entries)
                    if (recentLookups.isNotEmpty()) {
                        OutlinedTextField(
                            value = historyFilter,
                            onValueChange = { historyFilter = it },
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp).height(48.dp),
                            placeholder = { Text("Filter history…", fontSize = 13.sp) },
                            leadingIcon = { Icon(Icons.Default.FilterList, null, modifier = Modifier.size(18.dp)) },
                            trailingIcon = if (historyFilter.isNotEmpty()) {
                                { IconButton(onClick = { historyFilter = "" }) { Icon(Icons.Default.Close, null, modifier = Modifier.size(16.dp)) } }
                            } else null,
                            singleLine = true,
                            shape = MaterialTheme.shapes.extraLarge,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF3B82F6),
                                unfocusedBorderColor = Color(0xFF1E293B),
                                focusedContainerColor = Color(0xFF162032),
                                unfocusedContainerColor = Color(0xFF162032),
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedPlaceholderColor = Color(0xFF334155),
                                unfocusedPlaceholderColor = Color(0xFF334155),
                            ),
                            textStyle = androidx.compose.ui.text.TextStyle(fontSize = 13.sp),
                        )
                        Spacer(Modifier.height(6.dp))
                    }
                }

                // Empty state
                if (recentLookups.isEmpty()) {
                    item {
                        Column(
                            Modifier
                                .fillMaxWidth()
                                .padding(vertical = 40.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            Box(
                                Modifier
                                    .size(64.dp)
                                    .background(Color(0xFF1E293B), MaterialTheme.shapes.extraLarge),
                                contentAlignment = Alignment.Center,
                            ) {
                                Icon(Icons.Default.Search, null, tint = Color(0xFF334155), modifier = Modifier.size(32.dp))
                            }
                            Text("No recent lookups", color = Color(0xFF475569), fontSize = 15.sp, fontWeight = FontWeight.Medium)
                            Text("Search a number above to get started", color = Color(0xFF334155), fontSize = 13.sp, textAlign = TextAlign.Center)
                        }
                    }
                } else if (filteredLookups.isEmpty()) {
                    item {
                        Column(
                            Modifier
                                .fillMaxWidth()
                                .padding(vertical = 32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Icon(Icons.Default.SearchOff, null, tint = Color(0xFF334155), modifier = Modifier.size(36.dp))
                            Text("No matches for \"$historyFilter\"", color = Color(0xFF475569), fontSize = 14.sp)
                        }
                    }
                } else {
                    items(filteredLookups, key = { it.e164Number }) { entity ->
                        RecentLookupRow(
                            entity = entity,
                            onClick = { onLookupResult(entity.e164Number) },
                            onLongClick = {
                                clipboardManager.setText(AnnotatedString(entity.e164Number))
                                scope.launch { snackbarHostState.showSnackbar("Copied ${formatPhoneDisplay(entity.e164Number)}") }
                            },
                            modifier = Modifier.padding(horizontal = 20.dp),
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun RecentLookupRow(
    entity: LookupEntity,
    onClick: () -> Unit,
    onLongClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val riskCol = riskColor(entity.riskLevel)
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
            .combinedClickable(onClick = onClick, onLongClick = onLongClick)
            .padding(horizontal = 16.dp, vertical = 13.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Risk dot
        Box(
            Modifier
                .size(8.dp)
                .background(riskCol, MaterialTheme.shapes.small),
        )
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    formatPhoneDisplay(entity.e164Number),
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 15.sp,
                )
                if (entity.isKnownContact) {
                    Icon(Icons.Default.Person, null, tint = Color(0xFF22C55E), modifier = Modifier.size(13.dp))
                }
                if (entity.isVerified) {
                    Icon(Icons.Default.Verified, null, tint = Color(0xFF3B82F6), modifier = Modifier.size(13.dp))
                }
            }
            entity.businessName?.let { Text(it, fontSize = 13.sp, color = Color(0xFF94A3B8)) }
            entity.contactName?.let { Text(it, fontSize = 12.sp, color = Color(0xFF22C55E), fontWeight = FontWeight.Medium) }
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(
                entity.riskLevel.replace("_", " "),
                fontWeight = FontWeight.Bold,
                color = riskCol,
                fontSize = 12.sp,
            )
            Text("${entity.spamScore}/100", fontSize = 11.sp, color = Color(0xFF64748B))
        }
    }
}

@Composable
private fun StatCard(target: Int, label: String, color: Color, modifier: Modifier = Modifier) {
    val animated by animateIntAsState(
        targetValue = target,
        animationSpec = tween(durationMillis = 600),
        label = "stat_$label",
    )
    Column(
        modifier = modifier
            .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(animated.toString(), fontSize = 26.sp, fontWeight = FontWeight.Black, color = color)
        Text(label, fontSize = 11.sp, color = Color(0xFF64748B), textAlign = TextAlign.Center, fontWeight = FontWeight.Medium)
    }
}
