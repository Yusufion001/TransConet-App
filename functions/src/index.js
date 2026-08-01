"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.flutterwaveWebhook = exports.verifyFlutterwavePayment = exports.initializeFlutterwavePayment = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const params_1 = require("firebase-functions/params");
const supabase_js_1 = require("@supabase/supabase-js");
// Firebase admin initialization
admin.initializeApp();
// Secret Manager parameters
const FLUTTERWAVE_SECRET_KEY = (0, params_1.defineSecret)('FLUTTERWAVE_SECRET_KEY');
const SUPABASE_SERVICE_ROLE_KEY = (0, params_1.defineSecret)('SUPABASE_SERVICE_ROLE_KEY');
const getSupabase = () => {
    return (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || 'https://fnguduantikuxkuiunwj.supabase.co', SUPABASE_SERVICE_ROLE_KEY.value());
};
exports.initializeFlutterwavePayment = functions
    .runWith({ secrets: [FLUTTERWAVE_SECRET_KEY] })
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { amount, email, loadId, callbackUrl } = data;
    if (!amount || !email || !loadId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    try {
        const Flutterwave = require('flutterwave-node-v3');
        const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY || 'dummy_public_key', FLUTTERWAVE_SECRET_KEY.value());
        const reference = `FLW-ESCROW-${loadId}-${Date.now()}`;
        const payload = {
            tx_ref: reference,
            amount: amount,
            currency: "NGN",
            redirect_url: callbackUrl || "https://transconet.com/payment/callback",
            payment_options: "card, banktransfer, ussd", // Explicitly supporting requested methods
            customer: {
                email: email,
                name: context.auth.token.name || "Customer"
            },
            customizations: {
                title: "TransConet Payment",
                description: "Secure payment for TransConet services",
                logo: "https://transconet.com/logo.png"
            },
            meta: {
                loadId,
                userId: context.auth.uid,
                type: 'ESCROW_DEPOSIT'
            }
        };
        const response = await flw.PaymentLinks.create(payload);
        return {
            success: true,
            authorizationUrl: response.data.link,
            reference,
            provider: 'flutterwave'
        };
    }
    catch (error) {
        console.error('Flutterwave init error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Payment initialization failed');
    }
});
exports.verifyFlutterwavePayment = functions
    .runWith({ secrets: [FLUTTERWAVE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY] })
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { transactionId, loadId, reference } = data;
    if (!transactionId || !loadId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing transactionId or loadId');
    }
    try {
        const Flutterwave = require('flutterwave-node-v3');
        const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY || 'dummy_public_key', FLUTTERWAVE_SECRET_KEY.value());
        const response = await flw.Transaction.verify({ id: transactionId });
        if (response.data.status === "successful" && response.data.currency === "NGN") {
            const supabase = getSupabase();
            // 1. Transaction logging
            const { error: txError } = await supabase.from('Transaction').insert({
                amount: response.data.amount,
                type: 'ESCROW_DEPOSIT',
                status: 'SUCCESS',
                loadId: loadId,
                shipperId: response.data.meta?.userId || context.auth.uid,
                transporterId: '00000000-0000-0000-0000-000000000000' // Placeholder if not assigned yet
            });
            if (txError)
                console.error("Error logging transaction:", txError);
            // 2. Escrow / Subscription Activation
            const { error: loadError } = await supabase.from('LoadPosting')
                .update({ paymentStatus: 'HELD_IN_ESCROW', isEscrowEnabled: true })
                .eq('id', loadId);
            if (loadError)
                console.error("Error updating load:", loadError);
            return {
                success: true,
                status: 'HELD_IN_ESCROW',
                message: 'Funds verified and locked securely',
                loadId,
                reference
            };
        }
        else {
            throw new functions.https.HttpsError('aborted', 'Transaction was not successful');
        }
    }
    catch (error) {
        console.error('Flutterwave verify error:', error);
        throw new functions.https.HttpsError('internal', 'Payment verification failed');
    }
});
exports.flutterwaveWebhook = functions
    .runWith({ secrets: [FLUTTERWAVE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY] })
    .https.onRequest(async (req, res) => {
    const signature = req.headers['verif-hash'];
    const expectedSignature = process.env.FLUTTERWAVE_WEBHOOK_HASH;
    if (!signature || signature !== expectedSignature) {
        res.status(401).send('Unauthorized');
        return;
    }
    const payload = req.body;
    console.log('Webhook payload:', payload);
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
        const reference = payload.data.tx_ref;
        const loadId = payload.data.meta?.loadId;
        const userId = payload.data.meta?.userId;
        const supabase = getSupabase();
        // 1. Transaction logging
        await supabase.from('Transaction').insert({
            amount: payload.data.amount,
            type: payload.data.meta?.type || 'ESCROW_DEPOSIT',
            status: 'SUCCESS',
            loadId: loadId,
            shipperId: userId,
            transporterId: '00000000-0000-0000-0000-000000000000'
        });
        // 2. Automatic subscription activation / Escrow
        await supabase.from('LoadPosting')
            .update({ paymentStatus: 'HELD_IN_ESCROW', isEscrowEnabled: true })
            .eq('id', loadId);
        // 3. Receipt Generation (Store event for outbox processing or send email)
        await supabase.from('OutboxEvent').insert({
            type: 'EMAIL_RECEIPT',
            payload: {
                to: payload.data.customer.email,
                subject: 'TransConet Payment Receipt',
                amount: payload.data.amount,
                reference: reference,
                date: new Date().toISOString()
            }
        });
        console.log(`Payment successful for ref: ${reference}. Services activated and receipt queued.`);
    }
    res.status(200).send('OK');
});
//# sourceMappingURL=index.js.map