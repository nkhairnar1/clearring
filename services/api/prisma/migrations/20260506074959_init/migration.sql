-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'BUSINESS_OWNER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('SAFE', 'LOW_RISK', 'CAUTION', 'LIKELY_SPAM', 'HIGH_RISK');

-- CreateEnum
CREATE TYPE "CallerCategory" AS ENUM ('PERSONAL', 'BUSINESS', 'DELIVERY', 'BANK', 'PAYMENT_UPI', 'LOAN_FINANCE', 'INSURANCE', 'CREDIT_CARD_SALES', 'TELEMARKETING', 'REAL_ESTATE', 'JOB_RECRUITMENT', 'SCHOOL_EDUCATION', 'HOSPITAL_CLINIC', 'GOVERNMENT', 'UTILITY_SERVICES', 'COURIER', 'CAB_RIDE_SHARING', 'ECOMMERCE', 'POLITICAL_CAMPAIGN', 'SURVEY', 'FRAUD', 'SCAM', 'HARASSMENT', 'SPAM', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('SPAM', 'FRAUD', 'SCAM', 'HARASSMENT', 'TELEMARKETING', 'ROBOCALL', 'SILENT_CALL', 'FAKE_BANK', 'OTP_SCAM', 'PAYMENT_SCAM', 'JOB_SCAM', 'SAFE', 'WRONG_NUMBER');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('NONE', 'COMMUNITY', 'DOCUMENT', 'ADMIN', 'OFFICIAL');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('COMMUNITY', 'ADMIN', 'OFFICIAL', 'BUSINESS_CLAIM', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AdminOverrideStatus" AS ENUM ('NONE', 'CONFIRMED_FRAUD', 'VERIFIED_SAFE', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BusinessVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('WRONG_LABEL', 'WRONG_CATEGORY', 'PERSONAL_NUMBER', 'BUSINESS_NUMBER', 'OTHER');

-- CreateEnum
CREATE TYPE "AppTheme" AS ENUM ('CRYSTAL_GLASS', 'MIDNIGHT_TRUST', 'CLEAN_LIGHT', 'HIGH_CONTRAST', 'TRUE_SIGNAL');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('ANDROID', 'WEB', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "country_code" TEXT NOT NULL DEFAULT 'IN',
    "name" TEXT,
    "email" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "trust_score" INTEGER NOT NULL DEFAULT 50,
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" "AppTheme" NOT NULL DEFAULT 'CRYSTAL_GLASS',
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'IN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_by_admin_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_numbers" (
    "id" TEXT NOT NULL,
    "e164_number" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "national_number" TEXT NOT NULL,
    "display_label" TEXT,
    "category" "CallerCategory" NOT NULL DEFAULT 'UNKNOWN',
    "spam_score" INTEGER NOT NULL DEFAULT 10,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'SAFE',
    "confidence_score" INTEGER NOT NULL DEFAULT 50,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_type" "VerificationType" NOT NULL DEFAULT 'NONE',
    "source_type" "SourceType" NOT NULL DEFAULT 'UNKNOWN',
    "source_reference" TEXT,
    "total_reports" INTEGER NOT NULL DEFAULT 0,
    "spam_reports" INTEGER NOT NULL DEFAULT 0,
    "fraud_reports" INTEGER NOT NULL DEFAULT 0,
    "scam_reports" INTEGER NOT NULL DEFAULT 0,
    "safe_reports" INTEGER NOT NULL DEFAULT 0,
    "last_reported_at" TIMESTAMP(3),
    "admin_override_status" "AdminOverrideStatus" NOT NULL DEFAULT 'NONE',
    "dispute_status" "DisputeStatus" NOT NULL DEFAULT 'NONE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "number_reports" (
    "id" TEXT NOT NULL,
    "phone_number_id" TEXT NOT NULL,
    "reported_by_user_id" TEXT NOT NULL,
    "approved_by_user_id" TEXT,
    "report_type" "ReportType" NOT NULL,
    "label_suggestion" TEXT,
    "business_name_suggestion" TEXT,
    "notes" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "language" TEXT DEFAULT 'en',
    "money_requested" BOOLEAN NOT NULL DEFAULT false,
    "otp_requested" BOOLEAN NOT NULL DEFAULT false,
    "payment_link_requested" BOOLEAN NOT NULL DEFAULT false,
    "threat_used" BOOLEAN NOT NULL DEFAULT false,
    "report_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "number_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_profiles" (
    "id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "phone_number_id" TEXT NOT NULL,
    "category" "CallerCategory" NOT NULL DEFAULT 'BUSINESS',
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "logo_url" TEXT,
    "verification_status" "BusinessVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verification_document_url" TEXT,
    "claimed_by_user_id" TEXT NOT NULL,
    "approved_by_admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_reasons" (
    "id" TEXT NOT NULL,
    "business_profile_id" TEXT NOT NULL,
    "reason_title" TEXT NOT NULL,
    "reason_description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_numbers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone_number_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "phone_number_id" TEXT NOT NULL,
    "submitted_by_user_id" TEXT NOT NULL,
    "reviewed_by_admin_id" TEXT,
    "dispute_type" "DisputeType" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lookup_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "phone_number_id" TEXT,
    "lookup_type" TEXT NOT NULL DEFAULT 'MANUAL',
    "raw_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lookup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "country" TEXT,
    "source" TEXT DEFAULT 'website',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme_name" "AppTheme" NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'ANDROID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "phone_numbers_e164_number_key" ON "phone_numbers"("e164_number");

-- CreateIndex
CREATE INDEX "phone_numbers_country_code_idx" ON "phone_numbers"("country_code");

-- CreateIndex
CREATE INDEX "phone_numbers_spam_score_idx" ON "phone_numbers"("spam_score");

-- CreateIndex
CREATE INDEX "phone_numbers_risk_level_idx" ON "phone_numbers"("risk_level");

-- CreateIndex
CREATE INDEX "phone_numbers_category_idx" ON "phone_numbers"("category");

-- CreateIndex
CREATE INDEX "phone_numbers_is_verified_idx" ON "phone_numbers"("is_verified");

-- CreateIndex
CREATE INDEX "number_reports_phone_number_id_idx" ON "number_reports"("phone_number_id");

-- CreateIndex
CREATE INDEX "number_reports_reported_by_user_id_idx" ON "number_reports"("reported_by_user_id");

-- CreateIndex
CREATE INDEX "number_reports_status_idx" ON "number_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "number_reports_phone_number_id_reported_by_user_id_report_t_key" ON "number_reports"("phone_number_id", "reported_by_user_id", "report_type");

-- CreateIndex
CREATE INDEX "business_profiles_verification_status_idx" ON "business_profiles"("verification_status");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_numbers_user_id_phone_number_id_key" ON "blocked_numbers"("user_id", "phone_number_id");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_entries_email_key" ON "waitlist_entries"("email");

-- CreateIndex
CREATE UNIQUE INDEX "theme_preferences_user_id_platform_key" ON "theme_preferences"("user_id", "platform");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_approved_by_admin_id_fkey" FOREIGN KEY ("approved_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_reports" ADD CONSTRAINT "number_reports_phone_number_id_fkey" FOREIGN KEY ("phone_number_id") REFERENCES "phone_numbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_reports" ADD CONSTRAINT "number_reports_reported_by_user_id_fkey" FOREIGN KEY ("reported_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_reports" ADD CONSTRAINT "number_reports_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_phone_number_id_fkey" FOREIGN KEY ("phone_number_id") REFERENCES "phone_numbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_claimed_by_user_id_fkey" FOREIGN KEY ("claimed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_approved_by_admin_id_fkey" FOREIGN KEY ("approved_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_reasons" ADD CONSTRAINT "call_reasons_business_profile_id_fkey" FOREIGN KEY ("business_profile_id") REFERENCES "business_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_numbers" ADD CONSTRAINT "blocked_numbers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_numbers" ADD CONSTRAINT "blocked_numbers_phone_number_id_fkey" FOREIGN KEY ("phone_number_id") REFERENCES "phone_numbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_phone_number_id_fkey" FOREIGN KEY ("phone_number_id") REFERENCES "phone_numbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_reviewed_by_admin_id_fkey" FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lookup_logs" ADD CONSTRAINT "lookup_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lookup_logs" ADD CONSTRAINT "lookup_logs_phone_number_id_fkey" FOREIGN KEY ("phone_number_id") REFERENCES "phone_numbers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_preferences" ADD CONSTRAINT "theme_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
