declare module 'react-native-razorpay' {
  interface RazorpayResult {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }
  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: {email?: string};
    theme?: {color?: string};
  }
  const RazorpayCheckout: {open(options: RazorpayOptions): Promise<RazorpayResult>};
  export default RazorpayCheckout;
}
