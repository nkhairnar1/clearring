package com.clearring.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.datastore.preferences.core.edit
import com.clearring.app.data.api.SERVER_URL_KEY
import com.clearring.app.data.api.dataStore
import com.clearring.app.viewmodel.AuthUiState
import com.clearring.app.viewmodel.AuthViewModel
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

@Composable
fun PhoneLoginScreen(
    authViewModel: AuthViewModel,
    onAuthenticated: () -> Unit,
    onNeedsPhone: () -> Unit = {},
) {
    val uiState by authViewModel.uiState.collectAsState()
    var email by remember { mutableStateOf("") }
    var otp by remember { mutableStateOf("") }
    var step by remember { mutableStateOf<LoginStep>(LoginStep.Phone) }
    var resendCountdown by remember { mutableStateOf(0) }
    var showServerUrl by remember { mutableStateOf(false) }
    var serverUrlInput by remember { mutableStateOf("") }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        val saved = context.dataStore.data.firstOrNull()?.get(SERVER_URL_KEY) ?: ""
        serverUrlInput = saved
    }

    LaunchedEffect(step) {
        if (step == LoginStep.Otp) {
            resendCountdown = 60
            while (resendCountdown > 0) {
                kotlinx.coroutines.delay(1000)
                resendCountdown--
            }
        }
    }

    LaunchedEffect(uiState) {
        val state = uiState
        when (state) {
            is AuthUiState.OtpSent -> {
                step = LoginStep.Otp
                state.devOtp?.let { otp = it }
            }
            is AuthUiState.NeedsPhone -> onNeedsPhone()
            is AuthUiState.Authenticated -> onAuthenticated()
            else -> {}
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)))),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(
                modifier = Modifier.size(72.dp)
                    .background(Brush.linearGradient(listOf(Color(0xFF3B82F6), Color(0xFF8B5CF6))), MaterialTheme.shapes.extraLarge),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Default.Shield, null, tint = Color.White, modifier = Modifier.size(40.dp))
            }

            Spacer(Modifier.height(24.dp))
            Text("ClearRing", fontSize = 38.sp, fontWeight = FontWeight.Black, color = Color.White)
            Spacer(Modifier.height(6.dp))
            Text(
                if (step == LoginStep.Phone) "Sign in to continue" else "Check your email",
                fontSize = 16.sp, color = Color(0xFF94A3B8),
            )
            Spacer(Modifier.height(40.dp))

            // Server URL row — tap gear to expand
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (showServerUrl) {
                    OutlinedTextField(
                        value = serverUrlInput,
                        onValueChange = { serverUrlInput = it },
                        modifier = Modifier.weight(1f).padding(end = 8.dp),
                        label = { Text("Server URL", fontSize = 11.sp) },
                        placeholder = { Text("http://192.168.x.x:3010/api", fontSize = 11.sp) },
                        singleLine = true,
                        textStyle = LocalTextStyle.current.copy(fontSize = 12.sp, color = Color.White),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri, imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(onDone = {
                            scope.launch {
                                context.dataStore.edit { it[SERVER_URL_KEY] = serverUrlInput.trim() }
                                showServerUrl = false
                            }
                        }),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF475569),
                            unfocusedBorderColor = Color(0xFF334155),
                            focusedLabelColor = Color(0xFF64748B),
                        ),
                    )
                    TextButton(onClick = {
                        scope.launch {
                            context.dataStore.edit { it[SERVER_URL_KEY] = serverUrlInput.trim() }
                            showServerUrl = false
                        }
                    }) {
                        Text("Save", color = Color(0xFF3B82F6), fontSize = 13.sp)
                    }
                } else {
                    IconButton(onClick = { showServerUrl = true }) {
                        Icon(Icons.Default.Settings, null, tint = Color(0xFF334155), modifier = Modifier.size(18.dp))
                    }
                }
            }

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = MaterialTheme.shapes.extraLarge,
            ) {
                Column(modifier = Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    when (step) {
                        LoginStep.Phone -> {
                            Text("Enter your email", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Text(
                                "We'll send a one-time code to verify it's you.",
                                fontSize = 14.sp, color = Color(0xFF64748B),
                            )
                            OutlinedTextField(
                                value = email,
                                onValueChange = { email = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Email Address") },
                                placeholder = { Text("you@example.com") },
                                leadingIcon = { Icon(Icons.Default.Email, null) },
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.Email,
                                    imeAction = ImeAction.Done,
                                ),
                                keyboardActions = KeyboardActions(onDone = {
                                    if (email.isNotBlank()) authViewModel.sendOtp(email)
                                }),
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Color(0xFF3B82F6),
                                    focusedLabelColor = Color(0xFF3B82F6),
                                ),
                            )
                            Button(
                                onClick = { authViewModel.sendOtp(email) },
                                modifier = Modifier.fillMaxWidth().height(52.dp),
                                enabled = email.isNotBlank() && uiState !is AuthUiState.Loading,
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                            ) {
                                if (uiState is AuthUiState.Loading) {
                                    CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                                } else {
                                    Text("Send OTP", fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }

                        LoginStep.Otp -> {
                            Text("Enter OTP", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Text("Sent to $email", fontSize = 14.sp, color = Color(0xFF64748B))

                            OtpBoxInput(
                                otp = otp,
                                onOtpChange = { otp = it },
                                isError = uiState is AuthUiState.Error,
                            )

                            Button(
                                onClick = { authViewModel.verifyOtp(email, otp) },
                                modifier = Modifier.fillMaxWidth().height(52.dp),
                                enabled = otp.length == 6 && uiState !is AuthUiState.Loading,
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                            ) {
                                if (uiState is AuthUiState.Loading) {
                                    CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                                } else {
                                    Text("Verify & Continue", fontWeight = FontWeight.SemiBold)
                                }
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                TextButton(
                                    onClick = { step = LoginStep.Phone; otp = ""; authViewModel.reset() },
                                ) {
                                    Text("← Change email", color = Color(0xFF64748B), fontSize = 13.sp)
                                }
                                TextButton(
                                    onClick = {
                                        if (resendCountdown == 0) {
                                            authViewModel.sendOtp(email)
                                            otp = ""
                                        }
                                    },
                                    enabled = resendCountdown == 0,
                                ) {
                                    Text(
                                        if (resendCountdown > 0) "Resend in ${resendCountdown}s" else "Resend OTP",
                                        color = if (resendCountdown > 0) Color(0xFF475569) else Color(0xFF3B82F6),
                                        fontSize = 13.sp,
                                    )
                                }
                            }
                        }
                    }

                    if (uiState is AuthUiState.Error) {
                        Row(
                            modifier = Modifier.fillMaxWidth()
                                .background(Color(0xFFEF4444).copy(0.1f), MaterialTheme.shapes.medium)
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text("⚠", fontSize = 14.sp, color = Color(0xFFEF4444))
                            Text(
                                (uiState as AuthUiState.Error).message,
                                color = Color(0xFFEF4444),
                                fontSize = 13.sp,
                            )
                        }
                    }
                }
            }
        }

    }
}

@Composable
private fun OtpBoxInput(
    otp: String,
    onOtpChange: (String) -> Unit,
    isError: Boolean = false,
) {
    val focusRequester = remember { FocusRequester() }
    LaunchedEffect(Unit) { focusRequester.requestFocus() }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { focusRequester.requestFocus() },
    ) {
        // Invisible input field — receives actual keypresses
        BasicTextField(
            value = otp,
            onValueChange = { v ->
                val filtered = v.filter { it.isDigit() }.take(6)
                onOtpChange(filtered)
            },
            modifier = Modifier
                .matchParentSize()
                .alpha(0.01f)
                .focusRequester(focusRequester),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.NumberPassword,
                imeAction = ImeAction.Done,
            ),
            keyboardActions = KeyboardActions(onDone = {}),
            cursorBrush = SolidColor(Color.Transparent),
            textStyle = TextStyle(color = Color.Transparent),
        )

        // Visual 6-box row (pointer-events pass through to the BasicTextField below)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            repeat(6) { i ->
                val char = otp.getOrElse(i) { ' ' }.let { if (it == ' ') "" else it.toString() }
                val isCurrent = i == otp.length
                val boxColor = when {
                    isError -> Color(0xFFEF4444)
                    isCurrent -> Color(0xFF3B82F6)
                    char.isNotEmpty() -> Color(0xFF475569)
                    else -> Color(0xFF334155)
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .aspectRatio(0.85f)
                        .background(Color(0xFF0F172A), MaterialTheme.shapes.medium)
                        .border(
                            width = if (isCurrent) 2.dp else 1.dp,
                            color = boxColor,
                            shape = MaterialTheme.shapes.medium,
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    if (char.isNotEmpty()) {
                        Text(
                            char,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            textAlign = TextAlign.Center,
                        )
                    } else if (isCurrent) {
                        Box(
                            Modifier
                                .width(2.dp)
                                .height(28.dp)
                                .background(Color(0xFF3B82F6)),
                        )
                    }
                }
            }
        }
    }
}

sealed class LoginStep { object Phone : LoginStep(); object Otp : LoginStep() }
