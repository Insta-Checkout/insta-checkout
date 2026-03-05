import { Router } from "express"
import sellersAnalyticsRouter from "./sellersAnalytics.js"
import sellersProductsRouter from "./sellersProducts.js"
import sellersPaymentLinksRouter from "./sellersPaymentLinks.js"

const router = Router()
router.use(sellersAnalyticsRouter)
router.use(sellersProductsRouter)
router.use(sellersPaymentLinksRouter)

export default router
