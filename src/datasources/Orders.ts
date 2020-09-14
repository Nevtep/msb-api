import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';

export type PayPalCredentials = {
    scope: string,
    access_token: string,
    token_type: string,
    app_id: string,
    expires_in: number,
    nonce: string
}



export type CurrencyValue = {
  currency_code: string
  value: string
}

export type PurchaseUnit = {
  reference_id: string
  amount: CurrencyValue
}

export type TransactionDetails = {
  create_time: Date
  update_time: Date
  id: string
  purchase_units: [PurchaseUnit]
  status: string
  intent: string
}

export type OrderDetail = {
  id: string
  referenceId: string
  status: string,
  intent: string,
  amount: CurrencyValue,
  createTime: Date,
}
class OrdersAPI extends RESTDataSource {
  credentialsTimestamp: number = 0;
  clientId: string;
  secret: string;

  constructor(clientId: string, secret: string) {
    super();
    this.baseURL = process.env.MSB_PP_API_SERVICE;
    this.clientId = clientId;
    this.secret = secret;
  }

  // leaving this inside the class to make the class easier to test
  orderReducer(order: TransactionDetails) {
    const purchaseUnit = order.purchase_units[0];
    return {
      id: order.id,
      status: order.status,
      intent: order.intent,
      referenceId: purchaseUnit.reference_id,
      amount: purchaseUnit.amount,
      createTime: order.create_time,
    }
  }

  async getOrderById(id: number) {
    const authorization = Buffer.from(`${this.clientId}:${this.secret}`).toString('base64');
    const credentials = await this.post<PayPalCredentials>(`/v1/oauth2/token?grant_type=client_credentials`, undefined, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        Authorization: `Basic ${authorization}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(credentials => {
        this.credentialsTimestamp = Date.now();
        return credentials;
    });
    const order = await this.get(`/v2/checkout/orders/${id}`, {}, {
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
      }
    })
    return this.orderReducer(order);
  }
}

export default OrdersAPI;