/**
 * Paystack Fee Calculation Utility (Nigeria)
 * 
 * Formula to pass fees to customer:
 * Charge = (amount + fee_flat) / (1 - fee_percent)
 * 
 * Paystack Nigeria Fees:
 * - 1.5% per transaction
 * - NGN 100 flat fee for transactions >= NGN 2,500
 * - Cap of NGN 2,000 per transaction
 */

export const calculatePaystackGross = (targetNet) => {
    if (!targetNet || targetNet <= 0) return 0;
    
    const PERCENT = 0.015;
    const FLAT = targetNet >= 2500 ? 100 : 0;
    const CAP = 2000;

    // Initial calculation
    let gross = (targetNet + FLAT) / (1 - PERCENT);
    let fee = gross - targetNet;

    // Handle Cap
    if (fee > CAP) {
        gross = targetNet + CAP;
        fee = CAP;
    }

    return {
        base: targetNet,
        fee: Math.ceil(fee),
        total: Math.ceil(gross)
    };
};
