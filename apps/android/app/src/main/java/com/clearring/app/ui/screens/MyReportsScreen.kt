package com.clearring.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.clearring.app.data.model.MyReport
import com.clearring.app.viewmodel.MyReportsViewModel

private val STATUS_FILTERS = listOf("ALL", "PENDING", "APPROVED", "REJECTED")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyReportsScreen(onBack: () -> Unit) {
    val viewModel: MyReportsViewModel = hiltViewModel()
    val state by viewModel.state.collectAsState()
    var statusFilter by remember { mutableStateOf("ALL") }
    var isRefreshing by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { viewModel.load() }
    LaunchedEffect(state) { if (state !is MyReportsState.Loading) isRefreshing = false }

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
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Go back", tint = Color.White) }
                Text("My Reports", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 18.sp)
                Spacer(Modifier.weight(1f))
                if (state is MyReportsState.Success) {
                    IconButton(onClick = { viewModel.load() }) {
                        Icon(Icons.Default.Refresh, "Refresh reports", tint = Color(0xFF64748B), modifier = Modifier.size(20.dp))
                    }
                }
            }

            // Filter chips
            if (state is MyReportsState.Success) {
                androidx.compose.foundation.lazy.LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(bottom = 8.dp),
                ) {
                    items(STATUS_FILTERS) { filter ->
                        val selected = statusFilter == filter
                        val chipColor = when (filter) {
                            "PENDING" -> Color(0xFFF97316)
                            "APPROVED" -> Color(0xFF22C55E)
                            "REJECTED" -> Color(0xFFEF4444)
                            else -> Color(0xFF3B82F6)
                        }
                        FilterChip(
                            selected = selected,
                            onClick = { statusFilter = filter },
                            label = { Text(filter, fontSize = 12.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = chipColor.copy(0.2f),
                                selectedLabelColor = chipColor,
                                containerColor = Color(0xFF1E293B),
                                labelColor = Color(0xFF64748B),
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = selected,
                                selectedBorderColor = chipColor.copy(0.5f),
                                borderColor = Color(0xFF334155),
                            ),
                        )
                    }
                }
            }

            PullToRefreshBox(
                isRefreshing = isRefreshing,
                onRefresh = { isRefreshing = true; viewModel.load() },
                modifier = Modifier.fillMaxSize(),
            ) {
            when (val s = state) {
                is MyReportsState.Loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF8B5CF6))
                }
                is MyReportsState.Error -> Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Icon(Icons.Default.ErrorOutline, null, tint = Color(0xFFEF4444), modifier = Modifier.size(48.dp))
                        Text(s.message, color = Color(0xFF94A3B8), fontSize = 14.sp)
                        Button(onClick = { viewModel.load() }) { Text("Retry") }
                    }
                }
                is MyReportsState.Success -> {
                    val filtered = if (statusFilter == "ALL") s.reports else s.reports.filter { it.status == statusFilter }
                    if (filtered.isEmpty()) {
                        Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                Icon(Icons.Default.Report, null, tint = Color(0xFF475569), modifier = Modifier.size(56.dp))
                                Text(if (statusFilter == "ALL") "No reports yet" else "No $statusFilter reports", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 18.sp)
                                if (statusFilter == "ALL") Text("Numbers you report will appear here.", color = Color(0xFF64748B), fontSize = 14.sp)
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
                                    Text("${filtered.size} of ${s.total} report${if (s.total != 1) "s" else ""}", color = Color(0xFF64748B), fontSize = 12.sp)
                                    if (s.totalPages > 1) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            IconButton(onClick = { viewModel.loadPage(s.page - 1) }, enabled = s.page > 1, modifier = Modifier.size(32.dp)) {
                                                Icon(Icons.Default.ChevronLeft, "Previous page", tint = if (s.page > 1) Color.White else Color(0xFF475569), modifier = Modifier.size(18.dp))
                                            }
                                            Text("${s.page}/${s.totalPages}", color = Color(0xFF94A3B8), fontSize = 12.sp)
                                            IconButton(onClick = { viewModel.loadPage(s.page + 1) }, enabled = s.page < s.totalPages, modifier = Modifier.size(32.dp)) {
                                                Icon(Icons.Default.ChevronRight, "Next page", tint = if (s.page < s.totalPages) Color.White else Color(0xFF475569), modifier = Modifier.size(18.dp))
                                            }
                                        }
                                    }
                                }
                            }
                            items(filtered) { report -> MyReportCard(report) }
                        }
                    }
                }
            }
            } // end PullToRefreshBox
        }
    }
}

@Composable
private fun MyReportCard(report: MyReport) {
    val statusColor = when (report.status) {
        "APPROVED" -> Color(0xFF22C55E)
        "REJECTED" -> Color(0xFFEF4444)
        "PENDING" -> Color(0xFFF97316)
        else -> Color(0xFF94A3B8)
    }
    val typeLabel = report.reportType.replace('_', ' ').lowercase().replaceFirstChar { it.uppercase() }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
                Modifier.size(36.dp).background(Color(0xFFF97316).copy(0.15f), MaterialTheme.shapes.medium),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Default.Report, null, tint = Color(0xFFF97316), modifier = Modifier.size(18.dp))
            }
            Column(Modifier.weight(1f)) {
                Text(
                    report.phoneNumber?.e164Number ?: "Unknown number",
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                )
                Text(typeLabel, color = Color(0xFF94A3B8), fontSize = 12.sp)
            }
            Surface(
                color = statusColor.copy(0.15f),
                shape = MaterialTheme.shapes.small,
            ) {
                Text(
                    report.status,
                    color = statusColor,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                )
            }
        }
        report.notes?.takeIf { it.isNotBlank() }?.let { notes ->
            Text(
                "\"$notes\"",
                color = Color(0xFF64748B),
                fontSize = 13.sp,
                modifier = Modifier.padding(start = 44.dp),
            )
        }
        Text(
            formatDate(report.createdAt),
            color = Color(0xFF475569),
            fontSize = 11.sp,
            modifier = Modifier.padding(start = 44.dp),
        )
    }
}

private fun formatDate(iso: String): String {
    return try {
        val parts = iso.substringBefore('T').split('-')
        "${parts[2]}/${parts[1]}/${parts[0]}"
    } catch (_: Exception) {
        iso
    }
}

sealed class MyReportsState {
    object Loading : MyReportsState()
    data class Success(
        val reports: List<MyReport>,
        val total: Int,
        val page: Int,
        val totalPages: Int,
    ) : MyReportsState()
    data class Error(val message: String) : MyReportsState()
}
