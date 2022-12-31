import { getProducts, getStripePayments } from '@stripe/firestore-stripe-payments'
import type { Product } from '@stripe/firestore-stripe-payments'
import { firebaseApp } from '../firebase/FirebaseStore'
import { centsToFormatedDollar } from '../../utils/math/math'

const payments = getStripePayments(firebaseApp, {
  productsCollection: 'products',
  customersCollection: 'customers',
})

export const getSubscriptionOptions = async (): Promise<Array<Product>> => {
  const freshProducts = []
  const prods = await getProducts(payments, {
    includePrices: true,
    activeOnly: true,
  })

  for (const product of prods) {
    let updatedP = { ...product }
    updatedP.prices = product.prices.filter((p) => p.active)
    freshProducts.push(updatedP)
  }

  return freshProducts
}

export const stripeAmountToUSD = (amount: number) => {
  return centsToFormatedDollar(amount)
}
