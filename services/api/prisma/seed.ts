import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ClearRing seed...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { phoneNumber: '+911234567890' },
    update: {},
    create: {
      phoneNumber: '+911234567890',
      countryCode: 'IN',
      name: 'ClearRing Admin',
      email: 'admin@clearring.app',
      role: 'SUPER_ADMIN',
      trustScore: 100,
      country: 'IN',
    },
  });

  const testUser = await prisma.user.upsert({
    where: { phoneNumber: '+919000000001' },
    update: {},
    create: {
      phoneNumber: '+919000000001',
      countryCode: 'IN',
      name: 'Test User',
      role: 'USER',
      trustScore: 60,
      country: 'IN',
    },
  });

  const reporter1 = await prisma.user.upsert({
    where: { phoneNumber: '+919000000002' },
    update: {},
    create: {
      phoneNumber: '+919000000002',
      countryCode: 'IN',
      name: 'Reporter Alpha',
      role: 'USER',
      trustScore: 75,
    },
  });

  const reporter2 = await prisma.user.upsert({
    where: { phoneNumber: '+919000000003' },
    update: {},
    create: {
      phoneNumber: '+919000000003',
      countryCode: 'IN',
      name: 'Reporter Beta',
      role: 'USER',
      trustScore: 65,
    },
  });

  const reporter3 = await prisma.user.upsert({
    where: { phoneNumber: '+919000000004' },
    update: {},
    create: {
      phoneNumber: '+919000000004',
      countryCode: 'IN',
      name: 'Reporter Gamma',
      role: 'USER',
      trustScore: 55,
    },
  });

  console.log('✅ Users created');

  // =============================================
  // VERIFIED / SAFE NUMBERS
  // =============================================

  const verifiedNumbers = [
    {
      e164: '+914422334455',
      national: '04422334455',
      label: 'Apollo Hospitals Chennai',
      category: 'HOSPITAL_CLINIC' as const,
      score: 5,
      risk: 'SAFE' as const,
      bizName: 'Apollo Hospitals',
      website: 'https://www.apollohospitals.com',
      city: 'Chennai',
      state: 'Tamil Nadu',
      callReasons: [
        { title: 'Appointment Reminder', desc: 'Calling to confirm or reschedule your appointment' },
        { title: 'Lab Results', desc: 'Your diagnostic test results are ready for pickup' },
        { title: 'Billing Inquiry', desc: 'Follow-up on your hospital bill or insurance claim' },
      ],
    },
    {
      e164: '+911800114477',
      national: '1800114477',
      label: 'HDFC Bank Customer Care',
      category: 'BANK' as const,
      score: 3,
      risk: 'SAFE' as const,
      bizName: 'HDFC Bank',
      website: 'https://www.hdfcbank.com',
      city: 'Mumbai',
      state: 'Maharashtra',
      callReasons: [
        { title: 'Account Query', desc: 'Questions about your savings or current account' },
        { title: 'Credit Card Support', desc: 'Help with your HDFC credit card' },
        { title: 'Loan Query', desc: 'Home loan, personal loan, or auto loan status' },
      ],
    },
    {
      e164: '+914428124455',
      national: '04428124455',
      label: 'Tamil Nadu Tax Helpline',
      category: 'GOVERNMENT' as const,
      score: 4,
      risk: 'SAFE' as const,
      bizName: 'Tamil Nadu Revenue Department',
      city: 'Chennai',
      state: 'Tamil Nadu',
      callReasons: [
        { title: 'Property Tax', desc: 'Property tax payment and assessment queries' },
        { title: 'GST Support', desc: 'GST registration and filing assistance' },
      ],
    },
    {
      e164: '+919940001234',
      national: '9940001234',
      label: 'Ola Cabs Support',
      category: 'CAB_RIDE_SHARING' as const,
      score: 5,
      risk: 'SAFE' as const,
      bizName: 'Ola Electric Mobility',
      website: 'https://www.olacabs.com',
      city: 'Bangalore',
      state: 'Karnataka',
      callReasons: [
        { title: 'Ride Status', desc: 'Update on your current ride or driver ETA' },
        { title: 'Lost Item', desc: 'Help with item left in an Ola vehicle' },
        { title: 'Dispute Resolution', desc: 'Ride fare dispute or complaint' },
      ],
    },
    {
      e164: '+918023345678',
      national: '08023345678',
      label: 'Amazon India Delivery',
      category: 'ECOMMERCE' as const,
      score: 5,
      risk: 'SAFE' as const,
      bizName: 'Amazon India',
      website: 'https://www.amazon.in',
      city: 'Bangalore',
      state: 'Karnataka',
      callReasons: [
        { title: 'Delivery Update', desc: 'Your package is out for delivery or has a delay' },
        { title: 'Order Confirmation', desc: 'Confirming details for a high-value order' },
        { title: 'Return Pickup', desc: 'Scheduling a return pickup' },
      ],
    },
    {
      e164: '+914423456789',
      national: '04423456789',
      label: 'Blue Dart Express',
      category: 'COURIER' as const,
      score: 4,
      risk: 'SAFE' as const,
      bizName: 'Blue Dart Express Ltd',
      website: 'https://www.bluedart.com',
      city: 'Chennai',
      state: 'Tamil Nadu',
      callReasons: [
        { title: 'Delivery Attempt', desc: 'Attempting to deliver your parcel, please be available' },
        { title: 'Address Confirmation', desc: 'Confirming your delivery address' },
      ],
    },
    {
      e164: '+911800103333',
      national: '1800103333',
      label: 'Airtel Customer Care',
      category: 'UTILITY_SERVICES' as const,
      score: 5,
      risk: 'SAFE' as const,
      bizName: 'Bharti Airtel Limited',
      website: 'https://www.airtel.in',
      city: 'New Delhi',
      state: 'Delhi',
      callReasons: [
        { title: 'Recharge Reminder', desc: 'Your Airtel prepaid plan is expiring soon' },
        { title: 'Network Issue', desc: 'Follow-up on a reported network problem' },
        { title: 'Plan Upgrade', desc: 'Information about new Airtel plans' },
      ],
    },
    {
      e164: '+919035001234',
      national: '9035001234',
      label: 'Swiggy Delivery Partner',
      category: 'DELIVERY' as const,
      score: 5,
      risk: 'SAFE' as const,
      bizName: 'Swiggy',
      website: 'https://www.swiggy.com',
      city: 'Bangalore',
      state: 'Karnataka',
      callReasons: [
        { title: 'Order Delivery', desc: 'Your food order is arriving, please be at delivery location' },
        { title: 'Address Clarification', desc: 'Delivery partner needs help finding your address' },
      ],
    },
    {
      e164: '+914424567890',
      national: '04424567890',
      label: 'Sri Venkateswara CBSE School',
      category: 'SCHOOL_EDUCATION' as const,
      score: 4,
      risk: 'SAFE' as const,
      bizName: 'Sri Venkateswara CBSE School',
      city: 'Chennai',
      state: 'Tamil Nadu',
      callReasons: [
        { title: 'Parent-Teacher Meeting', desc: 'Reminder for upcoming PTM on Saturday' },
        { title: 'Fee Due', desc: 'School fee payment reminder' },
        { title: 'Student Performance', desc: 'Update on your ward\'s academic progress' },
      ],
    },
    {
      e164: '+918026781234',
      national: '08026781234',
      label: 'BESCOM Utility Services',
      category: 'UTILITY_SERVICES' as const,
      score: 4,
      risk: 'SAFE' as const,
      bizName: 'Bangalore Electricity Supply Company',
      city: 'Bangalore',
      state: 'Karnataka',
      callReasons: [
        { title: 'Bill Due Reminder', desc: 'Your electricity bill is due soon' },
        { title: 'Planned Outage', desc: 'Scheduled maintenance power cut notice' },
        { title: 'Meter Reading', desc: 'Meter reading appointment' },
      ],
    },
  ];

  for (const num of verifiedNumbers) {
    const pn = await prisma.phoneNumber.upsert({
      where: { e164Number: num.e164 },
      update: {},
      create: {
        e164Number: num.e164,
        countryCode: 'IN',
        nationalNumber: num.national,
        displayLabel: num.label,
        category: num.category,
        spamScore: num.score,
        riskLevel: num.risk,
        confidenceScore: 95,
        isVerified: true,
        verificationType: 'DOCUMENT',
        sourceType: 'BUSINESS_CLAIM',
        adminOverrideStatus: 'VERIFIED_SAFE',
        totalReports: 0,
        spamReports: 0,
        fraudReports: 0,
        scamReports: 0,
        safeReports: 3,
      },
    });

    const bp = await prisma.businessProfile.create({
      data: {
        businessName: num.bizName,
        phoneNumberId: pn.id,
        category: num.category,
        website: num.website,
        city: num.city,
        state: num.state,
        country: 'IN',
        verificationStatus: 'APPROVED',
        claimedByUserId: admin.id,
        approvedByAdminId: admin.id,
      },
    });

    if (num.callReasons) {
      for (const cr of num.callReasons) {
        await prisma.callReason.create({
          data: {
            businessProfileId: bp.id,
            reasonTitle: cr.title,
            reasonDescription: cr.desc,
          },
        });
      }
    }
  }

  console.log('✅ Verified numbers created');

  // =============================================
  // SPAM / FRAUD NUMBERS
  // =============================================

  const spamNumbers = [
    {
      e164: '+919876543210',
      national: '9876543210',
      label: 'Loan Spam Call',
      category: 'LOAN_FINANCE' as const,
      score: 88,
      risk: 'HIGH_RISK' as const,
      fraudReports: 3,
      scamReports: 2,
      spamReports: 5,
      reports: [
        { userId: reporter1.id, type: 'FRAUD' as const, money: true },
        { userId: reporter2.id, type: 'SCAM' as const, otp: true },
        { userId: reporter3.id, type: 'SPAM' as const },
      ],
    },
    {
      e164: '+919123456780',
      national: '9123456780',
      label: 'UPI Payment Fraud',
      category: 'FRAUD' as const,
      score: 95,
      risk: 'HIGH_RISK' as const,
      fraudReports: 3,
      scamReports: 3,
      spamReports: 2,
      override: 'CONFIRMED_FRAUD' as const,
      reports: [
        { userId: reporter1.id, type: 'FRAUD' as const, money: true, payment: true },
        { userId: reporter2.id, type: 'PAYMENT_SCAM' as const, otp: true },
        { userId: reporter3.id, type: 'FRAUD' as const, threat: true },
      ],
    },
    {
      e164: '+919012345678',
      national: '9012345678',
      label: 'Fake Job Offer Scam',
      category: 'JOB_RECRUITMENT' as const,
      score: 92,
      risk: 'HIGH_RISK' as const,
      fraudReports: 2,
      scamReports: 3,
      spamReports: 3,
      override: 'CONFIRMED_FRAUD' as const,
      reports: [
        { userId: reporter1.id, type: 'JOB_SCAM' as const, money: true },
        { userId: reporter2.id, type: 'SCAM' as const },
        { userId: reporter3.id, type: 'FRAUD' as const },
      ],
    },
    {
      e164: '+919900112233',
      national: '9900112233',
      label: 'Credit Card Sales',
      category: 'CREDIT_CARD_SALES' as const,
      score: 72,
      risk: 'LIKELY_SPAM' as const,
      fraudReports: 0,
      scamReports: 1,
      spamReports: 6,
      reports: [
        { userId: reporter1.id, type: 'SPAM' as const },
        { userId: reporter2.id, type: 'TELEMARKETING' as const },
        { userId: reporter3.id, type: 'SPAM' as const },
      ],
    },
    {
      e164: '+919911223344',
      national: '9911223344',
      label: 'Insurance Telemarketing',
      category: 'INSURANCE' as const,
      score: 65,
      risk: 'LIKELY_SPAM' as const,
      fraudReports: 0,
      scamReports: 0,
      spamReports: 8,
      reports: [
        { userId: reporter1.id, type: 'TELEMARKETING' as const },
        { userId: reporter2.id, type: 'SPAM' as const },
        { userId: reporter3.id, type: 'TELEMARKETING' as const },
      ],
    },
    {
      e164: '+919922334455',
      national: '9922334455',
      label: 'Real Estate Spam',
      category: 'REAL_ESTATE' as const,
      score: 68,
      risk: 'LIKELY_SPAM' as const,
      fraudReports: 0,
      scamReports: 1,
      spamReports: 7,
      reports: [
        { userId: reporter1.id, type: 'SPAM' as const },
        { userId: reporter2.id, type: 'SPAM' as const },
        { userId: reporter3.id, type: 'TELEMARKETING' as const },
      ],
    },
    {
      e164: '+919933445566',
      national: '9933445566',
      label: 'OTP Harvest Scam',
      category: 'SCAM' as const,
      score: 91,
      risk: 'HIGH_RISK' as const,
      fraudReports: 2,
      scamReports: 3,
      spamReports: 1,
      override: 'CONFIRMED_FRAUD' as const,
      reports: [
        { userId: reporter1.id, type: 'OTP_SCAM' as const, otp: true },
        { userId: reporter2.id, type: 'SCAM' as const, otp: true },
        { userId: reporter3.id, type: 'FRAUD' as const },
      ],
    },
    {
      e164: '+919944556677',
      national: '9944556677',
      label: 'Harassment Calls',
      category: 'HARASSMENT' as const,
      score: 78,
      risk: 'LIKELY_SPAM' as const,
      fraudReports: 0,
      scamReports: 0,
      spamReports: 2,
      reports: [
        { userId: reporter1.id, type: 'HARASSMENT' as const, threat: true },
        { userId: reporter2.id, type: 'HARASSMENT' as const },
        { userId: reporter3.id, type: 'SPAM' as const },
      ],
    },
    {
      e164: '+919955667788',
      national: '9955667788',
      label: 'Political Campaign Call',
      category: 'POLITICAL_CAMPAIGN' as const,
      score: 55,
      risk: 'CAUTION' as const,
      fraudReports: 0,
      scamReports: 0,
      spamReports: 4,
      reports: [
        { userId: reporter1.id, type: 'ROBOCALL' as const },
        { userId: reporter2.id, type: 'SPAM' as const },
      ],
    },
    {
      e164: '+919966778899',
      national: '9966778899',
      label: 'Survey / Research Call',
      category: 'SURVEY' as const,
      score: 48,
      risk: 'CAUTION' as const,
      fraudReports: 0,
      scamReports: 0,
      spamReports: 3,
      reports: [
        { userId: reporter1.id, type: 'SPAM' as const },
        { userId: reporter2.id, type: 'SILENT_CALL' as const },
      ],
    },
  ];

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  for (const num of spamNumbers) {
    const pn = await prisma.phoneNumber.upsert({
      where: { e164Number: num.e164 },
      update: {},
      create: {
        e164Number: num.e164,
        countryCode: 'IN',
        nationalNumber: num.national,
        displayLabel: num.label,
        category: num.category,
        spamScore: num.score,
        riskLevel: num.risk,
        confidenceScore: 80,
        isVerified: false,
        verificationType: 'NONE',
        sourceType: 'COMMUNITY',
        totalReports: num.fraudReports + num.scamReports + num.spamReports,
        fraudReports: num.fraudReports,
        scamReports: num.scamReports,
        spamReports: num.spamReports,
        safeReports: 0,
        lastReportedAt: threeDaysAgo,
        adminOverrideStatus: num.override ?? 'NONE',
      },
    });

    for (const r of num.reports) {
      try {
        await prisma.numberReport.create({
          data: {
            phoneNumberId: pn.id,
            reportedByUserId: r.userId,
            reportType: r.type,
            moneyRequested: r.money ?? false,
            otpRequested: r.otp ?? false,
            paymentLinkRequested: r.payment ?? false,
            threatUsed: r.threat ?? false,
            reportWeight: 1.0,
            status: 'APPROVED',
            createdAt: threeDaysAgo,
          },
        });
      } catch {
        // Skip duplicates
      }
    }
  }

  console.log('✅ Spam/fraud numbers created');

  // =============================================
  // UNKNOWN / DISPUTED NUMBERS
  // =============================================

  const unknownNumbers = [
    {
      e164: '+919100000001',
      national: '9100000001',
      label: 'Unknown Personal',
      category: 'PERSONAL' as const,
      score: 10,
      risk: 'SAFE' as const,
      dispute: false,
    },
    {
      e164: '+919100000002',
      national: '9100000002',
      label: 'Possible Business (Community)',
      category: 'UNKNOWN' as const,
      score: 30,
      risk: 'LOW_RISK' as const,
      dispute: false,
    },
    {
      e164: '+919100000003',
      national: '9100000003',
      label: 'Disputed Label',
      category: 'SPAM' as const,
      score: 45,
      risk: 'CAUTION' as const,
      dispute: true,
    },
  ];

  for (const num of unknownNumbers) {
    const pn = await prisma.phoneNumber.upsert({
      where: { e164Number: num.e164 },
      update: {},
      create: {
        e164Number: num.e164,
        countryCode: 'IN',
        nationalNumber: num.national,
        displayLabel: num.label,
        category: num.category,
        spamScore: num.score,
        riskLevel: num.risk,
        confidenceScore: 40,
        sourceType: 'COMMUNITY',
        disputeStatus: num.dispute ? 'PENDING' : 'NONE',
        totalReports: num.dispute ? 1 : 0,
        spamReports: num.dispute ? 1 : 0,
      },
    });

    if (num.dispute) {
      await prisma.dispute.create({
        data: {
          phoneNumberId: pn.id,
          submittedByUserId: testUser.id,
          disputeType: 'WRONG_LABEL',
          message: 'This is my personal number. It has been incorrectly labeled as spam. Please remove this label.',
          status: 'PENDING',
        },
      });
    }
  }

  console.log('✅ Unknown/disputed numbers created');

  // =============================================
  // WAITLIST ENTRIES
  // =============================================

  const waitlistEmails = [
    { email: 'earlyuser1@example.com', country: 'IN', source: 'website' },
    { email: 'earlyuser2@example.com', country: 'US', source: 'product_hunt' },
    { email: 'business@example.com', country: 'IN', source: 'website', phone: '+919000099001' },
  ];

  for (const entry of waitlistEmails) {
    await prisma.waitlistEntry.upsert({
      where: { email: entry.email },
      update: {},
      create: {
        email: entry.email,
        country: entry.country,
        source: entry.source,
        phoneNumber: entry.phone,
      },
    });
  }

  console.log('✅ Waitlist entries created');

  // =============================================
  // AUDIT LOG ENTRIES
  // =============================================

  const auditEntries = [
    { action: 'ADMIN_OVERRIDE_SET', entityType: 'PhoneNumber', note: 'UPI Fraud number confirmed' },
    { action: 'BUSINESS_APPROVED', entityType: 'BusinessProfile', note: 'Apollo Hospitals verified' },
    { action: 'ADMIN_OVERRIDE_SET', entityType: 'PhoneNumber', note: 'Job scam confirmed fraud' },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: entry.action,
        entityType: entry.entityType,
        entityId: 'seed',
        metadata: { note: entry.note },
      },
    });
  }

  console.log('✅ Audit logs created');

  console.log('');
  console.log('🎉 Seed complete!');
  console.log('');
  console.log('📋 Test Credentials:');
  console.log('  Admin: +911234567890 / OTP: 123456');
  console.log('  User:  +919000000001 / OTP: 123456');
  console.log('');
  console.log('📞 Test Numbers:');
  console.log('  ✅ +914422334455 — Apollo Hospitals (SAFE, verified)');
  console.log('  ✅ +911800114477 — HDFC Bank (SAFE, verified)');
  console.log('  🚨 +919876543210 — Loan Spam (HIGH_RISK, 88)');
  console.log('  🚨 +919123456780 — UPI Fraud (HIGH_RISK, 95)');
  console.log('  🚨 +919012345678 — Job Scam (HIGH_RISK, 92)');
  console.log('  ⚠️  +919955667788 — Political Campaign (CAUTION, 55)');
  console.log('  ❓ +919100000001 — Unknown Personal');
  console.log('  ❓ +919100000003 — Disputed (pending review)');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
