package com.clearring.app.ui

import androidx.compose.runtime.Composable
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.clearring.app.ui.screens.*
import com.clearring.app.ui.theme.AppTheme
import com.clearring.app.viewmodel.AuthViewModel
import com.clearring.app.viewmodel.LookupViewModel

object Routes {
    const val SPLASH = "splash"
    const val ONBOARDING = "onboarding"
    const val LOGIN = "login"
    const val COMPLETE_PROFILE = "complete_profile"
    const val PERMISSIONS = "permissions"
    const val HOME = "home"
    const val LOOKUP_RESULT = "lookup_result/{number}"
    const val REPORT = "report/{number}"
    const val INCOMING_CALL = "incoming_call/{number}"
    const val BUSINESS_CLAIM = "business_claim"
    const val SETTINGS = "settings"
    const val THEME_PREVIEW = "theme_preview"
    const val BLOCKED_NUMBERS = "blocked_numbers"
    const val MY_REPORTS = "my_reports"
    const val CALL_SCREENING_SETUP = "call_screening_setup"
}

@Composable
fun ClearRingNavGraph(currentTheme: AppTheme, onThemeChange: (AppTheme) -> Unit) {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = hiltViewModel()
    val lookupViewModel: LookupViewModel = hiltViewModel()

    NavHost(navController = navController, startDestination = Routes.SPLASH) {
        composable(Routes.SPLASH) {
            SplashScreen(
                authViewModel = authViewModel,
                onAuthenticated = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.SPLASH) { inclusive = true }
                    }
                },
                onUnauthenticated = {
                    navController.navigate(Routes.ONBOARDING) {
                        popUpTo(Routes.SPLASH) { inclusive = true }
                    }
                }
            )
        }
        composable(Routes.ONBOARDING) {
            OnboardingScreen(onFinish = {
                navController.navigate(Routes.LOGIN) {
                    popUpTo(Routes.ONBOARDING) { inclusive = true }
                }
            })
        }
        composable(Routes.LOGIN) {
            PhoneLoginScreen(
                authViewModel = authViewModel,
                onAuthenticated = {
                    navController.navigate(Routes.PERMISSIONS) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onNeedsPhone = {
                    navController.navigate(Routes.COMPLETE_PROFILE) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
            )
        }
        composable(Routes.COMPLETE_PROFILE) {
            CompleteProfileScreen(
                authViewModel = authViewModel,
                onComplete = {
                    navController.navigate(Routes.PERMISSIONS) {
                        popUpTo(Routes.COMPLETE_PROFILE) { inclusive = true }
                    }
                }
            )
        }
        composable(Routes.PERMISSIONS) {
            PermissionEducationScreen(
                onContinue = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.PERMISSIONS) { inclusive = true }
                    }
                }
            )
        }
        composable(Routes.HOME) {
            HomeScreen(
                lookupViewModel = lookupViewModel,
                onLookupResult = { number ->
                    navController.navigate("lookup_result/$number")
                },
                onSettings = { navController.navigate(Routes.SETTINGS) }
            )
        }
        composable(
            Routes.LOOKUP_RESULT,
            arguments = listOf(navArgument("number") { type = NavType.StringType })
        ) { backStack ->
            val number = backStack.arguments?.getString("number") ?: ""
            LookupResultScreen(
                number = number,
                lookupViewModel = lookupViewModel,
                onReport = { navController.navigate("report/$number") },
                onBack = { navController.popBackStack() }
            )
        }
        composable(
            Routes.REPORT,
            arguments = listOf(navArgument("number") { type = NavType.StringType })
        ) { backStack ->
            val number = backStack.arguments?.getString("number") ?: ""
            ReportNumberScreen(
                number = number,
                lookupViewModel = lookupViewModel,
                onBack = { navController.popBackStack() }
            )
        }
        composable(Routes.INCOMING_CALL) {
            IncomingCallScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.BUSINESS_CLAIM) {
            BusinessClaimScreen(lookupViewModel = lookupViewModel, onBack = { navController.popBackStack() })
        }
        composable(Routes.SETTINGS) {
            SettingsScreen(
                currentTheme = currentTheme,
                authViewModel = authViewModel,
                onThemeChange = onThemeChange,
                onThemePreview = { navController.navigate(Routes.THEME_PREVIEW) },
                onBlockedNumbers = { navController.navigate(Routes.BLOCKED_NUMBERS) },
                onMyReports = { navController.navigate(Routes.MY_REPORTS) },
                onBusinessClaims = { navController.navigate(Routes.BUSINESS_CLAIM) },
                onCallScreeningSetup = { navController.navigate(Routes.CALL_SCREENING_SETUP) },
                onLogout = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }
        composable(Routes.BLOCKED_NUMBERS) {
            BlockedNumbersScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.MY_REPORTS) {
            MyReportsScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.CALL_SCREENING_SETUP) {
            IncomingCallScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.THEME_PREVIEW) {
            ThemePreviewScreen(
                currentTheme = currentTheme,
                onThemeChange = onThemeChange,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
