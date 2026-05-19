package com.clearring.app.ui.screens

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

data class OnboardingPage(
    val icon: ImageVector,
    val title: String,
    val desc: String,
    val highlights: List<String>,
    val color: Color,
    val gradient: List<Color>,
)

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(onFinish: () -> Unit) {
    val pages = listOf(
        OnboardingPage(
            icon = Icons.Default.Search,
            title = "Instant Lookup",
            desc = "Search any phone number and get a risk score in milliseconds.",
            highlights = listOf("Score 0–100 spam index", "Community reports powered", "Works globally (E.164)"),
            color = Color(0xFF3B82F6),
            gradient = listOf(Color(0xFF1E3A5F), Color(0xFF0F172A)),
        ),
        OnboardingPage(
            icon = Icons.Default.Shield,
            title = "Real-time Screening",
            desc = "ClearRing screens incoming calls before they ring — silently.",
            highlights = listOf("Works in the background", "Known contacts always allowed", "HIGH RISK calls auto-blocked"),
            color = Color(0xFF22C55E),
            gradient = listOf(Color(0xFF14532D), Color(0xFF0F172A)),
        ),
        OnboardingPage(
            icon = Icons.Default.Group,
            title = "Community Intelligence",
            desc = "Every report makes ClearRing smarter for everyone.",
            highlights = listOf("Report fraud, spam, scams", "Recent reports weighted higher", "Protect millions of users"),
            color = Color(0xFF8B5CF6),
            gradient = listOf(Color(0xFF2E1065), Color(0xFF0F172A)),
        ),
        OnboardingPage(
            icon = Icons.Default.Business,
            title = "Business Verification",
            desc = "Verified businesses get a blue badge. Answer with confidence.",
            highlights = listOf("Submit business documents", "Verified within 24–48 hrs", "Call reasons shown to users"),
            color = Color(0xFFEAB308),
            gradient = listOf(Color(0xFF422006), Color(0xFF0F172A)),
        ),
        OnboardingPage(
            icon = Icons.Default.History,
            title = "Your Lookup History",
            desc = "Every number you check is saved locally for quick reference.",
            highlights = listOf("Saved on-device, stays private", "Filter and search past lookups", "Long-press to copy number"),
            color = Color(0xFFF97316),
            gradient = listOf(Color(0xFF431407), Color(0xFF0F172A)),
        ),
    )

    val pagerState = rememberPagerState(pageCount = { pages.size })
    val scope = rememberCoroutineScope()
    val currentColor = pages[pagerState.currentPage].color

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)))),
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            HorizontalPager(state = pagerState, modifier = Modifier.weight(1f)) { page ->
                val p = pages[page]
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Brush.verticalGradient(p.gradient.map { it.copy(alpha = 0.4f) } + listOf(Color.Transparent)))
                        .padding(horizontal = 32.dp, vertical = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                ) {
                    // Icon circle with gradient ring
                    Box(contentAlignment = Alignment.Center) {
                        Box(
                            modifier = Modifier
                                .size(110.dp)
                                .background(
                                    Brush.radialGradient(listOf(p.color.copy(0.2f), Color.Transparent)),
                                    MaterialTheme.shapes.extraLarge,
                                ),
                        )
                        Box(
                            modifier = Modifier
                                .size(96.dp)
                                .background(p.color.copy(alpha = 0.15f), MaterialTheme.shapes.extraLarge),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(p.icon, null, tint = p.color, modifier = Modifier.size(52.dp))
                        }
                    }

                    Spacer(Modifier.height(28.dp))
                    Text(p.title, fontSize = 28.sp, fontWeight = FontWeight.Black, color = Color.White, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(10.dp))
                    Text(p.desc, fontSize = 15.sp, color = Color(0xFF94A3B8), textAlign = TextAlign.Center, lineHeight = 24.sp)

                    Spacer(Modifier.height(24.dp))

                    // Feature highlights
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF0F172A).copy(0.5f), MaterialTheme.shapes.extraLarge)
                            .padding(horizontal = 20.dp, vertical = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        p.highlights.forEach { highlight ->
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Box(
                                    Modifier
                                        .size(6.dp)
                                        .background(p.color, MaterialTheme.shapes.small)
                                )
                                Text(highlight, fontSize = 14.sp, color = Color(0xFFCBD5E1), fontWeight = FontWeight.Medium)
                            }
                        }
                    }
                }
            }

            // Page indicators — animated width pill
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(top = 4.dp, bottom = 12.dp),
            ) {
                repeat(pages.size) { i ->
                    val isActive = pagerState.currentPage == i
                    val dotWidth by animateDpAsState(
                        targetValue = if (isActive) 24.dp else 8.dp,
                        animationSpec = tween(durationMillis = 300),
                        label = "dot_$i",
                    )
                    Box(
                        Modifier
                            .size(dotWidth, 8.dp)
                            .background(
                                if (isActive) currentColor else Color(0xFF334155),
                                MaterialTheme.shapes.small,
                            ),
                    )
                }
            }

            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                TextButton(onClick = onFinish) {
                    Text("Skip", color = Color(0xFF64748B))
                }
                Button(
                    onClick = {
                        if (pagerState.currentPage < pages.lastIndex) {
                            scope.launch { pagerState.animateScrollToPage(pagerState.currentPage + 1) }
                        } else {
                            onFinish()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = currentColor),
                    shape = MaterialTheme.shapes.extraLarge,
                ) {
                    Text(
                        if (pagerState.currentPage == pages.lastIndex) "Get Started" else "Next",
                        fontWeight = FontWeight.Bold,
                    )
                    if (pagerState.currentPage < pages.lastIndex) {
                        Spacer(Modifier.width(4.dp))
                        Icon(Icons.Default.ChevronRight, null, modifier = Modifier.size(16.dp))
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}
